// CommonJS — runs directly with Node without any build step.
const path = require('path');
const fs = require('fs');

// Load .env.local first (takes precedence over .env)
const root = process.cwd();
for (const file of ['.env.local', '.env']) {
  const p = path.resolve(root, file);
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p, override: false });
  }
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const TABLES = [
  'loads',
  'load_vehicles',
  'vehicle_specs',
  'load_assignments',
  'yard_stops',
  'delivery_stops',
  'operator_overrides',
];

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

const pass = (msg) => console.log(`  ${GREEN}✓ PASS${RESET}  ${msg}`);
const fail = (msg) => console.log(`  ${RED}✗ FAIL${RESET}  ${msg}`);

async function run() {
  console.log(`\n${BOLD}Montar — Supabase Connection Test${RESET}`);
  console.log('─'.repeat(50));

  // 1. Check env vars
  let envOk = true;
  console.log('\n[1] Environment variables');

  if (!SUPABASE_URL) {
    fail('VITE_SUPABASE_URL is missing');
    envOk = false;
  } else {
    pass(`VITE_SUPABASE_URL = ${SUPABASE_URL}`);
  }

  if (!SUPABASE_ANON_KEY) {
    fail('VITE_SUPABASE_ANON_KEY is missing');
    envOk = false;
  } else {
    pass(`VITE_SUPABASE_ANON_KEY = ${SUPABASE_ANON_KEY.slice(0, 20)}…`);
  }

  if (!envOk) {
    console.log(`\n${RED}Stopped: fix missing env vars before continuing.${RESET}`);
    console.log('Create .env.local in the project root:\n');
    console.log('  VITE_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('  VITE_SUPABASE_ANON_KEY=your-anon-key\n');
    process.exit(1);
  }

  // 2. Create client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 3. Check tables
  console.log('\n[2] Table access');
  let allPassed = true;

  for (const table of TABLES) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);

      if (!error) {
        pass(table);
      } else {
        allPassed = false;
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('does not exist') || msg.includes('relation')) {
          fail(`${table} — Table missing or inaccessible`);
        } else if (
          msg.includes('permission') || msg.includes('rls') ||
          msg.includes('policy') || error.code === '42501'
        ) {
          fail(`${table} — RLS/policy issue`);
        } else if (msg.includes('invalid api key') || error.code === 'PGRST301') {
          fail(`${table} — Invalid API key`);
        } else {
          fail(`${table} — ${error.message}`);
        }
      }
    } catch (err) {
      allPassed = false;
      fail(`${table} — Unexpected error: ${err.message}`);
    }
  }

  // 4. Summary
  console.log('\n' + '─'.repeat(50));
  if (allPassed) {
    console.log(`${GREEN}${BOLD}All checks passed.${RESET} Supabase is connected and all tables are accessible.\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}One or more checks failed.${RESET} See output above for details.\n`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
