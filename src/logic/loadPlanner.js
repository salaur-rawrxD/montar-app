import { scoreVehicleForSlot } from './scoringEngine.js';

const SLOT_LABELS = {
  reversed: ['Reversed · Cab-over'],
  top: ['Height clearance ✓', 'Axle weight ✓', 'Lightest top deck', 'Height clearance ✓'],
  bottom: ['Bottom deck ✓', 'Weight balance ✓', 'Rear axle ✓', 'Bottom deck ✓'],
};

function pickLabel(slotDef, idx) {
  if (slotDef.reversed) return SLOT_LABELS.reversed[0];
  const arr = SLOT_LABELS[slotDef.deck];
  return arr[idx % arr.length];
}

export function runLoadPlanner(vehicles, rigConfig) {
  const slots = [...rigConfig.deckLayout].sort((a, b) => {
    if (a.reversed && !b.reversed) return -1;
    if (!a.reversed && b.reversed) return 1;
    if (a.deck === 'top' && b.deck === 'bottom') return -1;
    if (a.deck === 'bottom' && b.deck === 'top') return 1;
    return a.slot - b.slot;
  });

  const unassigned = vehicles.map((v, i) => ({ ...v, _origIdx: i }));
  const assignments = [];

  for (const slotDef of slots) {
    if (!unassigned.length) break;
    const scored = unassigned.map((v) => ({
      v,
      s: scoreVehicleForSlot(v, slotDef),
    }));
    scored.sort((a, b) => b.s.total - a.s.total);
    const best = scored[0];
    const idx = unassigned.findIndex((v) => v === best.v);
    unassigned.splice(idx, 1);
    assignments.push({
      slot: slotDef.slot,
      deck: slotDef.deck,
      reversed: slotDef.reversed,
      vehicle: best.v,
      score: best.s,
      warnings: best.s.warnings,
      reasoning: best.s.reasoning,
      label: pickLabel(slotDef, assignments.filter((a) => a.deck === slotDef.deck).length),
    });
  }

  assignments.sort((a, b) => a.slot - b.slot);

  const totalWeightLb = assignments.reduce((s, a) => s + (a.vehicle?.weightLb || 0), 0);

  return {
    rigId: rigConfig.id,
    slots: assignments,
    unassigned,
    totalWeightLb,
    maxCargoLb: rigConfig.maxCargoLb,
  };
}
