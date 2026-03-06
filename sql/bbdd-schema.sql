-- =========================================================
-- EXTENSIONES
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- HELPERS
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- SECURITY DEFINER helpers para storage policies (evitan recursion RLS)
create or replace function public.is_artist_owner(aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.artists a where a.id = aid and a.owner_user_id = auth.uid());
$$;

create or replace function public.is_artist_member_sd(aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.artist_members am where am.artist_id = aid and am.user_id = auth.uid());
$$;

-- =========================================================
-- 1) PROFILES (1:1 con auth.users)
-- =========================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  theme text not null default 'system' check (theme in ('light','dark','system')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- =========================================================
-- 2) ARTISTS
-- =========================================================
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  handle text,
  name text not null,
  bio text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_artists_updated_at on public.artists;
create trigger trg_artists_updated_at
before update on public.artists
for each row execute function public.set_updated_at();

create unique index if not exists artists_handle_lower_unique
on public.artists (lower(handle)) where handle is not null;

-- =========================================================
-- 3) ARTIST_MEMBERS (colaboracion)
-- =========================================================
create table if not exists public.artist_members (
  artist_id uuid not null references public.artists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (artist_id, user_id)
);

-- Helper (NON security definer, para RLS policies de tablas)
create or replace function public.is_artist_member(aid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.artist_members m where m.artist_id = aid and m.user_id = auth.uid());
$$;

-- Auto-insert owner al crear artista
create or replace function public.handle_new_artist_member()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.artist_members (artist_id, user_id, role)
  values (new.id, new.owner_user_id, 'owner')
  on conflict (artist_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_artist_created_add_owner on public.artists;
create trigger on_artist_created_add_owner
after insert on public.artists
for each row execute function public.handle_new_artist_member();

-- =========================================================
-- 4) ALBUMS
-- =========================================================
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  description text,
  cover_path text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_albums_updated_at on public.albums;
create trigger trg_albums_updated_at
before update on public.albums
for each row execute function public.set_updated_at();

-- =========================================================
-- 5) TRACKS
-- =========================================================
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  album_id uuid references public.albums(id) on delete set null,
  title text not null,
  description text,
  position int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_tracks_updated_at on public.tracks;
create trigger trg_tracks_updated_at
before update on public.tracks
for each row execute function public.set_updated_at();

create unique index if not exists tracks_album_position_unique
on public.tracks(album_id, position)
where album_id is not null and position is not null;

-- =========================================================
-- 6) TRACK_VERSIONS
-- =========================================================
create table if not exists public.track_versions (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  label text not null,
  notes text,
  audio_path text,
  duration_seconds int,
  bpm numeric,
  key text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (track_id, label)
);

drop trigger if exists trg_versions_updated_at on public.track_versions;
create trigger trg_versions_updated_at
before update on public.track_versions
for each row execute function public.set_updated_at();

create unique index if not exists one_active_version_per_track
on public.track_versions(track_id) where is_active;

-- =========================================================
-- 7) STEMS
-- =========================================================
create table if not exists public.stems (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.track_versions(id) on delete cascade,
  stem_type text not null check (stem_type in ('vocals','drums','bass','instrumental','fx','other')),
  label text,
  audio_path text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists stems_unique_per_version_type_label
on public.stems (version_id, stem_type, coalesce(label,''));

-- =========================================================
-- 8) COVER_ASSETS
-- =========================================================
create table if not exists public.cover_assets (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  album_id uuid references public.albums(id) on delete cascade,
  version_id uuid references public.track_versions(id) on delete cascade,
  image_path text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 9) SHARE_LINKS
-- =========================================================
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('album','track','version')),
  album_id uuid references public.albums(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete cascade,
  version_id uuid references public.track_versions(id) on delete cascade,
  token_hash text not null unique,
  can_download boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint share_scope_fk_check check (
    (scope='album'   and album_id   is not null and track_id is null and version_id is null) or
    (scope='track'   and track_id   is not null and album_id is null and version_id is null) or
    (scope='version' and version_id is not null and album_id is null and track_id   is null)
  )
);

-- =========================================================
-- 10) DOWNLOAD_EVENTS
-- =========================================================
create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  share_link_id uuid references public.share_links(id) on delete set null,
  version_id uuid references public.track_versions(id) on delete set null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 11) ARTIST_INVITES
