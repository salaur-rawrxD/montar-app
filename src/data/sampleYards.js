// Port of Tacoma - Taylor Way Auto Facility
export const SAMPLE_YARDS = [
  {
    id: 'port-tacoma-tw',
    name: 'Port of Tacoma — Taylor Way Auto Facility',
    address: '3400 Taylor Way, Tacoma WA 98421',
    coordinates: {
      lat: 47.268,
      lng: -122.426,
    },
    operator: 'Wallenius Wilhelmsen Solutions',
    acreage: 90,
    oems: ['Subaru', 'Toyota', 'BMW', 'Volkswagen', 'Volvo'],
    stalls: [
      // Zone TW-A: Subaru & Toyota stalls (north quadrant)
      { id: 'TW-A01', zone: 'A', capacity: 8, oems: ['Subaru', 'Toyota'] },
      { id: 'TW-A02', zone: 'A', capacity: 8, oems: ['Subaru', 'Toyota'] },
      { id: 'TW-A03', zone: 'A', capacity: 8, oems: ['Subaru', 'Toyota'] },
      { id: 'TW-A04', zone: 'A', capacity: 8, oems: ['Subaru', 'Toyota'] },
      { id: 'TW-A05', zone: 'A', capacity: 8, oems: ['Subaru', 'Toyota'] },
      // Zone TW-B: BMW & Volkswagen stalls (south quadrant)
      { id: 'TW-B01', zone: 'B', capacity: 7, oems: ['BMW', 'Volkswagen'] },
      { id: 'TW-B02', zone: 'B', capacity: 7, oems: ['BMW', 'Volkswagen'] },
      { id: 'TW-B03', zone: 'B', capacity: 7, oems: ['BMW', 'Volkswagen'] },
      { id: 'TW-B04', zone: 'B', capacity: 8, oems: ['Volvo'] },
      { id: 'TW-B05', zone: 'B', capacity: 8, oems: ['Volvo'] },
    ],
    description: 'Primary automotive vehicle facility at Port of Tacoma, handling import/export operations',
  },
];

export const getYardById = (id) => {
  return SAMPLE_YARDS.find((yard) => yard.id === id);
};

export const getYardByName = (name) => {
  return SAMPLE_YARDS.find((yard) => yard.name === name);
};

export const DEFAULT_YARD_ID = 'port-tacoma-tw';
export const DEFAULT_YARD_NAME = 'Port of Tacoma — Taylor Way Auto Facility';

// Flat list of loading stops keyed by stallId — used by yardPlanner + YardMapPage.
// stallId matches vehicle.stallId from the load plan slots.
export const YARD_STOPS = [
  { stallId: 'T042', title: 'Stall T042 — Zone A North', dist: '0.2 mi', walk: '3 min', upNextHint: 'Continue to Zone A' },
  { stallId: 'T043', title: 'Stall T043 — Zone A North', dist: '0.2 mi', walk: '3 min', upNextHint: 'Continue to Zone A' },
  { stallId: 'T044', title: 'Stall T044 — Zone A North', dist: '0.3 mi', walk: '4 min', upNextHint: 'Move to Zone A South' },
  { stallId: 'T045', title: 'Stall T045 — Zone A South', dist: '0.3 mi', walk: '4 min', upNextHint: 'Move to Zone B' },
  { stallId: 'T048', title: 'Stall T048 — Zone A South', dist: '0.4 mi', walk: '5 min', upNextHint: 'Continue to Zone A' },
  { stallId: 'T049', title: 'Stall T049 — Zone A South', dist: '0.4 mi', walk: '5 min', upNextHint: 'Move to Zone B' },
  { stallId: 'T071', title: 'Stall T071 — Zone B West',  dist: '0.5 mi', walk: '7 min', upNextHint: 'Continue in Zone B' },
  { stallId: 'T072', title: 'Stall T072 — Zone B West',  dist: '0.5 mi', walk: '7 min', upNextHint: 'Continue in Zone B' },
  { stallId: 'T073', title: 'Stall T073 — Zone B East',  dist: '0.6 mi', walk: '8 min', upNextHint: 'Loading complete' },
];