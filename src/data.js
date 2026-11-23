// Everything the site says about the venue and its events lives here.
export const VENUE = {
  name: 'Indus Arena',
  city: 'Hyderabad, Sindh',
  address: 'Indus Arena, Auto Bhan Road, Latifabad, Hyderabad',
  phone: '+92 22 111 000 777',
  email: 'tickets@indusarena.pk',
  capacity: '9,484 seats',
  boxOffice: 'Gate N1, open daily 11 AM to 9 PM',
};

export const EVENTS = [
  { id: 'e1', venue: 'arena', home: 'Sea Hawks', away: 'Falcons', day: 'Sat 28 Nov', time: '7:30 PM', iso: '20261128T143000Z', sport: 'League game', cat: 'league', utc: [2026, 10, 28, 14.5], doors: '6:00 PM' },
  { id: 'e2', venue: 'arena', home: 'Sea Hawks', away: 'Thunder', day: 'Tue 1 Dec', time: '8:00 PM', iso: '20261201T150000Z', sport: 'League game', cat: 'league', utc: [2026, 11, 1, 15], doors: '6:30 PM' },
  { id: 'e3', venue: 'arena', home: 'Harbour Kings', away: 'Falcons', day: 'Fri 4 Dec', time: '7:30 PM', iso: '20261204T143000Z', sport: 'League game', cat: 'league', utc: [2026, 11, 4, 14.5], doors: '6:00 PM' },
  { id: 'e4', venue: 'arena', home: 'Sea Hawks', away: 'Harbour Kings', day: 'Sun 6 Dec', time: '5:00 PM', iso: '20261206T120000Z', sport: 'Family day game', cat: 'family', mult: 0.9, utc: [2026, 11, 6, 12], doors: '3:30 PM' },
  { id: 'e5', venue: 'arena', home: 'Pakistan', away: 'Iran', day: 'Wed 9 Dec', time: '8:30 PM', iso: '20261209T153000Z', sport: 'International friendly', cat: 'international', mult: 1.3, utc: [2026, 11, 9, 15.5], doors: '7:00 PM' },
  { id: 'e6', venue: 'arena', home: 'Sea Hawks', away: 'Falcons', day: 'Sun 13 Dec', time: '8:00 PM', iso: '20261213T150000Z', sport: 'League final', cat: 'final', mult: 1.4, utc: [2026, 11, 13, 15], doors: '6:00 PM' },
  { id: 'e7', venue: 'arena', home: 'Indus All-Stars', away: 'Legends XI', day: 'Sat 19 Dec', time: '6:00 PM', iso: '20261219T130000Z', sport: 'All-Star night', cat: 'family', mult: 0.9, utc: [2026, 11, 19, 13], doors: '4:30 PM' },
  { id: 'e8', venue: 'arena', home: 'Thunder', away: 'Harbour Kings', day: 'Thu 24 Dec', time: '7:00 PM', iso: '20261224T140000Z', sport: 'League game', cat: 'league', utc: [2026, 11, 24, 14], doors: '5:30 PM' },
];

// Mirrors the engine's arena prices (base × stand multiplier).
export const PRICES = [
  { name: 'Lower bowl, sideline', price: 9000, note: 'Closest to the action, centre court' },
  { name: 'Lower bowl, behind the hoop', price: 6000, note: 'Low and loud, great for dunks' },
  { name: 'Upper bowl, sideline', price: 5300, note: 'Full view of plays developing' },
  { name: 'Upper bowl, ends', price: 3500, note: 'Best value in the house' },
  { name: 'Premier suites', price: 18000, note: 'Private box, padded seats, food and drinks included', vip: true },
];
export const FROM_PRICE = 3200;
export const fromPrice = (e) => Math.round(3500 * (e.mult || 1) / 100) * 100;
export const SERVICE_FEE = 150;
export const CANCEL_HOURS = 48;

export const fmt = (n) => 'PKR ' + Math.round(n).toLocaleString('en-US');
export const eventById = (id) => EVENTS.find((e) => e.id === id);
export const startsAt = (e) => { const [Y, M, D, H] = e.utc; return new Date(Date.UTC(Y, M, D, Math.floor(H), Math.round((H % 1) * 60))); };
export const CATS = [['all', 'All events'], ['league', 'League'], ['final', 'Finals'], ['international', 'International'], ['family', 'Family']];
