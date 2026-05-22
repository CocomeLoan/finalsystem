-- Drop existing tables if they exist (to recreate with new schema)
DROP TABLE IF EXISTS subject_grades CASCADE;
DROP TABLE IF EXISTS training_logs CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Create students table with new feature structure
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    department VARCHAR(255),
    year INTEGER,
    email VARCHAR(255),
    
    -- A. Academic Performance (1-4 scale, higher = better)
    academic_consistency NUMERIC CHECK (academic_consistency IS NULL OR (academic_consistency >= 1 AND academic_consistency <= 4)),
    gpa_trend NUMERIC CHECK (gpa_trend IS NULL OR (gpa_trend >= 1 AND gpa_trend <= 4)),
    subject_mastery_level NUMERIC CHECK (subject_mastery_level IS NULL OR (subject_mastery_level >= 1 AND subject_mastery_level <= 4)),
    exam_performance_consistency NUMERIC CHECK (exam_performance_consistency IS NULL OR (exam_performance_consistency >= 1 AND exam_performance_consistency <= 4)),
    
    -- B. Learning Behavior (1-4 scale, higher = better)
    study_habits_consistency NUMERIC CHECK (study_habits_consistency IS NULL OR (study_habits_consistency >= 1 AND study_habits_consistency <= 4)),
    lms_engagement_level NUMERIC CHECK (lms_engagement_level IS NULL OR (lms_engagement_level >= 1 AND lms_engagement_level <= 4)),
    assignment_completion_rate NUMERIC CHECK (assignment_completion_rate IS NULL OR (assignment_completion_rate >= 1 AND assignment_completion_rate <= 4)),
    self_learning_initiative NUMERIC CHECK (self_learning_initiative IS NULL OR (self_learning_initiative >= 1 AND self_learning_initiative <= 4)),
    
    -- C. Instructor Interaction (1-4 scale, higher = better)
    class_participation NUMERIC CHECK (class_participation IS NULL OR (class_participation >= 1 AND class_participation <= 4)),
    responsiveness_to_feedback NUMERIC CHECK (responsiveness_to_feedback IS NULL OR (responsiveness_to_feedback >= 1 AND responsiveness_to_feedback <= 4)),
    consultation_frequency NUMERIC CHECK (consultation_frequency IS NULL OR (consultation_frequency >= 1 AND consultation_frequency <= 4)),
    
    -- D. Peer Influence (1-4 scale, higher = better)
    group_study_participation NUMERIC CHECK (group_study_participation IS NULL OR (group_study_participation >= 1 AND group_study_participation <= 4)),
    peer_collaboration_quality NUMERIC CHECK (peer_collaboration_quality IS NULL OR (peer_collaboration_quality >= 1 AND peer_collaboration_quality <= 4)),
    academic_peer_environment_strength NUMERIC CHECK (academic_peer_environment_strength IS NULL OR (academic_peer_environment_strength >= 1 AND academic_peer_environment_strength <= 4)),
    
    -- E. Course Experience (1-4 scale, higher = better)
    adaptation_to_course_difficulty NUMERIC CHECK (adaptation_to_course_difficulty IS NULL OR (adaptation_to_course_difficulty >= 1 AND adaptation_to_course_difficulty <= 4)),
    engagement_in_program_activities NUMERIC CHECK (engagement_in_program_activities IS NULL OR (engagement_in_program_activities >= 1 AND engagement_in_program_activities <= 4)),
    skill_development_alignment NUMERIC CHECK (skill_development_alignment IS NULL OR (skill_development_alignment >= 1 AND skill_development_alignment <= 4)),
    
    -- F. Financial Factors (1-4 scale, higher = better, reversed scoring applied)
    financial_stability NUMERIC CHECK (financial_stability IS NULL OR (financial_stability >= 1 AND financial_stability <= 4)),
    scholarship_support_level NUMERIC CHECK (scholarship_support_level IS NULL OR (scholarship_support_level >= 1 AND scholarship_support_level <= 4)),
    
    -- G. Personal Factors (1-4 scale, higher = better, stress uses reverse scoring)
    motivation_level NUMERIC CHECK (motivation_level IS NULL OR (motivation_level >= 1 AND motivation_level <= 4)),
    stress_level NUMERIC CHECK (stress_level IS NULL OR (stress_level >= 1 AND stress_level <= 4)),
    time_management_skills NUMERIC CHECK (time_management_skills IS NULL OR (time_management_skills >= 1 AND time_management_skills <= 4)),
    
    -- Target Variable (Risk Classification)
    risk_label INTEGER DEFAULT 0 CHECK (risk_label >= 0 AND risk_label <= 2),
    
    -- Legacy fields (kept for backward compatibility)
    study_hours NUMERIC DEFAULT 0,
    library_visits INTEGER DEFAULT 0,
    scholarship VARCHAR(10) DEFAULT 'no',
    scholarship_amount NUMERIC DEFAULT 0,
    family_income NUMERIC DEFAULT 0,
    lms_login_per_month INTEGER DEFAULT 0,
    gpa_history JSONB DEFAULT '[]'::jsonb,
    
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subject_grades table (kept for detailed grade tracking)
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

-- Create training_logs table with multi-class support
CREATE TABLE training_logs (
    id BIGSERIAL PRIMARY KEY,
    algorithm VARCHAR(100) NOT NULL,
    accuracy NUMERIC NOT NULL,
    precision NUMERIC,
    recall NUMERIC,
    f1_score NUMERIC,
    roc_auc NUMERIC,
    is_best BOOLEAN DEFAULT false,
    department VARCHAR(255),
    training_session_id VARCHAR(255),
    dataset_size INTEGER,
    confusion_matrix JSONB DEFAULT '[]'::jsonb,
    cv_accuracy_mean NUMERIC,
    cv_accuracy_std NUMERIC,
    cv_scores JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_risk_label ON students(risk_label);
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

-- Add comments for documentation
COMMENT ON TABLE students IS 'Student records with 22 performance features (1-4 scale) and risk classification';
COMMENT ON COLUMN students.risk_label IS '0 = Low Risk, 1 = Moderate Risk, 2 = High Risk';
COMMENT ON COLUMN students.stress_level IS 'Reverse scoring: 1 = high stress, 4 = low stress';
COMMENT ON COLUMN students.financial_stability IS 'Reverse scoring: 1 = high difficulty, 4 = stable';
COMMENT ON TABLE training_logs IS 'ML training logs with multi-class classification metrics';
