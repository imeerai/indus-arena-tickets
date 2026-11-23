import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookings, useBookings, canCancel, refundOf, downloadIcs } from '../store.js';
import { fmt, CANCEL_HOURS } from '../data.js';
import { btn } from '../App.jsx';

export function CancelDialog({ b, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 fade" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="cx-t" className="rise w-full max-w-md rounded-3xl border border-line bg-panel p-6">
        <h2 id="cx-t" className="text-lg font-bold">Cancel booking {b.ref}?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">Your {b.count > 1 ? b.count + ' seats go' : 'seat goes'} back on sale straight away. We refund <b className="text-fg">{fmt(refundOf(b))}</b> to your {b.pm === 'card' ? 'card' : b.pm === 'jazzcash' ? 'JazzCash wallet' : 'Easypaisa wallet'} within 5 working days. The {fmt(b.fee || 0)} service fee is not refunded.</p>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className={btn.ghost} autoFocus>Keep my tickets</button><button type="button" onClick={() => { bookings.update(b.ref, { status: 'Cancelled', cancelledAt: Date.now() }); onClose(); }} className="inline-flex h-11 items-center rounded-xl bg-bad px-5 text-sm font-semibold text-ink">Cancel and refund</button></div>
      </div>
    </div>
  );
}

export function TransferDialog({ b, onClose }) {
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [tried, setTried] = useState(false);
  const ok = name.trim().length >= 3 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const send = () => { if (!ok) return setTried(true); bookings.update(b.ref, { tickets: b.tickets.map((t) => ({ ...t, holder: name.trim() })), transferredTo: { name: name.trim(), email: email.trim(), at: Date.now() } }); onClose(true); };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 fade" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="tr-t" className="rise w-full max-w-md rounded-3xl border border-line bg-panel p-6">
        <h2 id="tr-t" className="text-lg font-bold">Send these tickets to a friend</h2>
        <p className="mt-2 text-sm text-muted">The tickets are reissued in their name and emailed to them. Your copies stop working.</p>
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-semibold text-muted">Their full name<input value={name} onChange={(e) => setName(e.target.value)} className={'mt-1.5 h-11 w-full rounded-xl border bg-raise px-3 text-sm text-fg outline-none focus:border-gold ' + (tried && name.trim().length < 3 ? 'border-bad' : 'border-line')} /></label>
          <label className="block text-xs font-semibold text-muted">Their email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={'mt-1.5 h-11 w-full rounded-xl border bg-raise px-3 text-sm text-fg outline-none focus:border-gold ' + (tried && !ok ? 'border-bad' : 'border-line')} /></label>
          {tried && !ok && <p className="text-xs font-medium text-bad">Enter their full name and a valid email.</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => onClose()} className={btn.ghost}>Not now</button><button type="button" onClick={send} className={btn.gold}>Transfer tickets</button></div>
      </div>
    </div>
  );
}

function FindBooking() {
  const [ref, setRef] = useState(''), [phone, setPhone] = useState(''), [res, setRes] = useState(null), nav = useNavigate();
  const go = (e) => { e.preventDefault(); const b = bookings.get(ref.trim().toUpperCase()); const digits = (s) => (s || '').replace(/\D/g, '').slice(-10);
    if (b && digits(b.phone) === digits(phone)) nav('/tickets/' + b.ref); else setRes('We could not find that booking on this device. Open the link in your confirmation email or text, or call the box office.'); };
  return (
    <form onSubmit={go} className="mt-8 flex flex-wrap items-end gap-2 rounded-3xl border border-line bg-panel p-4">
      <label className="flex-1 text-xs font-semibold text-muted">Booking reference<input value={ref} onChange={(e) => { setRef(e.target.value); setRes(null); }} placeholder="TR-XXXXXX" className="mt-1.5 h-11 w-full rounded-xl border border-line bg-raise px-3 text-sm uppercase text-fg outline-none focus:border-gold" /></label>
      <label className="flex-1 text-xs font-semibold text-muted">Mobile number used<input value={phone} onChange={(e) => { setPhone(e.target.value); setRes(null); }} inputMode="tel" placeholder="0300 1234567" className="mt-1.5 h-11 w-full rounded-xl border border-line bg-raise px-3 text-sm text-fg outline-none focus:border-gold" /></label>
      <button type="submit" className={btn.ghost}>Find my booking</button>
      {res && <p role="status" className="basis-full text-xs text-bad">{res}</p>}
    </form>
  );
}

export const statusTone = (s) => (s === 'Confirmed' ? 'bg-ok/15 text-ok' : 'bg-bad/15 text-bad');

export default function Tickets() {
  const list = useBookings(), [cx, setCx] = useState(null), [tr, setTr] = useState(null);
  const live = list.filter((b) => b.status === 'Confirmed'), past = list.filter((b) => b.status !== 'Confirmed');
  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-2 font-wide text-4xl font-extrabold">My tickets</h1>
      <p className="mt-3 max-w-xl text-muted">Tickets bought on this device. Free cancellation until {CANCEL_HOURS} hours before each event.</p>
      <FindBooking />
      {!list.length && (
        <div className="mt-10 rounded-3xl border border-line bg-panel p-10 text-center">
          <p className="text-lg font-semibold">No tickets yet</p><p className="mt-2 text-sm text-muted">When you book, your e-tickets show up here.</p>
          <Link to="/events" className={btn.gold + ' mt-6'}>Find a game</Link>
        </div>
      )}
      {[['Upcoming', live], ['Cancelled', past]].map(([h, rows]) => rows.length > 0 && (
        <section key={h} className="mt-10">
          <h2 className="eyebrow mb-3">{h} · {rows.length}</h2>
          <ul className="space-y-3">
            {rows.map((b, i) => (
              <li key={b.ref} className="rise rounded-3xl border border-line bg-panel p-5" style={{ animationDelay: i * 50 + 'ms' }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0"><p className="text-xs text-muted">{b.when} · {b.venue}</p><p className="mt-1 text-lg font-bold">{b.event}</p><p className="mt-1 text-sm text-[#c9cdd3]">{b.place} · Gate {b.gate}</p>
                    {b.transferredTo && <p className="mt-1 text-xs text-gold">Transferred to {b.transferredTo.name} on {new Date(b.transferredTo.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}. Only they can use or cancel these tickets now.</p>}</div>
                  <div className="text-right"><span className={'rounded-full px-2.5 py-1 text-xs font-bold ' + statusTone(b.status)}>{b.status === 'Cancelled' ? 'Cancelled · refund ' + fmt(refundOf(b)) : b.status}</span><p className="mt-2 font-wide font-extrabold">{b.total}</p><p className="text-xs text-muted">Ref {b.ref}</p></div>
                </div>
                {b.status === 'Confirmed' && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    <Link to={'/tickets/' + b.ref} className={btn.gold + ' h-10'}>View e-tickets</Link>
                    <button type="button" onClick={() => downloadIcs(b)} className={btn.ghost + ' h-10'}>Add to calendar</button>
                    {!b.transferredTo && <button type="button" onClick={() => setTr(b)} className={btn.ghost + ' h-10'}>Transfer</button>}
                    {!b.transferredTo && <button type="button" onClick={() => setCx(b)} disabled={!canCancel(b)} title={canCancel(b) ? '' : 'Less than 48 hours to go'} className={btn.ghost + ' h-10 text-bad'}>Cancel</button>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {cx && <CancelDialog b={cx} onClose={() => setCx(null)} />}
      {tr && <TransferDialog b={tr} onClose={() => setTr(null)} />}
    </div>
  );
}