-- =========================================================
create table if not exists public.artist_invites (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('editor','viewer')),
  token text not null unique default upper(encode(gen_random_bytes(3), 'hex')),
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_artist_invites_token on public.artist_invites(token);
create index if not exists idx_artist_invites_artist on public.artist_invites(artist_id);

-- =========================================================
-- INDEXES
-- =========================================================
create index if not exists idx_tracks_artist          on public.tracks(artist_id);
create index if not exists idx_tracks_album           on public.tracks(album_id);
create index if not exists idx_albums_artist          on public.albums(artist_id);
create index if not exists idx_versions_track         on public.track_versions(track_id);
create index if not exists idx_stems_version          on public.stems(version_id);
create index if not exists idx_cover_assets_artist    on public.cover_assets(artist_id);
create index if not exists idx_cover_assets_album     on public.cover_assets(album_id);
create index if not exists idx_cover_assets_version   on public.cover_assets(version_id);
create index if not exists idx_share_links_hash       on public.share_links(token_hash);
create index if not exists idx_share_links_created_by on public.share_links(created_by);
create index if not exists idx_download_events_share_link on public.download_events(share_link_id);
create index if not exists idx_download_events_version    on public.download_events(version_id);
create index if not exists idx_artist_members_user        on public.artist_members(user_id);

-- =========================================================
-- HELPERS: Prevenir multiples versiones activas
-- =========================================================
create or replace function public.ensure_single_active_version()
returns trigger language plpgsql as $$
begin
  if new.is_active then
    update public.track_versions
    set is_active = false
    where track_id = new.track_id and id != new.id and is_active = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ensure_single_active_version on public.track_versions;
create trigger trg_ensure_single_active_version
before insert or update on public.track_versions
for each row when (new.is_active = true)
execute function public.ensure_single_active_version();

-- =========================================================
-- RLS ENABLE
-- =========================================================
alter table public.profiles        enable row level security;
alter table public.artists         enable row level security;
alter table public.artist_members  enable row level security;
alter table public.albums          enable row level security;
alter table public.tracks          enable row level security;
alter table public.track_versions  enable row level security;
alter table public.stems           enable row level security;
alter table public.cover_assets    enable row level security;
alter table public.share_links     enable row level security;
alter table public.download_events enable row level security;
alter table public.artist_invites  enable row level security;

-- =========================================================
-- POLICIES
-- =========================================================

