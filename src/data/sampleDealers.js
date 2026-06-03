export const SAMPLE_DEALERS = [
  // Toyota Dealers
  {
    id: 'dealer-toyota-seattle',
    name: 'Hyundai of Seattle',
    brand: 'Toyota',
    address: '5900 Pacific Highway E, Fife WA 98424',
    phone: '(253) 922-5000',
    region: 'Seattle-Tacoma',
  },
  {
    id: 'dealer-toyota-tacoma',
    name: "Mel's Toyota of Tacoma",
    brand: 'Toyota',
    address: '3811 S Tacoma Way, Tacoma WA 98409',
    phone: '(253) 472-4341',
    region: 'Tacoma',
  },
  // Subaru Dealers
  {
    id: 'dealer-subaru-seattle',
    name: 'Subaru of Seattle',
    brand: 'Subaru',
    address: '3200 Airport Way S, Seattle WA 98134',
    phone: '(206) 763-3200',
    region: 'Seattle',
  },
  {
    id: 'dealer-subaru-tacoma',
    name: 'Pars Subaru of Tacoma',
    brand: 'Subaru',
    address: '1515 Fawcett Ave, Tacoma WA 98402',
    phone: '(253) 572-1000',
    region: 'Tacoma',
  },
  // BMW Dealers
  {
    id: 'dealer-bmw-seattle',
    name: 'BMW of Seattle',
    brand: 'BMW',
    address: '9200 Medina Ave N, Seattle WA 98103',
    phone: '(206) 633-3900',
    region: 'Seattle',
  },
  {
    id: 'dealer-bmw-bellevue',
    name: 'BMW of Bellevue',
    brand: 'BMW',
    address: '14020 Bel Red Rd, Bellevue WA 98007',
    phone: '(425) 957-7000',
    region: 'East King County',
  },
  // VW Dealers
  {
    id: 'dealer-vw-seattle',
    name: 'Volk Volkswagen Seattle',
    brand: 'Volkswagen',
    address: '2505 4th Ave S, Seattle WA 98134',
    phone: '(206) 582-3777',
    region: 'Seattle',
  },
  // Volvo Dealers
  {
    id: 'dealer-volvo-seattle',
    name: 'Volvo Cars Seattle',
    brand: 'Volvo',
    address: '3609 Lakeshore Ave N, Seattle WA 98103',
    phone: '(206) 545-9000',
    region: 'Seattle',
  },
];

export const getDealersByBrand = (brand) => {
  return SAMPLE_DEALERS.filter((dealer) => dealer.brand === brand);
};

export const getDealerById = (id) => {
  return SAMPLE_DEALERS.find((dealer) => dealer.id === id);
};