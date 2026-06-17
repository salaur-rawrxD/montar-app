/**
 * Data source logger — tracks vehicle specs origin and load plan generation.
 * Logs to console with structured format for debugging and audit trail.
 */

function formatDataSource(vehicle) {
  const parts = [];
  
  // VIN source
  if (vehicle.source) {
    const sourceLabel = {
      'ocr': 'OCR scan',
      'manual': 'Manual entry',
      'demo': 'Demo data',
      'nhtsa': 'NHTSA verified',
      'nhtsa_fallback': 'NHTSA fallback',
    }[vehicle.source] || vehicle.source;
    parts.push(`VIN source: ${sourceLabel}`);
  }

  // Specs source and confidence
  if (vehicle.specsSource) {
    const specsLabel = {
      'auto.dev': 'Auto.dev',
      'estimated': 'Estimated',
      'fallback': 'Fallback',
      'mock': 'Mock',
    }[vehicle.specsSource] || vehicle.specsSource;
    
    let specsDesc = `Specs: ${specsLabel}`;
    if (vehicle.specsNeedsVerification) {
      specsDesc += ' ⚠️ needs verification';
    }
    if (vehicle.specsConfidence) {
      specsDesc += ` (${vehicle.specsConfidence})`;
    }
    parts.push(specsDesc);
  }

  // Identity confidence
  if (vehicle.confidence) {
    parts.push(`Identity: ${vehicle.confidence}`);
  }

  return parts.join(' • ');
}

export function logLoadPlanGeneration(vehicles, loadPlan, dotStatus) {
  console.group('📋 Load Plan Generated');
  
  console.log(`Total vehicles: ${vehicles.length}`);
  console.log(`Trailer: ${loadPlan.rigId}`);
  console.log(`Total cargo weight: ${(dotStatus.estimatedCargoLb / 1000).toFixed(1)}K lbs`);
  console.log(`Height clearance: ${dotStatus.tallestVehicleIn}" (margin: ${162 - dotStatus.tallestVehicleIn}")`);
  
  console.group('Data Sources Summary');
  
  // Group vehicles by VIN source
  const byVinSource = {};
  vehicles.forEach((v) => {
    const source = v.source || 'unknown';
    if (!byVinSource[source]) byVinSource[source] = 0;
    byVinSource[source]++;
  });
  
  Object.entries(byVinSource).forEach(([source, count]) => {
    const labels = {
      'ocr': '📸 OCR scan',
      'manual': '✍️ Manual entry',
      'demo': '🧪 Demo data',
      'nhtsa': '✓ NHTSA',
      'nhtsa_fallback': 'ⓘ NHTSA fallback',
    };
    console.log(`${labels[source] || source}: ${count} vehicles`);
  });
  
  // Group vehicles by specs source
  const bySpecsSource = {};
  vehicles.forEach((v) => {
    const source = v.specsSource || 'unknown';
    if (!bySpecsSource[source]) bySpecsSource[source] = 0;
    bySpecsSource[source]++;
  });
  
  console.log('Specs sources:');
  Object.entries(bySpecsSource).forEach(([source, count]) => {
    const labels = {
      'auto.dev': '⚡ Auto.dev',
      'estimated': 'ℹ️ Estimated',
      'fallback': '⚠️ Fallback',
      'mock': '🧪 Mock',
    };
    console.log(`  ${labels[source] || source}: ${count} vehicles`);
  });
  
  const needsVerification = vehicles.filter((v) => v.specsNeedsVerification).length;
  if (needsVerification > 0) {
    console.warn(`⚠️ ${needsVerification} vehicles need specs verification`);
  }
  
  console.groupEnd();
  
  console.group('Slot Assignments');
  loadPlan.slots.forEach((slot) => {
    const v = slot.vehicle;
    console.log(
      `Slot ${slot.slot} (${slot.deck}): ${v.year} ${v.make} ${v.model}`,
      `• ${v.weightLb}lbs • ${v.heightIn}" • Score: ${slot.score.total.toFixed(0)}`
    );
  });
  console.groupEnd();
  
  console.groupEnd();
}

export function logVehicleEnrichment(vehicles, stage) {
  const stageName = {
    'decode': 'NHTSA Decode',
    'specs': 'Auto.dev Enrichment',
    'final': 'Final merged specs',
  }[stage] || stage;
  
  console.group(`📊 ${stageName}`);
  
  vehicles.forEach((v, i) => {
    const source = formatDataSource(v);
    console.log(`${i + 1}. ${v.vin}`, source);
    
    if (v.heightIn && v.weightLb) {
      console.log(
        `   └─ ${v.year} ${v.make} ${v.model} • ${v.heightIn}" • ${v.weightLb}lbs`,
        v.groundClearanceIn ? `• GC: ${v.groundClearanceIn.toFixed(1)}"` : ''
      );
    }
  });
  
  console.groupEnd();
}

export function logScoringDetail(vehicle, slotDef, score) {
  const source = formatDataSource(vehicle);
  console.group(`🎯 Score Detail: Slot ${slotDef.slot}`);
  console.log(`Vehicle: ${vehicle.vin} (${source})`);
  console.log(`Slot: ${slotDef.deck} deck • Max height: ${slotDef.maxHeightIn}" • Max weight: ${slotDef.maxWeightLb}lbs`);
  console.log(`Score: ${score.total.toFixed(0)}`);
  console.log(`Reasoning: ${score.reasoning}`);
  if (score.warnings.length > 0) {
    console.warn('Warnings:', score.warnings);
  }
  console.groupEnd();
}

export function logDataQualityAlert(vehicles) {
  const issues = [];
  
  const withoutAutodev = vehicles.filter((v) => v.specsSource !== 'auto.dev').length;
  if (withoutAutodev > 0) {
    issues.push(`${withoutAutodev}/${vehicles.length} vehicles without Auto.dev specs`);
  }
  
  const needsVerification = vehicles.filter((v) => v.specsNeedsVerification).length;
  if (needsVerification > 0) {
    issues.push(`${needsVerification}/${vehicles.length} vehicles need specs verification`);
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Data Quality Alert:', issues.join(' • '));
  }
}
