-- =========================================================
-- Initial schema migration
-- Includes: all tables, RLS, RPC functions, role management,
--           short invite codes (6-char uppercase hex)
-- Apply to a fresh project with: supabase db reset
-- Apply to existing project: run sql/bbdd-schema.sql in SQL Editor
-- =========================================================

-- Copy full content from sql/bbdd-schema.sql
-- Run that file directly for the full schema.
-- This file contains ONLY the incremental changes for role management
-- and the new short-code invite system for existing deployments.

-- 1) Change invite token to 6-char uppercase code
-- (for new tables only — existing tokens keep their old format)
ALTER TABLE public.artist_invites
  ALTER COLUMN token SET DEFAULT upper(encode(gen_random_bytes(3), 'hex'));

-- 2) Add role management function
CREATE OR REPLACE FUNCTION public.set_artist_member_role(
  p_artist_id uuid,
  p_user_id uuid,
  p_role text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.artists a WHERE a.id = p_artist_id AND a.owner_user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_user_id = (SELECT owner_user_id FROM public.artists WHERE id = p_artist_id) THEN
    RAISE EXCEPTION 'Cannot change owner role';
  END IF;
  IF p_role NOT IN ('editor', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  UPDATE public.artist_members
  SET role = p_role
  WHERE artist_id = p_artist_id AND user_id = p_user_id;
END;
$$;

-- 4) Add remove_artist_member RPC
CREATE OR REPLACE FUNCTION public.remove_artist_member(
  p_artist_id uuid,
  p_user_id uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.artists a WHERE a.id = p_artist_id AND a.owner_user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_user_id = (SELECT owner_user_id FROM public.artists WHERE id = p_artist_id) THEN
    RAISE EXCEPTION 'Cannot remove owner';
  END IF;
  DELETE FROM public.artist_members
  WHERE artist_id = p_artist_id AND user_id = p_user_id;
END;
$$;

-- 5) Add delete_artist_invite RPC
CREATE OR REPLACE FUNCTION public.delete_artist_invite(
  p_invite_id uuid
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_artist_id uuid;
BEGIN
  SELECT artist_id INTO v_artist_id FROM public.artist_invites WHERE id = p_invite_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.artists a WHERE a.id = v_artist_id AND a.owner_user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM public.artist_invites WHERE id = p_invite_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_artist_owner(aid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.artists a WHERE a.id = aid AND a.owner_user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_artist_member_sd(aid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.artist_members am WHERE am.artist_id = aid AND am.user_id = auth.uid());
$$;
