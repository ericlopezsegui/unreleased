-- Activa RLS en storage.objects (normalmente ya lo está)
alter table storage.objects enable row level security;

-- Limpieza por si rehaces
drop policy if exists "avatars_read_own" on storage.objects;
drop policy if exists "avatars_write_own" on storage.objects;

drop policy if exists "artist_assets_read_member" on storage.objects;
drop policy if exists "artist_assets_write_member" on storage.objects;

-- =========================
-- AVATARS (bucket: avatars)
-- path: user/<user_id>/...
-- =========================

create policy "avatars_read_own"
on storage.objects for select
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'user'
  and split_part(name, '/', 2) = auth.uid()::text
);

create policy "avatars_write_own"
on storage.objects for all
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

-- =========================
-- AVATARS: lectura pública para paths de artistas
-- (permite mostrar el banner sin autenticación)
-- =========================
drop policy if exists "avatars_read_artist_public" on storage.objects;
create policy "avatars_read_artist_public"
on storage.objects for select
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'artist'
);

-- =========================
-- AVATARS: escritura de artista solo si eres miembro
-- =========================
drop policy if exists "avatars_write_artist_member" on storage.objects;
create policy "avatars_write_artist_member"
on storage.objects for all
using (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'artist'
  and public.is_artist_member( (split_part(name, '/', 2))::uuid )
)
with check (
  bucket_id = 'avatars'
  and split_part(name, '/', 1) = 'artist'
  and public.is_artist_member( (split_part(name, '/', 2))::uuid )
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