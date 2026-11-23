import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useBookings, canCancel, downloadIcs, refundOf } from '../store.js';
import { eventById, fmt, VENUE } from '../data.js';
import { btn } from '../App.jsx';
import { CancelDialog, TransferDialog, statusTone } from './Tickets.jsx';
import { NotFound } from './Info.jsx';
import Barcode from '../components/Barcode.jsx';

export default function Ticket() {
  const { ref } = useParams(), [q] = useSearchParams(), list = useBookings(), b = list.find((x) => x.ref === ref);
  const [cx, setCx] = useState(false), [tr, setTr] = useState(false);
  if (!b) return <NotFound what="That booking is not on this device." />;
  const e = eventById(b.eventId) || {}, fresh = q.get('new') === '1' && b.status === 'Confirmed', off = b.status !== 'Confirmed';
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      {b.transferredTo && <p className="no-print mb-6 rounded-2xl bg-gold/10 px-4 py-3 text-sm text-gold">These tickets were transferred to {b.transferredTo.name}. The barcodes below were reissued in their name.</p>}
      {fresh && (
        <div className="no-print rise mb-8 rounded-3xl border border-ok/40 bg-ok/10 p-6">
          <p className="font-wide text-2xl font-extrabold">You are in. See you on {e.day}.</p>
          <p className="mt-2 text-sm text-[#c9cdd3]">Booking {b.ref} is confirmed. We emailed the e-tickets to {b.email || 'you'}{b.phone ? ' and sent a text to ' + b.phone : ''}. Show them on your phone or print them.</p>
        </div>
      )}
      <div className="no-print flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Booking {b.ref}</p><h1 className="mt-2 font-wide text-3xl font-extrabold">{b.event}</h1><p className="mt-1 text-muted">{b.when} · Doors {e.doors} · {b.venue}</p></div>
        <span className={'rounded-full px-3 py-1.5 text-xs font-bold ' + statusTone(b.status)}>{off ? 'Cancelled · refund ' + fmt(refundOf(b)) : 'Confirmed'}</span>
      </div>
      {!off && (
        <div className="no-print mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className={btn.gold}>Print or save as PDF</button>
          <button type="button" onClick={() => downloadIcs(b)} className={btn.ghost}>Add to calendar</button>
          <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(VENUE.address)} target="_blank" rel="noreferrer" className={btn.ghost}>Directions</a>
          <Link to={'/book/' + b.eventId} className={btn.ghost}>See the arena in 3D</Link>
          {!b.transferredTo && <button type="button" onClick={() => setTr(true)} className={btn.ghost}>Transfer</button>}
          {!b.transferredTo && <button type="button" onClick={() => setCx(true)} disabled={!canCancel(b)} className={btn.ghost + ' text-bad'}>Cancel</button>}
        </div>
      )}

      <div className={'mt-8 space-y-4 ' + (off ? 'opacity-50' : '')}>
        {b.tickets.map((t, i) => (
          <article key={i} className="print-ticket rise grid overflow-hidden rounded-3xl border border-line bg-panel sm:grid-cols-[1fr_210px]" style={{ animationDelay: i * 70 + 'ms' }} aria-label={'Ticket ' + (i + 1) + ' of ' + b.tickets.length}>
            <div className="p-6">
              <div className="flex items-center justify-between gap-3"><span className="font-wide text-[13px] font-extrabold tracking-[0.08em]">INDUS <span className="text-gold">ARENA</span></span><span className="text-xs text-muted">Ticket {i + 1} of {b.tickets.length}</span></div>
              <p className="mt-5 text-xs text-muted">{e.sport}</p>
              <h2 className="text-2xl font-bold">{b.event}</h2>
              <p className="mt-1 text-sm text-[#c9cdd3]">{b.when} · Doors open {e.doors}</p>
              <dl className="mt-6 grid grid-cols-4 gap-4">
                {[['Gate', b.gate], [b.vip ? 'Suite' : 'Section', b.vip ? b.box : b.section], ['Row', t.row], ['Seat', t.num]].map(([k, v]) => <div key={k}><dt className="text-[10px] font-semibold tracking-[0.1em] text-muted">{k.toUpperCase()}</dt><dd className="font-wide text-2xl font-extrabold">{v}</dd></div>)}
              </dl>
            </div>
            <div className="flex flex-col justify-between gap-4 border-t border-dashed border-line p-6 sm:border-l sm:border-t-0">
              <div><p className="text-[10px] font-semibold tracking-[0.1em] text-muted">TICKET HOLDER</p><p className="font-semibold">{t.holder}</p></div>
              <div><p className="text-[10px] font-semibold tracking-[0.1em] text-muted">TIER</p><p className="text-sm">{b.tier}</p></div>
              <div><Barcode value={b.ref + '-' + (i + 1)} className="h-14 w-full rounded-md" /><p className="mt-1.5 text-center font-mono text-xs tracking-[0.2em]">{b.ref}-{i + 1}</p><p className="mt-1 text-center text-[11px] text-muted">Scan at gate {b.gate} · {fmt(b.unit)}</p></div>
            </div>
          </article>
        ))}
      </div>

      <div className="no-print mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-line bg-panel p-6 text-sm">
          <p className="eyebrow mb-3">Payment</p>
          <div className="space-y-1.5"><div className="flex justify-between text-muted"><span>{b.count} × {fmt(b.unit)}</span><span>{fmt(b.sub)}</span></div><div className="flex justify-between text-muted"><span>Service fee</span><span>{fmt(b.fee)}</span></div>{b.disc > 0 && <div className="flex justify-between text-ok"><span>Promo</span><span>−{fmt(b.disc)}</span></div>}<div className="flex justify-between border-t border-line pt-2 font-bold"><span>Paid ({b.pm === 'card' ? 'card' : b.pm})</span><span>{b.total}</span></div></div>
        </div>
        <div className="rounded-3xl border border-line bg-panel p-6 text-sm leading-relaxed text-muted">
          <p className="eyebrow mb-3">On the day</p>
          <p>Use gate <b className="text-fg">{b.gate}</b>. Bring a photo ID that matches the ticket holder name. Small bags only, no outside food. Re-entry is not allowed.</p>
          <Link to="/venue" className="mt-3 inline-block font-semibold text-gold hover:underline">Full venue guide →</Link>
        </div>
      </div>
      {cx && <CancelDialog b={b} onClose={() => setCx(false)} />}
      {tr && <TransferDialog b={b} onClose={() => setTr(false)} />}
    </div>
  );
}
