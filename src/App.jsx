import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { VENUE, eventById } from './data.js';
import { useBookings } from './store.js';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import Tickets from './pages/Tickets.jsx';
import Ticket from './pages/Ticket.jsx';
import { Venue, Faq, About, Contact, Legal, NotFound } from './pages/Info.jsx';

const Book = lazy(() => import('./pages/Book.jsx'));

export const btn = {
  gold: 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gold text-gold-ink font-semibold text-sm transition hover:brightness-105 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
  ghost: 'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-line text-fg font-semibold text-sm transition hover:bg-white/5 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
  copper: 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-copper text-[#1a0a03] font-semibold text-sm transition hover:brightness-105 active:scale-[0.98]',
};

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={'flex items-center gap-2.5 ' + className} aria-label="Indus Arena home">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 22c0-6.5 4.9-11 11-11s11 4.5 11 11" fill="none" stroke="#FFC845" strokeWidth="3" strokeLinecap="round" /><path d="M10 22c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2" fill="none" stroke="#F4F5F7" strokeWidth="2.4" strokeLinecap="round" /></svg>
      <span className="whitespace-nowrap font-wide font-extrabold tracking-[0.08em] text-[15px]">INDUS <span className="text-gold">ARENA</span></span>
    </Link>
  );
}

function Nav() {
  const list = useBookings(), live = list.filter((b) => b.status === 'Confirmed').length;
  const link = ({ isActive }) => 'whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition ' + (isActive ? 'text-fg bg-white/[0.06]' : 'text-muted hover:text-fg');
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-gold-ink">Skip to content</a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
        <Logo />
        <nav aria-label="Main" className="hidden md:flex items-center gap-1">
          <NavLink to="/events" className={link}>Events</NavLink>
          <NavLink to="/venue" className={link}>Venue guide</NavLink>
          <NavLink to="/faq" className={link}>Help</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <NavLink to="/tickets" className={link}>My tickets{live > 0 && <span className="ml-2 inline-grid min-w-5 h-5 place-items-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-gold-ink">{live}</span>}</NavLink>
          <span className="hidden sm:block"><Link to="/events" className={btn.gold + ' h-10'}>Buy tickets</Link></span>
        </div>
      </div>
      <nav aria-label="Main mobile" className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2">
        {[['/events', 'Events'], ['/venue', 'Venue'], ['/faq', 'Help'], ['/about', 'About']].map(([to, l]) => <NavLink key={to} to={to} className={link}>{l}</NavLink>)}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="no-print border-t border-line mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3"><Logo /><p className="text-sm text-muted leading-relaxed">The official box office of {VENUE.name}, {VENUE.city}. Every ticket sold here is valid at the gate.</p></div>
        <div className="space-y-2 text-sm"><p className="eyebrow mb-3">Tickets</p><Link className="block text-muted hover:text-fg" to="/events">All events</Link><Link className="block text-muted hover:text-fg" to="/tickets">My tickets</Link><Link className="block text-muted hover:text-fg" to="/faq">Refunds and cancellations</Link></div>
        <div className="space-y-2 text-sm"><p className="eyebrow mb-3">Visit</p><Link className="block text-muted hover:text-fg" to="/venue">Gates, parking, bag policy</Link><Link className="block text-muted hover:text-fg" to="/venue#access">Accessibility</Link><Link className="block text-muted hover:text-fg" to="/contact">Contact the box office</Link></div>
        <div className="space-y-2 text-sm"><p className="eyebrow mb-3">Box office</p><p className="text-muted">{VENUE.boxOffice}</p><a className="block text-muted hover:text-fg" href={'tel:' + VENUE.phone.replace(/\s/g, '')}>{VENUE.phone}</a><a className="block text-muted hover:text-fg" href={'mailto:' + VENUE.email}>{VENUE.email}</a></div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-6 text-xs text-muted">
        <span>© 2026 {VENUE.name}. Prototype: payments are simulated, no money is charged.</span>
        <span className="flex gap-4"><Link to="/terms" className="hover:text-fg">Terms</Link><Link to="/privacy" className="hover:text-fg">Privacy</Link></span>
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
    const t = { '': 'Official tickets', events: 'Events and tickets', tickets: b ? 'Your e-tickets ' + b : 'My tickets', venue: 'Venue guide', faq: 'Help', about: 'About', contact: 'Contact', terms: 'Terms of sale', privacy: 'Privacy' }[a];
    document.title = e ? `${e.home} vs ${e.away}, ${e.day} – Tickets | Indus Arena` : (t || 'Page not found') + ' | Indus Arena';
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
