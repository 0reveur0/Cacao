-- ═══════════════════════════════════════════════════════════════════════════════
-- CACAO TLMS: Assignments Table
-- Purpose: Long-form assignments, projects, and coding tasks for students
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core fields
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT DEFAULT '',

  -- Classification
  subject     TEXT DEFAULT 'General',
  type        TEXT DEFAULT 'PROJECT' CHECK (type IN ('ESSAY', 'CODE', 'PROJECT', 'QUIZ', 'RESEARCH')),

  -- Status tracking
  status      TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED')),
  priority    TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),

  -- Dates
  due_date    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  -- Content storage
  content     TEXT DEFAULT '',
  attached_files JSONB DEFAULT '[]'::jsonb,

  -- Feedback & Scoring
  score       INTEGER,
  has_feedback BOOLEAN DEFAULT FALSE,
  feedback    JSONB,

  -- Metadata
  author_name TEXT
);

-- ─── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_user_status ON public.assignments(user_id, status);

-- ─── Enable RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ──────────────────────────────────────────────────────────────

-- SELECT: Users can view only their own assignments
DROP POLICY IF EXISTS "select_own_assignments" ON public.assignments;
CREATE POLICY "select_own_assignments" ON public.assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can insert only their own assignments
DROP POLICY IF EXISTS "insert_own_assignments" ON public.assignments;
CREATE POLICY "insert_own_assignments" ON public.assignments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update only their own assignments
DROP POLICY IF EXISTS "update_own_assignments" ON public.assignments;
CREATE POLICY "update_own_assignments" ON public.assignments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete only their own assignments
DROP POLICY IF EXISTS "delete_own_assignments" ON public.assignments;
CREATE POLICY "delete_own_assignments" ON public.assignments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
