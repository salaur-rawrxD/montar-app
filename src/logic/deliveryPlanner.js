import { SAMPLE_DEALERS } from '../data/sampleDealers.js';

const DEFAULT_DEALER = SAMPLE_DEALERS[0];

export function buildDeliveryPlan(loadPlan) {
  const vehicleCount = loadPlan?.slots?.length || 9;
  return {
    dealer: DEFAULT_DEALER,
    vehicleCount,
    multiStop: false,
    etaMin: 45,
  };
}
