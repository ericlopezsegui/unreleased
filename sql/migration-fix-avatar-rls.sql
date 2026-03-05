-- =========================================================
-- MIGRATION: Fix avatar visibility for team members
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =========================================================

-- 1) Drop the restrictive read policy (only allows reading YOUR OWN avatar)
drop policy if exists "avatars_read_own" on storage.objects;

-- 2) Create new read policy: any authenticated user can read any avatar
--    (profile pics aren't sensitive — they need to be visible to team members)
create policy "avatars_read_authenticated"
on storage.objects for select
using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- 3) Drop old "for all" write policy and replace with proper separate ones
drop policy if exists "avatars_write_own" on storage.objects;

-- INSERT: user can upload to their own path
create policy "avatars_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'user'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- UPDATE: user can update their own path
create policy "avatars_update_own"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'user'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- DELETE: user can delete their own avatar
create policy "avatars_delete_own"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'user'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- 4) Drop old artist write policy and replace with separate INSERT/UPDATE
drop policy if exists "avatars_write_artist_member" on storage.objects;

-- INSERT artist avatar: must be artist member (via SECURITY DEFINER helper)
create policy "avatars_insert_artist_member"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'artist'
  and public.is_artist_member_sd(((storage.foldername(name))[2])::uuid)
);

-- UPDATE artist avatar: must be artist owner
create policy "avatars_update_artist_owner"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = 'artist'
  and public.is_artist_owner(((storage.foldername(name))[2])::uuid)
);

-- 5) Create SECURITY DEFINER helpers if they don't exist yet
create or replace function public.is_artist_owner(aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.artists a where a.id = aid and a.owner_user_id = auth.uid());
$$;

create or replace function public.is_artist_member_sd(aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.artist_members am where am.artist_id = aid and am.user_id = auth.uid());
$$;
