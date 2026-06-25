/*
# Create profiles table for Cacao TLMS

This migration creates a `profiles` table that extends Supabase's built-in auth.users with additional user data needed for the Cacao Learning Management System.

## 1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) - Links to Supabase auth
  - `name` (text, not null) - User's display name
  - `role` (text, not null, default 'STUDENT') - User role: 'STUDENT', 'TEACHER', or 'ADMIN'
  - `avatar_url` (text, nullable) - Optional avatar URL
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

## 2. Security
- Enable RLS on `profiles`.
- Users can only read/update their own profile.
- New users can insert their own profile on signup.

## 3. Important Notes
1. This table uses Supabase's built-in auth.users for authentication
2. Role values are validated via CHECK constraint
3. A trigger automatically creates a profile when a new user signs up via auth.users
4. The profile is linked to auth.users via the id field (same UUID)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT')
  );
  RETURN NEW;
END;
$$;

-- Trigger the function on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster profile lookups
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
