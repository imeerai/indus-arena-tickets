# Indus Arena · Official tickets

The ticket office of **Indus Arena**, a 9,484-seat indoor basketball arena in Hyderabad, Sindh. Fans can **sit in a seat before they buy it**. They spin a 3D model of the arena, fly into a section, drop into the exact seat to look around, and then book one ticket or a group of up to eight seats side by side.

> **Prototype.** Payments are simulated and no money is charged. Bookings are saved in the browser (`localStorage`), so they live on the device that made them.

## What a fan can do

| Area | Features |
| --- | --- |
| **3D seat map** (`/book/:eventId`) | Turn the arena by dragging and zoom with the wheel. Hover a section to see its price and seats left. Click it and the camera flies in. Drag to orbit the section, then click a seat. **Sit here** drops the camera into that seat for a free look-around. The map also shows the premier suites ring and a "find the best seats" button. |
| **Groups** | Choose 1–8 tickets before picking. Seats are always side by side in one row. **Find N best seats together** searches every section for the best run that fits your budget. |
| **Filters** | Budget per seat. The prices on the map change with the night (finals ×1.4, internationals ×1.3, family nights ×0.9). |
| **Seat facts** | Each seat shows its view (sideline or behind the hoop), its gate and walking time, the distance to washrooms and food, and whether it is an aisle seat. |
| **Checkout** | A 10-minute hold with a visible timer. Fields: name, Pakistani mobile number and email, all checked as you type. Optional holder names for group seats. Pay by card, JazzCash or Easypaisa (simulated). Promo code `TIER10` gives 10% off. A service fee of PKR 150 per ticket is shown before you pay, along with the terms you are agreeing to. |
| **E-tickets** (`/tickets/:ref`) | One ticket per seat, each with a scannable Code 128 barcode, gate, section, row, seat and holder. Print or save as PDF (with its own print layout), add to calendar (`.ics`), get directions, or jump back to the 3D map. |
| **My tickets** (`/tickets`) | Upcoming and cancelled bookings. **Cancel** gives a refund of the ticket price (the fee is not refunded) and is allowed only until 48 hours before the event. **Transfer** reissues the tickets in a friend's name; after that, the sender can no longer cancel or transfer them. **Find my booking** works with your reference and mobile number. |
| **Info pages** | Events (with filters and search), venue guide (gates, parking, accessibility, bag policy, food, prayer areas, family zone), FAQ, About, Contact (form with checks), Terms, Privacy, and a 404 page. |

### Works without WebGL

If the browser has 3D graphics turned off, the same flow runs on pre-rendered images, so nobody is locked out:

- The arena turns through 144 frames: 48 angles × 3 heights.
- The drone fly-in is a 30-frame sprite.
- Section photos have clickable seat dots.
- The seat view is a **360° panorama**: six cube faces reprojected onto a 2D canvas, pixel by pixel.

## Tech

- **React 18** and **React Router 6**. Plain JavaScript, no TypeScript.
- **Tailwind CSS 4**, with the theme tokens in `src/index.css`.
- **three.js r149** draws the arena procedurally in `src/engine/Stadium.js`: superellipse bowls, instanced seats, low-poly fans everywhere and detailed fans next to your seat, LED ribbons, the jumbotron and the court.
- **Vite 5** builds the site. It is deployed as a static site on **Vercel**; `vercel.json` sends every route to the app.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm test          # money, cancellation and barcode rules
```

## Folder map

```
src/
  engine/Stadium.js   3D arena: geometry, camera moves, picking, seat search, checkout state, no-WebGL mode
  pages/              Home, Events, Book (3D), Tickets, Ticket, Info (venue, FAQ, about, contact, legal, 404)
  components/         EventCard, HeroStadium (live 3D on the home page), Barcode
  data.js             venue facts, events, prices, policy numbers
  store.js            bookings in localStorage, cancellation rule, refund amount, calendar file
  barcode.js          Code 128 encoder
