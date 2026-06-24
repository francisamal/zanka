-- ===========================================
-- ZANKA: Notification Logs Table
-- Run this via RPC 'exec_sql'
-- ===========================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID, -- Can be NULL if not linked to a specific order
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL, -- 'customer' or 'admin'
  subject TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent' or 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Grant service role full access (needed for backend logging operations)
GRANT ALL ON notification_logs TO service_role;
