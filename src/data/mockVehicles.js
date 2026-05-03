export const SEED_VEHICLES = [
  { vin: '4T1G11AK8PU123481', year: 2025, make: 'Toyota', model: 'Camry XSE V6',     weightLb: 3572, heightIn: 56.9, type: 'sedan', dealerCode: '05210-WA', stallId: 'T042' },
  { vin: '2T3P1RFV8PW847263', year: 2025, make: 'Toyota', model: 'RAV4 XLE Premium', weightLb: 4015, heightIn: 67.1, type: 'suv',   dealerCode: '05210-WA', stallId: 'T043' },
  { vin: '3TMLB5JN3SM178449', year: 2025, make: 'Toyota', model: 'Tacoma TRD 4x4',   weightLb: 4480, heightIn: 70.5, type: 'truck', dealerCode: '05318-WA', stallId: 'T071' },
  { vin: '5TDHZRBH9MS523875', year: 2025, make: 'Toyota', model: 'Highlander XLE',   weightLb: 4705, heightIn: 70.9, type: 'suv',   dealerCode: '05318-WA', stallId: 'T072' },
  { vin: '4T1DAACK6SU566558', year: 2025, make: 'Toyota', model: 'Corolla SE CVT',   weightLb: 3097, heightIn: 56.5, type: 'sedan', dealerCode: '05441-WA', stallId: 'T048' },
  { vin: '2T3P1RFV2SC561402', year: 2025, make: 'Toyota', model: 'RAV4 Adventure',   weightLb: 4015, heightIn: 67.1, type: 'suv',   dealerCode: '05318-WA', stallId: 'T049' },
  { vin: '4T1DAACK1SU559372', year: 2025, make: 'Toyota', model: 'Camry LE Hybrid',  weightLb: 3616, heightIn: 57.5, type: 'sedan', dealerCode: '05210-WA', stallId: 'T044' },
  { vin: '4T1DAACK8SU046040', year: 2025, make: 'Toyota', model: 'Camry XSE AWD',    weightLb: 3682, heightIn: 57.5, type: 'sedan', dealerCode: '05210-WA', stallId: 'T045' },
  { vin: '5TDHZRBH9MS500001', year: 2025, make: 'Toyota', model: 'Highlander XSE',   weightLb: 4705, heightIn: 70.9, type: 'suv',   dealerCode: '05318-WA', stallId: 'T073' },
];

export function vehicleDisplayName(v) {
  return `${v.year} ${v.make} ${v.model}`;
}

export function weightBadgeClass(weightLb) {
  if (weightLb >= 4400) return 'badge-warn';
  if (weightLb >= 4000) return 'badge-warn';
  return 'badge-neu';
}
