/**
 * loadSessionService.js
 *
 * Persists Montar session data to Supabase when configured.
 * Falls back silently when Supabase is not available — all functions
 * return { success: false, error: 'offline' } in that case and the
 * caller continues normally using localStorage.
 *
 * Tables:  loads · load_vehicles · load_assignments
 *          vehicle_specs · yard_stops · delivery_stops · operator_overrides
 */

import { supabase, isSupabaseEnabled } from './supabaseClient.js';
import { RIG_CONFIGS } from '../data/trailerConfigs.js';

// ── Helpers ────────────────────────────────────────────────────────────

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function result(data)  { return { success: true,  data }; }
function offline()     { return { success: false, error: 'offline' }; }
function fail(err)     { return { success: false, error: err?.message ?? String(err) }; }

// ── loads ──────────────────────────────────────────────────────────────

/**
 * Insert a completed load session.
 * Returns { success, data: { id } } where id is the uuid used for all
 * related child inserts in this session.
 */
export async function insertLoad({
  loadRef = '—',
  origin  = 'Unknown',
  rigId,
  rigName,
  vehicleCount,
  yardMin,
  dealerMin,
  destination,
}) {
  if (!isSupabaseEnabled()) return offline();
  try {
    const id = newId();
    const { error } = await supabase.from('loads').insert({
      id,
      load_ref:      loadRef,
      origin,
      rig_id:        rigId   ?? null,
      rig_name:      rigName ?? null,
      vehicle_count: vehicleCount ?? null,
      yard_min:      yardMin      ?? null,
      dealer_min:    dealerMin    ?? null,
      destination:   destination  ?? null,
      status:        'completed',
      completed_at:  new Date().toISOString(),
    });
    if (error) return fail(error);
    return result({ id });
  } catch (err) {
    return fail(err);
  }
}

// ── load_vehicles ──────────────────────────────────────────────────────

/**
 * Bulk-insert the vehicle list for a load.
 * vehicles: array of { vin, year, make, model, weightLb, heightIn, type, dealerCode, stallId }
 */
export async function insertLoadVehicles(loadId, vehicles = []) {
  if (!isSupabaseEnabled()) return offline();
  if (!vehicles.length) return result([]);
  try {
    const rows = vehicles.map((v) => ({
      load_id:      loadId,
      vin:          v.vin,
      year:         v.year         ?? null,
      make:         v.make         ?? null,
      model:        v.model        ?? null,
      weight_lb:    v.weightLb     ?? null,
      height_in:    v.heightIn     ?? null,
      vehicle_type: v.type         ?? null,
      dealer_code:  v.dealerCode   ?? null,
      stall_id:     v.stallId      ?? null,
      accepted:     true,
    }));
    const { error } = await supabase.from('load_vehicles').insert(rows);
    if (error) return fail(error);
    return result(rows);
  } catch (err) {
    return fail(err);
  }
}

// ── load_assignments ───────────────────────────────────────────────────

/**
 * Bulk-insert the slot assignments (load plan) for a load.
 * assignments: array of { slot, deck, reversed, vehicle, score, reasoning, label }
 */
export async function insertLoadAssignments(loadId, assignments = [], confirmedSlots = []) {
  if (!isSupabaseEnabled()) return offline();
  if (!assignments.length) return result([]);
  try {
    const rows = assignments.map((a) => ({
      load_id:   loadId,
      slot:      a.slot,
      deck:      a.deck      ?? null,
      reversed:  a.reversed  ?? false,
      vin:       a.vehicle?.vin ?? null,
      weight_lb: a.vehicle?.weightLb ?? null,
      score:     a.score?.total ?? null,
      reasoning: a.reasoning ?? null,
      label:     a.label     ?? null,
      confirmed: confirmedSlots.includes(a.slot),
    }));
    const { error } = await supabase.from('load_assignments').insert(rows);
    if (error) return fail(error);
    return result(rows);
  } catch (err) {
    return fail(err);
  }
}

// ── vehicle_specs ──────────────────────────────────────────────────────

/**
 * Upsert vehicle specs into the shared cache.
 * Safe to call repeatedly — uses VIN as the primary key.
 */
export async function upsertVehicleSpecs(vehicles = []) {
  if (!isSupabaseEnabled()) return offline();
  if (!vehicles.length) return result([]);
  try {
    const rows = vehicles.map((v) => ({
      vin:                    v.vin,
      year:                   v.year         ?? null,
      make:                   v.make         ?? null,
      model:                  v.model        ?? null,
      weight_lb:              v.weightLb     ?? null,
      height_in:              v.heightIn     ?? null,
      vehicle_type:           v.type         ?? null,
      source:                 v.source       ?? 'mock',
      operator_verified:      v.needsVerification ? false : true,
      updated_at:             new Date().toISOString(),
    }));
    const { error } = await supabase
      .from('vehicle_specs')
      .upsert(rows, { onConflict: 'vin' });
    if (error) return fail(error);
    return result(rows);
  } catch (err) {
    return fail(err);
  }
}

// ── yard_stops ─────────────────────────────────────────────────────────

/**
 * Bulk-insert the yard stop sequence for a load.
 * stops: array of YARD_STOPS shape { stallId, title, dist, walk }
 * completedCount: how many stops were completed before session ended.
 */
