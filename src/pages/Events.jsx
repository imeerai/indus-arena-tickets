import React, { useState } from 'react';
import { EVENTS, CATS } from '../data.js';
import EventCard from '../components/EventCard.jsx';

export default function Events() {
  const [cat, setCat] = useState('all'), [q, setQ] = useState('');
  const list = EVENTS.filter((e) => (cat === 'all' || e.cat === cat) && (e.home + ' ' + e.away + ' ' + e.sport).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="mx-auto max-w-7xl px-5 py-14">
      <p className="eyebrow">Indus Arena · Season 2026</p>
      <h1 className="mt-2 font-wide text-4xl font-extrabold">Events and tickets</h1>
      <p className="mt-3 max-w-xl text-muted">Pick a game to open the 3D seat map. Prices are the same on every date, so choose the night that suits you.</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-1.5">{CATS.map(([k, l]) => <button key={k} type="button" onClick={() => setCat(k)} aria-pressed={cat === k} className={'h-10 rounded-full border px-4 text-sm font-semibold transition ' + (cat === k ? 'border-fg bg-fg text-ink' : 'border-line hover:bg-white/5')}>{l}</button>)}</div>
        <label className="ml-auto w-full sm:w-72"><span className="sr-only">Search by team</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams" className="h-10 w-full rounded-full border border-line bg-panel px-4 text-sm outline-none focus:border-gold" /></label>
      </div>
      <p className="mt-6 text-sm text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'event' : 'events'}</p>
      <div className="mt-4 grid gap-3">{list.map((e, i) => <EventCard key={e.id} e={e} i={i} wide />)}</div>
      {!list.length && <p className="mt-10 rounded-3xl border border-line p-10 text-center text-muted">No events match. Try another team or clear the filter.</p>}
    </div>
  );
}
