const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/g;

export function extractVins(text) {
  const raw = text.toUpperCase().match(VIN_RE) || [];
  return [...new Set(raw)];
}

export function normalizeVin(vin) {
  return vin.toUpperCase().replace(/\s/g, '').slice(0, 17);
}

export function isValidVin(vin) {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}
