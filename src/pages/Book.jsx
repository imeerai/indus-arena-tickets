import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Stadium from '../engine/Stadium.js';
import { EVENTS, eventById, fmt } from '../data.js';
import { bookings } from '../store.js';
import { btn, Logo } from '../App.jsx';
import { NotFound } from './Info.jsx';

const panel = 'glass rounded-2xl';
const chip = (on) => 'h-9 px-3 rounded-full border text-xs font-semibold transition ' + (on ? 'bg-fg text-ink border-fg' : 'border-line text-fg hover:bg-white/5');
const Toggle = ({ on, onClick, children }) => (
  <button type="button" onClick={onClick} aria-pressed={on} className="flex w-full items-center justify-between gap-3 py-1.5 text-left text-[13px] font-semibold">
    <span>{children}</span>
    <span className={'relative h-[22px] w-10 flex-none rounded-full transition ' + (on ? 'bg-gold' : 'bg-white/20')}><span className={'absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all ' + (on ? 'left-[21px]' : 'left-[3px]')} /></span>
  </button>
);
const Ctl = ({ label, onClick, children, gold }) => (
  <button type="button" onClick={onClick} aria-label={label} title={label} className={'grid h-10 w-10 place-items-center rounded-xl text-[15px] font-bold transition ' + (gold ? 'bg-gold text-gold-ink text-[10px]' : 'text-fg hover:bg-white/10')}>{children}</button>
);
const Field = ({ label, value, onChange, error, ...p }) => (
  <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
    {label}
    <input value={value} onChange={onChange} {...p} className={'h-11 rounded-xl border bg-raise px-3 text-sm font-medium text-fg outline-none transition focus:border-gold ' + (error ? 'border-bad' : 'border-line')} aria-invalid={!!error} />
    {error && <span className="text-[12px] font-medium text-bad">{error}</span>}
  </label>
);

