const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually to avoid dependency issues
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
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("Reading create-order-tables.sql...");
  const sqlPath = path.join(__dirname, 'create-order-tables.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`Error: SQL file not found at ${sqlPath}`);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log("Running migrations on Supabase via RPC 'exec_sql'...");
  const { error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error("Failed to create tables via RPC:", error.message);
    console.log("\n--- SQL COMMANDS FOR MANUAL EXECUTION ---");
    console.log(sql);
    console.log("-----------------------------------------");
    console.log("\nPlease copy the SQL block above and run it manually in the Supabase SQL Editor.");
  } else {
    console.log("Database tables created and policies configured successfully!");
  }
}

runMigration();
