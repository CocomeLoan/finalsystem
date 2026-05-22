-- Drop existing predictions table if it exists
DROP TABLE IF EXISTS predictions CASCADE;

-- Create predictions table with all columns including categorized risk analysis
CREATE TABLE predictions (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    student_name VARCHAR(255),
    department VARCHAR(255),
    result VARCHAR(50) NOT NULL CHECK (result IN ('Good Standing', 'Moderate Risk', 'At-Risk')),
    confidence NUMERIC,
    model_used VARCHAR(100),
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    explanation TEXT,
    recommendations JSONB DEFAULT '[]'::jsonb,
    feature_importance JSONB DEFAULT '[]'::jsonb,
    prediction_type VARCHAR(20) CHECK (prediction_type IN ('basic', 'advanced')),
    financial_risk JSONB DEFAULT '{}'::jsonb,
    personal_risk JSONB DEFAULT '{}'::jsonb,
    academic_risk JSONB DEFAULT '{}'::jsonb,
    overall_risk_score NUMERIC DEFAULT 0,
    risk_percentage NUMERIC DEFAULT 0,
    llm_explanation TEXT,
    llm_recommendations JSONB DEFAULT '[]'::jsonb,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_predictions_student_id ON predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_predictions_result ON predictions(result);
CREATE INDEX IF NOT EXISTS idx_predictions_created_date ON predictions(created_date);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Enable all access for predictions" ON predictions FOR ALL USING (true) WITH CHECK (true);
