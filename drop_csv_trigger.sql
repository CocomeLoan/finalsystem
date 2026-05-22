-- Drop the trigger and function since we're using cleaned CSV with correct column names
DROP TRIGGER IF EXISTS sync_csv_columns_trigger ON students;
DROP FUNCTION IF EXISTS sync_csv_columns_to_short_columns();

-- Optionally, drop the extra columns that were added for CSV import
-- Uncomment these lines if you want to remove the extra columns
-- ALTER TABLE students DROP COLUMN IF EXISTS "name";
-- ALTER TABLE students DROP COLUMN IF EXISTS "Course or Program Experience
-- I like the course/program I chose.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "I am interested in the subjects in my course.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "My course motivates me to study harder.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "Academic Performance/History
-- I am satisfied with my academic performance.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "My previous grades affect my current studies.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "I always try to improve my grades.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "Learning Behavior
-- I study regularly for my lessons.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "I submit my school requirements on time.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "I manage my study time well.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "Instructor Interaction
-- My instructors explain lessons clearly.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "I can easily approach my instructors when I have questions.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "My instructors encourage students to learn.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "Classmate/Peer Influence
-- My classmates influence me positively in school.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "I work well with my classmates during activities.";
-- ALTER TABLE students DROP COLUMN IF EXISTS "My friends motivate me to do better in my studies.";
