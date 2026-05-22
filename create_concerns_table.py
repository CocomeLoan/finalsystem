import asyncio
from supabase import create_client

supabaseUrl = 'https://aitsnadsajzuzrinmavk.supabase.co'
supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdHNuYWRzYWp6dXpyaW5tYXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4OTY2MDAsImV4cCI6MjA5NDQ3MjYwMH0.82uJ_uGzveWmto-m-ZMW0lfkVYIZHEhUYKx4_-UZogE'

client = create_client(supabaseUrl, supabaseAnonKey)

# SQL to create concerns table
sql = """
CREATE TABLE IF NOT EXISTS concerns (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    department VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    replies JSONB DEFAULT '[]'::jsonb,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_concerns_student_id ON concerns(student_id);
CREATE INDEX IF NOT EXISTS idx_concerns_status ON concerns(status);
CREATE INDEX IF NOT EXISTS idx_concerns_department ON concerns(department);

ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for concerns" ON concerns;
CREATE POLICY "Enable all access for concerns" ON concerns FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_concerns_updated_at ON concerns;
CREATE TRIGGER update_concerns_updated_at BEFORE UPDATE ON concerns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
"""

try:
    result = client.rpc('exec_sql', {'sql': sql})
    print("Concerns table created successfully!")
except Exception as e:
    print(f"Error: {e}")
    print("\nPlease run the SQL manually in the Supabase SQL editor:")
    print("File: add_concerns_table.sql")
