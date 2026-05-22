-- Add columns to match CSV headers with full question text
-- This allows direct import of CSV with question-based column names
-- These columns will be used alongside the existing short column names

-- Add new columns with full question text names (including newlines as they appear in CSV)
ALTER TABLE students ADD COLUMN IF NOT EXISTS "name" VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS "Course or Program Experience
I like the course/program I chose." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "I am interested in the subjects in my course." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "My course motivates me to study harder." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "Academic Performance/History
I am satisfied with my academic performance." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "My previous grades affect my current studies." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "I always try to improve my grades." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "Learning Behavior
I study regularly for my lessons." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "I submit my school requirements on time." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "I manage my study time well." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "Instructor Interaction
My instructors explain lessons clearly." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "I can easily approach my instructors when I have questions." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "My instructors encourage students to learn." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "Classmate/Peer Influence
My classmates influence me positively in school." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "I work well with my classmates during activities." INTEGER DEFAULT 3;
ALTER TABLE students ADD COLUMN IF NOT EXISTS "My friends motivate me to do better in my studies." INTEGER DEFAULT 3;

-- Create trigger to sync data from new columns to existing short columns
CREATE OR REPLACE FUNCTION sync_csv_columns_to_short_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- Copy data from CSV column names to short column names
    IF NEW."name" IS NOT NULL THEN
        NEW.full_name = NEW."name";
    END IF;
    
    IF NEW."Course or Program Experience
I like the course/program I chose." IS NOT NULL THEN
        NEW.like_course = NEW."Course or Program Experience
I like the course/program I chose.";
    END IF;
    
    IF NEW."I am interested in the subjects in my course." IS NOT NULL THEN
        NEW.interested_in_subjects = NEW."I am interested in the subjects in my course.";
    END IF;
    
    IF NEW."My course motivates me to study harder." IS NOT NULL THEN
        NEW.course_motivates = NEW."My course motivates me to study harder.";
    END IF;
    
    IF NEW."Academic Performance/History
I am satisfied with my academic performance." IS NOT NULL THEN
        NEW.satisfied_with_performance = NEW."Academic Performance/History
I am satisfied with my academic performance.";
    END IF;
    
    IF NEW."My previous grades affect my current studies." IS NOT NULL THEN
        NEW.previous_grades_affect = NEW."My previous grades affect my current studies.";
    END IF;
    
    IF NEW."I always try to improve my grades." IS NOT NULL THEN
        NEW.try_improve_grades = NEW."I always try to improve my grades.";
    END IF;
    
    IF NEW."Learning Behavior
I study regularly for my lessons." IS NOT NULL THEN
        NEW.study_regularly = NEW."Learning Behavior
I study regularly for my lessons.";
    END IF;
    
    IF NEW."I submit my school requirements on time." IS NOT NULL THEN
        NEW.submit_on_time = NEW."I submit my school requirements on time.";
    END IF;
    
    IF NEW."I manage my study time well." IS NOT NULL THEN
        NEW.manage_time_well = NEW."I manage my study time well.";
    END IF;
    
    IF NEW."Instructor Interaction
My instructors explain lessons clearly." IS NOT NULL THEN
        NEW.instructors_explain_clearly = NEW."Instructor Interaction
My instructors explain lessons clearly.";
    END IF;
    
    IF NEW."I can easily approach my instructors when I have questions." IS NOT NULL THEN
        NEW.approach_instructors = NEW."I can easily approach my instructors when I have questions.";
    END IF;
    
    IF NEW."My instructors encourage students to learn." IS NOT NULL THEN
        NEW.instructors_encourage = NEW."My instructors encourage students to learn.";
    END IF;
    
    IF NEW."Classmate/Peer Influence
My classmates influence me positively in school." IS NOT NULL THEN
        NEW.classmates_influence_positively = NEW."Classmate/Peer Influence
My classmates influence me positively in school.";
    END IF;
    
    IF NEW."I work well with my classmates during activities." IS NOT NULL THEN
        NEW.work_well_with_classmates = NEW."I work well with my classmates during activities.";
    END IF;
    
    IF NEW."My friends motivate me to do better in my studies." IS NOT NULL THEN
        NEW.friends_motivate = NEW."My friends motivate me to do better in my studies.";
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to sync on insert and update
DROP TRIGGER IF EXISTS sync_csv_columns_trigger ON students;
CREATE TRIGGER sync_csv_columns_trigger BEFORE INSERT OR UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION sync_csv_columns_to_short_columns();
