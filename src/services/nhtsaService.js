/**
 * NHTSA vPIC API — VIN identity decode
 *
 * Returns year / make / model / bodyClass / vehicleType / manufacturer / plantCountry.
 * Does NOT return weight, height, width, or length — those come from vehicleSpecsService.
 *
 * Endpoint: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json
 * Free, no API key required, ~200–800 ms per call.
 */

const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues';
const TIMEOUT_MS = 8000;

/** I, O, Q are excluded from VINs by ISO 3779 */
const INVALID_VIN_CHARS = /[IOQ]/i;

// ── VIN Validation ────────────────────────────────────────────────────────

export function validateVin(raw) {
  const vin = String(raw ?? '').trim().toUpperCase();
  if (vin.length !== 17) {
    return { valid: false, vin, reason: `VIN must be 17 characters (got ${vin.length})` };
  }
  if (INVALID_VIN_CHARS.test(vin)) {
    return { valid: false, vin, reason: 'VIN contains invalid character (I, O, or Q)' };
  }
  return { valid: true, vin };
}

// ── Response normalisation helpers ────────────────────────────────────────

/** Pick a non-empty, non-placeholder string from the NHTSA result object. */
function pick(result, key) {
  const val = result[key];
  if (!val || val === '0' || val === 'Not Applicable') return null;
  return String(val).trim() || null;
}

/** Title-case a make name: "TOYOTA" → "Toyota", "FORD MOTOR" → "Ford Motor" */
function titleCaseMake(str) {
  return str
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function normalizeResult(vin, r) {
  const make = pick(r, 'Make');
  return {
    vin,
    year:         pick(r, 'ModelYear'),
    make:         make ? titleCaseMake(make) : null,
    model:        pick(r, 'Model'),
    bodyClass:    pick(r, 'BodyClass'),
    vehicleType:  pick(r, 'VehicleType'),
    manufacturer: pick(r, 'Manufacturer'),
    plantCountry: pick(r, 'PlantCountry'),
    source:       'nhtsa',
    confidence:   'identity_only',
    raw:          r,
  };
}

function fallbackResult(vin, reason) {
  return {
    vin,
    year: null, make: null, model: null,
    bodyClass: null, vehicleType: null, manufacturer: null, plantCountry: null,
    source:     'nhtsa_fallback',
    confidence: 'none',
    error:      reason,
    raw:        null,
  };
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Decode a single VIN via the NHTSA vPIC API.
 * Always resolves — network errors return a fallback object, never throw.
 */
export async function decodeVin(rawVin) {
  const { valid, vin, reason } = validateVin(rawVin);

  if (!valid) {
    return {
      ...fallbackResult(rawVin, reason),
      source: 'invalid',
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res;
    try {
      res = await fetch(`${BASE_URL}/${vin}?format=json`, {
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      return fallbackResult(vin, `HTTP ${res.status}`);
    }

    const data = await res.json();
    const result = data?.Results?.[0];

    if (!result) {
      return fallbackResult(vin, 'Empty results from NHTSA');
    }

    const normalized = normalizeResult(vin, result);

    // NHTSA error code 0 = success; anything else = partial / failed decode
    const errorCode = result.ErrorCode;
    if (errorCode && errorCode !== '0') {
      // Still return what we have if make + model are present
      if (normalized.make && normalized.model) {
        return { ...normalized, confidence: 'identity_partial' };
      }
      return fallbackResult(vin, `NHTSA error code ${errorCode}`);
    }

    return normalized;
  } catch (err) {
    const reason = err.name === 'AbortError' ? 'NHTSA timeout' : (err.message ?? 'Network error');
    return fallbackResult(vin, reason);
  }
}

/**
 * Decode multiple VINs in parallel.
 * All requests fire simultaneously; individual failures return fallback objects.
 */
export async function decodeVinBatch(vins) {
  return Promise.all(vins.map(decodeVin));
}
