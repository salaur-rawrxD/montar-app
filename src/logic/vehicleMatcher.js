import { SEED_VEHICLES } from '../data/mockVehicles.js';

const SEED_MAP = Object.fromEntries(SEED_VEHICLES.map((v) => [v.vin, v]));

export function matchVehicles(vins) {
  return vins.map((vin) => {
    const known = SEED_MAP[vin];
    if (known) return { ...known, matched: true, needsVerification: false };
    return {
      vin,
      year: null,
      make: 'Unknown',
      model: 'Unknown — needs verification',
      weightLb: 3800,
      heightIn: 60,
      type: 'sedan',
      dealerCode: '—',
      stallId: '—',
      matched: false,
      needsVerification: true,
    };
  });
}
