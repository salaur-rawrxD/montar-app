export const BNSF_ORILLIA = {
  id: 'bnsf-orillia',
  name: 'BNSF Orillia',
  city: 'Renton, WA',
  loadId: '041625-09',
  rows: ['T-A', 'T-B', 'T-C', 'T-D'],
};

function pathRowA(sx) {
  return 'M30,318 L30,165 L196,165 L196,78 L' + sx + ',78 L' + sx + ',52';
}
function pathRowC(sx) {
  return 'M30,318 L30,165 L196,165 L196,198 L' + sx + ',198 L' + sx + ',208';
}

export const YARD_STOPS = [
  { stallId: 'T042', title: 'Bay T042 — Camry XSE V6',     dist: '~220 ft · Row T-A', walk: '~1.5 min · staging lane',     routeD: pathRowA(86),  nextPull: 'translate(0,0)',   upNextHint: 'Same row — short walk east' },
  { stallId: 'T043', title: 'Bay T043 — RAV4 XLE Premium', dist: '~45 ft · Row T-A',  walk: '~25 sec · no row change',     routeD: pathRowA(118), nextPull: 'translate(32,0)',  upNextHint: 'Continue east along T-A' },
  { stallId: 'T044', title: 'Bay T044 — Camry LE Hybrid',  dist: '~38 ft · Row T-A',  walk: '~20 sec',                     routeD: pathRowA(152), nextPull: 'translate(64,0)',  upNextHint: 'Next stall east' },
  { stallId: 'T045', title: 'Bay T045 — Camry XSE AWD',    dist: '~35 ft · Row T-A',  walk: '~20 sec',                     routeD: pathRowA(182), nextPull: 'translate(96,0)',  upNextHint: 'Then jump to east T-A' },
  { stallId: 'T048', title: 'Bay T048 — Corolla SE CVT',   dist: '~95 ft · Row T-A east', walk: '~50 sec',                 routeD: pathRowA(292), nextPull: 'translate(206,0)', upNextHint: 'Adjacent stall — RAV4 next' },
  { stallId: 'T049', title: 'Bay T049 — RAV4 Adventure',   dist: '~38 ft · Row T-A',  walk: '~22 sec',                     routeD: pathRowA(324), nextPull: 'translate(228,0)', upNextHint: 'Then Row T-C SUVs' },
  { stallId: 'T071', title: 'Bay T071 — Tacoma TRD 4x4',   dist: '~175 ft · Row T-C', walk: '~1.9 min · main aisle',       routeD: pathRowC(86),  nextPull: 'translate(0,177)', upNextHint: 'Highlander same row' },
  { stallId: 'T072', title: 'Bay T072 — Highlander XLE',   dist: '~38 ft · Row T-C',  walk: '~22 sec',                     routeD: pathRowC(118), nextPull: 'translate(32,177)',upNextHint: 'Final pull east on T-C' },
  { stallId: 'T073', title: 'Bay T073 — Highlander XSE',   dist: '~110 ft · Row T-C east', walk: '~1.1 min',               routeD: pathRowC(224), nextPull: 'translate(138,177)',upNextHint: '' },
];
