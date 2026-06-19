-- Run once in Supabase → SQL Editor (project: lslwjxuhxnevntvjhyrd)
-- Fixes first-time sign-ups stuck as Viewer and upgrades known accounts.

-- 1) RPC: self-service repair on each login (SECURITY DEFINER)
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

  -- Owner on workspace record but wrong membership role
  UPDATE workspace_members wm
  SET role = 'owner'
  FROM workspaces w
  WHERE wm.workspace_id = w.id
    AND wm.user_id = uid
    AND wm.status = 'active'
    AND w.owner_id = uid
    AND wm.role <> 'owner';

  -- Email matches workspace owner_email
  UPDATE workspace_members wm
  SET role = 'owner'
  FROM workspaces w
  WHERE wm.workspace_id = w.id
    AND wm.user_id = uid
    AND wm.status = 'active'
    AND lower(w.owner_email) = lower(user_email)
    AND wm.role <> 'owner';

  UPDATE workspaces
  SET owner_id = uid
  WHERE lower(owner_email) = lower(user_email)
    AND (owner_id IS NULL OR owner_id = uid);

  -- Sole active member → claim ownership
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

  -- Workspace has no owner/admin yet → first active member becomes owner
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

  -- Create a workspace when user has no active membership and no external pending invite
  IF NOT EXISTS (
    SELECT 1 FROM workspace_members WHERE user_id = uid AND status = 'active'
  ) AND NOT EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE lower(wm.email) = lower(user_email)
      AND wm.status = 'pending'
      AND w.owner_id IS NOT NULL
      AND w.owner_id <> uid
  ) THEN
    ws_id := gen_random_uuid();
    ws_key := 'QAM-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));

    INSERT INTO workspaces (id, name, workspace_key, owner_id, owner_email)
    VALUES (ws_id, 'My Workspace', ws_key, uid, user_email);

    INSERT INTO workspace_members (workspace_id, user_id, email, display_name, role, status)
    VALUES (ws_id, uid, user_email, user_name, 'owner', 'active');
  END IF;

  RETURN jsonb_build_object('ok', true, 'user_id', uid);
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_workspace_access() TO authenticated;

-- 2) Immediate fix for Perfect QA Services accounts (case-insensitive)
UPDATE workspace_members
SET role = 'owner'
WHERE lower(email) IN (
  'sharma@perfectqsservices.com',
  'rahul@perfectqsservices.com'
)
AND status = 'active';

-- Also match Google sign-in casing variants
UPDATE workspace_members
SET role = 'owner'
WHERE status = 'active'
  AND role <> 'owner'
  AND (
    lower(email) LIKE 'sharma@%perfectqsservices.com'
    OR lower(email) LIKE 'rahul@%perfectqsservices.com'
  );

UPDATE workspaces w
SET owner_id = wm.user_id,
    owner_email = wm.email
FROM workspace_members wm
WHERE wm.workspace_id = w.id
  AND lower(wm.email) IN (
    'sharma@perfectqsservices.com',
    'rahul@perfectqsservices.com'
  )
  AND wm.status = 'active'
  AND wm.role = 'owner'
  AND (w.owner_id IS NULL OR w.owner_id <> wm.user_id);

-- 3) Verify
SELECT wm.email, wm.role, wm.status, w.name AS workspace, w.owner_email
FROM workspace_members wm
LEFT JOIN workspaces w ON w.id = wm.workspace_id
WHERE lower(wm.email) IN (
  'sharma@perfectqsservices.com',
  'rahul@perfectqsservices.com'
)
ORDER BY wm.email;
