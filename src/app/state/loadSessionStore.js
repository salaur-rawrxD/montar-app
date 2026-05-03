import { create } from 'zustand';
import { RIG_CONFIGS } from '../../data/trailerConfigs.js';
import { SEED_VEHICLES } from '../../data/mockVehicles.js';
import { SESSION_DEALER_OPTIONS, loadPreviousLoads, savePreviousLoad, formatLoadDate } from '../../data/mockLoads.js';
import { runLoadPlanner } from '../../logic/loadPlanner.js';
import { calculateDotCompliance } from '../../logic/dotCompliance.js';
import { buildYardStops } from '../../logic/yardPlanner.js';
import { buildDeliveryPlan } from '../../logic/deliveryPlanner.js';

function haptic(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {}
}
function hapticSuccess() { haptic([15, 45, 15]); }

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
    set({
      scanSheetSource: source,
      scanSheetObjectUrl: objectUrl,
      vehicles: SEED_VEHICLES.map((v) => ({ ...v })),
      acceptedIdxs: [],
      loadSheetPickerOpen: false,
    });
    const { currentScreen } = get();
    set({ prevScreen: currentScreen, currentScreen: 'scan', navDir: 'forward' });
  },

  initScanSample() {
    haptic(8);
    const prev = get().scanSheetObjectUrl;
    if (prev) URL.revokeObjectURL(prev);
    set({
      scanSheetSource: 'sample',
      scanSheetObjectUrl: null,
      vehicles: SEED_VEHICLES.map((v) => ({ ...v })),
      acceptedIdxs: [],
      loadSheetPickerOpen: false,
    });
    const { currentScreen } = get();
    set({ prevScreen: currentScreen, currentScreen: 'scan', navDir: 'forward' });
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
    const rig = RIG_CONFIGS[selectedRigIdx];
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
    const { yardStartTs } = get();
    const yardMin   = yardStartTs ? Math.max(1, Math.round((Date.now() - yardStartTs) / 60000)) : (36 + Math.floor(Math.random() * 28));
    const dealerMin = 14 + Math.floor(Math.random() * 26);
    const destination = SESSION_DEALER_OPTIONS[Math.floor(Math.random() * SESSION_DEALER_OPTIONS.length)];
    const entry = {
      origin: 'BNSF Orillia',
      destination,
      vehicleCount: 9,
      yardMin,
      dealerMin,
      ts: Date.now(),
    };
    savePreviousLoad(entry);
    hapticSuccess();
    set({
      previousLoads: loadPreviousLoads(),
      sessionEndVisible: true,
      sessionEndData: { yardMin, dealerMin, destination, loadDate: formatLoadDate(entry.ts) },
    });
  },

  dismissSession() {
    haptic(8);
    set({ sessionEndVisible: false });
    const { currentScreen } = get();
    set({ prevScreen: currentScreen, currentScreen: 'home', navDir: 'forward' });
  },

  // ── Previous loads ──────────────────────────────────────────────
  previousLoads: loadPreviousLoads(),

  refreshLoads() {
    set({ previousLoads: loadPreviousLoads() });
  },
}));
