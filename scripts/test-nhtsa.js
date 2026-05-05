/**
 * Test NHTSA vPIC API decoder
 * 
 * Usage:
 *   node scripts/test-nhtsa.js                 # Test with sample VINs
 *   node scripts/test-nhtsa.js 1HGCV41JXFA109186
 *   node scripts/test-nhtsa.js 5TDJKRFH6LS123456
 */

import { decodeVin, validateVin, decodeVinBatch } from '../src/services/nhtsaService.js';

const SAMPLE_VINS = [
  '1HGCV41JXFA109186', // 2015 Honda Civic
  '5TDJKRFH6LS123456', // 2020 Toyota Highlander
  '1GTG6BE30F1267518', // 2015 GMC Sierra 1500
  'INVALID',            // Too short — should fail validation
  '1111111111111111I',  // Contains I — should fail validation
];

async function testSingleVin(vin) {
  console.log(`\n───────────────────────────────────────`);
  console.log(`VIN: ${vin}`);
  console.log(`───────────────────────────────────────`);

  // Test validation
  const validation = validateVin(vin);
  console.log(`Validation:  ${validation.valid ? '✓ PASS' : '✗ FAIL'}`);
  if (!validation.valid) {
    console.log(`  Reason: ${validation.reason}`);
    return;
  }

  // Test API call
  console.log(`Fetching from NHTSA...`);
  const start = Date.now();
  const result = await decodeVin(vin);
  const elapsed = Date.now() - start;

  console.log(`Status:      ${result.source}`);
  console.log(`Confidence:  ${result.confidence}`);
  console.log(`Time:        ${elapsed}ms`);

  if (result.error) {
    console.log(`Error:       ${result.error}`);
    return;
  }

  if (result.year || result.make || result.model) {
    console.log(`Year:        ${result.year || '(unknown)'}`);
    console.log(`Make:        ${result.make || '(unknown)'}`);
    console.log(`Model:       ${result.model || '(unknown)'}`);
  }

  if (result.bodyClass) console.log(`Body Class:  ${result.bodyClass}`);
  if (result.vehicleType) console.log(`Vehicle Type: ${result.vehicleType}`);
  if (result.manufacturer) console.log(`Manufacturer: ${result.manufacturer}`);
  if (result.plantCountry) console.log(`Plant Country: ${result.plantCountry}`);
}

async function main() {
  const args = process.argv.slice(2);
  const vins = args.length > 0 ? args : SAMPLE_VINS;

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`NHTSA vPIC API Decoder Test`);
  console.log(`${'═'.repeat(50)}`);

  if (args.length === 0) {
    console.log(`\nRunning tests with ${vins.length} sample VINs...`);
    console.log(`(Pass VINs as arguments to test specific ones)\n`);
  }

  // Test individual VINs
  for (const vin of vins) {
    await testSingleVin(vin);
  }

  // Test batch decode if we have multiple valid VINs
  const validVins = vins.filter((v) => validateVin(v).valid);
  if (validVins.length > 1) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`Testing batch decode (${validVins.length} VINs)...`);
    console.log(`${'═'.repeat(50)}\n`);

    const start = Date.now();
    const results = await decodeVinBatch(validVins);
    const elapsed = Date.now() - start;

    console.log(`Batch result: ${results.length} results in ${elapsed}ms`);
    results.forEach((r, i) => {
      console.log(`  [${i}] ${r.vin} → ${r.make || '?'} ${r.model || '?'} (${r.source})`);
    });
  }

  console.log(`\n${'═'.repeat(50)}\n`);
}

main().catch(console.error);
