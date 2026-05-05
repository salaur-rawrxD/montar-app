import { SEED_VEHICLES } from '../data/mockVehicles.js';
import { createClient } from '@supabase/supabase-js';

const SEED_MAP = Object.fromEntries(SEED_VEHICLES.map((v) => [v.vin, v]));

/** Initialize Supabase client if configured */
function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

/**
 * Enrich a single vehicle with specs from Auto.dev via Supabase Edge Function.
 * Falls back to mock/estimated data if Supabase is unavailable or Auto.dev fails.
 */
export async function enrichVehicleSpecs(vin) {
  try {
    const supabase = getSupabase();

    if (!supabase) {
      // Supabase not configured — return mock specs
      const known = SEED_MAP[vin];
      return {
        vin,
        curbWeightLb: known?.weightLb ?? 3800,
        heightIn: known?.heightIn ?? 60,
        lengthIn: known?.lengthIn ?? 180,
        widthIn: known?.widthIn ?? 72,
        source: 'mock',
        confidence: 'none',
        needsVerification: true,
      };
    }

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('decode-vehicle-specs', {
      body: { vin },
    });

    if (error || !data) {
      console.warn(`Enrich failed for VIN ${vin}:`, error?.message);
      // Fall back to mock specs
      const known = SEED_MAP[vin];
      return {
        vin,
        curbWeightLb: known?.weightLb ?? 3800,
        heightIn: known?.heightIn ?? 60,
        lengthIn: known?.lengthIn ?? 180,
        widthIn: known?.widthIn ?? 72,
        source: 'estimated',
        confidence: 'none',
        needsVerification: true,
      };
    }

    return data;
  } catch (err) {
    console.error(`Enrich error for VIN ${vin}:`, err);
    // Safe fallback
    const known = SEED_MAP[vin];
    return {
      vin,
      curbWeightLb: known?.weightLb ?? 3800,
      heightIn: known?.heightIn ?? 60,
      lengthIn: known?.lengthIn ?? 180,
      widthIn: known?.widthIn ?? 72,
      source: 'estimated',
      confidence: 'none',
      needsVerification: true,
    };
  }
}

/**
 * Enrich multiple vehicles in parallel.
 * Never blocks the app — failures are graceful.
 */
export async function enrichVehicles(vehicles) {
  return Promise.all(vehicles.map((v) => enrichVehicleSpecs(v.vin)));
}

// Stub — returns mock specs; real implementation would query a vehicle specs DB
export async function getVehicleSpecs(vin) {
  const known = SEED_MAP[vin];
  if (known) {
    return {
      vin: known.vin,
      weightLb: known.weightLb,
      heightIn: known.heightIn,
      type: known.type,
      source: 'mock',
      operatorVerificationRequired: false,
    };
  }
  return {
    vin,
    weightLb: 3800,
    heightIn: 60,
    type: 'sedan',
    source: 'estimated',
    operatorVerificationRequired: true,
  };
}

