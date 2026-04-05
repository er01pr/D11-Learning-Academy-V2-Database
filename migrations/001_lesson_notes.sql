-- Migration 001: Add notes JSON column to profiles table
-- Used by the Lesson Notes feature to persist per-lesson notes

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notes jsonb DEFAULT '{}'::jsonb;

-- Notes structure: { "lessonId": "note content string", ... }
COMMENT ON COLUMN profiles.notes IS 'JSON object mapping lessonId to note content string';
