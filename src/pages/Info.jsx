import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VENUE, CANCEL_HOURS, fmt, SERVICE_FEE } from '../data.js';
import { btn } from '../App.jsx';

const Page = ({ eyebrow, title, lead, children, wide }) => (
  <div className={'mx-auto px-5 py-14 ' + (wide ? 'max-w-6xl' : 'max-w-3xl')}>
    <p className="eyebrow">{eyebrow}</p>
    <h1 className="mt-2 font-wide text-4xl font-extrabold">{title}</h1>
    {lead && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>}
    <div className="mt-10">{children}</div>
  </div>
);
const Card = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24 rounded-3xl border border-line bg-panel p-6">
    <h2 className="text-lg font-bold">{title}</h2>
    <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
  </section>
);

const gates = [['N1, N2', 'North stand · box office at N1'], ['E1, E2', 'East stand · step-free, nearest to Parking A'], ['S1, S2', 'South stand · family zone entrance'], ['W1, W2', 'West stand · premier suites lift lobby']];

export function Venue() {
  return (
    <Page wide eyebrow="Plan your visit" title="Venue guide" lead={VENUE.name + ' is an indoor, air-conditioned basketball arena with ' + VENUE.capacity + ' in two bowls and a ring of premier suites between them.'}>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <figure className="overflow-hidden rounded-3xl border border-line"><img src="/assets/tt/1_00.jpg" alt="Indus Arena seen from above, with the court in the middle and two rings of seats" className="w-full" /><figcaption className="border-t border-line bg-panel px-5 py-3 text-xs text-muted">North is at the top. Gates sit on the outer concourse, two per stand. <Link to="/book/e1" className="font-semibold text-gold">Open the 3D map →</Link></figcaption></figure>
        <Card title="Gates">
          <ul className="space-y-3">{gates.map(([g, d]) => <li key={g} className="flex gap-4"><span className="w-16 flex-none font-wide font-extrabold text-fg">{g}</span><span>{d}</span></li>)}</ul>
          <p className="pt-2">Your gate is printed on your ticket. Doors open 90 minutes before the start.</p>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Getting here"><p>{VENUE.address}.</p><p>Rickshaws and ride-hailing drop off at the East plaza. The Latifabad bus loop stops at Gate S1 every 15 minutes until midnight on game nights.</p><a className="font-semibold text-gold" href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(VENUE.address)} target="_blank" rel="noreferrer">Open in Google Maps →</a></Card>
        <Card title="Parking"><p>Parking A (east, 600 cars) and Parking B (west, 400 cars). PKR 300 per car, PKR 100 per motorbike, pay on entry.</p><p>Accessible bays are next to Gates E1 and W1.</p></Card>
        <Card id="access" title="Accessibility"><p>Step-free routes from Gates E1 and W1 to both bowls, with lifts to the suite level and upper bowl.</p><p>Wheelchair spaces and companion seats are at the top of every lower-bowl section. Call the box office to book them.</p><p>Assistance dogs are welcome. Ear defenders are free at guest services.</p></Card>
        <Card title="Bag policy and security"><p>Bags up to the size of an A4 sheet. Everything is searched at the gate.</p><p>Not allowed: outside food and drink, glass, umbrellas, flags on poles, laser pointers, drones, power banks over 20,000 mAh.</p></Card>
        <Card title="Food, prayer and first aid"><p>Food courts on every side of the concourse, open from doors until 30 minutes after the final whistle. Card and wallet payments accepted.</p><p>Prayer areas for men and women on the North and South concourse. First aid at Gate N2 and Gate S2.</p></Card>
        <Card title="Family zone"><p>Behind the South stand: baby-changing rooms, a quiet room and kids’ shooting hoops before the game.</p><p>Children under 3 sit on a lap for free. Everyone older needs a ticket.</p></Card>
      </div>
    </Page>
  );
}