-- PROFILES ------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (user_id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (user_id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ARTISTS -------------------------------------------------
drop policy if exists artists_select_member on public.artists;
create policy artists_select_member on public.artists
for select using (
  owner_user_id = auth.uid()
  or exists(select 1 from public.artist_members m where m.artist_id = id and m.user_id = auth.uid())
);

drop policy if exists artists_insert_self_owner on public.artists;
create policy artists_insert_self_owner on public.artists
for insert with check (owner_user_id = auth.uid());

drop policy if exists artists_update_owner on public.artists;
create policy artists_update_owner on public.artists
for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists artists_delete_owner on public.artists;
create policy artists_delete_owner on public.artists
for delete using (owner_user_id = auth.uid());

-- ARTIST_MEMBERS ------------------------------------------
-- select: solo tu propia fila (evita recursion)
drop policy if exists artist_members_select_member on public.artist_members;
create policy artist_members_select_member on public.artist_members
for select using (user_id = auth.uid());

-- insert/update/delete: solo owner del artista
drop policy if exists artist_members_insert_owner on public.artist_members;
create policy artist_members_insert_owner on public.artist_members
for insert with check (
  exists(select 1 from public.artists a where a.id = artist_id and a.owner_user_id = auth.uid())
);

drop policy if exists artist_members_update_owner on public.artist_members;
create policy artist_members_update_owner on public.artist_members
for update
using (exists(select 1 from public.artists a where a.id = artist_id and a.owner_user_id = auth.uid()))
with check (exists(select 1 from public.artists a where a.id = artist_id and a.owner_user_id = auth.uid()));

drop policy if exists artist_members_delete_owner on public.artist_members;
create policy artist_members_delete_owner on public.artist_members
for delete using (
  exists(select 1 from public.artists a where a.id = artist_id and a.owner_user_id = auth.uid())
);

-- ALBUMS --------------------------------------------------
drop policy if exists albums_select_member on public.albums;
create policy albums_select_member on public.albums
for select using (public.is_artist_member(artist_id));

drop policy if exists albums_insert_member on public.albums;
create policy albums_insert_member on public.albums
for insert with check (public.is_artist_member(artist_id));

drop policy if exists albums_update_member on public.albums;
create policy albums_update_member on public.albums
for update using (public.is_artist_member(artist_id)) with check (public.is_artist_member(artist_id));

drop policy if exists albums_delete_member on public.albums;
create policy albums_delete_member on public.albums
for delete using (public.is_artist_member(artist_id));

-- TRACKS --------------------------------------------------
drop policy if exists tracks_select_member on public.tracks;
create policy tracks_select_member on public.tracks
for select using (public.is_artist_member(artist_id));

drop policy if exists tracks_insert_member on public.tracks;
create policy tracks_insert_member on public.tracks
for insert with check (public.is_artist_member(artist_id));

drop policy if exists tracks_update_member on public.tracks;
create policy tracks_update_member on public.tracks
for update using (public.is_artist_member(artist_id)) with check (public.is_artist_member(artist_id));

drop policy if exists tracks_delete_member on public.tracks;
create policy tracks_delete_member on public.tracks
for delete using (public.is_artist_member(artist_id));

-- TRACK_VERSIONS ------------------------------------------
drop policy if exists versions_select_member on public.track_versions;
create policy versions_select_member on public.track_versions
for select using (
  exists(select 1 from public.tracks t where t.id = track_id and public.is_artist_member(t.artist_id))
);

drop policy if exists versions_insert_member on public.track_versions;
create policy versions_insert_member on public.track_versions
for insert with check (
  exists(select 1 from public.tracks t where t.id = track_id and public.is_artist_member(t.artist_id))
);

drop policy if exists versions_update_member on public.track_versions;
create policy versions_update_member on public.track_versions
for update
using (exists(select 1 from public.tracks t where t.id = track_id and public.is_artist_member(t.artist_id)))
with check (exists(select 1 from public.tracks t where t.id = track_id and public.is_artist_member(t.artist_id)));

drop policy if exists versions_delete_member on public.track_versions;
create policy versions_delete_member on public.track_versions
for delete using (
  exists(select 1 from public.tracks t where t.id = track_id and public.is_artist_member(t.artist_id))
);

-- STEMS ---------------------------------------------------
drop policy if exists stems_select_member on public.stems;
create policy stems_select_member on public.stems
for select using (
  exists(
    select 1 from public.track_versions v
    join public.tracks t on t.id = v.track_id
    where v.id = version_id and public.is_artist_member(t.artist_id)
  )
);

drop policy if exists stems_insert_member on public.stems;
create policy stems_insert_member on public.stems
for insert with check (
  exists(
    select 1 from public.track_versions v
    join public.tracks t on t.id = v.track_id
    where v.id = version_id and public.is_artist_member(t.artist_id)
  )
);

drop policy if exists stems_update_member on public.stems;
create policy stems_update_member on public.stems
for update
using (
  exists(
    select 1 from public.track_versions v
    join public.tracks t on t.id = v.track_id
    where v.id = version_id and public.is_artist_member(t.artist_id)
  )
)
with check (
  exists(
    select 1 from public.track_versions v
    join public.tracks t on t.id = v.track_id
    where v.id = version_id and public.is_artist_member(t.artist_id)
  )
);

drop policy if exists stems_delete_member on public.stems;
create policy stems_delete_member on public.stems
for delete using (
  exists(
    select 1 from public.track_versions v
    join public.tracks t on t.id = v.track_id
    where v.id = version_id and public.is_artist_member(t.artist_id)
  )
);

-- COVER_ASSETS --------------------------------------------
drop policy if exists cover_assets_select_member on public.cover_assets;
create policy cover_assets_select_member on public.cover_assets
for select using (public.is_artist_member(artist_id));

drop policy if exists cover_assets_insert_member on public.cover_assets;
create policy cover_assets_insert_member on public.cover_assets
for insert with check (public.is_artist_member(artist_id));

drop policy if exists cover_assets_delete_member on public.cover_assets;
create policy cover_assets_delete_member on public.cover_assets
for delete using (public.is_artist_member(artist_id));

-- SHARE_LINKS ---------------------------------------------
drop policy if exists share_links_select_creator on public.share_links;
create policy share_links_select_creator on public.share_links
for select using (created_by = auth.uid());

drop policy if exists share_links_select_by_token on public.share_links;
-- Token validation should be done from Edge Functions with service_role

drop policy if exists share_links_insert_creator on public.share_links;
create policy share_links_insert_creator on public.share_links
for insert with check (created_by = auth.uid());

drop policy if exists share_links_update_creator on public.share_links;
create policy share_links_update_creator on public.share_links
for update using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists share_links_delete_creator on public.share_links;
create policy share_links_delete_creator on public.share_links
for delete using (created_by = auth.uid());

-- DOWNLOAD_EVENTS -----------------------------------------
drop policy if exists download_events_insert_auth on public.download_events;
create policy download_events_insert_auth on public.download_events
for insert with check (auth.uid() is not null);

drop policy if exists download_events_select_creator on public.download_events;
create policy download_events_select_creator on public.download_events
for select using (
  exists(select 1 from public.share_links s where s.id = share_link_id and s.created_by = auth.uid())
);

-- ARTIST_INVITES ------------------------------------------
drop policy if exists invites_select_owner on public.artist_invites;
create policy invites_select_owner on public.artist_invites
for select using (created_by = auth.uid());

drop policy if exists invites_insert_owner on public.artist_invites;
create policy invites_insert_owner on public.artist_invites
for insert with check (created_by = auth.uid());

drop policy if exists invites_delete_owner on public.artist_invites;
create policy invites_delete_owner on public.artist_invites
for delete using (created_by = auth.uid());

-- Cualquier usuario autenticado puede leer un invite por token (para aceptarlo)
drop policy if exists invites_select_by_token on public.artist_invites;
create policy invites_select_by_token on public.artist_invites
for select using (auth.uid() is not null);

-- El invitado puede marcar el invite como usado
drop policy if exists invites_update_accept on public.artist_invites;
create policy invites_update_accept on public.artist_invites
for update using (auth.uid() is not null) with check (used_by = auth.uid());

-- =========================================================
-- RPC FUNCTIONS
-- =========================================================

-- Listar miembros con datos de perfil (SECURITY DEFINER)
create or replace function public.get_artist_member_profiles(aid uuid)
returns table(user_id uuid, role text, created_at timestamptz, display_name text, avatar_path text)
language sql security definer stable set search_path = public as $$
  select m.user_id, m.role, m.created_at, p.display_name, p.avatar_path
  from public.artist_members m
  left join public.profiles p on p.user_id = m.user_id
  where m.artist_id = aid
    and exists(select 1 from public.artist_members my where my.artist_id = aid and my.user_id = auth.uid());
$$;

-- Listar miembros sin datos de perfil (SECURITY DEFINER)
create or replace function public.get_artist_members(aid uuid)
returns table(user_id uuid, role text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select m.user_id, m.role, m.created_at
  from public.artist_members m
  where m.artist_id = aid
    and exists(select 1 from public.artist_members my where my.artist_id = aid and my.user_id = auth.uid());
$$;

-- Crear invite (solo owner)
create or replace function public.create_artist_invite(p_artist_id uuid, p_role text)
returns table(id uuid, token text, role text, expires_at timestamptz, used_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
begin
  if not exists(select 1 from public.artists a where a.id = p_artist_id and a.owner_user_id = v_user_id) then
    raise exception 'Not authorized';
  end if;
  return query
  insert into public.artist_invites (artist_id, created_by, role)
  values (p_artist_id, v_user_id, p_role)
  returning
    public.artist_invites.id,
    public.artist_invites.token,
    public.artist_invites.role,
    public.artist_invites.expires_at,
    public.artist_invites.used_at;
end;
$$;

-- Info de invite por token (no requiere auth)
create or replace function public.get_invite_info(p_token text)
returns table(artist_name text, role text, valid boolean, reason text, artist_avatar_path text)
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.artist_invites;
  v_artist public.artists;
begin
  select * into v_invite from public.artist_invites where token = p_token;
  if not found then
    return query select ''::text, ''::text, false, 'invalid'::text, ''::text;
    return;
  end if;
  if v_invite.used_at is not null then
    return query select ''::text, ''::text, false, 'used'::text, ''::text;
    return;
  end if;
  if v_invite.expires_at < now() then
    return query select ''::text, ''::text, false, 'expired'::text, ''::text;
    return;
  end if;
  select * into v_artist from public.artists where id = v_invite.artist_id;
  return query select v_artist.name, v_invite.role, true, 'ok'::text, coalesce(v_artist.avatar_path, '')::text;
end;
$$;

-- Listar invites de un artista (solo owner)
create or replace function public.get_artist_invites(p_artist_id uuid)
returns table(id uuid, token text, role text, expires_at timestamptz, used_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.artists a where a.id = p_artist_id and a.owner_user_id = auth.uid()) then
    return;
  end if;
  return query
  select i.id, i.token, i.role, i.expires_at, i.used_at
  from public.artist_invites i
  where i.artist_id = p_artist_id
  order by i.created_at desc;
end;
$$;

-- =========================================================
-- ACCEPT ARTIST INVITE (SECURITY DEFINER)
-- =========================================================
drop function if exists public.accept_artist_invite(text);
drop function if exists public.accept_artist_invite(text, text);
drop function if exists public.accept_artist_invite(text, text, text);

create function public.accept_artist_invite(
  p_token text,
  p_display_name text default null,
  p_avatar_path text default null
)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_invite public.artist_invites;
begin
  if v_user_id is null then return 'not_authenticated'; end if;

  select * into v_invite from public.artist_invites where token = p_token;
  if not found then return 'invalid'; end if;
  if v_invite.used_at is not null then return 'used'; end if;
  if v_invite.expires_at < now() then return 'expired'; end if;

  -- Upsert profile
  insert into public.profiles (user_id, display_name, avatar_path, onboarding_completed)
  values (v_user_id, coalesce(nullif(p_display_name, ''), 'Usuario'), nullif(p_avatar_path, ''), true)
  on conflict (user_id) do update set
    onboarding_completed = true,
    display_name = coalesce(nullif(excluded.display_name, 'Usuario'), nullif(profiles.display_name, ''), excluded.display_name),
    avatar_path = coalesce(nullif(excluded.avatar_path, ''), profiles.avatar_path);

  -- Add as member
  insert into public.artist_members (artist_id, user_id, role)
  values (v_invite.artist_id, v_user_id, v_invite.role)
  on conflict (artist_id, user_id) do nothing;

  -- Mark invite as used
  update public.artist_invites
  set used_by = v_user_id, used_at = now()
  where id = v_invite.id;

  return 'ok';
end;
$$;

-- Eliminar un miembro (solo owner, no puede eliminar al owner)
create or replace function public.remove_artist_member(
  p_artist_id uuid,
  p_user_id uuid
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.artists a where a.id = p_artist_id and a.owner_user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  if p_user_id = (select owner_user_id from public.artists where id = p_artist_id) then
    raise exception 'Cannot remove owner';
  end if;
  delete from public.artist_members
  where artist_id = p_artist_id and user_id = p_user_id;
end;
$$;

-- Eliminar un invite (solo owner / creador)
create or replace function public.delete_artist_invite(
  p_invite_id uuid
)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_artist_id uuid;
begin
  select artist_id into v_artist_id from public.artist_invites where id = p_invite_id;
  if not found then
    raise exception 'Invite not found';
  end if;
  if not exists(select 1 from public.artists a where a.id = v_artist_id and a.owner_user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  delete from public.artist_invites where id = p_invite_id;
end;
$$;

-- Cambiar rol de un miembro (solo owner)
create or replace function public.set_artist_member_role(
  p_artist_id uuid,
  p_user_id uuid,
  p_role text
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.artists a where a.id = p_artist_id and a.owner_user_id = auth.uid()) then
    raise exception 'Not authorized';
  end if;
  if p_user_id = (select owner_user_id from public.artists where id = p_artist_id) then
    raise exception 'Cannot change owner role';
  end if;
  if p_role not in ('editor', 'viewer') then
    raise exception 'Invalid role';
  end if;
  update public.artist_members
  set role = p_role
  where artist_id = p_artist_id and user_id = p_user_id;
end;
$$;
