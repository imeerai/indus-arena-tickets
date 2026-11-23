import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { VENUE, EVENTS, eventById } from './data.js';
import { useBookings } from './store.js';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import Tickets from './pages/Tickets.jsx';
import Ticket from './pages/Ticket.jsx';
import { Venue, Faq, About, Contact, Legal, NotFound } from './pages/Info.jsx';

const Book = lazy(() => import('./pages/Book.jsx'));

export const btn = {
  gold: 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[4px] bg-gold text-gold-ink font-semibold text-sm transition hover:bg-[#ffd466] active:translate-y-px disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap',
  ghost: 'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-[4px] border border-white/15 text-fg font-semibold text-sm transition hover:border-white/40 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap',
  copper: 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[4px] bg-copper text-[#1a0a03] font-semibold text-sm transition hover:brightness-105 active:translate-y-px whitespace-nowrap',
};

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={'flex items-center gap-2.5 ' + className} aria-label="Indus Arena home">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 22c0-6.5 4.9-11 11-11s11 4.5 11 11" fill="none" stroke="#FFC845" strokeWidth="3" strokeLinecap="round" /><path d="M10 22c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2" fill="none" stroke="#F4F5F7" strokeWidth="2.4" strokeLinecap="round" /></svg>
      <span className="whitespace-nowrap font-wide text-[15px] font-extrabold tracking-[0.06em]">INDUS ARENA</span>
    </Link>
  );
}

const NAV = [['/events', 'Fixtures'], ['/venue', 'Visit'], ['/faq', 'Help'], ['/about', 'About']];

function Nav() {
  const list = useBookings(), live = list.filter((b) => b.status === 'Confirmed').length, next = EVENTS[0], [open, setOpen] = useState(false), { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  const link = ({ isActive }) => 'relative py-5 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:bg-gold after:transition-transform after:duration-300 ' + (isActive ? 'text-fg after:scale-x-100' : 'text-muted hover:text-fg after:scale-x-0 hover:after:scale-x-100');
  return (
    <header className="no-print sticky top-0 z-40">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-[4px] focus:bg-gold focus:px-3 focus:py-2 focus:text-gold-ink">Skip to content</a>
      <Link to={'/book/' + next.id} className="group block bg-gold text-gold-ink">
        <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-5 py-2 text-center text-[13px] font-medium">
          <span className="whitespace-nowrap font-semibold"><span className="max-sm:hidden">Next home game:</span><span className="sm:hidden">Next:</span></span><span className="truncate">{next.home} v {next.away}, {next.day}, {next.time}</span><span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </p>
      </Link>
      <div className="border-b border-white/[0.08] bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-10 px-5">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">{NAV.map(([to, l]) => <NavLink key={to} to={to} className={link}>{l}</NavLink>)}</nav>
          <div className="ml-auto flex items-center gap-5">
            <NavLink to="/tickets" className={link}>My tickets{live > 0 && <span className="ml-1.5 text-gold">({live})</span>}</NavLink>
            <Link to="/events" className={btn.gold + ' h-10 max-sm:hidden'}>Buy tickets</Link>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mnav" aria-label="Menu" className="grid h-10 w-10 place-items-center md:hidden">
              <span className="relative block h-3 w-5"><span className={'absolute left-0 h-[2px] w-5 bg-fg transition ' + (open ? 'top-[5px] rotate-45' : 'top-0')} /><span className={'absolute left-0 h-[2px] w-5 bg-fg transition ' + (open ? 'top-[5px] -rotate-45' : 'top-[10px]')} /></span>
            </button>
          </div>
        </div>
        {open && (
          <nav id="mnav" aria-label="Main mobile" className="fade border-t border-white/[0.08] px-5 pb-6 pt-2 md:hidden">
            {NAV.map(([to, l]) => <NavLink key={to} to={to} className={({ isActive }) => 'block border-b border-white/[0.06] py-4 font-wide text-xl font-extrabold ' + (isActive ? 'text-gold' : '')}>{l}</NavLink>)}
            <Link to="/events" className={btn.gold + ' mt-6 w-full'}>Buy tickets</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

function Footer() {
  const col = (h, links) => <div><p className="text-sm font-semibold">{h}</p><ul className="mt-4 space-y-3 text-sm text-muted">{links.map(([to, l]) => <li key={l}>{to.startsWith('/') ? <Link className="transition-colors hover:text-fg" to={to}>{l}</Link> : <a className="transition-colors hover:text-fg" href={to}>{l}</a>}</li>)}</ul></div>;
  return (
    <footer className="no-print mt-32 border-t border-white/[0.08]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div><Logo /><p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">The official box office of {VENUE.name}. Tickets bought here are the only ones guaranteed at the gate.</p></div>
        {col('Tickets', [['/events', 'Fixtures'], ['/tickets', 'My tickets'], ['/faq#refunds', 'Refunds']])}
        {col('Visit', [['/venue', 'Getting here'], ['/venue#access', 'Accessibility'], ['/venue#bags', 'Bag policy']])}
        {col('Box office', [['tel:' + VENUE.phone.replace(/\s/g, ''), VENUE.phone], ['mailto:' + VENUE.email, VENUE.email], ['/contact', 'Send a message']])}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 pb-10 text-xs text-muted">
        <span>© 2026 {VENUE.name}, Hyderabad. Prototype: payments are simulated.</span>
        <span className="flex gap-5"><Link to="/terms" className="hover:text-fg">Terms</Link><Link to="/privacy" className="hover:text-fg">Privacy</Link></span>
      </div>
    </footer>
  );
}

export function Loading({ text = 'Loading' }) {
  return <div className="grid min-h-[70vh] place-items-center"><span className="eyebrow animate-pulse">{text}</span></div>;
}

export default function App() {
  const { pathname, hash } = useLocation();
  const immersive = pathname.startsWith('/book/');
  useEffect(() => { if (!hash) window.scrollTo(0, 0); else document.getElementById(hash.slice(1))?.scrollIntoView(); }, [pathname, hash]);
  useEffect(() => {
    const [, a, b] = pathname.split('/'), e = a === 'book' && eventById(b);
    const t = { '': 'Official tickets', events: 'Fixtures and tickets', tickets: b ? 'Your e-tickets ' + b : 'My tickets', venue: 'Venue guide', faq: 'Help', about: 'About', contact: 'Contact', terms: 'Terms of sale', privacy: 'Privacy' }[a];
    document.title = e ? `${e.home} vs ${e.away}, ${e.day}: Tickets | Indus Arena` : (t || 'Page not found') + ' | Indus Arena';
  }, [pathname]);
  return (
    <>
      {!immersive && <Nav />}
      <main id="main" key={pathname} className={immersive ? '' : 'fade'}>
        <Suspense fallback={<Loading text="Loading the arena" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/book/:id" element={<Book />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:ref" element={<Ticket />} />
            <Route path="/venue" element={<Venue />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Legal kind="terms" />} />
            <Route path="/privacy" element={<Legal kind="privacy" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!immersive && <Footer />}
    </>
  );
}
