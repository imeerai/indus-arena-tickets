import React, { useState } from 'react';
import { EVENTS, CATS } from '../data.js';
import Fixture from '../components/Fixture.jsx';

export default function Events() {
  const [cat, setCat] = useState('all'), [q, setQ] = useState('');
  const list = EVENTS.filter((e) => (cat === 'all' || e.cat === cat) && (e.home + ' ' + e.away + ' ' + e.sport).toLowerCase().includes(q.trim().toLowerCase()));
  const months = [...new Set(list.map((e) => e.day.split(' ')[2]))];
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16">
      <h1 className="font-wide text-5xl font-extrabold">Fixtures</h1>
      <p className="mt-4 max-w-lg text-lg text-muted">Every game at Indus Arena this season. Pick one to open the 3D seat map.</p>
      <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-b border-white/[0.08]">
        <div role="tablist" aria-label="Filter by type" className="-mb-px flex gap-7 overflow-x-auto">
          {CATS.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={cat === k} onClick={() => setCat(k)} className={'whitespace-nowrap border-b-2 pb-4 text-sm font-semibold transition-colors ' + (cat === k ? 'border-gold text-fg' : 'border-transparent text-muted hover:text-fg')}>{l}</button>)}
        </div>
        <label className="mb-3 w-full sm:w-64"><span className="sr-only">Search by team</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a team" className="h-10 w-full rounded-[4px] border border-white/15 bg-transparent px-3 text-sm outline-none transition focus:border-gold" /></label>
      </div>
      <p className="sr-only" aria-live="polite">{list.length} fixtures</p>
      {months.map((m) => (
        <section key={m} className="mt-10">
          <h2 className="font-wide text-sm font-extrabold tracking-[0.1em] text-muted">{({ Nov: 'NOVEMBER', Dec: 'DECEMBER' })[m] || m} 2026</h2>
          <div className="mt-2 divide-y divide-white/[0.08]">{list.filter((e) => e.day.split(' ')[2] === m).map((e, i) => <Fixture key={e.id} e={e} i={i} />)}</div>
        </section>
      ))}
      {!list.length && <div className="py-24"><p className="text-lg font-semibold">No fixtures match that search.</p><button type="button" onClick={() => { setQ(''); setCat('all'); }} className="mt-3 text-sm font-semibold text-gold hover:underline">Show all fixtures</button></div>}
    </div>
  );
}
