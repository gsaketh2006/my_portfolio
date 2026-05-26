-- Migration: Add visibility and source tracking to projects table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='is_visible') THEN
        ALTER TABLE projects ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='source') THEN
        ALTER TABLE projects ADD COLUMN source TEXT DEFAULT 'manual';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='github_id') THEN
        ALTER TABLE projects ADD COLUMN github_id TEXT;
    END IF;
END $$;

-- Update existing rows to have source = 'manual' if it's null (it should be default though)
UPDATE projects SET source = 'manual' WHERE source IS NULL;
UPDATE projects SET is_visible = TRUE WHERE is_visible IS NULL;
