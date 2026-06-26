/*
# Create schedule_events table

## Summary
Adds a `schedule_events` table to store course calendar events per user: live classes,
assignment deadlines, and quiz release schedules. Each event has a type enum, date range,
color tag for visual grouping, and is owner-scoped so each authenticated student sees only
their own events.

## New Tables
- `schedule_events`
  - `id` (uuid, PK, auto-generated)
  - `user_id` (uuid, FK → auth.users, defaults to auth.uid())
  - `title` (text, not null) — event display name
  - `start_date` (timestamptz, not null) — event start
  - `end_date` (timestamptz, not null) — event end
  - `type` (text, not null) — one of: LIVE_CLASS, ASSIGNMENT, QUIZ
  - `color_tag` (text) — hex or named color for the calendar badge
  - `lesson_id` (text) — optional link to a lesson
  - `created_at` (timestamptz, auto)

## Security
- RLS enabled; 4 owner-scoped policies (SELECT / INSERT / UPDATE / DELETE) for `authenticated`.
- `user_id` defaults to `auth.uid()` so client inserts never need to pass it explicitly.
*/

CREATE TABLE IF NOT EXISTS schedule_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date   timestamptz NOT NULL,
  type       text NOT NULL CHECK (type IN ('LIVE_CLASS', 'ASSIGNMENT', 'QUIZ')),
  color_tag  text NOT NULL DEFAULT '#C5A880',
  lesson_id  text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_events_user_date
  ON schedule_events (user_id, start_date);

ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_events"  ON schedule_events;
DROP POLICY IF EXISTS "insert_own_events"  ON schedule_events;
DROP POLICY IF EXISTS "update_own_events"  ON schedule_events;
DROP POLICY IF EXISTS "delete_own_events"  ON schedule_events;

CREATE POLICY "select_own_events" ON schedule_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_events" ON schedule_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_events" ON schedule_events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_events" ON schedule_events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