export default function Book() {
  const { id } = useParams(), nav = useNavigate(), ev = eventById(id);
  const ref = useRef(null);
  if (!ref.current && ev) ref.current = new Stadium({ mode: 'full', eventId: id, taken: (eid) => bookings.takenFor(eid), onBooked: (bk) => { bookings.add({ ...bk, status: 'Confirmed' }); nav('/tickets/' + bk.ref + '?new=1'); } });
  const eng = ref.current;
  if (eng && typeof window !== 'undefined') window.__arena = eng; // handy for support and automated checks
  useSyncExternalStore((f) => (eng ? eng.subscribe(f) : () => {}), () => (eng ? eng.version : 0));
  useEffect(() => { if (!eng) return; eng.alive = true; eng.boot(); return () => eng.componentWillUnmount(); }, [eng]);
  const first = useRef(true);
  useEffect(() => { if (!eng) return; if (first.current) { first.current = false; return; } eng.pickEvent(id); }, [id, eng]);
  useEffect(() => { if (!eng) return; const k = (e) => { if (e.key === 'Escape' && !e.target.closest?.('input')) { if (eng.state.drawer) eng.setState({ drawer: null }); else eng.back(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [eng]);
  if (!ev) return <NotFound />;

  const st = eng.state, v = eng.renderVals(), step = st.step, need = st.need || 1, fb = !!st.fbMode;
  const choosing = step === 'overview' || step === 'stand';
  const filters = !!st.filters;
  const setNeed = (n) => eng.setNeed(n);

  return (
    <div ref={v.setWrap} className="relative h-dvh min-h-[600px] w-full overflow-hidden bg-ink select-none">
      <canvas ref={v.setCanvas} aria-label="Interactive 3D model of Indus Arena" className="absolute inset-0 block h-full w-full touch-none" style={{ cursor: v.cursor }} />

      {/* ---------- no-WebGL mode: pre-rendered arena that still turns, flies and looks around ---------- */}
      {v.panoOn && (
        <div onPointerDown={v.cDown} onPointerMove={v.cMove} onPointerUp={v.cUp} onPointerLeave={v.cUp} onWheel={v.cWheel} className="absolute inset-0 cursor-grab touch-none bg-ink transition-opacity duration-500" style={{ opacity: v.cubeOp }}>
          <canvas ref={v.setPanoC} role="img" aria-label="360 degree view from your seat. Drag to look around." className="absolute inset-0 block h-full w-full" />
        </div>
      )}
      {v.panoOn && v.cubeWait && <div className="absolute inset-0 grid place-items-center"><span className="eyebrow animate-pulse">Taking you to your seat</span></div>}
      {v.panoOn && (
        <div role="group" aria-label="Look around" className={panel + ' absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-1 p-1.5'}>
          <Ctl label="Look up" onClick={v.cUpB}>↑</Ctl><Ctl label="Look left" onClick={v.cL}>←</Ctl><Ctl label="Look right" onClick={v.cR}>→</Ctl><Ctl label="Look down" onClick={v.cDnB}>↓</Ctl>
          <span className="mx-2 my-1 h-px bg-line" /><Ctl label="Zoom in" onClick={v.cIn}>+</Ctl><Ctl label="Zoom out" onClick={v.cOut}>−</Ctl><Ctl label="Face the court" onClick={v.cCourt} gold>⌂</Ctl>
        </div>
      )}
      {v.secOn && (
        <div className="absolute inset-0 overflow-hidden transition-opacity duration-500" style={{ opacity: v.fade }}>
          <div className="absolute left-1/2 top-1/2 h-[max(100%,62.5vw)] w-[max(100%,160vh)] -translate-x-1/2 -translate-y-1/2">
            <div className="absolute inset-0" style={{ transform: v.zoomTf, transformOrigin: v.zoomOrigin, transition: 'transform 1100ms cubic-bezier(0.6,0,0.9,0.4)' }}>
              <div aria-hidden="true" className="absolute inset-0 bg-[length:100%_100%]" style={{ backgroundImage: v.secBg }} />
              <svg viewBox="0 0 1600 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                {v.dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.fill} stroke={d.stroke} strokeWidth="2" style={{ cursor: d.cur }} onClick={d.pick}><title>{d.label}</title></circle>)}
              </svg>
            </div>
          </div>
        </div>
      )}
      {v.cineOn && (
        <div className="absolute inset-0 overflow-hidden bg-ink">
          <div role="img" aria-label="Flying to your section" className="absolute left-1/2 top-1/2 h-[max(100%,62.5vw)] w-[max(100%,160vh)] -translate-x-1/2 -translate-y-1/2 bg-no-repeat" style={{ backgroundImage: v.cine.bg, backgroundSize: '600% 500%', backgroundPosition: v.cine.pos }} />
          {v.cine.wait && <div className="absolute inset-0 grid place-items-center"><span className="eyebrow animate-pulse">Loading the fly-in</span></div>}
        </div>
      )}
      {v.fbOv && (
        <div onPointerDown={v.ttDown} onPointerMove={v.ttMove} onPointerUp={v.ttUp} onPointerLeave={v.ttUp} onWheel={v.ttWheel} className="absolute inset-0 touch-none overflow-hidden bg-ink" style={{ cursor: v.ttCur }}>
          <div ref={v.setTtS} className="absolute inset-0 origin-top-left" style={{ transform: v.tt.tf }}>
            <div className="absolute left-1/2 top-1/2 h-[max(100%,62.5vw)] w-[max(100%,160vh)] -translate-x-1/2 -translate-y-1/2">
              <div ref={v.setTtA} role="img" aria-label="Indus Arena from above. Drag to turn it, scroll to zoom, click a section to fly in." className="absolute inset-0 bg-[length:100%_100%]" style={{ backgroundImage: v.tt.a }} />
              <div ref={v.setTtB} aria-hidden="true" className="absolute inset-0 bg-[length:100%_100%]" style={{ backgroundImage: v.tt.b, opacity: v.tt.bo }} />
              <svg ref={v.setTtH} viewBox="0 0 1600 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full transition-opacity duration-200" style={{ opacity: v.hotOp }}>
                {v.hot.map((h, i) => <polygon key={i} points={h.pts} fill={h.fill} stroke={h.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" className="cursor-pointer" onMouseEnter={h.enter} onMouseLeave={h.leave} onClick={h.pick}><title>{h.label}</title></polygon>)}
              </svg>
            </div>
          </div>
          {v.ttCtl && (
            <div role="group" aria-label="Move the arena" className={panel + ' absolute right-5 top-1/2 flex -translate-y-1/2 flex-col gap-1 p-1.5'}>
              <Ctl label="Turn left" onClick={v.ttL}>⟲</Ctl><Ctl label="Turn right" onClick={v.ttR}>⟳</Ctl><Ctl label="View from higher" onClick={v.ttUpB}>↑</Ctl><Ctl label="View from lower" onClick={v.ttDnB}>↓</Ctl>
              <span className="mx-2 my-1 h-px bg-line" /><Ctl label="Zoom in" onClick={v.ttIn}>+</Ctl><Ctl label="Zoom out" onClick={v.ttOut}>−</Ctl><Ctl label="Reset view" onClick={v.ttRst}><span className="text-[9px]">RESET</span></Ctl>
            </div>
          )}
        </div>
      )}
      {v.pinsOn && v.pins.map((p, i) => (
        <span key={i} title={p.name} className="pointer-events-none absolute flex h-[22px] -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 px-2 text-[10px] font-bold" style={{ left: p.x, top: p.y, background: p.bg, color: p.fg }}>{p.code}<span className="font-medium">{p.name}</span></span>
      ))}
      {v.vipOn && (
        <button type="button" onClick={v.goVip} className="absolute flex h-8 -translate-x-1/2 -translate-y-full items-center gap-2 whitespace-nowrap rounded-full border border-copper bg-ink/90 px-3 text-xs font-bold" style={{ left: v.vipPin.x, top: v.vipPin.y }}><span className="h-2 w-2 rounded-full bg-copper" />Premier suites · this ring</button>
      )}
      {v.fbMap && (
        <div className="pointer-events-none absolute inset-x-5 bottom-28 top-24 grid place-items-center lg:right-72">
          <div role="group" aria-label="Seat map for this section" className={panel + ' pointer-events-auto flex max-h-full max-w-full flex-col gap-1 overflow-auto p-5'}>
            {v.rows.map((rw) => (
              <div key={rw.label} className="flex items-center gap-1"><span className="mr-1.5 w-6 flex-none text-right text-[11px] font-semibold text-muted">{rw.label}</span>
                {rw.seats.map((sx) => <button key={sx.n} type="button" disabled={sx.dis} onClick={sx.pick} aria-label={sx.label} title={sx.label} className="h-[22px] w-[22px] flex-none rounded-t-md rounded-b-sm text-[9px] font-semibold disabled:cursor-not-allowed" style={{ background: sx.bg, color: sx.fg }}>{sx.n}</button>)}
              </div>
            ))}
            <div className="mt-2 rounded-md bg-white/5 py-1.5 text-center text-[10px] font-bold tracking-[0.16em] text-muted">COURT THIS WAY</div>
          </div>
        </div>
      )}

      {v.loading && <div className="absolute inset-0 grid place-items-center p-6 text-center"><span className="eyebrow animate-pulse">{v.loadText}</span></div>}

      {/* ---------- top bar ---------- */}
      <header className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-1 bg-gradient-to-b from-ink/95 to-transparent px-4 py-3 sm:px-6">
        {v.showBack
          ? <button type="button" onClick={v.back} className={btn.ghost + ' h-10 bg-ink/70'}><span aria-hidden="true">←</span>{v.backLabel}</button>
          : <Link to="/events" className={btn.ghost + ' h-10 bg-ink/70'}><span aria-hidden="true">←</span>Events</Link>}
        <Logo className="hidden lg:flex" />
        <button type="button" onClick={v.toggleEvents} aria-expanded={v.evOpen} className="order-last mx-auto flex min-w-0 max-w-full flex-col items-center rounded-xl px-3 py-1 text-center transition hover:bg-white/5 sm:order-none">
          <span className="truncate font-wide text-[13px] font-extrabold tracking-[0.06em] sm:text-[15px]">{(ev.home + ' vs ' + ev.away).toUpperCase()} <span aria-hidden="true" className="text-muted">▾</span></span>
          <span className="text-xs text-muted">{ev.sport} · {ev.day} · {ev.time}</span>
        </button>
        <div className="ml-auto flex gap-2 sm:ml-0">{v.hasVip && <button type="button" onClick={v.goVip} className={btn.ghost + ' h-10 border-copper/60 bg-ink/70'}><span className="h-2 w-2 rounded-full bg-copper" /><span className="max-sm:hidden">Premier </span>Suites</button>}
        <Link to="/tickets" className={btn.ghost + ' h-10 bg-ink/70'}>My tickets</Link></div>
      </header>
      {v.evOpen && (
        <div className={panel + ' slide-in absolute left-1/2 top-[72px] z-30 w-[min(420px,calc(100%-32px))] -translate-x-1/2 p-2'}>
          <p className="eyebrow px-3 pb-1 pt-2">Change event</p>
          {EVENTS.map((x) => (
            <button key={x.id} type="button" onClick={() => { eng.setState({ drawer: null }); if (x.id !== id) nav('/book/' + x.id); }} aria-current={x.id === id} className={'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5 ' + (x.id === id ? 'bg-gold/10' : '')}>
              <span className="w-10 text-center"><span className="block font-wide text-lg font-extrabold leading-none">{x.day.split(' ')[1]}</span><span className="text-[10px] font-bold text-muted">{x.day.split(' ')[2].toUpperCase()}</span></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{x.home} vs {x.away}</span><span className="text-xs text-muted">{x.sport} · {x.time}</span></span>
              {x.id === id && <span className="text-xs font-bold text-gold">Selected</span>}
            </button>
          ))}
        </div>
      )}

      {/* ---------- tooltips ---------- */}
      {v.tipOn && (
        <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-fg px-3 py-2 text-ink shadow-2xl" style={{ left: v.tip.x, top: v.tip.y - 8 }}>
          <p className="font-wide text-[10px] font-extrabold tracking-[0.12em]">{v.tip.title}</p>
          <p className="text-[13px]">{v.tip.line} <b>{v.tip.price}</b></p>
        </div>
      )}
      {v.hsOn && !(eng.selSet && eng.selSet.has(eng.hoverRaw)) && <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink/95 px-2.5 py-1.5 text-xs" style={{ left: v.hs.x, top: v.hs.y }}><b className="block">{v.hs.label}</b><span style={{ color: v.hs.color }}>{v.hs.status}</span></div>}
      {v.tagOn && <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-gold px-2.5 py-1 text-xs font-bold text-gold-ink" style={{ left: v.tag.x, top: v.tag.y }}>Row {v.seat.row} · Seat {v.seat.num}</div>}
      {v.msgOn && (
        <div role="status" className="rise absolute left-1/2 top-20 z-30 flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-xl border border-copper bg-ink/95 px-4 py-2.5 text-[13px] font-semibold">
          <span>{v.msg}</span><button type="button" onClick={v.clearMsg} aria-label="Dismiss" className="text-muted hover:text-fg">✕</button>
        </div>
      )}
      {v.hintOn && <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/70 px-4 py-1.5 text-xs text-[#c9cdd3] max-sm:hidden" style={{ bottom: step === 'overview' || step === 'stand' ? 30 : step === 'seat' ? 150 : 104 }}>{v.hint}</p>}

      {/* ---------- overview: prices, budget, group size ---------- */}
      {v.isOverview && (
        <aside aria-label="Find seats" className={panel + ' rise absolute bottom-5 left-5 z-10 flex w-[290px] flex-col gap-4 p-4 max-sm:inset-x-3 max-sm:bottom-3 max-sm:w-auto max-sm:gap-3'}>
          <div>
            <p className="eyebrow mb-2">How many tickets</p>
            <div className="grid grid-cols-8 gap-1">{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <button key={n} type="button" onClick={() => setNeed(n)} aria-pressed={need === n} className={'h-9 rounded-lg border text-sm font-bold transition ' + (need === n ? 'border-gold bg-gold text-gold-ink' : 'border-line hover:bg-white/5')}>{n}</button>)}</div>
            <p className="mt-2 text-xs text-muted">{need > 1 ? 'Group seats are always kept together in one row.' : 'Going with friends? Pick a number and we keep you together.'}</p>
          </div>
          <button type="button" onClick={() => eng.setState({ filters: !filters })} aria-expanded={filters} className="flex items-center justify-between text-xs font-semibold text-muted sm:hidden">Budget and prices<span aria-hidden="true">{filters ? '−' : '+'}</span></button>
          <div className={filters ? '' : 'max-sm:hidden'}>
            <p className="eyebrow mb-2">Budget per seat</p>
            <div className="flex flex-wrap gap-1.5">{v.budgets.map((b) => <button key={b.label} type="button" onClick={b.pick} aria-pressed={b.on === 'true'} className={chip(b.on === 'true')}>{b.label}</button>)}</div>
          </div>
          <div className={'space-y-1.5 ' + (filters ? '' : 'max-sm:hidden')}>
            <p className="eyebrow mb-2">Prices tonight</p>
            {v.v.tiers.map((t) => <div key={t.name} className="flex items-center gap-2.5 text-[13px]"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: t.color }} /><span className="flex-1 text-[#c9cdd3]">{t.name}</span><b className="font-semibold">{t.price}</b></div>)}
          </div>
          <p className="text-xs leading-relaxed text-muted max-sm:hidden">{v.sunText}</p>
          <button type="button" onClick={() => eng.takeBest()} className={btn.gold}>Find {need > 1 ? need + ' best seats together' : 'the best seat'}</button>
        </aside>
      )}
      {v.isOverview && (
        <div className="absolute bottom-5 right-5 z-10 hidden gap-2 lg:flex">
          <button type="button" onClick={v.tour} className={btn.ghost + ' bg-ink/80'}>Take the tour</button>
        </div>
      )}

      {/* ---------- section ---------- */}
      {v.isBlock && (
        <aside aria-label="Seat options" className={panel + ' slide-in absolute right-5 top-20 z-10 flex w-[250px] flex-col gap-3.5 p-4 max-lg:hidden'}>
          <p className="eyebrow">Tickets</p>
          <div className="grid grid-cols-4 gap-1">{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <button key={n} type="button" onClick={() => setNeed(n)} aria-pressed={need === n} className={'h-9 rounded-lg border text-sm font-bold transition ' + (need === n ? 'border-gold bg-gold text-gold-ink' : 'border-line hover:bg-white/5')}>{n}</button>)}</div>
          <p className="text-xs leading-relaxed text-muted">Click any free seat. {need > 1 ? 'We add the ' + (need - 1) + ' next to it in the same row.' : ''} {fb ? '' : 'Drag to orbit the section, scroll to zoom.'}</p>
          {fb && <button type="button" onClick={v.toggleList} className={btn.ghost + ' h-9 text-xs'}>{v.listLabel}</button>}
          <span className="h-px bg-line" />
          {!fb && <Toggle on={v.crowdOn} onClick={v.toggleCrowd}>Show booked fans</Toggle>}
          <div className="space-y-2 text-xs text-[#c9cdd3]">
            <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-seat" />Available</p>
            <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-[#132457] ring-1 ring-white/25" />Booked</p>
            <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-gold" />Your pick</p>
            <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-ok" />Already yours</p>
          </div>
        </aside>
      )}
      {v.isBlock && (
        <div className={panel + ' rise absolute bottom-5 left-1/2 z-10 flex w-[min(880px,calc(100%-24px))] -translate-x-1/2 flex-wrap items-center justify-between gap-3 py-3 pl-5 pr-3'}>
          <div><p className="font-wide text-[11px] font-extrabold tracking-[0.14em]">{v.block.title}</p><p className="text-xs text-muted">{v.block.free} seats free · {v.block.price} each</p></div>
          <div className="flex items-center gap-1 lg:hidden">{[1, 2, 3, 4].map((n) => <button key={n} type="button" onClick={() => setNeed(n)} aria-label={n + ' tickets'} aria-pressed={need === n} className={'h-9 w-9 rounded-lg border text-sm font-bold ' + (need === n ? 'border-gold bg-gold text-gold-ink' : 'border-line')}>{n}</button>)}</div>
          {v.hasSeat
            ? <div className="flex items-center gap-3"><span className="text-[13px] font-semibold">Row {v.seat.row} · Seat {v.seat.num} · {v.seat.total}</span><button type="button" onClick={v.goSeat} className={btn.gold}>Sit here</button></div>
            : <span className="text-[13px] text-[#c9cdd3]">Click a blue seat to pick it</span>}
        </div>
      )}

      {/* ---------- seat view ---------- */}
      {v.isSeat && (
        <div className={panel + ' rise absolute bottom-5 left-1/2 z-10 flex w-[min(1000px,calc(100%-24px))] -translate-x-1/2 flex-wrap items-center justify-between gap-4 py-3 pl-5 pr-3'}>
          <dl className="flex flex-wrap items-center gap-6">
            {[['Section', v.tk.section], ['Row', v.seat.row], [v.seat.count > 1 ? 'Seats' : 'Seat', v.seat.num], ['Total', v.seat.total]].map(([k, val]) => <div key={k}><dt className="text-[10px] font-semibold tracking-[0.08em] text-muted">{k.toUpperCase()}</dt><dd className="text-base font-bold">{val}</dd></div>)}
          </dl>
          <div className="flex flex-wrap gap-2">
            {v.hasVip && <button type="button" onClick={v.upgrade} className={btn.ghost}>Compare premier suite</button>}
            <button type="button" onClick={v.checkout} className={btn.gold + ' px-6'}>Book {v.seat.count > 1 ? v.seat.count + ' seats' : 'seat'} · {v.seat.total}</button>
          </div>
          <div className="order-3 flex basis-full flex-wrap gap-1.5 border-t border-line pt-2.5">
            {[v.facts.shade, v.facts.view, v.facts.walk, v.facts.wc, v.facts.food].filter(Boolean).map((t) => <span key={t} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium">{t}</span>)}
            {v.facts.aisle && <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold">Aisle seat</span>}
          </div>
        </div>
      )}
      {v.isVip && (
        <div className={panel + ' rise absolute bottom-5 left-1/2 z-10 flex w-[min(900px,calc(100%-24px))] -translate-x-1/2 flex-wrap items-center justify-between gap-4 border-copper py-3 pl-5 pr-3'}>
          <div><p className="font-wide text-[11px] font-extrabold tracking-[0.14em] text-copper">{v.tk.vipTitle}</p><p className="text-xs text-[#c9cdd3]">Private box · padded seats · food and drinks included · {v.tk.vipPrice} per seat</p></div>
          <div className="flex gap-2"><button type="button" onClick={v.back} className={btn.ghost}>Keep my seat</button><button type="button" onClick={v.checkoutVip} className={btn.copper}>Book the suite</button></div>
        </div>
      )}

      {/* ---------- checkout drawer ---------- */}
      {v.isCheckout && <Checkout v={v} eng={eng} ev={ev} />}
    </div>
  );
}

function Checkout({ v, eng, ev }) {
  const st = eng.state, c = st.cart;
  return (
    <div className="absolute inset-0 z-40 flex justify-end bg-ink/50 fade" onClick={(e) => { if (e.target === e.currentTarget) v.back(); }}>
      <aside role="dialog" aria-modal="true" aria-label="Checkout" className="slide-in flex h-full w-full max-w-[460px] flex-col overflow-y-auto border-l border-line bg-panel">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div><p className="eyebrow">Checkout</p><p className="text-sm font-semibold">{ev.home} vs {ev.away} · {ev.day}</p></div>
          <span className="rounded-full px-3 py-1.5 text-xs font-bold tabular-nums" style={{ background: v.hold.bg, color: v.hold.fg }} title="Your seats are held for you while you check out">Held {v.hold.text}</span>
        </div>
        <div className="space-y-5 p-5">
          <div className="overflow-hidden rounded-2xl border border-line">
            {v.shotOn && <div className="aspect-[16/7] bg-cover bg-center" style={{ backgroundImage: v.shotBg }} role="img" aria-label="Your view from this seat" />}
            <div className="p-4"><p className="text-sm font-semibold">{v.c.place}</p><p className="text-xs text-muted">{c.stand} · Gate {c.gate} · {c.tier}</p></div>
          </div>
          <ol className="grid grid-cols-2 gap-2">{v.ckSteps.map((s) => <li key={s.label} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold" style={{ background: s.bg, color: s.fg }}><span className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-ink" style={{ background: s.dot }}>{s.n}</span>{s.label}</li>)}</ol>

          {v.ckDetails && (
            <div className="space-y-3">
              <Field label="Full name" value={v.f.name} onChange={v.fName} error={v.err.name} autoComplete="name" placeholder="As on your CNIC" />
              <Field label="Mobile number" value={v.f.phone} onChange={v.fPhone} error={v.err.phone} autoComplete="tel" inputMode="tel" placeholder="0300 1234567" />
              <Field label="Email for your e-tickets" value={v.f.email} onChange={v.fEmail} error={v.err.email} autoComplete="email" type="email" placeholder="you@example.com" />
              {v.multi && (
                <div className="space-y-2 rounded-2xl border border-line p-3">
                  <p className="text-xs font-semibold text-muted">Name on each ticket (optional, leave blank to use yours)</p>
                  {v.holders.map((h, i) => <input key={i} value={h.val} onChange={h.set} placeholder={h.label + ' holder'} className="h-10 w-full rounded-lg border border-line bg-raise px-3 text-sm outline-none focus:border-gold" />)}
                </div>
              )}
            </div>
          )}
          {v.ckPay && (
            <div className="space-y-3">
              <p className="rounded-xl bg-gold/10 px-3 py-2 text-xs font-medium text-gold">Demo checkout: no money is charged. Any details work, or leave them blank.</p>
              <div className="grid grid-cols-3 gap-2">{v.pms.map((p) => <button key={p.label} type="button" onClick={p.pick} aria-pressed={p.on === 'true'} className="rounded-xl border p-3 text-left transition" style={{ background: p.bg, borderColor: p.border }}><span className="block text-sm font-bold">{p.label}</span><span className="text-[11px] text-muted">{p.sub}</span></button>)}</div>
              {v.payCard
                ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_88px_72px] [&>label:first-child]:col-span-2 sm:[&>label:first-child]:col-span-1"><Field label="Card number" value={v.f.card} onChange={v.fCard} inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="off" /><Field label="Expiry" value={v.f.exp} onChange={v.fExp} placeholder="MM/YY" autoComplete="off" /><Field label="CVC" value={v.f.cvc} onChange={v.fCvc} placeholder="123" autoComplete="off" /></div>
                : <Field label={v.pmName + ' number'} value={v.f.wallet} onChange={v.fWallet} inputMode="tel" placeholder="0300 1234567" />}
              <div className="flex gap-2"><input value={v.promo} onChange={v.fPromo} placeholder="Promo code" className="h-11 flex-1 rounded-xl border border-line bg-raise px-3 text-sm outline-none focus:border-gold" /><button type="button" onClick={v.applyPromo} className={btn.ghost}>Apply</button></div>
              {v.promoMsgOn && <p className="text-xs font-semibold" style={{ color: v.promoColor }}>{v.promoMsg}</p>}
            </div>
          )}

          <div className="space-y-1.5 rounded-2xl bg-raise p-4 text-sm">
            <div className="flex justify-between text-muted"><span>{v.tot.line}</span><span>{v.tot.sub}</span></div>
            <div className="flex justify-between text-muted"><span>Service fee ({fmt(150)} per ticket)</span><span>{v.tot.fee}</span></div>
            {v.tot.discOn && <div className="flex justify-between text-ok"><span>Promo TIER10</span><span>−{v.tot.disc}</span></div>}
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><span>Total</span><span>{v.tot.total}</span></div>
            <p className="pt-1 text-[11px] text-muted">Free cancellation up to 48 hours before the event. The service fee is not refunded.</p>
          </div>
        </div>
        <div className="sticky bottom-0 mt-auto border-t border-line bg-panel p-4">
          {v.ckPay && <p className="mb-3 text-[11px] text-muted">By paying you agree to the <a href="/terms" target="_blank" className="font-semibold text-fg underline">Terms of sale</a>.</p>}
          <div className="flex gap-2">
          <button type="button" onClick={v.ckBack} className={btn.ghost}>{v.ckBackLabel}</button>
          <button type="button" onClick={v.ckNext} className={btn.gold + ' flex-1'}>{v.ckNextLabel}</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
