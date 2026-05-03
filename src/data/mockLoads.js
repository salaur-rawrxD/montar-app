export const LS_PREV_LOADS = 'montar_previous_loads';

export const SEED_RECENT_LOADS = [
  { origin: 'BNSF Orillia',    destination: 'Lexus of Bellevue · Bellevue, WA',        vehicleCount: 8, yardMin: 46, dealerMin: 31, ts: Date.now() - 86400000 * 2  },
  { origin: 'Port of Tacoma',  destination: 'BMW of Bellevue · Bellevue, WA',           vehicleCount: 9, yardMin: 52, dealerMin: 24, ts: Date.now() - 86400000 * 5  },
  { origin: 'BNSF Auburn',     destination: 'Acura of Redmond · Redmond, WA',           vehicleCount: 7, yardMin: 41, dealerMin: 19, ts: Date.now() - 86400000 * 8  },
  { origin: 'Rail Miraloma',   destination: 'Mercedes-Benz of Bellevue · Bellevue, WA', vehicleCount: 9, yardMin: 55, dealerMin: 28, ts: Date.now() - 86400000 * 11 },
  { origin: 'BNSF Orillia',    destination: 'Audi Bellevue · Bellevue, WA',             vehicleCount: 9, yardMin: 43, dealerMin: 22, ts: Date.now() - 86400000 * 14 },
  { origin: 'Portland IC',     destination: 'Volvo Cars Redmond · Redmond, WA',         vehicleCount: 6, yardMin: 38, dealerMin: 17, ts: Date.now() - 86400000 * 18 },
  { origin: 'Port of Long Beach', destination: 'Chino Auto Hub · Chino, CA',            vehicleCount: 8, yardMin: 61, dealerMin: 35, ts: Date.now() - 86400000 * 24 },
];

export const SESSION_DEALER_OPTIONS = [
  'Honda of Bellevue · Bellevue, WA',
  'BMW of Redmond · Redmond, WA',
  'Lexus of Bellevue · Bellevue, WA',
  'Mercedes-Benz of Bellevue · Bellevue, WA',
  'Subaru of Bellevue · Bellevue, WA',
  'Porsche Bellevue · Bellevue, WA',
  'Land Rover Redmond · Redmond, WA',
  'Toyota of Renton · Renton, WA',
];

export function loadPreviousLoads() {
  try {
    return JSON.parse(localStorage.getItem(LS_PREV_LOADS)) || [];
  } catch { return []; }
}

export function savePreviousLoad(entry) {
  const list = loadPreviousLoads();
  list.unshift(entry);
  localStorage.setItem(LS_PREV_LOADS, JSON.stringify(list.slice(0, 12)));
}

export function formatLoadDate(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

export function buildPreviousLoadRows(storedLoads) {
  const rows = [];
  storedLoads.slice(0, 8).forEach((s) => {
    if (!s.headline && !s.origin) return;
    rows.push(normalizeEntry(s));
  });
  SEED_RECENT_LOADS.forEach((seed) => {
    if (rows.length >= 7) return;
    const n = normalizeEntry(seed);
    if (!rows.some((r) => r.origin === n.origin && r.destination === n.destination)) rows.push(n);
  });
  return rows;
}

function normalizeEntry(s) {
  if (s.origin && s.destination) {
    return {
      origin: s.origin, destination: s.destination,
      vehicleCount: s.vehicleCount ?? 9,
      yardMin: s.yardMin ?? null, dealerMin: s.dealerMin ?? null,
      loadDate: formatLoadDate(s.ts) || s.dateShort || '',
    };
  }
  const parts = String(s.headline || '').split('→').map((x) => x.trim());
  return {
    origin: parts[0] || '—', destination: parts[1] || '—',
    vehicleCount: 9, yardMin: null, dealerMin: null,
    loadDate: formatLoadDate(s.ts) || '',
  };
}
