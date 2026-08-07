-- ===========================================
-- ZANKA: Add is_sold_out column to products table
-- Run this in Supabase SQL Editor or via node script
-- ===========================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT false;
