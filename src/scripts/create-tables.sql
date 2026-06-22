-- ===========================================
-- ZANKA: Reviews & Community Posts Tables
-- Run this in Supabase SQL Editor
-- ===========================================

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  product_name TEXT,
  image_url TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  instagram_handle TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved reviews
CREATE POLICY "Allow public read approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Allow public insert for reviews (anyone can submit)
CREATE POLICY "Allow public insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Allow public read access to approved posts
CREATE POLICY "Allow public read approved posts"
  ON community_posts FOR SELECT
  USING (is_approved = true);

-- Allow public insert for posts (anyone can submit)
CREATE POLICY "Allow public insert posts"
  ON community_posts FOR INSERT
  WITH CHECK (true);

-- Grant service role full access (for admin/API)
GRANT ALL ON reviews TO service_role;
GRANT ALL ON community_posts TO service_role;
