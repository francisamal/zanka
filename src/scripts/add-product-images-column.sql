-- ===========================================
-- ZANKA: Add images column to products table
-- Run this in Supabase SQL Editor or via node script
-- ===========================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