const faqs = [
  ['Is the view in the 3D map what I will really see?', 'Yes. The 3D arena is built to the real seating plan, row by row. When you sit in a seat, the camera is placed at eye height in that seat. Small things like the people in front of you will change on the night.'],
  ['How do I book seats together for a group?', 'Choose how many tickets you need (up to 8) before you pick a seat, or press “Find the best seats together”. We only offer seats that are side by side in one row.'],
  ['How long are my seats held while I pay?', 'Ten minutes from the moment you press Book. The timer is shown at the top of checkout. If it runs out, the seats go back on sale.'],
  ['Can I cancel?', 'Yes, until ' + CANCEL_HOURS + ' hours before the event, from My tickets. You get the ticket price back to the way you paid within 5 working days. The ' + fmt(SERVICE_FEE) + ' service fee per ticket is not refunded.'],
  ['Can I give my ticket to someone else?', 'Yes. Use Transfer on the ticket. It is reissued in their name and the old copy stops working, so it cannot be used twice.'],
  ['Do I need to print my ticket?', 'No. Show the e-ticket on your phone at the gate, along with a photo ID. Printing is there if you prefer paper.'],
  ['What are the premier suites?', 'Private boxes between the lower and upper bowl, with padded seats, a host, and food and drinks included. You can sit in one in 3D with the “VIP suites” button.'],
  ['Which payment methods do you take?', 'Visa and Mastercard, JazzCash and Easypaisa. This website is a prototype, so no money is charged.'],
  ['What if the event is postponed or cancelled?', 'Your tickets move to the new date automatically. If you cannot make it, you can ask for a full refund, including the service fee.'],
];

