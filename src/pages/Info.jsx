import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VENUE, CANCEL_HOURS, fmt, SERVICE_FEE } from '../data.js';
import { btn } from '../App.jsx';

const Head = ({ title, lead }) => (
  <header className="max-w-3xl">
    <h1 className="font-wide text-5xl font-extrabold leading-[1.02]">{title}</h1>
    {lead && <p className="mt-5 text-lg leading-relaxed text-muted">{lead}</p>}
  </header>
);
// A titled block of text separated by a single rule; used instead of boxed cards.
const Block = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-28 border-t border-white/[0.08] pt-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
  </section>
);
const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(VENUE.address);

const gates = [['N1, N2', 'North stand', 'Box office at N1'], ['E1, E2', 'East stand', 'Step-free, nearest to Parking A'], ['S1, S2', 'South stand', 'Family zone entrance'], ['W1, W2', 'West stand', 'Lift lobby for the premier suites']];

export function Venue() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16">
      <Head title="Plan your visit" lead={`${VENUE.name} is an indoor basketball arena with ${VENUE.capacity} in two bowls and a ring of premier suites in between.`} />
      <div className="mt-14 grid gap-12 lg:grid-cols-[1.25fr_1fr]">
        <figure>
          <img src="/assets/tt/1_00.jpg" alt="Indus Arena from above, with the court in the middle and two rings of seats" className="w-full rounded-[4px]" />
          <figcaption className="mt-3 text-sm text-muted">North is at the top. <Link to="/book/e1" className="font-semibold text-gold hover:underline">Open the 3D map</Link> to see gates, food courts and prayer areas around the concourse.</figcaption>
        </figure>
        <div>
          <h2 className="font-wide text-2xl font-extrabold">Gates</h2>
          <p className="mt-2 text-muted">Your gate is printed on your ticket. Doors open 90 minutes before the start.</p>
          <dl className="mt-6">
            {gates.map(([g, s, d]) => <div key={g} className="grid grid-cols-[88px_1fr] gap-4 border-t border-white/[0.08] py-4"><dt className="font-wide text-xl font-extrabold">{g}</dt><dd><p className="font-medium">{s}</p><p className="text-sm text-muted">{d}</p></dd></div>)}
          </dl>
        </div>
      </div>
      <div className="mt-20 grid gap-x-16 gap-y-12 md:grid-cols-2">
        <Block title="Getting here"><p>{VENUE.address}. Rickshaws and ride-hailing drop off at the East plaza. The Latifabad bus loop stops at Gate S1 every 15 minutes until midnight on game nights.</p><a className="inline-block font-semibold text-gold hover:underline" href={mapsUrl} target="_blank" rel="noreferrer">Directions in Google Maps</a></Block>
        <Block title="Parking"><p>Parking A on the east side has 600 spaces and Parking B on the west has 400. PKR 300 per car and PKR 100 per motorbike, paid on entry. Accessible bays sit next to Gates E1 and W1.</p></Block>
        <Block id="access" title="Accessibility"><p>Step-free routes run from Gates E1 and W1 to both bowls, with lifts to the suite level and upper bowl. Wheelchair spaces and companion seats are at the top of every lower-bowl section; call the box office to book them.</p><p>Assistance dogs are welcome. Ear defenders are free at guest services.</p></Block>
        <Block id="bags" title="Bags and security"><p>Bags up to the size of an A4 sheet. Everything is searched at the gate.</p><p>Please leave at home: outside food and drink, glass, umbrellas, flags on poles, laser pointers, drones, and power banks over 20,000 mAh.</p></Block>
        <Block title="Food, prayer and first aid"><p>Food courts on every side of the concourse stay open until 30 minutes after the final whistle, with card and wallet payments. Prayer areas for men and women are on the North and South concourse. First aid is at Gates N2 and S2.</p></Block>
        <Block title="Families"><p>The family zone behind the South stand has baby-changing rooms, a quiet room and hoops for kids before the game. Children under 3 sit on a lap for free; everyone older needs a ticket.</p></Block>
      </div>
    </div>
  );
}

const FAQ = [
  ['Buying tickets', 'buying', [
    ['Is the view in the 3D map what I will really see?', 'Yes. The arena is built to the real seating plan, row by row, and the seat view puts the camera at eye height in that seat. Only the people around you will be different on the night.'],
    ['How do I book seats together for a group?', 'Choose how many tickets you need, up to 8, before you pick a seat, or press "Find the best seats together". We only offer seats side by side in one row.'],
    ['How long are my seats held while I pay?', 'Ten minutes from the moment you press Book. The timer is at the top of checkout. If it runs out, the seats go back on sale.'],
    ['Which payment methods do you take?', 'Visa and Mastercard, JazzCash and Easypaisa. This website is a prototype, so no money is charged.'],
  ]],
  ['Refunds and changes', 'refunds', [
    ['Can I cancel?', `Yes, up to ${CANCEL_HOURS} hours before the event, from My tickets. The ticket price goes back to the way you paid within 5 working days. The ${fmt(SERVICE_FEE)} service fee per ticket is not refunded.`],
    ['Can I give my ticket to someone else?', 'Yes. Use Transfer on the ticket. It is reissued in their name and your copy stops working, so it cannot be used twice. After a transfer, only the new holder can cancel.'],
    ['What if the game is postponed or cancelled?', 'Your tickets move to the new date automatically. If you cannot make it, you can ask for a full refund, including the service fee.'],
  ]],
  ['On the day', 'day', [
    ['Do I need to print my ticket?', 'No. Show the e-ticket on your phone at the gate, with a photo ID. Printing is there if you prefer paper.'],
    ['What are the premier suites?', 'Private boxes between the lower and upper bowl, with padded seats, a host, and food and drinks included. Press "Premier suites" on the seat map to sit in one.'],
    ['Can I leave and come back in?', 'No. Re-entry is not allowed once your ticket has been scanned.'],
  ]],
];

