-- Add random_seed column to training_logs table
ALTER TABLE training_logs ADD COLUMN IF NOT EXISTS random_seed INTEGER;
