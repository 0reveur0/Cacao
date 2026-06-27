/*
# Create lesson_notes table for personal class notes

1. New Tables
- `lesson_notes`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
  - `lesson_id` (text, not null, identifies which lesson these notes belong to)
  - `content` (text, not null, stores the markdown/notes content)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Unique Constraint
- One note per user per lesson: `@@unique([user_id, lesson_id])`

3. Security
- RLS enabled on `lesson_notes`.
- Owner-scoped CRUD: each authenticated user can only access their own lesson notes.
- Policies:
  - SELECT: users can view own notes
  - INSERT: users can insert own notes (user_id defaults to auth.uid())
  - UPDATE: users can update own notes
  - DELETE: users can delete own notes

4. Notes
- `content` field stores structured markdown with timestamp references
- Timestamps in notes follow format: `⏱️ MM:SS - [note text]`
- When a user opens a lesson, we fetch their existing note or create empty
*/

CREATE TABLE IF NOT EXISTS lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_lesson_note UNIQUE (user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can read only their own notes
DROP POLICY IF EXISTS "select_own_lesson_notes" ON lesson_notes;
CREATE POLICY "select_own_lesson_notes" ON lesson_notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- INSERT: Users can insert only their own notes
DROP POLICY IF EXISTS "insert_own_lesson_notes" ON lesson_notes;
CREATE POLICY "insert_own_lesson_notes" ON lesson_notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update only their own notes
DROP POLICY IF EXISTS "update_own_lesson_notes" ON lesson_notes;
CREATE POLICY "update_own_lesson_notes" ON lesson_notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete only their own notes
DROP POLICY IF EXISTS "delete_own_lesson_notes" ON lesson_notes;
CREATE POLICY "delete_own_lesson_notes" ON lesson_notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Create index for efficient lookups by user and lesson
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson ON lesson_notes(user_id, lesson_id);
