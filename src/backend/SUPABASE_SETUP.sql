-- Create users table for Supabase authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  provider VARCHAR(50) NOT NULL,
  picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on provider for filtering by auth provider
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sync new users from auth.users to public.users automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, provider, picture)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create projects table to manage project entities
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  priority VARCHAR(50) DEFAULT 'medium',
  total_story_points INTEGER DEFAULT 10,
  remaining_story_points INTEGER DEFAULT 10,
  start_date DATE,
  target_date DATE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bugs table with foreign keys referencing projects
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  test_case_title TEXT NOT NULL,
  error_message TEXT,
  code_snippet TEXT,
  developer_notes TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on bugs project_id for faster filtration
CREATE INDEX IF NOT EXISTS idx_bugs_project_id ON bugs(project_id);

-- Create sprints table to support Agile Sprint Planning Engine
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  goal_description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Active', 'Completed')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  story_points_allocated INTEGER NOT NULL DEFAULT 0,
  sprint_lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sprint_members UUID[] DEFAULT '{}',
  sprint_developers UUID[] DEFAULT '{}',
  sprint_testers UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on sprints project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON public.sprints(project_id);

-- Create test_plans table
CREATE TABLE IF NOT EXISTS public.test_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on test_plans project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_plans_project_id ON public.test_plans(project_id);

-- ─── Super Admin Access Tables ───
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.super_admins (email) 
VALUES ('vihan@qanexus.ai')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.super_admin_config (
  key VARCHAR(50) PRIMARY KEY,
  value VARCHAR(255) NOT NULL
);

-- Hashed value for "SuperAdmin123!" using SHA-256 is "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
INSERT INTO public.super_admin_config (key, value)
VALUES ('master_password_hash', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by VARCHAR(255) NOT NULL,
  new_password_hash VARCHAR(255) NOT NULL,
  approvals JSONB NOT NULL DEFAULT '[]', -- JSON array of admin emails who approved
  is_executed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Project Schema Extensions & Suite Storage ───
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_lead_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS team_members UUID[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── Multi-User Workspace & Advanced Schema ───

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  workspace_key VARCHAR(255) NOT NULL UNIQUE,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  owner_email VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'standard',
  billing_status VARCHAR(50) DEFAULT 'active',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Nullable for pending invites
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  job_title VARCHAR(255),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  avatar_color VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending')),
  UNIQUE(workspace_id, email)
);

-- Add workspace_id to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Create test_suites table
CREATE TABLE IF NOT EXISTS public.test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test_cases table
CREATE TABLE IF NOT EXISTS public.test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  steps TEXT,
  expected TEXT,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  author_status VARCHAR(50) DEFAULT 'draft' CHECK (author_status IN ('draft', 'ready', 'approved')),
  last_run_status VARCHAR(50) CHECK (last_run_status IN ('passed', 'failed', 'skipped')),
  last_run_id UUID,
  tags TEXT[] DEFAULT '{}',
  type VARCHAR(50) CHECK (type IN ('functional', 'regression', 'smoke', 'performance', 'security', 'integration', 'e2e')),
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  requirement_id VARCHAR(255),
  source_recording_id UUID,
  module_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test_runs table
CREATE TABLE IF NOT EXISTS public.test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  suite_id UUID REFERENCES public.test_suites(id) ON DELETE SET NULL,
  suite_name VARCHAR(255),
  project_name VARCHAR(255),
  duration INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'passed', 'failed', 'aborted')),
  coverage NUMERIC,
  environment VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test_run_results table
CREATE TABLE IF NOT EXISTS public.test_run_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('passed', 'failed', 'skipped')),
  duration INTEGER DEFAULT 0,
  error_message TEXT
);

-- Update bugs table to include workspace_id and additional columns
ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS test_case_id UUID REFERENCES public.test_cases(id) ON DELETE SET NULL;
ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS run_id UUID REFERENCES public.test_runs(id) ON DELETE SET NULL;
ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS recording_session_id UUID;
ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS severity VARCHAR(50) DEFAULT 'major' CHECK (severity IN ('blocker', 'critical', 'major', 'minor', 'trivial'));
ALTER TABLE public.bugs ADD COLUMN IF NOT EXISTS environment VARCHAR(255);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

