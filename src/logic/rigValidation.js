export function validateLoadForRig(loadPlan, rigConfig) {
  const issues = [];
  if (!loadPlan || !rigConfig) return issues;

  for (const assignment of loadPlan.slots) {
    const slotDef = rigConfig.deckLayout.find((d) => d.slot === assignment.slot);
    if (!slotDef || !assignment.vehicle) continue;

    if (assignment.vehicle.heightIn > slotDef.maxHeightIn) {
      issues.push({
        slot: assignment.slot,
        severity: 'error',
        message: `${assignment.vehicle.model} height ${assignment.vehicle.heightIn}" exceeds slot ${assignment.slot} clearance ${slotDef.maxHeightIn}"`,
      });
    }
    if (assignment.vehicle.weightLb > slotDef.maxWeightLb) {
      issues.push({
        slot: assignment.slot,
        severity: 'warning',
        message: `${assignment.vehicle.model} weight ${assignment.vehicle.weightLb} lbs exceeds slot ${assignment.slot} limit ${slotDef.maxWeightLb} lbs`,
      });
    }
  }
  return issues;
}
