import { SEED_VEHICLES } from '../data/mockVehicles.js';

const SEED_MAP = Object.fromEntries(SEED_VEHICLES.map((v) => [v.vin, v]));

// Stub — returns mock data for known VINs; real implementation calls api.nhtsa.dot.gov
export async function decodeVin(vin) {
  const known = SEED_MAP[vin];
  if (known) {
    return {
      vin: known.vin,
      year: String(known.year),
      make: known.make,
      model: known.model,
      bodyStyle: known.type,
      source: 'mock',
    };
  }
  return { vin, year: null, make: null, model: null, bodyStyle: null, source: 'unknown' };
}

export async function decodeVinBatch(vins) {
  return Promise.all(vins.map(decodeVin));
}
