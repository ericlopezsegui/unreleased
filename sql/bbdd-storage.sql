-- Activa RLS en storage.objects (normalmente ya lo está)
alter table storage.objects enable row level security;

-- Limpieza por si rehaces
drop policy if exists "avatars_read_own" on storage.objects;
drop policy if exists "avatars_write_own" on storage.objects;
drop policy if exists "avatars_read_authenticated" on storage.objects;
drop policy if exists "avatars_read_artist_public" on storage.objects;
drop policy if exists "avatars_write_artist_member" on storage.objects;
drop policy if exists "avatars_insert_artist_member_or_owner" on storage.objects;
drop policy if exists "avatars_update_artist_member_or_owner" on storage.objects;
drop policy if exists "avatars_read_artist_member" on storage.objects;
drop policy if exists "avatars_sign_artist_member" on storage.objects;

drop policy if exists "artist_assets_read_member" on storage.objects;
drop policy if exists "artist_assets_write_member" on storage.objects;

-- =========================
-- AVATARS (bucket: avatars)
-- =========================

-- READ: cualquier usuario autenticado puede leer avatares
-- (las fotos de perfil no son sensibles, y los miembros del equipo
--  necesitan ver las fotos de otros miembros)
create policy "avatars_read_authenticated"
on storage.objects for select
using (
  bucket_id = 'avatars'
  and auth.uid() is not null
);

-- WRITE: usuarios solo pueden escribir su propio avatar (user/<uid>/...)
create policy "avatars_write_own"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
);

create policy "avatars_update_own"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
);

create policy "avatars_delete_own"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
);

-- =========================
-- AVATARS: lectura pública para avatars de artista (para invites sin auth)
-- =========================
create policy "avatars_read_artist_public"
on storage.objects for select
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'artist'
);

-- =========================
-- AVATARS: escritura de artista solo si eres miembro O OWNER
-- =========================
create policy "avatars_write_artist_member"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'artist'
  and (
    public.is_artist_member_sd( (split_part(name, '/', 2))::uuid )
    or public.is_artist_owner( (split_part(name, '/', 2))::uuid )
  )
);

create policy "avatars_update_artist_member"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'artist'
  and (
    public.is_artist_member_sd( (split_part(name, '/', 2))::uuid )
    or public.is_artist_owner( (split_part(name, '/', 2))::uuid )
  )
)
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'artist'
  and (
    public.is_artist_member_sd( (split_part(name, '/', 2))::uuid )
    or public.is_artist_owner( (split_part(name, '/', 2))::uuid )
  )
);

-- =========================
-- ARTIST ASSETS (covers/audio/stems)
-- buckets: covers, audio, stems
-- path: artist/<artist_id>/...
-- =========================

create policy "artist_assets_read_member"
on storage.objects for select
using (
  bucket_id in ('covers','audio','stems')
  and split_part(name, '/', 1) = 'artist'
  and public.is_artist_member( (split_part(name, '/', 2))::uuid )
);

create policy "artist_assets_write_member"
on storage.objects for all
using (
  bucket_id in ('covers','audio','stems')
  and split_part(name, '/', 1) = 'artist'
  and public.is_artist_member( (split_part(name, '/', 2))::uuid )
)
with check (
  bucket_id in ('covers','audio','stems')
  and split_part(name, '/', 1) = 'artist'
  and public.is_artist_member( (split_part(name, '/', 2))::uuid )
);