-- Add columns for categorized risk analysis to predictions table
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS financial_risk JSONB DEFAULT '{}'::jsonb;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS personal_risk JSONB DEFAULT '{}'::jsonb;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS academic_risk JSONB DEFAULT '{}'::jsonb;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS overall_risk_score NUMERIC DEFAULT 0;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS risk_percentage NUMERIC DEFAULT 0;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS llm_explanation TEXT;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS llm_recommendations JSONB DEFAULT '[]'::jsonb;
