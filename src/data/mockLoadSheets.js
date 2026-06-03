/**
 * Mock load sheets with real VINs for testing
 * All sheets originate from Port of Tacoma — Taylor Way Auto Facility
 * All destinations are Seattle/Tacoma area dealers
 */

export const MOCK_LOAD_SHEETS = [
  {
    id: 'load-001',
    load_ref: 'LOA-2024-05-001',
    origin: 'Port of Tacoma — Taylor Way Auto Facility',
    originId: 'port-tacoma-tw',
    destination: 'Mel\'s Toyota of Tacoma',
    destinationId: 'dealer-toyota-tacoma',
    createdAt: new Date('2024-05-15').toISOString(),
    status: 'planning',
    vehicles: [
      {
        vin: '2T3A1RFV4SW564340',
        bayCode: 'TW-A01',
        make: 'Toyota',
        model: 'RAV4',
        year: 2024,
        color: 'Blue Metallic',
      },
      {
        vin: '2T3UWRFV7SW261969',
        bayCode: 'TW-A02',
        make: 'Toyota',
        model: 'RAV4 Hybrid',
        year: 2024,
        color: 'Pearl White',
      },
      {
        vin: '3TMLB5JN3SM178449',
        bayCode: 'TW-A03',
        make: 'Toyota',
        model: 'Tacoma',
        year: 2023,
        color: 'Barcelona Red',
      },
      {
        vin: '4T1DAACK6SU566558',
        bayCode: 'TW-A04',
        make: 'Toyota',
        model: 'Corolla',
        year: 2024,
        color: 'Lunar Rock',
      },
      {
        vin: '2T3P1RFV2SC561402',
        bayCode: 'TW-A05',
        make: 'Toyota',
        model: 'RAV4 Adventure',
        year: 2024,
        color: 'Voodoo Blue',
      },
      {
        vin: '4T1DAACK8SU046040',
        bayCode: 'TW-A06',
        make: 'Toyota',
        model: 'Camry XSE',
        year: 2024,
        color: 'Magnetic Gray',
      },
      {
        vin: '5TDHZRBH9MS523875',
        bayCode: 'TW-A07',
        make: 'Toyota',
        model: 'Highlander',
        year: 2024,
        color: 'Magnetic Gray',
      },
      {
        vin: '4T1DAACK1SU559372',
        bayCode: 'TW-A08',
        make: 'Toyota',
        model: 'Camry LE Hybrid',
        year: 2024,
        color: 'Blueprint',
      },
      {
        vin: '4T1DBADK1SU013733',
        bayCode: 'TW-A09',
        make: 'Toyota',
        model: 'Camry XLE AWD',
        year: 2024,
        color: 'Pearl White',
      },
    ],
  },
  {
    id: 'load-002',
    load_ref: 'LOA-2024-05-002',
    origin: 'Port of Tacoma — Taylor Way Auto Facility',
    originId: 'port-tacoma-tw',
    destination: 'Pars Subaru of Tacoma',
    destinationId: 'dealer-subaru-tacoma',
    createdAt: new Date('2024-05-16').toISOString(),
    status: 'planning',
    vehicles: [
      {
        vin: 'JF2GTABC4C1234567',
        bayCode: 'TW-A01',
        make: 'Subaru',
        model: 'Outback',
        year: 2024,
        color: 'Dark Blue Pearl',
      },
      {
        vin: 'JF2GTABC3C7654321',
        bayCode: 'TW-A02',
        make: 'Subaru',
        model: 'Legacy',
        year: 2024,
        color: 'Ice Silver Metallic',
      },
      {
        vin: 'JF2GTABC2C3456789',
        bayCode: 'TW-A03',
        make: 'Subaru',
        model: 'Crosstrek',
        year: 2024,
        color: 'Magnetite Gray Metallic',
      },
      {
        vin: 'JF2GTABC1C1111111',
        bayCode: 'TW-A04',
        make: 'Subaru',
        model: 'Impreza',
        year: 2024,
        color: 'Autumn Green Metallic',
      },
      {
        vin: 'JF2GTABC9C9999999',
        bayCode: 'TW-A05',
        make: 'Subaru',
        model: 'Ascent',
        year: 2024,
        color: 'Carbide Gray Metallic',
      },
      {
        vin: 'JF2GTABC8C8888888',
        bayCode: 'TW-A06',
        make: 'Subaru',
        model: 'Outback',
        year: 2024,
        color: 'Dark Blue Pearl',
      },
      {
        vin: 'JF2GTABC7C7777777',
        bayCode: 'TW-A07',
        make: 'Subaru',
        model: 'Legacy',
        year: 2024,
        color: 'Pearl White',
      },
      {
        vin: 'JF2GTABC6C6666666',
        bayCode: 'TW-A08',
        make: 'Subaru',
        model: 'Crosstrek',
        year: 2024,
        color: 'Abyss Blue Pearl',
      },
      {
        vin: 'JF2GTABC5C5555555',
        bayCode: 'TW-A09',
        make: 'Subaru',
        model: 'Solterra',
        year: 2024,
        color: 'Slate Gray Metallic',
      },
    ],
  },
  {
    id: 'load-003',
    load_ref: 'LOA-2024-05-003',
    origin: 'Port of Tacoma — Taylor Way Auto Facility',
    originId: 'port-tacoma-tw',
    destination: 'BMW of Seattle',
    destinationId: 'dealer-bmw-seattle',
    createdAt: new Date('2024-05-17').toISOString(),
    status: 'planning',
    vehicles: [
      {
        vin: 'WBXYZ123XS456789',
        bayCode: 'TW-B01',
        make: 'BMW',
        model: 'X5',
        year: 2024,
        color: 'Alpine White',
      },
      {
        vin: 'WBXYZ124XS123456',
        bayCode: 'TW-B02',
        make: 'BMW',
        model: 'M340i',
        year: 2024,
        color: 'Black Sapphire',
      },
      {
        vin: 'WBXYZ125XS789012',
        bayCode: 'TW-B03',
        make: 'BMW',
        model: 'X3',
        year: 2024,
        color: 'Slate Gray',
      },
      {
        vin: 'WBXYZ126XS345678',
        bayCode: 'TW-B04',
        make: 'Volvo',
        model: 'XC90',
        year: 2024,
        color: 'Onyx Black',
      },
      {
        vin: 'WBXYZ127XS901234',
        bayCode: 'TW-B05',
        make: 'Volvo',
        model: 'S90',
        year: 2024,
        color: 'Birch Light',
      },
      {
        vin: 'WBXYZ128XS567890',
        bayCode: 'TW-B01',
        make: 'Volkswagen',
        model: 'ID.Buzz',
        year: 2024,
        color: 'Unified White',
      },
      {
        vin: 'WBXYZ129XS234567',
        bayCode: 'TW-B02',
        make: 'Volkswagen',
        model: 'ID.4',
        year: 2024,
        color: 'Deep Black Pearl',
      },
      {
        vin: 'WBXYZ130XS890123',
        bayCode: 'TW-B03',
        make: 'BMW',
        model: 'M440i',
        year: 2024,
        color: 'Frozen Brilliant White',
      },
      {
        vin: 'WBXYZ131XS456789',
        bayCode: 'TW-B04',
        make: 'BMW',
        model: 'X7',
        year: 2024,
        color: 'Mineral White',
      },
    ],
  },
];

