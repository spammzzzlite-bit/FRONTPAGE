-- Run in Supabase → SQL Editor (project: lslwjxuhxnevntvjhyrd)
-- Rahul & Sharma exist in auth.users but have NO workspace_members rows yet.
-- This script creates their workspaces and sets them as Owner.

-- 1) RPC: self-service repair on each login (run this block first)
CREATE OR REPLACE FUNCTION public.ensure_user_workspace_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  user_email text;
  user_name text;
  member_rec workspace_members%ROWTYPE;
  active_count int;
  ws_id uuid;
  ws_key text;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  SELECT email, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
  INTO user_email, user_name
  FROM auth.users
  WHERE id = uid;

  UPDATE workspace_members
  SET email = user_email
  WHERE user_id = uid AND lower(email) IS DISTINCT FROM lower(user_email);

  UPDATE workspace_members wm
  SET role = 'owner'
  FROM workspaces w
  WHERE wm.workspace_id = w.id
    AND wm.user_id = uid
    AND wm.status = 'active'
    AND w.owner_id = uid
    AND wm.role <> 'owner';

  UPDATE workspace_members wm
  SET role = 'owner'
  FROM workspaces w
  WHERE wm.workspace_id = w.id
    AND wm.user_id = uid
    AND wm.status = 'active'
    AND lower(w.owner_email) = lower(user_email)
    AND wm.role <> 'owner';

  UPDATE workspaces
  SET owner_id = uid, owner_email = user_email
  WHERE lower(owner_email) = lower(user_email)
    AND (owner_id IS NULL OR owner_id = uid);

  FOR member_rec IN
    SELECT * FROM workspace_members
    WHERE user_id = uid AND status = 'active' AND role IN ('viewer', 'editor')
  LOOP
    SELECT COUNT(*) INTO active_count
    FROM workspace_members
    WHERE workspace_id = member_rec.workspace_id AND status = 'active';

    IF active_count = 1 THEN
      UPDATE workspace_members SET role = 'owner' WHERE id = member_rec.id;
      UPDATE workspaces
      SET owner_id = uid, owner_email = user_email
      WHERE id = member_rec.workspace_id;
    END IF;
  END LOOP;

  UPDATE workspace_members wm
  SET role = 'owner'
  WHERE wm.user_id = uid
    AND wm.status = 'active'
    AND wm.role IN ('viewer', 'editor')
    AND NOT EXISTS (
      SELECT 1 FROM workspace_members o
      WHERE o.workspace_id = wm.workspace_id
        AND o.status = 'active'
        AND o.role IN ('owner', 'admin')
    );

  IF NOT EXISTS (
    SELECT 1 FROM workspace_members WHERE user_id = uid AND status = 'active'
  ) THEN
    ws_id := gen_random_uuid();
    ws_key := 'QAM-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));

    INSERT INTO workspaces (id, name, workspace_key, owner_id, owner_email)
    VALUES (ws_id, 'My Workspace', ws_key, uid, user_email);

    INSERT INTO workspace_members (workspace_id, user_id, email, display_name, role, status)
    VALUES (ws_id, uid, user_email, user_name, 'owner', 'active');
  END IF;

  RETURN jsonb_build_object('ok', true, 'user_id', uid, 'email', user_email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_workspace_access() TO authenticated;

-- 2) Diagnose: what exists today (any status)
SELECT
  u.email AS auth_email,
  wm.id AS member_id,
  wm.user_id,
  wm.email AS member_email,
  wm.role,
  wm.status
FROM auth.users u
LEFT JOIN workspace_members wm
  ON wm.user_id = u.id OR lower(wm.email) = lower(u.email)
WHERE lower(u.email) LIKE '%@perfectqaservices.com'
ORDER BY u.email, wm.status;

-- 3) BOOTSTRAP — create workspace + owner membership when missing entirely
DO $$
DECLARE
  u RECORD;
  ws_id uuid;
  ws_key text;
BEGIN
  FOR u IN
    SELECT
      id,
      email,
      COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) AS display_name
    FROM auth.users
    WHERE lower(email) LIKE '%@perfectqaservices.com'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM workspace_members
      WHERE user_id = u.id AND status = 'active'
    ) THEN
      ws_id := gen_random_uuid();
      ws_key := 'QAM-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));

      INSERT INTO workspaces (id, name, workspace_key, owner_id, owner_email)
      VALUES (ws_id, u.display_name || '''s Workspace', ws_key, u.id, u.email);

      INSERT INTO workspace_members (workspace_id, user_id, email, display_name, role, status)
      VALUES (ws_id, u.id, u.email, u.display_name, 'owner', 'active');

      RAISE NOTICE 'Created workspace % for %', ws_id, u.email;
    END IF;
  END LOOP;
END $$;

-- 4) Repair existing rows (if any) to owner
UPDATE workspace_members wm
SET role = 'owner', status = 'active', user_id = u.id
FROM auth.users u
WHERE lower(wm.email) = lower(u.email)
  AND lower(u.email) LIKE '%@perfectqaservices.com'
  AND (wm.user_id IS NULL OR wm.user_id = u.id);

UPDATE workspaces w
SET owner_id = u.id, owner_email = u.email
FROM auth.users u
WHERE lower(w.owner_email) = lower(u.email)
  AND lower(u.email) LIKE '%@perfectqaservices.com';

-- 5) Verify — should show role = owner (NOT null)
SELECT
  u.email AS auth_email,
  wm.email AS member_email,
  wm.role,
  wm.status,
  w.name AS workspace,
  w.workspace_key,
  w.owner_id = u.id AS is_workspace_owner
FROM auth.users u
INNER JOIN workspace_members wm ON wm.user_id = u.id AND wm.status = 'active'
INNER JOIN workspaces w ON w.id = wm.workspace_id
WHERE lower(u.email) LIKE '%@perfectqaservices.com'
ORDER BY u.email;