export function Faq() {
  return (
    <Page eyebrow="Help" title="Questions and answers" lead="Short answers to what people ask the box office most. Something else? Call or email us.">
      <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-panel">
        {faqs.map(([q, a]) => (
          <details key={q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">{q}<span aria-hidden="true" className="text-xl text-muted transition group-open:rotate-45">+</span></summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link to="/contact" className={btn.gold}>Contact the box office</Link><Link to="/venue" className={btn.ghost}>Venue guide</Link></div>
    </Page>
  );
}

export function About() {
  return (
    <Page wide eyebrow="About us" title="A home for basketball in Sindh." lead="Indus Arena opened in 2026 as the home court of the Sea Hawks. We built this box office so that nobody buys a seat without knowing exactly what they will see from it.">
      <div className="grid gap-5 md:grid-cols-3">
        {[['9,484', 'seats in a lower and upper bowl'], ['24', 'premier suites on the club level'], ['8', 'gates with step-free entry at two']].map(([a, b]) => <div key={b} className="rounded-3xl border border-line bg-panel p-7"><p className="font-wide text-4xl font-extrabold">{a}</p><p className="mt-2 text-sm text-muted">{b}</p></div>)}
      </div>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-4 leading-relaxed text-muted"><h2 className="text-xl font-bold text-fg">What we promise</h2><p>One price per seat, shown up front, with the service fee shown before you pay. No hidden charges.</p><p>The view you see is the view you get. Every one of our seats can be tried in 3D before you book it.</p><p>Groups sit together. We never split a booking across rows.</p></div>
        <div className="space-y-4 leading-relaxed text-muted"><h2 className="text-xl font-bold text-fg">Who runs it</h2><p>The arena and this website are run by Indus Arena Management, the same team at the box office at Gate N1.</p><p>Questions, ideas or a booking for a school or company group? We would like to hear from you.</p><Link to="/contact" className={btn.gold}>Get in touch</Link></div>
      </div>
    </Page>
  );
}

export function Contact() {
  const [f, setF] = useState({ name: '', email: '', topic: 'Booking help', ref: '', msg: '' }), [sent, setSent] = useState(false), [tried, setTried] = useState(false);
  const errs = { name: f.name.trim().length < 2 && 'Enter your name', email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()) && 'Enter a valid email', msg: f.msg.trim().length < 10 && 'Tell us a little more (10 characters or more)' };
  const bad = Object.values(errs).some(Boolean), set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const input = (k) => 'mt-1.5 h-11 w-full rounded-xl border bg-raise px-3 text-sm text-fg outline-none focus:border-gold ' + (tried && errs[k] ? 'border-bad' : 'border-line');
  return (
    <Page wide eyebrow="Contact" title="Talk to the box office" lead="We answer email within one working day, usually much faster on game days.">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {sent ? (
          <div className="rise rounded-3xl border border-ok/40 bg-ok/10 p-8"><p className="text-xl font-bold">Thanks, {f.name.split(' ')[0]}. Your message is with us.</p><p className="mt-2 text-sm text-[#c9cdd3]">We will reply to {f.email}. In a hurry? Call {VENUE.phone}.</p></div>
        ) : (
          <form noValidate onSubmit={(e) => { e.preventDefault(); if (bad) return setTried(true); setSent(true); }} className="space-y-4 rounded-3xl border border-line bg-panel p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-muted">Name<input value={f.name} onChange={set('name')} autoComplete="name" className={input('name')} />{tried && errs.name && <span className="mt-1 block text-bad">{errs.name}</span>}</label>
              <label className="text-xs font-semibold text-muted">Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" className={input('email')} />{tried && errs.email && <span className="mt-1 block text-bad">{errs.email}</span>}</label>
              <label className="text-xs font-semibold text-muted">Topic<select value={f.topic} onChange={set('topic')} className={input('topic')}>{['Booking help', 'Refund or cancellation', 'Accessibility', 'Group or school booking', 'Premier suites', 'Something else'].map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="text-xs font-semibold text-muted">Booking reference (if you have one)<input value={f.ref} onChange={set('ref')} placeholder="TR-XXXXXX" className={input('ref')} /></label>
            </div>
            <label className="block text-xs font-semibold text-muted">Message<textarea value={f.msg} onChange={set('msg')} rows={5} className={input('msg') + ' h-auto py-3'} />{tried && errs.msg && <span className="mt-1 block text-bad">{errs.msg}</span>}</label>
            <button type="submit" className={btn.gold}>Send message</button>
          </form>
        )}
        <div className="space-y-4">
          <Card title="Box office"><p>{VENUE.boxOffice}</p><p>{VENUE.address}</p></Card>
          <Card title="Phone and email"><a className="block font-semibold text-fg" href={'tel:' + VENUE.phone.replace(/\s/g, '')}>{VENUE.phone}</a><a className="block font-semibold text-fg" href={'mailto:' + VENUE.email}>{VENUE.email}</a><p>Phone lines 10:00 AM – 8:00 PM, every day.</p></Card>
        </div>
      </div>
    </Page>
  );
}

export function Legal({ kind }) {
  const terms = kind === 'terms';
  return (
    <Page eyebrow="Legal" title={terms ? 'Terms of sale' : 'Privacy notice'} lead={terms ? 'The short version of the rules that come with every ticket.' : 'What we keep about you, and why.'}>
      <div className="space-y-4">
        {(terms ? [
          ['Your ticket', 'A ticket gives one person entry to one seat for one event. It is valid only when bought here or at the box office.'],
          ['Prices and fees', 'Prices are shown per seat in Pakistani rupees. A ' + fmt(SERVICE_FEE) + ' service fee is added per ticket and shown before you pay.'],
          ['Cancellations', 'You can cancel up to ' + CANCEL_HOURS + ' hours before the event for a refund of the ticket price. The service fee is not refunded unless we cancel or postpone the event.'],
          ['Resale', 'Tickets may be transferred free of charge through My tickets. Selling them above face value is not allowed and the ticket can be cancelled.'],
          ['At the venue', 'Follow staff instructions and the bag policy. We may refuse entry or remove anyone who puts others at risk.'],
          ['Prototype', 'This website is a working prototype. Payments are simulated and no money is taken.'],
        ] : [
          ['What we collect', 'Your name, mobile number, email and the seats you book. Card details are never stored by us; they go straight to the payment provider.'],
          ['Why', 'To send your e-tickets, contact you about your event, and check tickets at the gate.'],
          ['On this device', 'In this prototype, your bookings are saved only in your browser. Clearing site data removes them.'],
          ['How long', 'Booking records are kept for 12 months after the event, then deleted.'],
          ['Your rights', 'Ask for a copy of your data or for it to be deleted by emailing ' + VENUE.email + '.'],
        ]).map(([h, t]) => <Card key={h} title={h}><p>{t}</p></Card>)}
      </div>
    </Page>
  );
}

export function NotFound({ what }) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 py-20 text-center">
      <div><p className="font-wide text-7xl font-extrabold text-gold">404</p><h1 className="mt-4 text-2xl font-bold">{what || 'This page is out of bounds.'}</h1><p className="mt-2 text-muted">The link may be old, or the page has moved.</p><div className="mt-8 flex justify-center gap-3"><Link to="/" className={btn.gold}>Home</Link><Link to="/events" className={btn.ghost}>See events</Link></div></div>
    </div>
  );
}
