-- Drop existing tables if they exist (to recreate with proper constraints)
DROP TABLE IF EXISTS subject_grades CASCADE;
DROP TABLE IF EXISTS training_logs CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Create students table with updated schema matching actual dataset
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    department VARCHAR(255),
    year_level INTEGER,
    email VARCHAR(255),
    -- Basic Academic Data
    study_hours NUMERIC DEFAULT 0,
    library_visits INTEGER DEFAULT 0,
    lms_login_per_month INTEGER DEFAULT 0,
    -- Financial Factors
    scholarship VARCHAR(10) DEFAULT 'no',
    scholarship_amount NUMERIC DEFAULT 0,
    family_income NUMERIC DEFAULT 0,
    -- GPA History (individual columns)
    gpa_y1s1 NUMERIC DEFAULT 0,
    gpa_y1s2 NUMERIC DEFAULT 0,
    gpa_y2s1 NUMERIC DEFAULT 0,
    gpa_y2s2 NUMERIC DEFAULT 0,
    gpa_y3s1 NUMERIC DEFAULT 0,
    -- Course or Program Experience (Likert 1-5)
    like_course INTEGER DEFAULT 3,
    interested_in_subjects INTEGER DEFAULT 3,
    course_motivates INTEGER DEFAULT 3,
    -- Academic Performance/History (Likert 1-5)
    satisfied_with_performance INTEGER DEFAULT 3,
    previous_grades_affect INTEGER DEFAULT 3,
    -- Learning Behavior (Likert 1-5)
    study_regularly INTEGER DEFAULT 3,
    submit_on_time INTEGER DEFAULT 3,
    manage_time_well INTEGER DEFAULT 3,
    -- Instructor Interaction (Likert 1-5)
    instructors_explain_clearly INTEGER DEFAULT 3,
    approach_instructors INTEGER DEFAULT 3,
    instructors_encourage INTEGER DEFAULT 3,
    -- Classmate/Peer Influence (Likert 1-5)
    classmates_influence_positively INTEGER DEFAULT 3,
    work_well_with_classmates INTEGER DEFAULT 3,
    friends_motivate INTEGER DEFAULT 3,
    -- Student Concerns (text field for open-ended responses)
    concerns TEXT,
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subject_grades table
CREATE TABLE subject_grades (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade NUMERIC NOT NULL,
    semester VARCHAR(50),
    school_year VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create training_logs table
CREATE TABLE training_logs (
    id BIGSERIAL PRIMARY KEY,
    algorithm VARCHAR(100) NOT NULL,
    accuracy NUMERIC NOT NULL,
    precision NUMERIC,
    recall NUMERIC,
    f1_score NUMERIC,
    roc_auc NUMERIC,
    confusion_matrix JSONB,
    cv_accuracy_mean NUMERIC,
    cv_accuracy_std NUMERIC,
    cv_scores JSONB,
    is_best BOOLEAN DEFAULT false,
    department VARCHAR(255),
    training_session_id VARCHAR(255),
    dataset_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_subject_grades_student_id ON subject_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_session_id ON training_logs(training_session_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_department ON training_logs(department);

-- Enable Row Level Security (optional, for Supabase)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust as needed for production)
CREATE POLICY "Enable all access for students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for subject_grades" ON subject_grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for training_logs" ON training_logs FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_grades_updated_at BEFORE UPDATE ON subject_grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
