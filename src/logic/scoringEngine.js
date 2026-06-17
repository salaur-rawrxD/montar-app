export function scoreVehicleForSlot(vehicle, slotDef) {
  let total = 100;
  const warnings = [];
  const reasons = [];

  // Use enriched specs with fallback to defaults
  const heightIn = vehicle.heightIn ?? 60;
  const weightLb = vehicle.weightLb ?? 3800;
  const groundClearanceIn = vehicle.groundClearanceIn ?? null;
  const needsSpecsVerification = vehicle.specsNeedsVerification ?? false;
  const specsSource = vehicle.specsSource ?? 'unknown';

  // Penalize unverified or estimated specs — less confidence in scoring
  if (needsSpecsVerification) {
    total -= 15;
    warnings.push('Vehicle specs need verification — scoring less certain');
  } else if (specsSource === 'estimated' || specsSource === 'fallback') {
    total -= 5;
    reasons.push('Specs estimated; verify before loading');
  } else if (specsSource === 'auto.dev') {
    reasons.push('Specs verified via Auto.dev');
  }

  // Hard constraint: height clearance
  if (heightIn > slotDef.maxHeightIn) {
    total -= 1000;
    warnings.push(`Height ${heightIn}" exceeds slot ${slotDef.slot} clearance of ${slotDef.maxHeightIn}"`);
  } else {
    const margin = slotDef.maxHeightIn - heightIn;
    total += margin * 0.4;
    reasons.push(`Height ${heightIn}" clears ${slotDef.maxHeightIn}" (margin ${margin.toFixed(1)}")`);
  }

  // Hard constraint: weight
  if (weightLb > slotDef.maxWeightLb) {
    total -= 500;
    warnings.push(`Weight ${weightLb} lbs exceeds slot limit ${slotDef.maxWeightLb} lbs`);
  }

  // Ground clearance: prefer higher clearance for bottom deck to avoid trailer scrape
  if (groundClearanceIn && slotDef.deck === 'bottom') {
    if (groundClearanceIn < 5) {
      total -= 20;
      warnings.push(`Ground clearance ${groundClearanceIn.toFixed(1)}" may be risky on ramps`);
    } else if (groundClearanceIn >= 6.5) {
      total += 10;
      reasons.push(`Good ground clearance ${groundClearanceIn.toFixed(1)}" for bottom deck`);
    }
  }

  const isHeavy = weightLb >= 4200;
  const isTall  = heightIn >= 68;

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
    if (heightIn <= 57)  { total += 30; reasons.push('Low roof ideal for cab-over reversed slot'); }
    else if (heightIn <= 60) { total += 15; }
    total += (4500 - weightLb) * 0.004; // lighter wins tie
  }

  return { total, warnings, reasoning: reasons.join('; ') || 'Standard assignment' };
}
