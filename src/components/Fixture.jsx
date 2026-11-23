import React from 'react';
import { Link } from 'react-router-dom';
import { fromPrice, fmt } from '../data.js';

const TEAM = {
  'Sea Hawks': ['SH', '#1D4ED8'], Falcons: ['FA', '#B91C1C'], Thunder: ['TH', '#7C5E10'], 'Harbour Kings': ['HK', '#0F766E'],
  Pakistan: ['PAK', '#166534'], Iran: ['IRN', '#9F1239'], 'Indus All-Stars': ['IA', '#C2410C'], 'Legends XI': ['LX', '#334155'],
};

// Square team mark: initials on the team colour, like a fixture list on a club site.
export function TeamBadge({ team, size = 40 }) {
  const [ab, col] = TEAM[team] || [team.slice(0, 2).toUpperCase(), '#334155'];
  return <span aria-hidden="true" className="inline-grid flex-none place-items-center rounded-[4px] font-wide font-extrabold text-white" style={{ width: size, height: size, background: col, fontSize: size * (ab.length > 2 ? 0.26 : 0.32) }}>{ab}</span>;
}

// Share of seats already sold per event (fixed per event so the site reads the same on every visit).
export const soldPct = (e) => 52 + ((e.id.charCodeAt(1) * 37) % 41);
export const stockNote = (e) => { const left = 100 - soldPct(e); return left < 20 ? ['Few seats left', 'text-copper'] : left < 35 ? ['Selling fast', 'text-gold'] : ['Good availability', 'text-muted']; };
const [D, M, W] = [(e) => e.day.split(' ')[1], (e) => e.day.split(' ')[2], (e) => e.day.split(' ')[0]];

// One fixture as a schedule row: date, matchup, time, stock, price, action.
export default function Fixture({ e, i = 0 }) {
  const [note, tone] = stockNote(e);
  return (
    <Link to={'/book/' + e.id} className="rise group grid grid-cols-[56px_1fr] items-center gap-x-5 gap-y-3 py-6 transition-colors hover:bg-white/[0.025] sm:grid-cols-[72px_1fr_auto] md:grid-cols-[72px_1.6fr_1fr_auto] md:px-4" style={{ animationDelay: i * 50 + 'ms' }}>
      <div className="row-span-2 sm:row-span-1"><p className="font-wide text-4xl font-extrabold leading-none">{D(e)}</p><p className="mt-1.5 text-xs font-semibold text-muted">{M(e)} · {W(e)}</p></div>
      <div className="min-w-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="flex min-w-0 items-center gap-3"><TeamBadge team={e.home} size={34} /><span className="truncate text-lg font-semibold">{e.home}</span></span>
          <span className="text-sm text-muted max-sm:hidden">v</span>
          <span className="flex min-w-0 items-center gap-3 sm:flex-row-reverse"><TeamBadge team={e.away} size={34} /><span className="truncate text-lg font-semibold">{e.away}</span></span>
        </div>
        <p className="mt-2 text-sm text-muted">{e.sport}{e.cat === 'final' ? ', season decider' : ''}</p>
      </div>
      <div className="text-sm max-md:hidden"><p className="font-medium">{e.time}</p><p className="text-muted">Doors {e.doors}</p></div>
      <div className="col-start-2 flex items-center justify-between gap-6 sm:col-start-auto sm:justify-end">
        <div className="text-right text-sm"><p className={'font-semibold ' + tone}>{note}</p><p className="text-muted">from {fmt(fromPrice(e))}</p></div>
        <span className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-fg px-4 text-sm font-semibold text-ink transition group-hover:bg-gold">Tickets <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span></span>
      </div>
    </Link>
  );
}
