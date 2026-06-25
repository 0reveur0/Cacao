-- Submissions and Feedback Tables for AI Diagnostic System
-- Cacao TLMS - Mastery Learning & Descriptive Feedback

-- Submissions table: stores student submissions for lessons/assignments
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  submission_type VARCHAR(20) DEFAULT 'quiz' CHECK (submission_type IN ('quiz', 'code', 'essay')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'REVIEWED', 'FAILED')),
  answers JSONB,
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table: stores AI-generated descriptive feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Structured feedback components (JSON format from AI)
  greeting TEXT,
  positive_points JSONB DEFAULT '[]'::jsonb,
  gap_analysis JSONB DEFAULT '[]'::jsonb,
  action_plan JSONB DEFAULT '[]'::jsonb,
  encouragement TEXT,

  -- Raw AI response for backup
  raw_response TEXT,

  -- Metadata
  model_used VARCHAR(50) DEFAULT 'gemini-3.5-flash',
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(submission_id)
);

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submissions
CREATE POLICY "users_view_own_submissions" ON submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_submissions" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for feedback
CREATE POLICY "users_view_own_feedback" ON feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_feedback" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_lesson_id ON submissions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_submission_id ON feedback(submission_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- Updated_at trigger for submissions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();