-- Migration 002: Add achievements and streak tracking to profiles table
-- Used by the Achievement & Streak System

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_activity_date date;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0;

-- Achievements structure: ["badge-id-1", "badge-id-2", ...]
COMMENT ON COLUMN profiles.achievements IS 'JSON array of earned badge IDs';
COMMENT ON COLUMN profiles.last_activity_date IS 'Date of last lesson completion, for streak tracking';
COMMENT ON COLUMN profiles.streak_count IS 'Current consecutive-day learning streak';
