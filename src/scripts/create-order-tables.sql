-- ===========================================
-- ZANKA: Customers, Orders & Order Items Tables
-- Run this in Supabase SQL Editor
-- ===========================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  amount INTEGER NOT NULL, -- amount in INR (Rupees)
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT, -- References slug in products table
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- Price in INR (Rupees)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public insert for customers (anyone can register/sign in)
CREATE POLICY "Allow public insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Allow public select for customers (so front-end can retrieve signed-in customer info)
CREATE POLICY "Allow public read customers"
  ON customers FOR SELECT
  USING (true);

-- Allow public insert for orders (anyone can place an order)
CREATE POLICY "Allow public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Allow public select for orders
CREATE POLICY "Allow public read orders"
  ON orders FOR SELECT
  USING (true);

-- Allow public update for orders (needed to update status on payment confirmation from client/webhook)
CREATE POLICY "Allow public update orders"
  ON orders FOR UPDATE
  USING (true);

-- Allow public insert for order items
CREATE POLICY "Allow public insert order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Allow public select for order items
CREATE POLICY "Allow public read order_items"
  ON order_items FOR SELECT
  USING (true);

-- Grant service role full access (for backend admin API operations)
GRANT ALL ON customers TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_items TO service_role;
