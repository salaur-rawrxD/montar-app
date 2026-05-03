export function scoreVehicleForSlot(vehicle, slotDef) {
  let total = 100;
  const warnings = [];
  const reasons = [];

  // Hard constraint: height clearance
  if (vehicle.heightIn > slotDef.maxHeightIn) {
    total -= 1000;
    warnings.push(`Height ${vehicle.heightIn}" exceeds slot ${slotDef.slot} clearance of ${slotDef.maxHeightIn}"`);
  } else {
    const margin = slotDef.maxHeightIn - vehicle.heightIn;
    total += margin * 0.4;
    reasons.push(`Height ${vehicle.heightIn}" clears ${slotDef.maxHeightIn}" (margin ${margin.toFixed(1)}")`);
  }

  // Hard constraint: weight
  if (vehicle.weightLb > slotDef.maxWeightLb) {
    total -= 500;
    warnings.push(`Weight ${vehicle.weightLb} lbs exceeds slot limit ${slotDef.maxWeightLb} lbs`);
  }

  const isHeavy = vehicle.weightLb >= 4200;
  const isTall  = vehicle.heightIn >= 68;

  if (slotDef.deck === 'bottom') {
    if (isHeavy) { total += 35; reasons.push('Heavy vehicle suits bottom deck'); }
    if (isTall)  { total += 20; reasons.push('Tall vehicle suits bottom deck'); }
    if (vehicle.type === 'suv' || vehicle.type === 'truck') { total += 15; }
  } else {
    if (!isHeavy) { total += 20; reasons.push('Lighter vehicle suits top deck'); }
    if (!isTall)  { total += 15; reasons.push('Lower vehicle suits top deck'); }
    if (vehicle.type === 'sedan') { total += 10; }
  }

  // Reversed slot: prefer lowest roof
  if (slotDef.reversed) {
    if (vehicle.heightIn <= 57)  { total += 30; reasons.push('Low roof ideal for cab-over reversed slot'); }
    else if (vehicle.heightIn <= 60) { total += 15; }
    total += (4500 - vehicle.weightLb) * 0.004; // lighter wins tie
  }

  return { total, warnings, reasoning: reasons.join('; ') || 'Standard assignment' };
}
