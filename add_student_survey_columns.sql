-- Add missing survey question to students table
-- Academic Performance/History: "I always try to improve my grades"
ALTER TABLE students ADD COLUMN IF NOT EXISTS try_improve_grades INTEGER DEFAULT 3;
