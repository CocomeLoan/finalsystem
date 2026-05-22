-- Add full_name column if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
