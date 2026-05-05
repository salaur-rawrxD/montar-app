/**
 * Test Auto.dev vehicle specs via Supabase Edge Function
 *
 * Usage:
 *   npm run test:auto-dev                          # Test with sample VIN
 *   npm run test:auto-dev 5TDJKRFH6LS123456         # Test with specific VIN
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_VIN = '5TDJKRFH6LS123456'; // 2020 Toyota Highlander

async function testAutoDevSpecs(vin) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Testing: ${vin}`);
  console.log(`${'─'.repeat(50)}\n`);

  try {
    const start = Date.now();
    const { data, error } = await supabase.functions.invoke('decode-vehicle-specs', {
      body: { vin },
    });
    const elapsed = Date.now() - start;

    if (error) {
      console.error(`❌ Function error: ${error.message}`);
      return false;
    }

    if (!data) {
      console.error('❌ No data returned');
      return false;
    }

    console.log(`✓ Status: ${data.source}`);
    console.log(`✓ Confidence: ${data.confidence}`);
    console.log(`✓ Needs verification: ${data.needsVerification}`);
    console.log(`✓ From cache: ${data.fromCache ? 'YES' : 'NO'}`);
    console.log(`✓ Time: ${elapsed}ms\n`);

    if (data.year) console.log(`  Year: ${data.year}`);
    if (data.make) console.log(`  Make: ${data.make}`);
    if (data.model) console.log(`  Model: ${data.model}`);
    if (data.trim) console.log(`  Trim: ${data.trim}`);
    if (data.bodyStyle) console.log(`  Body style: ${data.bodyStyle}`);
    if (data.vehicleType) console.log(`  Vehicle type: ${data.vehicleType}`);

    if (data.curbWeightLb) console.log(`  Curb weight: ${data.curbWeightLb} lbs`);
    if (data.lengthIn) console.log(`  Length: ${data.lengthIn}"`);
    if (data.widthIn) console.log(`  Width: ${data.widthIn}"`);
    if (data.heightIn) console.log(`  Height: ${data.heightIn}"`);
    if (data.groundClearanceIn) console.log(`  Ground clearance: ${data.groundClearanceIn}"`);

    return true;
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const vins = args.length > 0 ? args : [SAMPLE_VIN];

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Auto.dev Specs via Supabase Edge Function`);
  console.log(`${'═'.repeat(50)}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Function: decode-vehicle-specs`);

  let passed = 0;
  let failed = 0;

  for (const vin of vins) {
    const result = await testAutoDevSpecs(vin);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'═'.repeat(50)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
