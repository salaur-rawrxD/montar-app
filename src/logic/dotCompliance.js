const MAX_GROSS_LB  = 80000;
const MAX_HEIGHT_IN = 162; // 13.5 ft conservative clearance

export function calculateDotCompliance(vehicles, rigConfig) {
  const estimatedCargoLb  = vehicles.reduce((s, v) => s + (v.weightLb || 0), 0);
  const estimatedGrossLb  = (rigConfig?.tareLb || 33000) + estimatedCargoLb;
  const maxCargo          = rigConfig?.maxCargoLb || 47000;

  const grossRemaining    = MAX_GROSS_LB - estimatedGrossLb;
  const cargoRemaining    = maxCargo - estimatedCargoLb;
  const grossPct          = Math.min(100, (estimatedCargoLb / maxCargo) * 100);

  const tallestVehicleIn  = Math.max(0, ...vehicles.map((v) => v.heightIn || 0));
  const heightRemaining   = MAX_HEIGHT_IN - tallestVehicleIn;

  const warnings = [];
  const checks   = [];

  if (estimatedCargoLb > maxCargo) {
    warnings.push(`Estimated cargo weight ${estimatedCargoLb.toLocaleString()} lbs exceeds rig limit ${maxCargo.toLocaleString()} lbs`);
  }
  if (estimatedGrossLb > MAX_GROSS_LB) {
    warnings.push(`Estimated gross weight ${estimatedGrossLb.toLocaleString()} lbs exceeds federal 80,000 lb limit`);
  }
  if (tallestVehicleIn > MAX_HEIGHT_IN) {
    warnings.push(`Tallest vehicle at ${tallestVehicleIn}" may exceed clearance — verify deck height`);
  }

  checks.push('Operator must verify actual axle weights at scale before departure');
  checks.push('Actual vehicle weights may differ from estimated curb weights');
  checks.push('DOT compliance is operator responsibility — these are estimates only');

  return {
    estimatedCargoLb,
    estimatedGrossLb,
    grossRemainingLb: grossRemaining,
    cargoRemainingLb: cargoRemaining,
    grossPct: Math.round(grossPct * 10) / 10,
    tallestVehicleIn,
    heightRemainingIn: heightRemaining,
    grossStatus:  estimatedGrossLb <= MAX_GROSS_LB ? 'ok' : 'fail',
    cargoStatus:  estimatedCargoLb <= maxCargo     ? 'ok' : 'fail',
    heightStatus: tallestVehicleIn  <= MAX_HEIGHT_IN ? 'ok' : 'warn',
    warnings,
    requiredOperatorChecks: checks,
  };
}
