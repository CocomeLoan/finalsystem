-- Create concerns table for student concerns/conversations
CREATE TABLE IF NOT EXISTS concerns (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    department VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    replies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add created_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'concerns' AND column_name = 'created_date'
    ) THEN
        ALTER TABLE concerns ADD COLUMN created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'concerns' AND column_name = 'name'
    ) THEN
        ALTER TABLE concerns ADD COLUMN name VARCHAR(255);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_concerns_student_id ON concerns(student_id);
CREATE INDEX IF NOT EXISTS idx_concerns_status ON concerns(status);
CREATE INDEX IF NOT EXISTS idx_concerns_department ON concerns(department);

-- Enable Row Level Security
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Enable all access for concerns" ON concerns;
CREATE POLICY "Enable all access for concerns" ON concerns FOR ALL USING (true) WITH CHECK (true);

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_concerns_updated_at ON concerns;
CREATE TRIGGER update_concerns_updated_at BEFORE UPDATE ON concerns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
