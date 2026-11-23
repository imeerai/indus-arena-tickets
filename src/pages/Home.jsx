import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { EVENTS, PRICES, FROM_PRICE, fmt, SERVICE_FEE, CANCEL_HOURS } from '../data.js';
import { btn } from '../App.jsx';
import Fixture, { TeamBadge, stockNote } from '../components/Fixture.jsx';

const HeroStadium = lazy(() => import('../components/HeroStadium.jsx'));

const promises = [
  ['One price, shown up front', `The seat price and the ${fmt(SERVICE_FEE)} fee are on screen before you pay. Nothing is added later.`],
  ['Your group sits together', 'Up to eight seats, side by side, in one row. We never split a booking.'],
  ['Change of plans is fine', `Cancel up to ${CANCEL_HOURS} hours before the game and the ticket price comes back to you.`],
  ['No sun, no rain', 'The arena is indoor and kept at 22°C for every game, all year.'],
];

export default function Home() {
  const [next, ...rest] = EVENTS, [note, tone] = stockNote(next);
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10"><Suspense fallback={null}><HeroStadium /></Suspense></div>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-transparent max-md:bg-ink/70" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto flex min-h-[calc(100dvh-100px)] max-w-7xl flex-col justify-center px-5 py-20">
          <h1 className="rise max-w-2xl font-wide text-[clamp(2.6rem,6vw,4.75rem)] font-extrabold leading-[0.95]">Sit in your seat before you buy it.</h1>
          <p className="rise mt-6 max-w-md text-lg leading-relaxed text-[#c9cdd3]" style={{ animationDelay: '100ms' }}>Spin Indus Arena in 3D, fly into any section and look around from the exact seat you want.</p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '200ms' }}>
            <Link to="/events" className={btn.gold + ' h-12 px-7 text-[15px]'}>Buy tickets</Link>
            <Link to={'/book/' + next.id} className={btn.ghost + ' h-12 bg-ink/40 px-6 text-[15px]'}>Try the 3D seat map</Link>
          </div>
        </div>
      </section>

      <section aria-label="The arena in numbers" className="border-y border-white/[0.08]">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 md:grid-cols-4 md:divide-x md:divide-white/[0.08]">
          {[['9,484', 'seats, each with its own view'], ['44', 'sections across two bowls'], [fmt(FROM_PRICE), 'for the cheapest seat'], [CANCEL_HOURS + ' hours', 'free cancellation window']].map(([a, b]) => (
            <div key={b} className="py-8 md:px-8 md:first:pl-0"><dt className="font-wide text-3xl font-extrabold">{a}</dt><dd className="mt-1 text-sm text-muted">{b}</dd></div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="flex items-end justify-between gap-4"><h2 className="font-wide text-4xl font-extrabold">Up next</h2><Link to="/events" className="text-sm font-semibold text-gold hover:underline">All {EVENTS.length} fixtures</Link></div>
        <Link to={'/book/' + next.id} className="group relative mt-8 grid overflow-hidden rounded-[4px] bg-panel md:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-between gap-10 p-8 md:p-10">
            <div>
              <p className="text-sm text-muted">{next.sport} · {next.day}, {next.time}</p>
              <div className="mt-6 space-y-3">
                {[next.home, next.away].map((t) => <div key={t} className="flex items-center gap-4"><TeamBadge team={t} size={52} /><span className="font-wide text-3xl font-extrabold md:text-4xl">{t}</span></div>)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <span className={btn.gold + ' h-12 px-7'}>Choose your seats</span>
              <span className="text-sm"><span className={'font-semibold ' + tone}>{note}</span><span className="text-muted">, doors open {next.doors}</span></span>
            </div>
          </div>
          <div className="relative min-h-[260px] overflow-hidden"><img src="/assets/sec/0_6.jpg" alt="Lower bowl seats seen from across the court" className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" /></div>
        </Link>
        <div className="mt-4 divide-y divide-white/[0.08]">{rest.slice(0, 3).map((e, i) => <Fixture key={e.id} e={e} i={i} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-32">
        <h2 className="max-w-xl font-wide text-4xl font-extrabold leading-tight">From the car park to row 9, before you pay.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <figure className="group">
            <div className="overflow-hidden rounded-[4px] bg-raise"><img src="/assets/marketing/seat.jpg" alt="The view from an upper bowl seat, looking down at the court" loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]" /></div>
            <figcaption className="mt-5 max-w-md"><p className="text-lg font-semibold">Sit in the seat</p><p className="mt-1 text-sm leading-relaxed text-muted">The camera drops to eye height in the exact seat. Drag to look around, then book.</p></figcaption>
          </figure>
          <div className="grid gap-6">
            {[['/assets/tt/1_30.jpg', 'Spin the arena', 'Every section shows its price and how many seats are left.', 'The whole arena from above'], ['/assets/sec/1_9.jpg', 'Fly into a section', 'Orbit it, pick a free seat, or let us find the best seats for your group.', 'An upper bowl section up close']].map(([img, t, d, alt]) => (
              <figure key={t} className="group">
                <div className="overflow-hidden rounded-[4px] bg-raise"><img src={img} alt={alt} loading="lazy" className="aspect-[16/9] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]" /></div>
                <figcaption className="mt-4"><p className="font-semibold">{t}</p><p className="mt-1 text-sm leading-relaxed text-muted">{d}</p></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-32 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="font-wide text-4xl font-extrabold">Five ways to watch</h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">League-night prices per seat. Finals cost a little more and family nights a little less. The seat map always shows the price for that night.</p>
          <Link to="/events" className={btn.gold + ' mt-8'}>Buy tickets</Link>
        </div>
        <ol>
          {PRICES.map((p) => (
            <li key={p.name} className="flex items-baseline gap-6 border-t border-white/[0.08] py-5 first:border-t-0 first:pt-0">
              <span className={'w-36 flex-none font-wide text-2xl font-extrabold ' + (p.vip ? 'text-copper' : '')}>{p.price.toLocaleString('en-US')}</span>
              <div><p className="font-semibold">{p.name}</p><p className="text-sm text-muted">{p.note}</p></div>
            </li>
          ))}
          <li className="pt-2 text-xs text-muted">Prices in PKR. A {fmt(SERVICE_FEE)} service fee applies per ticket.</li>
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-32">
        <h2 className="font-wide text-4xl font-extrabold">What we promise every fan</h2>
        <div className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {promises.map(([t, d]) => <div key={t} className="border-l-2 border-gold pl-6"><h3 className="text-lg font-semibold">{t}</h3><p className="mt-2 max-w-md leading-relaxed text-muted">{d}</p></div>)}
        </div>
      </section>

      <section className="relative mt-32 overflow-hidden">
        <img src="/assets/tt/0_12.jpg" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
        <div className="relative mx-auto max-w-7xl px-5 py-24">
          <h2 className="max-w-lg font-wide text-4xl font-extrabold leading-tight">Doors open 90 minutes before tip-off.</h2>
          <p className="mt-4 max-w-md leading-relaxed text-[#c9cdd3]">Eight gates, two car parks, prayer areas for men and women, and step-free routes to both bowls.</p>
          <Link to="/venue" className={btn.ghost + ' mt-8 bg-ink/50'}>Plan your visit</Link>
        </div>
      </section>
    </>
  );
}