public/assets/        pre-rendered frames for the no-WebGL mode
tests/                node test for the rules that move money
```

## System design (production version)

The prototype runs in the browser. A real launch puts the following behind it:

```
 Browser (this app) ──HTTPS──> CDN (static site + render assets)
        │
        └── REST/JSON ──> API (Node) ──> PostgreSQL  (events, seats, orders, tickets)
                           │      └────> Redis       (seat holds with 10-minute expiry, rate limits)
                           ├──> Payment gateway (cards, JazzCash, Easypaisa) ── webhooks back to the API
                           ├──> Email / SMS (tickets, reminders)
                           └──> Gate scanners (validate barcode, mark ticket used)
```

**Main tables:** `events(id, starts_at, price_mult)` · `seats(id, section, row, number, tier, stand)` · `event_seats(event_id, seat_id, status: free|held|sold, order_id)` · `orders(id, ref, buyer, total, fee, status, payment_ref)` · `tickets(id, order_id, event_seat_id, holder, barcode, used_at)`.

**Stopping two people from buying the same seat.** A hold is `SET hold:{event}:{seat} {cart} NX EX 600` in Redis for every seat in the group. If any `SET` fails, the ones that succeeded are released and the fan is shown "taken". Payment then confirms with a single PostgreSQL transaction: `UPDATE event_seats SET status='sold' WHERE ... AND status <> 'sold'`, with a check on the affected row count. A unique index on `(event_id, seat_id)` in `tickets` is the final guard.

**Paying exactly once.** The checkout sends an idempotency key, and the payment webhook is processed once per `payment_ref`.

**Scaling a big on-sale.** A queue (waiting room) in front of `/book` controls traffic. Seat availability is cached per event and pushed to open seat maps (SSE or WebSocket) when it changes.

## Data structures and algorithms used

| Problem | Approach | Where |
| --- | --- | --- |
| Find a section's position along a curved bowl | Superellipse ring stored as a polyline with **prefix sums of arc length**, then **binary search** on those sums (`atLen`), O(log n) | `Stadium.js` |
| Seats side by side for a group | **Sliding window** of width *k* over each row's seats, keeping only windows with no taken seat, starting from the middle of the row | `pickSeat`, `bestAvailable` |
| Best seats for a group | Sections ranked by a comparator (sideline before ends, lower tier first, closest to the centre of the stand), then rows ordered by distance from the ideal row, then the first free window | `bestAvailable` |
| Clickable section outlines in no-WebGL mode | Seat positions projected to the screen, then **convex hull** (Andrew's monotone chain), O(n log n) per section | `computeHot` |
| Sun and shade for open-air venues | Solar position (declination and hour angle), then a ray march from each seat against the roof | `computeSun` |
| Seats you already own | **Hash set** of `tier-section-row-seat` keys, O(1) lookup while the arena is built | `store.takenFor` |
| 360° seat view without a GPU | Per-pixel ray direction, choose the cube face by the **largest axis**, then bilinear sampling | `cDraw` |
| Gate barcode | **Code 128-B** with a mod-103 weighted checksum | `barcode.js` |
| Seat-hold expiry (production) | Redis TTL keys, or a **min-heap** of expiry times in a single worker | design above |

## Accessibility and usability

- **Keyboard:** a skip link, visible focus rings, and Esc to step back in the 3D map.
- **Screen readers:** the 3D map has labelled buttons, and dialogs are marked with `aria-modal`.
- **No-WebGL mode:** offers a seat list instead of the photo.
- **Reduced motion:** animations are switched off when the system asks for less motion.
- **Mobile:** layouts are built for phones first; the 3D map accepts taps, and filters fold away on small screens.
- **Wording:** plain language throughout. Fees, the refund rule and the hold time are shown before you pay.

## Credits

Built for Indus Arena by Anza Arain (MUET, Computer Systems Engineering) with Claude.
