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

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const sqlPath = path.join(__dirname, 'add-likes-column.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log("Adding 'likes' column to 'products' table...");
  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.warn("RPC 'exec_sql' failed:", error.message);
    const { data, error: selectErr } = await supabase.from('products').select('id, likes').limit(1);
    if (selectErr) {
      console.log("SQL TO RUN IN SUPABASE SQL EDITOR:", sql);
    } else {
      console.log("'likes' column exists on 'products' table!");
    }
  } else {
    console.log("Successfully added 'likes' column to 'products' table!");
  }
}

runMigration();
