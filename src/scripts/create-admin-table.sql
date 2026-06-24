-- ===========================================
-- ZANKA: Admins Table
-- Run this in Supabase SQL Editor or via RPC
-- ===========================================

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  receive_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Grant service role full access (needed for backend admin API operations)
GRANT ALL ON admins TO service_role;

-- Seed default admin email
INSERT INTO admins (email, name, receive_notifications)
VALUES ('admin@zanka.shop', 'Zanka Administrator', true)
ON CONFLICT (email) DO NOTHING;