export function Faq() {
  const [q, setQ] = useState(''), s = q.trim().toLowerCase();
  const groups = FAQ.map(([t, id, items]) => [t, id, items.filter(([a, b]) => !s || (a + ' ' + b).toLowerCase().includes(s))]).filter((g) => g[2].length);
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16">
      <Head title="Help" lead="Answers to what fans ask the box office most." />
      <label className="mt-10 block max-w-xl"><span className="sr-only">Search help</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, for example refund or parking" className="h-12 w-full rounded-[4px] border border-white/15 bg-transparent px-4 outline-none transition focus:border-gold" /></label>
      <div className="mt-14 grid gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Help topics" className="hidden lg:block"><ul className="sticky top-32 space-y-3 text-sm">{FAQ.map(([t, id]) => <li key={id}><a href={'#' + id} className="text-muted transition-colors hover:text-fg">{t}</a></li>)}<li className="pt-3"><Link to="/contact" className="font-semibold text-gold hover:underline">Contact the box office</Link></li></ul></nav>
        <div className="space-y-14">
          {groups.map(([t, id, items]) => (
            <section key={id} id={id} className="scroll-mt-32">
              <h2 className="font-wide text-2xl font-extrabold">{t}</h2>
              <div className="mt-4">
                {items.map(([a, b]) => (
                  <details key={a} className="group border-b border-white/[0.08] [&_summary::-webkit-details-marker]:hidden" open={!!s}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-medium transition-colors hover:text-gold">{a}<span aria-hidden="true" className="text-xl leading-none text-muted transition-transform duration-300 group-open:rotate-45">+</span></summary>
                    <p className="max-w-2xl pb-6 leading-relaxed text-muted">{b}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
          {!groups.length && <p className="text-muted">Nothing matches "{q}". Try another word, or <Link to="/contact" className="font-semibold text-gold hover:underline">ask the box office</Link>.</p>}
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="pt-16">
      <div className="mx-auto max-w-7xl px-5"><Head title="Built for basketball in Sindh." lead="Indus Arena opened in 2026 as the home court of the Sea Hawks. This box office exists so nobody buys a seat without seeing it first." /></div>
      <img src="/assets/tt/2_18.jpg" alt="The arena seen from a low angle across the lower bowl" className="mt-14 h-[56vh] min-h-[320px] w-full object-cover" />
      <div className="mx-auto grid max-w-7xl gap-16 px-5 pt-20 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-[#c9cdd3]">
          <p>The arena seats <b className="text-fg">9,484</b> people in a lower and an upper bowl, with <b className="text-fg">24 premier suites</b> in a ring between them. All eight gates open onto one concourse, so you can walk the whole building inside.</p>
          <p>It is run by Indus Arena Management, the same team you meet at the box office at Gate N1. We sell every ticket ourselves, at face value.</p>
        </div>
        <div>
          <h2 className="font-wide text-2xl font-extrabold">How we sell tickets</h2>
          <ul className="mt-6">
            {[['The view comes first', 'Every seat can be tried in 3D before you book it.'], ['One price', 'The fee is shown before you pay. Nothing is added at the end.'], ['Groups stay together', 'We never split a booking across rows.'], ['Face value only', 'Tickets can be transferred for free. Resale above face value is not allowed.']].map(([t, d]) => (
              <li key={t} className="grid grid-cols-[180px_1fr] gap-6 border-t border-white/[0.08] py-5 max-sm:grid-cols-1 max-sm:gap-1"><span className="font-semibold">{t}</span><span className="text-muted">{d}</span></li>
            ))}
          </ul>
          <Link to="/contact" className={btn.ghost + ' mt-8'}>Talk to the box office</Link>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  const [f, setF] = useState({ name: '', email: '', topic: 'Booking help', ref: '', msg: '' }), [sent, setSent] = useState(false), [tried, setTried] = useState(false);
  const errs = { name: f.name.trim().length < 2 && 'Enter your name', email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()) && 'Enter a valid email', msg: f.msg.trim().length < 10 && 'Tell us a little more, at least 10 characters' };
  const bad = Object.values(errs).some(Boolean), set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const input = (k) => 'mt-2 h-12 w-full rounded-[4px] border bg-transparent px-3 text-fg outline-none transition focus:border-gold ' + (tried && errs[k] ? 'border-bad' : 'border-white/15');
  const field = (k, label, el) => <label className="block text-sm font-medium">{label}{el}{tried && errs[k] && <span className="mt-1.5 block text-sm text-bad">{errs[k]}</span>}</label>;
  return (
    <div className="mx-auto max-w-7xl px-5 pt-16">
      <Head title="Contact the box office" lead="We reply to email within one working day, faster on game days." />
      <div className="mt-14 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
        {sent ? (
          <div className="rise border-l-2 border-ok pl-6"><p className="font-wide text-2xl font-extrabold">Thanks, {f.name.split(' ')[0]}.</p><p className="mt-2 text-muted">Your message is with us. We will reply to {f.email}. In a hurry? Call {VENUE.phone}.</p></div>
        ) : (
          <form noValidate onSubmit={(e) => { e.preventDefault(); if (bad) return setTried(true); setSent(true); }} className="grid gap-6 sm:grid-cols-2">
            {field('name', 'Your name', <input value={f.name} onChange={set('name')} autoComplete="name" className={input('name')} />)}
            {field('email', 'Email', <input type="email" value={f.email} onChange={set('email')} autoComplete="email" className={input('email')} />)}
            {field('topic', 'Topic', <select value={f.topic} onChange={set('topic')} className={input('topic') + ' bg-ink'}>{['Booking help', 'Refund or cancellation', 'Accessibility', 'Group or school booking', 'Premier suites', 'Something else'].map((t) => <option key={t}>{t}</option>)}</select>)}
            {field('ref', 'Booking reference, if you have one', <input value={f.ref} onChange={set('ref')} placeholder="TR-XXXXXX" className={input('ref')} />)}
            <div className="sm:col-span-2">{field('msg', 'Message', <textarea value={f.msg} onChange={set('msg')} rows={6} className={input('msg') + ' h-auto py-3'} />)}</div>
            <div><button type="submit" className={btn.gold}>Send message</button></div>
          </form>
        )}
        <div className="space-y-10">
          <Block title="Visit us"><p>{VENUE.boxOffice}.</p><p>{VENUE.address}.</p></Block>
          <Block title="Call or email"><p><a className="font-semibold text-fg hover:text-gold" href={'tel:' + VENUE.phone.replace(/\s/g, '')}>{VENUE.phone}</a>, every day from 10 AM to 8 PM.</p><p><a className="font-semibold text-fg hover:text-gold" href={'mailto:' + VENUE.email}>{VENUE.email}</a></p></Block>
        </div>
      </div>
    </div>
  );
}

export function Legal({ kind }) {
  const terms = kind === 'terms';
  const rows = terms ? [
    ['Your ticket', 'A ticket gives one person entry to one seat for one event. It is valid only when bought here or at the box office.'],
    ['Prices and fees', `Prices are per seat in Pakistani rupees. A ${fmt(SERVICE_FEE)} service fee is added per ticket and shown before you pay.`],
    ['Cancellations', `You can cancel up to ${CANCEL_HOURS} hours before the event for a refund of the ticket price. The service fee is refunded only if we cancel or postpone the event.`],
    ['Transfers and resale', 'Tickets can be transferred free of charge in My tickets. Selling them above face value is not allowed and the ticket can be cancelled.'],
    ['At the venue', 'Follow staff instructions and the bag policy. We may refuse entry to, or remove, anyone who puts others at risk.'],
    ['Prototype', 'This website is a working prototype. Payments are simulated and no money is taken.'],
  ] : [
    ['What we collect', 'Your name, mobile number, email and the seats you book. Card details go straight to the payment provider and are never stored by us.'],
    ['Why', 'To send your e-tickets, contact you about your event, and check tickets at the gate.'],
    ['On this device', 'In this prototype your bookings are saved only in your browser. Clearing site data removes them.'],
    ['How long', 'Booking records are kept for 12 months after the event, then deleted.'],
    ['Your rights', `Ask for a copy of your data, or for it to be deleted, by emailing ${VENUE.email}.`],
  ];
  return (
    <div className="mx-auto max-w-3xl px-5 pt-16">
      <Head title={terms ? 'Terms of sale' : 'Privacy'} lead={terms ? 'The rules that come with every ticket, in plain words.' : 'What we keep about you, and why.'} />
      <dl className="mt-12">{rows.map(([h, t]) => <div key={h} className="grid gap-2 border-t border-white/[0.08] py-6 sm:grid-cols-[180px_1fr] sm:gap-8"><dt className="font-semibold">{h}</dt><dd className="leading-relaxed text-muted">{t}</dd></div>)}</dl>
    </div>
  );
}

export function NotFound({ what }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-24">
      <p className="font-wide text-[clamp(5rem,14vw,10rem)] font-extrabold leading-none text-gold">404</p>
      <h1 className="mt-6 text-2xl font-semibold">{what || 'This page is out of bounds.'}</h1>
      <p className="mt-2 text-muted">The link may be old, or the page has moved.</p>
      <div className="mt-8 flex gap-3"><Link to="/events" className={btn.gold}>See fixtures</Link><Link to="/" className={btn.ghost}>Home</Link></div>
    </div>
  );
}
