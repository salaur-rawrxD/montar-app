export const RENTON_TOYOTA = {
  id: 'renton-toyota',
  name: 'Renton Toyota',
  address: '501 SW 41st St, Renton, WA 98057',
  phone: '(425) 555-0182',
  contact: 'Mike Torres — Receiving Manager',
  hours: '7am–5pm Mon–Sat',
  etaMin: 24,
  approach: [
    { step: 1, text: 'Take <strong>Rainier Ave N southbound</strong> — wider lanes, no overhead clearance issues, easier rig maneuver.' },
    { step: 2, text: '<strong>Do not use SW 41st St entrance</strong> — tight turn radius for 80-foot rig. Tight residential block on the approach.' },
    { step: 3, text: 'Enter via <strong>Rainier Ave N driveway</strong> on the east side of the lot. Swing wide on entry.' },
    { step: 4, text: 'Park rig <strong>north–south orientation</strong>, driver side facing the service bay. New vehicle receiving is on the north end.' },
  ],
  notes: [
    { icon: 'meeting_room',  color: 'orange', title: 'Check-in',        body: 'Ask for the receiving manager at the front service desk. Do not unload until they sign the BOL. Hours: 7am–5pm Mon–Sat.' },
    { icon: 'local_parking', color: 'blue',   title: 'Staging area',    body: 'Unload vehicles onto the north staging lot — the paved area directly behind the showroom. Drive-through unload only, no backing required from the Rainier entrance.' },
    { icon: 'warning_amber', color: 'warn',   title: 'Low clearance notice', body: 'Covered walkway between showroom and service bay is 14\'6". Keep clear — do not pull rig under canopy.' },
    { icon: 'person',        color: 'green',  title: 'Dealer contact',  body: 'Mike Torres — Receiving Manager · (425) 555-0182. Call ahead if arriving after 4pm or if load has any damage to note.' },
  ],
};