export const getLoadSheetById = (id) => {
  return MOCK_LOAD_SHEETS.find((sheet) => sheet.id === id);
};

export const getLoadSheetByRef = (loadRef) => {
  return MOCK_LOAD_SHEETS.find((sheet) => sheet.load_ref === loadRef);
};

export const getLoadSheetsByOrigin = (origin) => {
  return MOCK_LOAD_SHEETS.filter((sheet) => sheet.origin === origin);
};

export const getLoadSheetsByDestination = (destination) => {
  return MOCK_LOAD_SHEETS.filter((sheet) => sheet.destination === destination);
};

export const getAllLoadSheets = () => {
  return MOCK_LOAD_SHEETS;
};

// ── Session utilities (localStorage-backed) ───────────────────────────────

export const SESSION_DEALER_OPTIONS = [
  "Mel's Toyota of Tacoma",
  'Hyundai of Seattle',
  'Subaru of Seattle',
  'Pars Subaru of Tacoma',
  'BMW of Seattle',
  'BMW of Bellevue',
  'Volk Volkswagen Seattle',
  'Volvo Cars Seattle',
];

const LS_KEY = 'montar_previous_loads';

export function loadPreviousLoads() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function savePreviousLoad(entry) {
  try {
    const existing = loadPreviousLoads();
    localStorage.setItem(LS_KEY, JSON.stringify([entry, ...existing].slice(0, 50)));
  } catch (_) {}
}

export function formatLoadDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function buildPreviousLoadRows(loads = []) {
  return loads.map((entry) => ({
    ...entry,
    loadDate: formatLoadDate(entry.ts),
  }));
}