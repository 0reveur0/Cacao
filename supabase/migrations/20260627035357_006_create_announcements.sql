/*
# Create announcements table

## Summary
Adds an `announcements` table to power the Cacao TLMS Announcement & Updates Feed.
Stores platform-wide notices (exam schedules, feature releases, course updates) with
category tagging, pin support, and rich-text markdown content.

## New Tables
- `announcements`
  - `id` (uuid, PK, auto-generated)
  - `title` (text, not null) — headline of the announcement
  - `content` (text, not null) — markdown body
  - `category` (text, not null) — one of: EXAM, FEATURE, GENERAL
  - `pinned` (boolean, default false) — pinned posts float to top
  - `author_id` (uuid, FK → auth.users, nullable) — who posted it; null = system
  - `author_name` (text, nullable) — denormalized display name
  - `created_at` (timestamptz, auto)
  - `updated_at` (timestamptz, auto)

## Security
- RLS enabled.
- Anyone authenticated (students) can SELECT all announcements — they are platform-wide.
- Only users with role = ADMIN (checked via profiles table) can INSERT / UPDATE / DELETE.
- A helper function `is_admin()` is created to keep policies readable.
*/

CREATE TABLE IF NOT EXISTS announcements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  content     text NOT NULL DEFAULT '',
  category    text NOT NULL DEFAULT 'GENERAL'
                CHECK (category IN ('EXAM', 'FEATURE', 'GENERAL')),
  pinned      boolean NOT NULL DEFAULT false,
  author_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned_date
  ON announcements (pinned DESC, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Helper: true when the calling user is an ADMIN in profiles
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- SELECT: any authenticated user can read all announcements
DROP POLICY IF EXISTS "authenticated_select_announcements" ON announcements;
CREATE POLICY "authenticated_select_announcements" ON announcements FOR SELECT
  TO authenticated USING (true);

-- INSERT: only admins
DROP POLICY IF EXISTS "admin_insert_announcements" ON announcements;
CREATE POLICY "admin_insert_announcements" ON announcements FOR INSERT
  TO authenticated WITH CHECK (is_admin());

-- UPDATE: only admins
DROP POLICY IF EXISTS "admin_update_announcements" ON announcements;
CREATE POLICY "admin_update_announcements" ON announcements FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- DELETE: only admins
DROP POLICY IF EXISTS "admin_delete_announcements" ON announcements;
CREATE POLICY "admin_delete_announcements" ON announcements FOR DELETE
  TO authenticated USING (is_admin());

-- Seed three sample announcements so the feed is never empty
INSERT INTO announcements (title, content, category, pinned, author_name)
VALUES
  (
    '📅 Mid-Term Examination Schedule — July 2026',
    E'The mid-term examinations for all active courses are scheduled as follows:\n\n**SQL Fundamentals (Lesson 1–3):** 15 July 2026, 9:00 AM\n**TypeScript Deep Dive (Lesson 4–6):** 17 July 2026, 10:00 AM\n\nAll exams are conducted through the platform''s live quiz system. Please ensure you have reviewed all concepts in your lesson''s toggle blocks before the exam date.\n\n> Results will be published within 24 hours via the AI feedback system.',
    'EXAM',
    true,
    'Cacao Academic Office'
  ),
  (
    '✨ New Feature: Pomodoro Focus Timer & Smart Calendar',
    E'We have shipped two major productivity features to your student dashboard:\n\n**Pomodoro Focus Timer** — a minimalist ☕/🌿 session tracker integrated directly into your sidebar. Sessions are counted per day.\n\n**Course Schedule Calendar** — a full monthly calendar view with color-coded event types: Live Class, Assignment deadlines, and Quiz releases. Events are stored per-student and synced to your account.\n\nBoth features are live now. Check your Dashboard sidebar to get started.',
    'FEATURE',
    false,
    'Cacao Product Team'
  ),
  (
    '📣 Course Enrollment Open: SQL & Database Design — Cohort 3',
    E'Enrollment for **Cohort 3** of the SQL & Database Design course is now open.\n\nThis course covers:\n- SELECT, WHERE, ORDER BY fundamentals\n- JOIN types and table aliases\n- INDEX optimization and GROUP BY aggregation\n- HAVING clause and subquery patterns\n\nCohort 3 starts **1 August 2026**. Seats are limited to 30 students per cohort to ensure quality mentor feedback.\n\nContact your academic advisor or use the enrollment form in Settings to register.',
    'GENERAL',
    false,
    'Cacao Admissions'
  )
ON CONFLICT DO NOTHING;
