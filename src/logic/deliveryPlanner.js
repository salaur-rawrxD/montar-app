import { RENTON_TOYOTA } from '../data/sampleDealers.js';

export function buildDeliveryPlan(loadPlan) {
  const vehicleCount = loadPlan?.slots?.length || 9;
  return {
    dealer: RENTON_TOYOTA,
    vehicleCount,
    multiStop: false,
    etaMin: RENTON_TOYOTA.etaMin,
  };
}
