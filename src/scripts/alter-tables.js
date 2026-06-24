const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const sql1 = `ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT; ALTER TABLE customers ADD COLUMN IF NOT EXISTS pincode TEXT;`;
  const { error: e1 } = await supabase.rpc('exec_sql', { query: sql1 });
  console.log('customers alter:', e1 ? e1.message : 'success');

  const sql2 = `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT; ALTER TABLE orders ADD COLUMN IF NOT EXISTS pincode TEXT; ALTER TABLE orders ADD COLUMN IF NOT EXISTS comments TEXT;`;
  const { error: e2 } = await supabase.rpc('exec_sql', { query: sql2 });
  console.log('orders alter:', e2 ? e2.message : 'success');
}
run();
