import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { EVENTS, PRICES, FROM_PRICE, fmt, VENUE } from '../data.js';
import { btn } from '../App.jsx';
import EventCard from '../components/EventCard.jsx';

const HeroStadium = lazy(() => import('../components/HeroStadium.jsx'));

const steps = [
  ['Spin the arena', 'Drag the live model around. Every section shows its price and how many seats are left.', '/assets/tt/1_30.jpg'],
  ['Fly into a section', 'Click a section and the camera flies in. Orbit it, then pick a free seat, or let us find the best group seats.', '/assets/sec/0_6.jpg'],
  ['Sit in your seat', 'The camera drops into the exact seat so you see the court the way you will on the night. Then book.', '/assets/marketing/seat.jpg'],
];
const perks = [
  ['The real view first', 'Every seat has its own view. No more guessing from a flat map.'],
  ['Groups stay together', 'Book up to 8 seats side by side in one row, in one go.'],
  ['10-minute seat hold', 'Your seats are held while you check out, so nobody can take them.'],
  ['Free cancellation', 'Cancel up to 48 hours before the event for a refund of the ticket price.'],
  ['E-tickets you can print', 'Show the ticket on your phone or print it at home. Transfer it to a friend in seconds.'],
  ['Indoor and air-conditioned', 'No sun, no rain. 22°C inside for every game, all year.'],
];

export default function Home() {
  const next = EVENTS[0];
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10"><Suspense fallback={null}><HeroStadium /></Suspense></div>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/10 max-md:bg-ink/70" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto flex min-h-[calc(100dvh-64px)] max-w-7xl flex-col justify-center px-5 py-20">
          <p className="eyebrow rise text-gold">Official box office · {VENUE.city}</p>
          <h1 className="rise mt-5 max-w-2xl font-wide text-[clamp(2.4rem,6vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.01em]" style={{ animationDelay: '80ms' }}>Sit in your seat<br />before you buy it.</h1>
          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-[#c9cdd3]" style={{ animationDelay: '160ms' }}>Spin Indus Arena in 3D, fly into any section and look around from the exact seat. Then book one ticket or eight together in under two minutes.</p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
            <Link to="/events" className={btn.gold + ' h-12 px-6 text-[15px]'}>Find tickets</Link>
            <Link to={'/book/' + next.id} className={btn.ghost + ' h-12 bg-ink/50 px-5 text-[15px]'}>Next game: {next.home} vs {next.away} · {next.day}</Link>
          </div>
          <dl className="rise mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4" style={{ animationDelay: '320ms' }}>
            {[['9,484', 'seats, each with its own view'], ['44', 'sections in two bowls'], [fmt(FROM_PRICE), 'cheapest ticket'], ['48 h', 'free cancellation']].map(([a, b]) => <div key={b}><dt className="font-wide text-2xl font-extrabold">{a}</dt><dd className="mt-1 text-xs leading-snug text-muted">{b}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Up next</p><h2 className="mt-2 font-wide text-3xl font-extrabold">On sale now</h2></div><Link to="/events" className="text-sm font-semibold text-gold hover:underline">All {EVENTS.length} events →</Link></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{EVENTS.slice(0, 4).map((e, i) => <EventCard key={e.id} e={e} i={i} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <p className="eyebrow">How it works</p><h2 className="mt-2 max-w-xl font-wide text-3xl font-extrabold">From the car park to row 9, before you pay.</h2>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(([t, d, img], i) => (
            <li key={t} className="group overflow-hidden rounded-3xl border border-line bg-panel">
              <div className="aspect-[16/10] overflow-hidden bg-raise"><img src={img} alt="" loading={i ? 'lazy' : 'eager'} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" /></div>
              <div className="p-6"><span className="font-wide text-sm font-extrabold text-gold">0{i + 1}</span><h3 className="mt-2 text-lg font-bold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-24 lg:grid-cols-[1fr_1.1fr]">
        <div><p className="eyebrow">Seating and prices</p><h2 className="mt-2 font-wide text-3xl font-extrabold">Five ways to watch.</h2><p className="mt-4 max-w-md leading-relaxed text-muted">Prices are per seat for a league game. Finals and international nights cost a little more, family nights a little less; the seat map always shows that night's price. A {fmt(150)} service fee is added per ticket at checkout. Children under 3 sit on a lap for free.</p><Link to="/events" className={btn.gold + ' mt-8'}>Choose your seats</Link></div>
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-panel">
          {PRICES.map((p) => (
            <li key={p.name} className="flex items-center gap-4 px-6 py-5">
              <span className={'h-3 w-3 flex-none rounded-[4px] ' + (p.vip ? 'bg-copper' : 'bg-seat')} />
              <div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-sm text-muted">{p.note}</p></div>
              <p className={'font-wide font-extrabold ' + (p.vip ? 'text-copper' : '')}>{fmt(p.price)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <p className="eyebrow">Why book here</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {perks.map(([t, d]) => <div key={t} className="bg-ink p-7 transition hover:bg-panel"><h3 className="font-bold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{d}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="relative overflow-hidden rounded-3xl border border-line">
          <img src="/assets/tt/0_12.jpg" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="relative grid gap-8 bg-gradient-to-r from-ink via-ink/85 to-ink/30 p-10 md:grid-cols-2 md:p-14">
            <div><p className="eyebrow">Planning your visit</p><h2 className="mt-2 font-wide text-3xl font-extrabold">Doors open 90 minutes before tip-off.</h2><p className="mt-4 max-w-md leading-relaxed text-[#c9cdd3]">Eight gates, two car parks, prayer areas for men and women, and step-free routes to every bowl.</p></div>
            <div className="flex flex-wrap content-end gap-3 md:justify-end"><Link to="/venue" className={btn.gold}>Venue guide</Link><Link to="/faq" className={btn.ghost + ' bg-ink/60'}>Questions and answers</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