export async function insertYardStops(loadId, stops = [], completedCount = 0) {
  if (!isSupabaseEnabled()) return offline();
  if (!stops.length) return result([]);
  try {
    const rows = stops.map((s, i) => ({
      load_id:      loadId,
      sequence:     i + 1,
      stall_id:     s.stallId ?? null,
      title:        s.title   ?? null,
      dist:         s.dist    ?? null,
      walk:         s.walk    ?? null,
      completed:    i < completedCount,
      completed_at: i < completedCount ? new Date().toISOString() : null,
    }));
    const { error } = await supabase.from('yard_stops').insert(rows);
    if (error) return fail(error);
    return result(rows);
  } catch (err) {
    return fail(err);
  }
}

// ── delivery_stops ─────────────────────────────────────────────────────

/**
 * Insert the delivery destination for a load.
 * deliveryPlan: { dealer: { id, name, address, etaMin }, vehicleCount }
 */
export async function insertDeliveryStop(loadId, deliveryPlan) {
  if (!isSupabaseEnabled()) return offline();
  if (!deliveryPlan?.dealer) return result(null);
  try {
    const { dealer, vehicleCount } = deliveryPlan;
    const { error } = await supabase.from('delivery_stops').insert({
      load_id:        loadId,
      sequence:       1,
      dealer_id:      dealer.id      ?? null,
      dealer_name:    dealer.name    ?? null,
      dealer_address: dealer.address ?? null,
      vehicle_count:  vehicleCount   ?? null,
      eta_min:        dealer.etaMin  ?? null,
      completed:      true,
    });
    if (error) return fail(error);
    return result({ loadId });
  } catch (err) {
    return fail(err);
  }
}

// ── operator_overrides ─────────────────────────────────────────────────

/**
 * Record a driver override for auditing.
 * override: { slot, overrideType, originalVin, overrideVin, driverNote, riskAcknowledged }
 */
export async function insertOperatorOverride(loadId, override) {
  if (!isSupabaseEnabled()) return offline();
  if (!override) return result(null);
  try {
    const { error } = await supabase.from('operator_overrides').insert({
      load_id:            loadId,
      slot:               override.slot               ?? null,
      override_type:      override.overrideType       ?? 'slot_swap',
      original_vin:       override.originalVin        ?? null,
      override_vin:       override.overrideVin        ?? null,
      driver_note:        override.driverNote         ?? null,
      risk_acknowledged:  override.riskAcknowledged   ?? false,
    });
    if (error) return fail(error);
    return result({ loadId });
  } catch (err) {
    return fail(err);
  }
}

// ── fetchRecentLoads ───────────────────────────────────────────────────

/**
 * Fetch the most recent completed loads from Supabase.
 * Used to hydrate the dashboard's Previous loads list.
 */
export async function fetchRecentLoads(limit = 12) {
  if (!isSupabaseEnabled()) return offline();
  try {
    const { data, error } = await supabase
      .from('loads')
      .select('id,load_ref,origin,destination,vehicle_count,yard_min,dealer_min,completed_at')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);
    if (error) return fail(error);
    return result(data ?? []);
  } catch (err) {
    return fail(err);
  }
}

// ── saveCompleteSession ────────────────────────────────────────────────

/**
 * Top-level convenience function: saves the entire completed session in
 * one shot. Called from the Zustand store after endSession().
 *
 * storeState: snapshot of the Zustand store at wrap time.
 * Returns { success, loadId, errors[] }
 */
export async function saveCompleteSession(storeState) {
  if (!isSupabaseEnabled()) return offline();

  const errors = [];

  const {
    loadPlan,
    vehicles,
    acceptedIdxs,
    confirmedSlots,
    yardStops,
    yardIdx,
    deliveryPlan,
    sessionEndData,
    selectedRigIdx,
  } = storeState;

  // Determine rig info
  const rig   = RIG_CONFIGS[selectedRigIdx ?? 0] ?? null;
  const rigId   = rig?.id   ?? null;
  const rigName = rig?.name ?? null;

  // 1. Create the load record
  const d = new Date();
  const fallbackRef = `MNT-${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-SAVED`;

  const loadRes = await insertLoad({
    loadRef:      storeState.sessionLoadRef ?? fallbackRef,
    origin:       storeState.sessionOrigin  ?? 'Unassigned yard',
    rigId,
    rigName,
    vehicleCount: loadPlan?.slots?.length ?? vehicles.length,
    yardMin:      sessionEndData?.yardMin    ?? null,
    dealerMin:    sessionEndData?.dealerMin  ?? null,
    destination:  sessionEndData?.destination ?? null,
  });

  if (!loadRes.success) return { success: false, error: loadRes.error, errors: [loadRes.error] };
  const loadId = loadRes.data.id;

  // 2–6. Run remaining inserts in parallel; collect errors without aborting
  const accepted = vehicles.filter((_, i) => acceptedIdxs.includes(i));

  const [vehiclesRes, specsRes, assignRes, stopsRes, delivRes] = await Promise.all([
    insertLoadVehicles(loadId, accepted),
    upsertVehicleSpecs(accepted),
    insertLoadAssignments(loadId, loadPlan?.slots ?? [], confirmedSlots),
    insertYardStops(loadId, yardStops, yardIdx),
    insertDeliveryStop(loadId, deliveryPlan),
  ]);

  for (const r of [vehiclesRes, specsRes, assignRes, stopsRes, delivRes]) {
    if (!r.success && r.error !== 'offline') errors.push(r.error);
  }

  return { success: errors.length === 0, loadId, errors };
}
