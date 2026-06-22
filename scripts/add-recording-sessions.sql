-- Run in Supabase SQL Editor (project: lslwjxuhxnevntvjhyrd)
-- Persists Chrome extension recordings so they survive refresh / new browser sessions.

CREATE TABLE IF NOT EXISTS public.recording_sessions (
  id text PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_name text NOT NULL,
  url text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'converted', 'failed')),
  duration_ms bigint DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  viewport jsonb,
  browser_info jsonb,
  recorded_by text,
  module text,
  project_name text,
  tags text[] DEFAULT '{}',
  generated_test_case_ids text[] DEFAULT '{}',
  generated_scenario_id text,
  ai_ready_recording jsonb,
  raw_recording jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recording_sessions_workspace_idx
  ON public.recording_sessions (workspace_id, created_at DESC);

ALTER TABLE public.recording_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view workspace recordings" ON public.recording_sessions;
CREATE POLICY "Members can view workspace recordings" ON public.recording_sessions
  FOR SELECT USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Members can insert workspace recordings" ON public.recording_sessions;
CREATE POLICY "Members can insert workspace recordings" ON public.recording_sessions
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Members can update workspace recordings" ON public.recording_sessions;
CREATE POLICY "Members can update workspace recordings" ON public.recording_sessions
  FOR UPDATE USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Members can delete workspace recordings" ON public.recording_sessions;
CREATE POLICY "Members can delete workspace recordings" ON public.recording_sessions
  FOR DELETE USING (public.is_workspace_member(workspace_id));
