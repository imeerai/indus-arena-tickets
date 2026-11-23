import { useSyncExternalStore } from 'react';
import { CANCEL_HOURS, eventById, startsAt } from './data.js';

// Bookings live in localStorage for the prototype. ponytail: swap for an API (see README "System design") when there is a backend.
const KEY = 'ia.bookings.v1';
const subs = new Set();
let cache = null;
const read = () => { if (cache) return cache; try { cache = JSON.parse(localStorage.getItem(KEY)) || []; } catch { cache = []; } return cache; };
const write = (list) => { cache = list; try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage full or blocked: keep in memory */ } subs.forEach((f) => f()); };
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key === KEY) { cache = null; subs.forEach((f) => f()); } });

export const bookings = {
  list: read,
  get: (ref) => read().find((b) => b.ref === ref),
  add: (bk) => write([bk, ...read().filter((b) => b.ref !== bk.ref)]),
  update: (ref, patch) => write(read().map((b) => (b.ref === ref ? { ...b, ...patch } : b))),
  // seats held by active bookings for one event, as engine seat keys "tier-section-row-seat"
  takenFor: (eventId) => new Set(read().filter((b) => b.eventId === eventId && b.status === 'Confirmed').flatMap((b) => b.keys || [])),
};

export function useBookings() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, read, read);
}

export function canCancel(b, now = Date.now()) {
  const e = eventById(b.eventId);
  return b.status === 'Confirmed' && !b.transferredTo && !!e && startsAt(e).getTime() - now > CANCEL_HOURS * 3600e3;
}
export const refundOf = (b) => Math.max(0, (b.totalN || 0) - (b.fee || 0));

export function downloadIcs(b) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Indus Arena//Tickets//EN', 'BEGIN:VEVENT', 'UID:' + b.ref + '@indusarena.pk', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', 'DTSTART:' + b.iso, 'DURATION:PT3H', 'SUMMARY:' + b.event, 'LOCATION:' + b.venue + ', Hyderabad', 'DESCRIPTION:' + b.place + ' · Gate ' + b.gate + ' · Booking ' + b.ref, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = b.ref + '.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
