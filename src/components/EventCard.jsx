import React from 'react';
import { Link } from 'react-router-dom';
import { fromPrice, fmt } from '../data.js';

// Share of seats already sold per event (fixed per event so the site reads the same on every visit).
export const soldPct = (e) => 52 + ((e.id.charCodeAt(1) * 37) % 41);
const label = { final: 'Final', international: 'International', family: 'Family', league: 'League' };

export default function EventCard({ e, i = 0, wide }) {
  const sold = soldPct(e), hot = sold > 80;
  return (
    <Link to={'/book/' + e.id} className={'rise group flex rounded-3xl border border-line bg-panel p-5 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-raise ' + (wide ? 'flex-col gap-4 sm:flex-row sm:items-center sm:gap-6' : 'flex-col gap-5')} style={{ animationDelay: i * 60 + 'ms' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="w-16 flex-none text-center"><p className="font-wide text-3xl font-extrabold leading-none">{e.day.split(' ')[1]}</p><p className="mt-1 text-[11px] font-bold tracking-[0.12em] text-muted">{e.day.split(' ')[2].toUpperCase()} · {e.day.split(' ')[0].toUpperCase()}</p></div>
        {!wide && <span className={'rounded-full px-2.5 py-1 text-[11px] font-bold ' + (e.cat === 'final' ? 'bg-copper/15 text-copper' : 'bg-white/[0.06] text-muted')}>{label[e.cat]}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{e.sport} · {e.time}</p>
        <h3 className="mt-1 text-lg font-bold leading-snug">{e.home} <span className="text-muted">vs</span> {e.away}</h3>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true"><div className={'h-full rounded-full ' + (hot ? 'bg-copper' : 'bg-seat')} style={{ width: 100 - sold + '%' }} /></div>
        <p className={'mt-2 text-xs ' + (hot ? 'font-semibold text-copper' : 'text-muted')}>{hot ? 'Selling fast · ' : ''}{100 - sold}% of seats left</p>
      </div>
      <div className={'flex items-center justify-between gap-3 ' + (wide ? 'sm:flex-col sm:items-end' : '')}>
        <p className="text-sm"><span className="text-muted">From </span><b>{fmt(fromPrice(e))}</b></p>
        <span className="inline-flex h-10 items-center rounded-xl bg-gold px-4 text-sm font-semibold text-gold-ink transition group-hover:brightness-105">Choose seats</span>
      </div>
    </Link>
  );
}
