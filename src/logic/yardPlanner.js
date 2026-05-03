import { YARD_STOPS } from '../data/sampleYards.js';

export function buildYardStops(loadPlan) {
  if (!loadPlan) return [...YARD_STOPS];
  // Map load plan slots to stall IDs, then find matching yard stops
  const stallIds = loadPlan.slots.map((s) => s.vehicle?.stallId).filter(Boolean);
  const ordered = stallIds
    .map((sid) => YARD_STOPS.find((ys) => ys.stallId === sid))
    .filter(Boolean);
  return ordered.length > 0 ? ordered : [...YARD_STOPS];
}
