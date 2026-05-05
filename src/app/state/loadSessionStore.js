import { create } from 'zustand';
import { RIG_CONFIGS } from '../../data/trailerConfigs.js';
import { SEED_VEHICLES } from '../../data/mockVehicles.js';
import { SESSION_DEALER_OPTIONS, loadPreviousLoads, savePreviousLoad, formatLoadDate } from '../../data/mockLoads.js';
import { runLoadPlanner } from '../../logic/loadPlanner.js';
import { calculateDotCompliance } from '../../logic/dotCompliance.js';
import { buildYardStops } from '../../logic/yardPlanner.js';
import { buildDeliveryPlan } from '../../logic/deliveryPlanner.js';
import { saveCompleteSession } from '../../services/loadSessionService.js';
import { decodeVinBatch } from '../../services/nhtsaService.js';
import { enrichVehicles } from '../../services/vehicleSpecsService.js';

function haptic(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {}
}
function hapticSuccess() { haptic([15, 45, 15]); }

function generateLoadRef() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MNT-${yy}${mm}${dd}-${rnd}`;
}

export const useStore = create((set, get) => ({
  // ── Navigation ──────────────────────────────────────────────────
  currentScreen: 'splash',
  prevScreen: null,
  navDir: 'none',

  goTo(screenId, opts) {
    const { currentScreen } = get();
    if (!opts?.silent) haptic(8);
    set({ prevScreen: currentScreen, currentScreen: screenId, navDir: 'forward' });
  },

  goBack(screenId) {
    const { currentScreen } = get();
    haptic(6);
    set({ prevScreen: currentScreen, currentScreen: screenId, navDir: 'backward' });
  },

  // ── Rig ─────────────────────────────────────────────────────────
  selectedRigIdx: 0,

  selectRig(idx) {
    set({ selectedRigIdx: idx });
  },

  confirmRig() {
    hapticSuccess();
    const { currentScreen } = get();
    set({ prevScreen: currentScreen, currentScreen: 'home', navDir: 'forward' });
  },

  // ── Load sheet picker ────────────────────────────────────────────
  loadSheetPickerOpen: false,
  scanSheetSource: null,
  scanSheetObjectUrl: null,

  openLoadSheetPicker() { haptic(8); set({ loadSheetPickerOpen: true }); },
  closeLoadSheetPicker() { set({ loadSheetPickerOpen: false }); },

  initScanFromFile(source, objectUrl) {
    const prev = get().scanSheetObjectUrl;
    if (prev) URL.revokeObjectURL(prev);
    const vehicles = SEED_VEHICLES.map((v) => ({ ...v }));
    set({
      scanSheetSource: source,
      scanSheetObjectUrl: objectUrl,
      vehicles,
      acceptedIdxs: [],
      loadSheetPickerOpen: false,
      sessionLoadRef: generateLoadRef(),
      nhtsaStatus: 'loading',
    });
    const { currentScreen } = get();
    set({ prevScreen: currentScreen, currentScreen: 'scan', navDir: 'forward' });
    // Fire-and-forget: decode VINs during the scan animation
    setTimeout(() => get()._decodeNhtsa(vehicles), 0);
  },

  initScanSample() {
    haptic(8);
    const prev = get().scanSheetObjectUrl;
    if (prev) URL.revokeObjectURL(prev);
    const vehicles = SEED_VEHICLES.map((v) => ({ ...v }));
    set({
      scanSheetSource: 'sample',
      scanSheetObjectUrl: null,
      vehicles,
      acceptedIdxs: [],
      loadSheetPickerOpen: false,
      sessionLoadRef: generateLoadRef(),
      nhtsaStatus: 'loading',
    });
    const { currentScreen } = get();
    set({ prevScreen: currentScreen, currentScreen: 'scan', navDir: 'forward' });
    // Fire-and-forget: decode VINs during the scan animation
    setTimeout(() => get()._decodeNhtsa(vehicles), 0);
  },

  // ── NHTSA background decode ──────────────────────────────────────
  // 'idle'    — no scan started
  // 'loading' — API calls in flight during scan animation
  // 'done'    — identity merged into vehicles (year/make/model updated)
  //             specs enriched from Auto.dev (weight/dimensions)
  // 'failed'  — all calls failed; vehicles keep seed data with source:'demo'
  nhtsaStatus: 'idle',

  async _decodeNhtsa(originalVehicles) {
    const vins = originalVehicles.map((v) => v.vin);
    try {
      // Decode vehicle identity from NHTSA
      const nhtsaResults = await decodeVinBatch(vins);
      
      // Merge identity-only fields — never overwrite weight, height, stallId
      const nhtsamerged = originalVehicles.map((v, i) => {
        const r = nhtsaResults[i];
        if (!r || r.source === 'invalid' || r.source === 'nhtsa_fallback') {
          // API failed for this VIN — keep seed data, mark source
          return { ...v, source: r?.source ?? 'nhtsa_fallback' };
        }
        return {
          ...v,
          year:         r.year         ?? v.year,
          make:         r.make         ?? v.make,
          model:        r.model        ?? v.model,
          bodyClass:    r.bodyClass    ?? null,
          vehicleType:  r.vehicleType  ?? null,
          manufacturer: r.manufacturer ?? null,
          plantCountry: r.plantCountry ?? null,
          source:       r.source,       // 'nhtsa' or 'nhtsa_fallback'
          confidence:   r.confidence,
        };
      });

      // Enrich with specs from Auto.dev (parallel, non-blocking)
      const specs = await enrichVehicles(nhtsamerged);
      
      const enriched = nhtsamerged.map((v, i) => {
        const s = specs[i];
        return {
          ...v,
          weightLb:        s.curbWeightLb    ?? v.weightLb,
          lengthIn:        s.lengthIn        ?? v.lengthIn,
          widthIn:         s.widthIn         ?? v.widthIn,
          heightIn:        s.heightIn        ?? v.heightIn,
          groundClearanceIn: s.groundClearanceIn ?? null,
          specsSource:     s.source,
          specsConfidence: s.confidence,
          specsNeedsVerification: s.needsVerification,
          specsFromCache:  s.fromCache,
        };
      });

      set({ vehicles: enriched, nhtsaStatus: 'done' });
    } catch (_) {
      // Catastrophic failure — leave vehicles unchanged with 'demo' source
      set({ nhtsaStatus: 'failed' });
    }
  },

  // ── Vehicles ────────────────────────────────────────────────────
  vehicles: SEED_VEHICLES.map((v) => ({ ...v })),
  acceptedIdxs: [],

  acceptVin(idx) {
    const { acceptedIdxs } = get();
    if (acceptedIdxs.includes(idx)) return;
    haptic(12);
    set({ acceptedIdxs: [...acceptedIdxs, idx] });
  },

  acceptAllVins() {
    const { vehicles } = get();
    hapticSuccess();
    set({ acceptedIdxs: vehicles.map((_, i) => i) });
  },

  // ── Load plan ───────────────────────────────────────────────────
  loadPlan: null,
  dotStatus: null,
  confirmedSlots: [],

  generateLoadPlan() {
    const { vehicles, acceptedIdxs, selectedRigIdx } = get();
    const rig    = RIG_CONFIGS[selectedRigIdx];
    const accepted = vehicles.filter((_, i) => acceptedIdxs.includes(i));
    const plan   = runLoadPlanner(accepted, rig);
    const dot    = calculateDotCompliance(accepted, rig);
    const stops  = buildYardStops(plan);
    const dplan  = buildDeliveryPlan(plan);
    hapticSuccess();
    set({
      loadPlan: plan,
      dotStatus: dot,
      yardStops: stops,
      deliveryPlan: dplan,
      confirmedSlots: [],
      yardIdx: 0,
      syncStatus: 'local',
    });
  },

  confirmSlot(slotNum) {
    const { confirmedSlots } = get();
    const n = parseInt(slotNum, 10);
    if (confirmedSlots.includes(n)) return;
    haptic(12);
    set({ confirmedSlots: [...confirmedSlots, n] });
  },

  acceptMontarPlan() {
    const { loadPlan } = get();
    if (!loadPlan) return;
    hapticSuccess();
    set({ confirmedSlots: loadPlan.slots.map((s) => s.slot) });
  },

  // ── Yard ────────────────────────────────────────────────────────
  yardStops: [],
  yardIdx: 0,
  yardStartTs: null,

  initYardSession() {
    set({ yardIdx: 0, yardStartTs: Date.now() });
  },

  markYardStop() {
    const { yardIdx, yardStops } = get();
    if (yardIdx >= yardStops.length) return;
    hapticSuccess();
    set({ yardIdx: yardIdx + 1 });
  },

  // ── Delivery ────────────────────────────────────────────────────
  deliveryPlan: null,
  sessionEndVisible: false,
  sessionEndData: null,

  endSession() {
    const { yardStartTs, acceptedIdxs, sessionLoadRef, sessionOrigin } = get();
    const yardMin   = yardStartTs
      ? Math.max(1, Math.round((Date.now() - yardStartTs) / 60000))
      : (36 + Math.floor(Math.random() * 28));
    const dealerMin    = 14 + Math.floor(Math.random() * 26);
    const destination  = SESSION_DEALER_OPTIONS[Math.floor(Math.random() * SESSION_DEALER_OPTIONS.length)];
    const loadRef      = sessionLoadRef ?? generateLoadRef();
    const origin       = sessionOrigin  ?? 'Unassigned yard';
    const vehicleCount = acceptedIdxs.length || 1;
    const entry = {
      loadRef,
      origin,
      destination,
      vehicleCount,
      yardMin,
      dealerMin,
      ts: Date.now(),
    };

    // 1. Always save to localStorage first (works offline)
    savePreviousLoad(entry);
    hapticSuccess();
    const sessionEndData = { yardMin, dealerMin, destination, loadDate: formatLoadDate(entry.ts) };
    set({
      previousLoads:    loadPreviousLoads(),
      sessionEndVisible: true,
      sessionEndData,
      syncStatus:        'local',
    });

    // 2. Fire-and-forget Supabase sync — never blocks the UI
    const snapshot = { ...get(), sessionEndData };
    setTimeout(() => get()._syncSession(snapshot), 0);
  },

  // Internal — called from endSession via setTimeout, never directly
  async _syncSession(snapshot) {
    set({ syncStatus: 'syncing' });
    try {
      const { success, errors } = await saveCompleteSession(snapshot);
      if (success) {
        set({ syncStatus: 'saved', syncedAt: Date.now(), syncError: null });
      } else {
        // 'offline' means Supabase is not configured — stay on 'local', not 'failed'
        const isOffline = errors?.every((e) => e === 'offline') ??
                          !snapshot.syncStatus; // crude but safe
        set({
          syncStatus: isOffline ? 'local' : 'failed',
          syncError:  isOffline ? null : (errors?.[0] ?? 'Sync error'),
        });
      }
    } catch (err) {
      set({ syncStatus: 'failed', syncError: err?.message ?? 'Sync error' });
    }
  },

  dismissSession() {
    haptic(8);
    set({ sessionEndVisible: false });
    const { currentScreen } = get();
    set({ prevScreen: currentScreen, currentScreen: 'home', navDir: 'forward' });
  },

  // ── Session identity ─────────────────────────────────────────────
  // Generated at scan-start so every Supabase row is unique per run.
  sessionLoadRef: null,
  sessionOrigin:  'BNSF Orillia',

  // ── Sync status ──────────────────────────────────────────────────
  // 'idle'    — no session started yet
  // 'local'   — saved to localStorage, Supabase not configured
  // 'syncing' — actively writing to Supabase
  // 'saved'   — persisted to Supabase successfully
  // 'failed'  — Supabase write failed (localStorage copy is intact)
  syncStatus: 'idle',
  syncError:  null,
  syncedAt:   null,

  // ── Previous loads ──────────────────────────────────────────────
  previousLoads: loadPreviousLoads(),

  refreshLoads() {
    set({ previousLoads: loadPreviousLoads() });
  },
}));
