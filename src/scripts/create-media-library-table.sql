-- ===========================================
-- ZANKA: Media Library Table Schema
-- Run this in Supabase SQL Editor or via node migration
-- ===========================================

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Allow public read access to media library
CREATE POLICY "Allow public read access to media_library"
  ON media_library FOR SELECT
  USING (true);

-- Allow public insert access to media_library
CREATE POLICY "Allow public insert access to media_library"
  ON media_library FOR INSERT
  WITH CHECK (true);

-- Allow public delete access to media_library
CREATE POLICY "Allow public delete access to media_library"
  ON media_library FOR DELETE
  USING (true);
