import { SEED_VEHICLES } from '../data/mockVehicles.js';

const SEED_MAP = Object.fromEntries(SEED_VEHICLES.map((v) => [v.vin, v]));

// Stub — returns mock specs; real implementation would query a vehicle specs DB
export async function getVehicleSpecs(vin) {
  const known = SEED_MAP[vin];
  if (known) {
    return {
      vin: known.vin,
      weightLb: known.weightLb,
      heightIn: known.heightIn,
      type: known.type,
      source: 'mock',
      operatorVerificationRequired: false,
    };
  }
  return {
    vin,
    weightLb: 3800,
    heightIn: 60,
    type: 'sedan',
    source: 'estimated',
    operatorVerificationRequired: true,
  };
}
