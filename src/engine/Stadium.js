import * as THREE from 'three';
import { EVENTS } from '../data.js';

// Tiny state holder the engine was written against (props + setState + subscribers for React).
class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; this.subs = new Set(); this.version = 0; }
  setState(s, cb) { const next = typeof s === 'function' ? s(this.state) : s; this.state = { ...this.state, ...next }; this.version++; this.subs.forEach((f) => f()); if (cb) cb(); if (next && next.fadeIn) setTimeout(() => this.setState({}), 70); }
  subscribe(f) { this.subs.add(f); return () => this.subs.delete(f); }
}

export default class Stadium extends DCLogic {
  constructor(p) {
    super(p);
    this.state = { step: 'overview', venue: null, tip: null, loading: true };
    this.uid = 's3d' + Math.random().toString(36).slice(2); this.tries = 0;
    this.setCanvas = (el) => { this.canvas = el; };
    this.setWrap = (el) => { this.wrap = el; };
    this.setTtS = (el) => { this.ttS = el; }; this.setTtA = (el) => { this.ttA = el; }; this.setTtB = (el) => { this.ttB = el; }; this.setTtH = (el) => { this.ttH = el; };
    this.setPanoC = (el) => { this.panoC = el; if (el && this.cv) setTimeout(() => this.cDraw(true), 0); };
  }
  mode() { return this.props.mode || 'full'; }
  venueKey() { return 'arena'; }
  EV() { return EVENTS; }


  ev() { const id = this.state.eventId || this.props.eventId || 'e1'; return this.EV().find((e) => e.id === id); }
  componentDidMount() { this.alive = true; this.boot(); }
  componentWillUnmount() { cancelAnimationFrame(this.ttRaf); cancelAnimationFrame(this.cRaf); clearInterval(this.holdT); clearInterval(this.clipT); clearTimeout(this.zoomT); this.alive = false; clearTimeout(this._bt); this.stopTour(); cancelAnimationFrame(this.raf); if (this.ro) this.ro.disconnect(); if (this.io) this.io.disconnect(); if (this.r) this.r.dispose(); }
  boot() {
    if (!this.alive || !this.canvas) return;
    try { this.init(); } catch (e) { this.setState({ err: String(e && e.message || e), loading: true }); }
  }


  V() {
    return {
      oval: { nameA: 'MEHRAN', nameB: 'OVAL', event: 'Indus Lions vs Desert Hawks · Sun 2:00 PM', n: 2.3, a0: 56, b0: 48, spacing: 0.6, open: true,
        tiers: [ { rows: 16, d: 0.85, rise: 0.40, secs: 28, name: 'Lower tier' }, { rows: 13, d: 0.9, rise: 0.52, secs: 32, name: 'Middle tier' }, { rows: 17, d: 0.9, rise: 0.6, secs: 36, name: 'Upper tier' } ],
        levels: [ { gap: 1.6, lift: 2.4, kind: 'led' }, { gap: 4.6, lift: 3.8, kind: 'suite' } ],
        base: [2500, 2000, 1500], skybox: 12000, standMul: [1, 1.4, 1, 1.4], soldRate: [0.46, 0.38, 0.3],
        seat: '#1D4CD8', alt: null, sold: '#132457', ground: 'cricket',
        led1: 'MIDDLE TIER  FROM PKR 2,000     INDUS LIONS     ', led2: 'PREMIER BOXES  FROM PKR 12,000     UPPER TIER  FROM PKR 1,500     ', board: 'BOUNDARY  INDUS LIONS VS DESERT HAWKS     ', jumbo: ['INDUS LIONS', 'VS DESERT HAWKS'] },
      arena: { nameA: 'INDUS', nameB: 'ARENA', event: 'Sea Hawks vs Falcons · Sat 7:30 PM', n: 4, a0: 17.2, b0: 11.6, spacing: 0.56, open: false,
        tiers: [ { rows: 14, d: 0.85, rise: 0.42, secs: 20, name: 'Lower bowl' }, { rows: 16, d: 0.9, rise: 0.56, secs: 24, name: 'Upper bowl' } ],
        levels: [ { gap: 4.4, lift: 3.6, kind: 'suite' } ],
        base: [6000, 3500], skybox: 18000, standMul: [1, 1.5, 1, 1.5], soldRate: [0.44, 0.33],
        seat: '#1D4CD8', alt: null, sold: '#132457', ground: 'court',
        led1: 'LOWER BOWL  FROM PKR 6,000     SEA HAWKS     ', led2: 'PREMIER SUITES  FROM PKR 18,000     UPPER LEVEL  FROM PKR 3,500     ', board: 'LOWER BOWL SIDELINE  FROM PKR 9,000     SEA HAWKS     ', jumbo: ['SEA HAWKS', 'VS FALCONS'] }
    };
  }
  STANDS() { return ['North stand', 'East stand', 'South stand', 'West stand']; }
  fmt(n) { return 'PKR ' + Math.round(n).toLocaleString('en-US'); }
  mult() { return (this.ev() && this.ev().mult) || 1; }
  priceOf(ti, stand) { const V = this.vd; return Math.round(V.base[ti] * V.standMul[stand] * this.mult() / 100) * 100; }
  suitePrice() { return Math.round(this.V()[this.venueKey()].skybox * this.mult() / 100) * 100; }

  // ---------- geometry helpers ----------
  sePt(a, b, n, t) { const c = Math.cos(t), s = Math.sin(t), e = 2 / n; const x = a * Math.sign(c) * Math.pow(Math.abs(c), e), z = b * Math.sign(s) * Math.pow(Math.abs(s), e); let nx = Math.sign(x) * Math.pow(Math.abs(x / a), n - 1) / a, nz = Math.sign(z) * Math.pow(Math.abs(z / b), n - 1) / b; const l = Math.hypot(nx, nz) || 1; return { x, z, nx: nx / l, nz: nz / l }; }
  ringPoly(a, b, n, N) { const pts = [], cum = [0]; let L = 0; for (let i = 0; i <= N; i++) { const t = -Math.PI / 2 + i / N * Math.PI * 2; pts.push(this.sePt(a, b, n, t)); if (i) { L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z); cum.push(L); } } return { pts, cum, len: L }; }
  atLen(rp, L) { let lo = 0, hi = rp.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (rp.cum[m] < L) lo = m; else hi = m; } const p = rp.pts[lo], q = rp.pts[hi], k = (L - rp.cum[lo]) / ((rp.cum[hi] - rp.cum[lo]) || 1); const nx = p.nx + (q.nx - p.nx) * k, nz = p.nz + (q.nz - p.nz) * k, l = Math.hypot(nx, nz) || 1; return { x: p.x + (q.x - p.x) * k, z: p.z + (q.z - p.z) * k, nx: nx / l, nz: nz / l }; }
  fracOf(rp, x, z) { const ang = Math.atan2(z, x); let best = 0, bd = 1e9; for (let i = 0; i < rp.pts.length; i += 2) { const q = rp.pts[i]; let d = Math.abs(Math.atan2(q.z, q.x) - ang); if (d > Math.PI) d = 2 * Math.PI - d; if (d < bd) { bd = d; best = i; } } return rp.cum[best] / rp.len; }
  tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
  ledTex(text, color) { const t = this.tex(2048, 96, (g, w, h) => { g.fillStyle = '#050608'; g.fillRect(0, 0, w, h); g.font = '800 52px Archivo, "Arial Black", Arial, sans-serif'; g.fillStyle = color || '#F4F5F7'; g.textBaseline = 'middle'; let tw = g.measureText(text).width + 60; const n = Math.max(1, Math.ceil(w / tw - 0.2)), gap = w / n; if (tw > gap) { g.font = '800 ' + Math.floor(52 * gap / tw) + 'px Archivo, "Arial Black", Arial, sans-serif'; } for (let i = 0; i < n; i++) g.fillText(text, i * gap + 30, h / 2 + 2); }); t.wrapS = THREE.RepeatWrapping; return t; }
  ledMat(txt) { const m = new THREE.MeshBasicMaterial({ map: this.ledTex(txt), side: THREE.FrontSide, toneMapped: false }); m.userData.led = true; return m; }
  strip(a, b, n, h1, h2, mat, period) { const N = 260, rp = this.ringPoly(a, b, n, N), pos = [], uv = [], idx = []; for (let i = 0; i <= N; i++) { const p = rp.pts[i], u = rp.cum[i] / (period || 30); pos.push(p.x, h1, p.z, p.x, h2, p.z); uv.push(u, 0, u, 1); if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); } } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); if (!mat.userData || !mat.userData.led) return m;
    // LED ribbons read correctly from both sides: the back gets its own mesh with mirrored UVs
    const g2 = g.clone(), u2 = g2.attributes.uv; for (let i = 0; i < u2.count; i++) u2.setX(i, -u2.getX(i)); const m2 = new THREE.Mesh(g2, mat.clone()); m2.material.side = THREE.BackSide; const grp = new THREE.Group(); grp.add(m); grp.add(m2); return grp; }
  band(a, b, n, o1, h1, o2, h2, mat) { const N = 260, pos = [], idx = []; for (let i = 0; i <= N; i++) { const t = -Math.PI / 2 + i / N * Math.PI * 2; const p = this.sePt(a + o1, b + o1, n, t), q = this.sePt(a + o2, b + o2, n, t); pos.push(p.x, h1, p.z, q.x, h2, q.z); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return new THREE.Mesh(g, mat); }
  merge(parts) { const pos = [], nor = []; parts.forEach(([g, x, y, z]) => { const n = g.toNonIndexed(); n.translate(x, y, z); pos.push(...n.attributes.position.array); nor.push(...n.attributes.normal.array); n.dispose(); g.dispose(); }); const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return out; }
  ringInst(geo, mat, rp, count, place) { const m = new THREE.InstancedMesh(geo, mat, count), d = new THREE.Object3D(); for (let i = 0; i < count; i++) { const p = this.atLen(rp, i * rp.len / count); place(d, p, i); d.updateMatrix(); m.setMatrixAt(i, d.matrix); } return m; }

  // ---------- init ----------
  init() {
    const T = THREE, mode = this.mode();
    let r = null, lastErr = null; for (const o of [{ antialias: true }, { antialias: false }, { antialias: false, failIfMajorPerformanceCaveat: false, powerPreference: 'low-power' }]) { try { r = new T.WebGLRenderer(Object.assign({ canvas: this.canvas, alpha: mode === 'hero' }, o)); break; } catch (e) { lastErr = e; } }
    if (!r) { this.startFallback(); return; } if (mode === 'hero') r.setClearColor(0x000000, 0);
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.outputEncoding = T.sRGBEncoding; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.8;
    r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
    this.r = r; this.cam = new T.PerspectiveCamera(45, 1, 0.3, 2500); this.ray = new T.Raycaster(); this.mouse = new T.Vector2(); this.clock = new T.Clock();
    this.buildScene();
    const resize = () => { const w = this.canvas.clientWidth || (this.canvas.parentElement && this.canvas.parentElement.clientWidth) || 800, h = this.canvas.clientHeight || (this.canvas.parentElement && this.canvas.parentElement.clientHeight) || 500; r.setSize(w, h, false); this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.W = w; this.H = h; };
    resize(); this.ro = new ResizeObserver(resize); this.ro.observe(this.canvas);
    this.vis = true; this.io = new IntersectionObserver((es) => { this.vis = es[0].isIntersecting; }); this.io.observe(this.canvas);
    this.bindPointer();
    if (mode === 'pov') this.goSeat(true);
    const loop = () => { if (!this.alive) return; this.raf = requestAnimationFrame(loop); if (this.vis) this.frame(); };
    loop(); this.setState({ loading: false });
    if (document.fonts && document.fonts.load) document.fonts.load('800 52px Archivo').then(() => { if (this.alive && this.state.step === 'overview') { this.buildScene(true); if (this.mode() === 'pov') { this.selSet = null; this.goSeat(true); } } });
  }

  buildScene(keepCam) {
    const T = THREE, V = this.V()[this.venueKey()], mode = this.mode(), open = V.open && mode !== 'table';
    if (this.scene) this.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
    const S = new T.Scene(); this.scene = S; this.vd = V;
    let seed = 4242; this.rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const root = new T.Group(); S.add(root); this.root = root;

    if (mode === 'table') { S.background = new T.Color('#2B2620'); }
    else if (mode === 'hero') { S.background = null; }
    else { S.background = new T.Color('#040507'); S.fog = new T.Fog('#040507', V.open ? 300 : 150, V.open ? 900 : 420); }
    S.add(new T.HemisphereLight('#C9D6FF', '#1A1410', open ? 0.32 : 0.62));
    const sun = new T.DirectionalLight('#FFFFFF', 0.85); sun.position.set(-30, 160, 60); S.add(sun); S.add(sun.target);
    const fill = new T.DirectionalLight('#7FA0FF', 0.3); fill.position.set(60, 40, -80); S.add(fill);
    const warmL = new T.PointLight('#FF9A55', 0.5, 0, 2); warmL.position.set(0, 14, 0); S.add(warmL);
    if (!open) { const key = new T.DirectionalLight('#FFF4E6', 0.55); key.position.set(0, 120, 0); S.add(key); S.add(key.target); }
    const M = {
      concrete: new T.MeshStandardMaterial({ color: '#16181D', roughness: 0.9 }),
      concreteL: new T.MeshStandardMaterial({ color: '#2B3038', roughness: 0.8 }),
      courtChair: new T.MeshStandardMaterial({ color: '#C8562A', roughness: 0.5 }),
      seat: new T.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.55, metalness: 0.0 }),
      woodD: new T.MeshStandardMaterial({ color: '#5E2A12', roughness: 0.6 }),
      warm: new T.MeshStandardMaterial({ color: '#B4562A', emissive: '#5A2208', emissiveIntensity: 0.5, roughness: 0.45, side: T.DoubleSide }),
      orange: new T.MeshStandardMaterial({ color: '#D9773F', roughness: 0.35 }),
      glass: new T.MeshStandardMaterial({ color: '#9FC2FF', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.18, side: T.DoubleSide }),
      dark: new T.MeshStandardMaterial({ color: '#0B0C10', roughness: 0.9, side: T.DoubleSide }),
      white: new T.MeshStandardMaterial({ color: '#C9CED6', roughness: 0.5, side: T.DoubleSide }),
      membrane: new T.MeshStandardMaterial({ color: '#1C1F25', roughness: 0.6, side: T.DoubleSide })
    };
    const n = V.n, a0 = V.a0, b0 = V.b0, cast = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
    this.seats = []; this.tierMeshes = []; this.aisles = []; this.tiers = []; this.suite = null;
    let off = 0, base = open ? 1.1 : 0.35, prevEnd = 0, prevTop = 0;
    V.tiers.forEach((tr, ti) => {
      if (ti > 0) {
        const lv = V.levels[ti - 1], sOff = prevEnd, sH = prevTop; off = prevEnd + lv.gap; base = prevTop + lv.lift;
        root.add(cast(this.band(a0, b0, n, sOff, sH, sOff + lv.gap, sH, lv.kind === 'suite' ? M.woodD : M.concrete)));
        root.add(this.strip(a0 + sOff, b0 + sOff, n, sH - 0.25, sH + 0.95, this.ledMat(ti === 1 ? V.led1 : V.led2), 34));
        root.add(this.strip(a0 + off, b0 + off, n, base - 0.95, base, this.ledMat(V.led2), 36));
        if (lv.kind === 'suite') {
          root.add(this.strip(a0 + off, b0 + off, n, sH, base - 0.95, M.warm));
          root.add(this.strip(a0 + sOff + 0.35, b0 + sOff + 0.35, n, sH + 0.95, base - 1.0, M.glass));
          root.add(cast(this.band(a0, b0, n, sOff, base - 0.96, off, base - 0.96, M.dark)));
          const srp = this.ringPoly(a0 + sOff + 2.2, b0 + sOff + 2.2, n, 900), parts = Math.floor(srp.len / 7.5);
          root.add(this.ringInst(new T.BoxGeometry(0.15, lv.lift - 0.95, lv.gap), M.white, srp, parts, (d, p) => { d.position.set(p.x, sH + (lv.lift - 0.95) / 2, p.z); d.rotation.set(0, Math.atan2(p.nx, p.nz), 0); }));
          const chairs = []; [1.4, 2.5].forEach((o, k) => { const rp = this.ringPoly(a0 + sOff + o, b0 + sOff + o, n, 900); for (let L = 0.6; L < rp.len; L += 0.72) { if ((L % (rp.len / parts)) < 0.7) continue; const p = this.atLen(rp, L); chairs.push({ x: p.x, z: p.z, h: sH + k * 0.25, nx: p.nx, nz: p.nz }); } });
          this.addChairs(root, chairs, M.orange, 1.15);
          this.suite = { off: sOff, H: sH, parts, rp: this.ringPoly(a0 + sOff + 1.4, b0 + sOff + 1.4, n, 900) };
        }
      } else {
        root.add(cast(this.strip(a0, b0, n, 0, base, M.dark)));
      }
      const t0off = off, pos = [], idx = [], N = 260;
      const sold = new Set(); for (let s = 0; s < tr.secs; s++) if (this.rnd() < 0.09) sold.add(s);
      for (let r = 0; r < tr.rows; r++) {
        const o = off + r * tr.d, h = base + r * tr.rise, vi = pos.length / 3;
        for (let i = 0; i <= N; i++) {
          const t = -Math.PI / 2 + i / N * Math.PI * 2, p = this.sePt(a0 + o, b0 + o, n, t), q = this.sePt(a0 + o + tr.d, b0 + o + tr.d, n, t);
          pos.push(p.x, h, p.z, q.x, h, q.z, q.x, h + tr.rise, q.z);
          if (i) { const k = vi + i * 3, j = k - 3; idx.push(j, j + 1, k, j + 1, k + 1, k, j + 1, j + 2, k + 1, j + 2, k + 2, k + 1); }
        }
        const rp = this.ringPoly(a0 + o + tr.d * 0.5, b0 + o + tr.d * 0.5, n, 1200), secLen = rp.len / tr.secs;
        for (let s = 0; s < tr.secs; s++) {
          const ap = this.atLen(rp, s * secLen + 0.55); this.aisles.push({ x: ap.x, z: ap.z, h: h + 0.02, nx: ap.nx, nz: ap.nz, d: tr.d });
          const stand = Math.floor((((s + 0.5) / tr.secs + 0.125) % 1) * 4);
          let L = s * secLen + 1.15 + V.spacing / 2, num = 1;
          while (L < (s + 1) * secLen - V.spacing / 2) { const p = this.atLen(rp, L);
            this.seats.push({ ti, sec: s, row: r, num: num++, x: p.x, z: p.z, h, nx: p.nx, nz: p.nz, stand, taken: sold.has(s) || this.rnd() < V.soldRate[ti], female: this.rnd() < 0.5, alt: !!V.alt && this.rnd() < 0.13 });
            L += V.spacing; }
        }
      }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      const tm = cast(new T.Mesh(g, M.concrete)); tm.userData.ti = ti; root.add(tm); this.tierMeshes.push(tm);
      const end = off + tr.rows * tr.d, top = base + tr.rows * tr.rise;
      this.tiers.push({ off: t0off, end, base, top, secs: tr.secs, rp0: this.ringPoly(a0 + t0off + tr.d * 0.5, b0 + t0off + tr.d * 0.5, n, 900), cfg: tr });
      prevEnd = end; prevTop = top;
    });
    const outer = this.tiers[this.tiers.length - 1], OE = outer.end, OT = outer.top;
    this.R = Math.max(a0, b0) + OE; this.OT = OT;
    const am = new T.InstancedMesh(new T.BoxGeometry(1.0, 0.05, 1), M.concreteL, this.aisles.length), dm = new T.Object3D();
    this.aisles.forEach((a, i) => { dm.position.set(a.x, a.h, a.z); dm.rotation.set(0, Math.atan2(a.nx, a.nz), 0); dm.scale.set(1, 1, a.d); dm.updateMatrix(); am.setMatrixAt(i, dm.matrix); }); am.receiveShadow = true; root.add(am);
    this.seatMeshes = this.addChairs(root, this.seats, M.seat, 1, true);
    this.seatMeshes.forEach((m) => { m.receiveShadow = true; });
    const mine = this.props.taken ? this.props.taken(this.ev().id) : null; if (mine) this.seats.forEach((s) => { if (mine.has(s.ti + '-' + s.sec + '-' + s.row + '-' + s.num)) { s.taken = true; s.mine = true; } });
    if (!this.fb) this.buildCrowd(root, { x: 1e5, z: 1e5 }, 1); this.indexBlocks(); this.computeSun(); this.paintSeats(); // low-poly fans everywhere; detailed ones only around the seat you sit in
    if (V.ground === 'court') this.buildCourt(root, M, V); else this.buildCricket(root, M, V);
    if (open) {
      root.add(cast(this.strip(a0 + OE, b0 + OE, n, 0, OT + 1.2, M.white)));
      const frp = this.ringPoly(a0 + OE + 0.6, b0 + OE + 0.6, n, 900), ribs = Math.floor(frp.len / 6);
      root.add(cast(this.ringInst(new T.BoxGeometry(0.5, OT + 9, 0.9), M.white, frp, ribs, (d, p) => { d.position.set(p.x, (OT + 9) / 2, p.z); d.rotation.set(0, Math.atan2(p.nx, p.nz), 0); })));
      const roofIn = OE - 12;
      root.add(cast(this.band(a0, b0, n, OE + 1.5, OT + 9, roofIn, OT + 6.5, M.membrane)));
      root.add(cast(this.strip(a0 + roofIn, b0 + roofIn, n, OT + 5.9, OT + 6.6, M.dark)));
      const rrp = this.ringPoly(a0 + (OE + roofIn) / 2, b0 + (OE + roofIn) / 2, n, 900), rr = Math.floor(rrp.len / 6);
      root.add(cast(this.ringInst(new T.BoxGeometry(0.35, 0.9, OE - roofIn + 1.5), M.white, rrp, rr, (d, p) => { d.position.set(p.x, OT + 7.2, p.z); d.rotation.set(0, Math.atan2(p.nx, p.nz), 0); })));
      this.buildPark(root, OE, M);
    } else if (mode !== 'table' || true) {
      root.add(this.strip(a0 + OE, b0 + OE, n, OT, OT + 5, M.dark));
      if (!V.open) { const roofY = OT + 7, ceil = new T.MeshStandardMaterial({ color: '#0E1015', roughness: 0.95, side: T.BackSide }), truss = new T.MeshStandardMaterial({ color: '#2A2F38', roughness: 0.6, metalness: 0.4 });
        root.add(this.band(a0, b0, n, OE, OT + 5, -10, roofY + 6, ceil));
        [OE - 8, OE - 22].forEach((o, k) => root.add(this.strip(a0 + o, b0 + o, n, roofY + 2.2 + k * 1.2, roofY + 2.6 + k * 1.2, truss)));
        const lrp = this.ringPoly(a0 + OE - 15, b0 + OE - 15, n, 900), bulb = new T.MeshBasicMaterial({ color: '#FFF3DC', toneMapped: false });
        root.add(this.ringInst(new T.BoxGeometry(0.9, 0.25, 0.9), bulb, lrp, 56, (d, p) => { d.position.set(p.x, roofY + 1.9, p.z); d.rotation.set(0, Math.atan2(p.nx, p.nz), 0); }));
        const spot = new T.PointLight('#FFF1DC', 0.7, 0, 2); spot.position.set(0, roofY, 0); S.add(spot); }
    }
    if (mode === 'table') this.buildTable(S);
    if (!keepCam) this.resetView();
  }

  buildPark(root, OE, M) {
    const T = THREE, R = this.R, V = this.vd;
    const grass = this.tex(1024, 1024, (g, w, h) => { g.fillStyle = '#0A0C0F'; g.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { const v = Math.random(); g.fillStyle = v < 0.5 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)'; const s = 4 + Math.random() * 26; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, s, 0, 7); g.fill(); } });
    grass.wrapS = grass.wrapT = T.RepeatWrapping; grass.repeat.set(14, 14);
    const gp = new T.Mesh(new T.PlaneGeometry(R * 9, R * 9), new T.MeshStandardMaterial({ map: grass, roughness: 1 })); gp.rotation.x = -Math.PI / 2; gp.position.y = -0.4; gp.receiveShadow = true; root.add(gp);
    const pathMat = new T.MeshStandardMaterial({ color: '#15171B', roughness: 0.95 });
    const plaza = this.band(V.a0, V.b0, V.n, OE, 0.02, OE + 14, 0.02, pathMat); plaza.receiveShadow = true; root.add(plaza);
    const path = this.band(V.a0, V.b0, V.n, OE + 38, 0.03, OE + 42, 0.03, pathMat); path.receiveShadow = true; root.add(path);
    const spokes = [0, 1, 2, 3, 4, 5].map((k) => k / 6 * Math.PI * 2 + 0.3);
    spokes.forEach((a) => { const len = R * 2.6; const pm = new T.Mesh(new T.PlaneGeometry(5, len), pathMat); pm.rotation.set(-Math.PI / 2, 0, Math.PI / 2 - a); pm.position.set(Math.cos(a) * (R + len / 2), 0.03, Math.sin(a) * (R + len / 2)); pm.receiveShadow = true; root.add(pm); });
    const trunk = new T.CylinderGeometry(0.25, 0.35, 3, 6); trunk.translate(0, 1.5, 0);
    const crown = new T.IcosahedronGeometry(2.6, 1); crown.translate(0, 4.6, 0);
    const pts = []; let tries = 0;
    while (pts.length < 520 && tries < 8000) { tries++; const a = this.rnd() * Math.PI * 2, d = R + 18 + this.rnd() * R * 2.2; const x = Math.cos(a) * d, z = Math.sin(a) * d * 0.9;
      const ring = Math.hypot(x / (V.a0 + OE + 40), z / (V.b0 + OE + 40)); if (Math.abs(ring - 1) < 0.04) continue;
      const pa = Math.atan2(z, x); let onPath = false; spokes.forEach((s) => { let da = Math.abs(pa - s); if (da > Math.PI) da = 2 * Math.PI - da; if (da * Math.hypot(x, z) < 6) onPath = true; }); if (onPath) continue; pts.push([x, z, 0.7 + this.rnd() * 0.8]); }
    const tm = new T.InstancedMesh(trunk, new T.MeshStandardMaterial({ color: '#141210', roughness: 1 }), pts.length), cm = new T.InstancedMesh(crown, new T.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.95, flatShading: true }), pts.length), d = new T.Object3D(), c = new T.Color();
    pts.forEach(([x, z, s], i) => { d.position.set(x, 0, z); d.scale.set(s, s * (0.9 + this.rnd() * 0.4), s); d.rotation.set(0, this.rnd() * 6, 0); d.updateMatrix(); tm.setMatrixAt(i, d.matrix); cm.setMatrixAt(i, d.matrix); c.setHSL(0.3, 0.3, 0.05 + this.rnd() * 0.03); cm.setColorAt(i, c); });
    tm.castShadow = cm.castShadow = true; root.add(tm); root.add(cm);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => { const x = sx * (V.a0 + OE + 8) * 0.74, z = sz * (V.b0 + OE + 8) * 0.74, H = this.OT + 30;
      const mast = new T.Mesh(new T.CylinderGeometry(0.6, 1.0, H, 8), M.white); mast.position.set(x, H / 2, z); mast.castShadow = true; root.add(mast);
      const head = new T.Mesh(new T.BoxGeometry(8, 4, 1), [M.white, M.white, M.white, M.white, new T.MeshBasicMaterial({ color: '#FFF6E0', toneMapped: false }), M.white]); head.position.set(x, H + 1, z); head.lookAt(0, 0, 0); root.add(head); });
  }

  addChairs(root, list, mat, scale, record) {
    const T = THREE, s = scale || 1;
    const pan = new T.BoxGeometry(0.46 * s, 0.08, 0.42 * s); pan.translate(0, 0.42, 0.03);
    const back = new T.BoxGeometry(0.46 * s, 0.52 * s, 0.07); back.translate(0, 0.42 + 0.3 * s, -0.19 * s);
    const a = new T.InstancedMesh(pan, mat, list.length), b = new T.InstancedMesh(back, mat, list.length), d = new T.Object3D();
    list.forEach((p, i) => { d.position.set(p.x, p.h, p.z); d.rotation.set(0, Math.atan2(-p.nx, -p.nz), 0); d.updateMatrix(); a.setMatrixAt(i, d.matrix); b.setMatrixAt(i, d.matrix); });
    root.add(a); root.add(b); return record ? [a, b] : null;
  }
  figure(female) {
    const T = THREE, sh = female ? 0.15 : 0.18, w = female ? 0.3 : 0.36;
    const leg = (x) => [[new T.CylinderGeometry(0.075, 0.07, 0.44, 5).rotateX(Math.PI / 2), x, 0.52, 0.1], [new T.CylinderGeometry(0.06, 0.055, 0.42, 5), x, 0.3, 0.33], [new T.BoxGeometry(0.1, 0.07, 0.2), x, 0.08, 0.38]];
    const pants = this.merge([...leg(-w / 4), ...leg(w / 4)]);
    const torso = new T.CylinderGeometry(sh * 0.92, female ? 0.15 : 0.16, 0.54, 8); torso.scale(1, 1, 0.72);
    const arm = (x) => [[new T.CylinderGeometry(0.05, 0.045, 0.3, 5), x, 0.92, -0.04], [new T.CylinderGeometry(0.045, 0.04, 0.28, 5).rotateX(-1.2), x, 0.72, 0.08]];
    const shirt = this.merge([[torso, 0, 0.88, -0.09], [new T.SphereGeometry(sh * 0.95, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 0.75), 0, 1.15, -0.09], ...arm(-(sh + 0.03)), ...arm(sh + 0.03)]);
    const skin = this.merge([[new T.CylinderGeometry(0.045, 0.05, 0.09, 5), 0, 1.21, -0.08], [new T.SphereGeometry(0.1, 9, 7).scale(0.92, 1.08, 1), 0, 1.33, -0.07], [new T.SphereGeometry(0.04, 4, 2), -(sh + 0.02), 0.62, 0.2], [new T.SphereGeometry(0.04, 4, 2), sh + 0.02, 0.62, 0.2]]);
    const hair = female ? this.merge([[new T.SphereGeometry(0.112, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.62), 0, 1.34, -0.08], [new T.CylinderGeometry(0.1, 0.085, 0.28, 6, 1, true, Math.PI * 0.15, Math.PI * 1.7).rotateY(Math.PI), 0, 1.22, -0.1]])
      : this.merge([[new T.SphereGeometry(0.106, 9, 3, 0, Math.PI * 2, 0, Math.PI * 0.42), 0, 1.345, -0.075]]);
    return { pants, shirt, skin, hair };
  }
  figureLow(female) {
    const T = THREE, sh = female ? 0.15 : 0.18, w = female ? 0.3 : 0.36;
    return { pants: this.merge([[new T.BoxGeometry(w, 0.14, 0.44), 0, 0.52, 0.1], [new T.BoxGeometry(w - 0.06, 0.42, 0.12), 0, 0.3, 0.33]]),
      shirt: this.merge([[new T.BoxGeometry(sh * 2, 0.56, sh * 1.3), 0, 0.88, -0.09], [new T.BoxGeometry(sh * 2 + 0.16, 0.3, 0.1), 0, 0.9, -0.04]]),
      skin: this.merge([[new T.IcosahedronGeometry(0.105, 0), 0, 1.32, -0.07]]),
      hair: this.merge([[new T.BoxGeometry(0.19, female ? 0.26 : 0.07, 0.17), 0, female ? 1.3 : 1.41, -0.1]]) };
  }
  buildCrowd(root, near, nearR) {
    const T = THREE, d = new T.Object3D(), c = new T.Color(), mat = new T.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.7, side: T.DoubleSide }), matS = new T.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.5 });
    const jers = ['#1D4ED8', '#1E3A8A', '#F2F4F7', '#1D4ED8', '#E8743B', '#0F172A', '#2563EB', '#6B7280', '#334155', '#B91C1C'], pantsC = ['#1F2937', '#111827', '#273449', '#3B3F46', '#2B2620'], skinC = ['#E0AC8A', '#C68B66', '#A86F4C', '#8A5638', '#D49B78', '#B97E5B'], hairC = ['#120D0A', '#1C130E', '#2A1C14', '#0B0B0C', '#3A2A1F'];
    (this.crowd || []).forEach((m) => { root.remove(m); m.geometry.dispose(); });
    this.crowdLists = []; this.crowd = []; let k = 0; const pick = (a, s) => a[(s.num * 7 + s.row * 13 + s.sec * 3 + k) % a.length];
    const isNear = (s) => !near || Math.hypot(s.x - near.x, s.z - near.z) < nearR;
    [false, true].forEach((fem) => [true, false].forEach((detail) => { const list = this.seats.filter((s) => s.taken && s.female === fem && (near ? isNear(s) === detail : detail)); if (!list.length) return; const f = detail ? this.figure(fem) : this.figureLow(fem);
      [['shirt', jers, mat], ['pants', pantsC, mat], ['skin', skinC, matS], ['hair', hairC, mat]].forEach(([part, pal, mt], pi) => { const m = new T.InstancedMesh(f[part], mt, list.length);
        list.forEach((s, i) => { d.position.set(s.x, s.h, s.z); d.rotation.set(0, Math.atan2(-s.nx, -s.nz), 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); k = pi * 5; c.set(pick(pal, s)); m.setColorAt(i, c); });
        m.receiveShadow = true; m.visible = this.state.showCrowd !== false; root.add(m); this.crowd.push(m); this.crowdLists.push(list); }); }));
  }
  indexBlocks() {
    const B = {}, St = [0, 1, 2, 3].map(() => ({ free: 0, total: 0, x: 0, y: 0, z: 0, min: 1e12, blocks: 0 }));
    this.seats.forEach((s) => { const k = s.ti + '-' + s.sec; let b = B[k]; if (!b) { b = B[k] = { ti: s.ti, sec: s.sec, stand: s.stand, free: 0, total: 0, x: 0, y: 0, z: 0 }; St[s.stand].blocks++; }
      b.total++; b.x += s.x; b.y += s.h; b.z += s.z; if (!s.taken) b.free++; const st = St[s.stand]; st.total++; st.x += s.x; st.y += s.h; st.z += s.z; if (!s.taken) st.free++; });
    Object.values(B).forEach((b) => { b.c = new THREE.Vector3(b.x / b.total, b.y / b.total, b.z / b.total); b.num = String((b.ti + 1) * 100 + b.sec + 1); b.price = this.priceOf(b.ti, b.stand); const st = St[b.stand]; if (b.free && b.price < st.min) st.min = b.price; });
    St.forEach((st, i) => { st.c = new THREE.Vector3(st.x / st.total, st.y / st.total, st.z / st.total); st.name = this.STANDS()[i]; });
    this.blocks = B; this.standsInfo = St;
  }
  sunAt(utc) {
    // simple solar position for Hyderabad (25.40N, 68.37E); scene north is -z, east is +x
    const [Y, M, D, H] = utc, d0 = Date.UTC(Y, 0, 0), n = Math.floor((Date.UTC(Y, M, D) - d0) / 864e5), rad = Math.PI / 180, lat = 25.40 * rad;
    const decl = -23.44 * Math.cos(2 * Math.PI / 365 * (n + 10)) * rad, solar = H + 68.37 / 15, ha = (solar - 12) * 15 * rad;
    const el = Math.asin(Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha));
    const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) + Math.PI;
    return { el, az, d: new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)) };
  }
  computeSun() {
    const E = this.ev(), V = this.vd, out = this.tiers[this.tiers.length - 1], OE = out.end, OT = out.top, roofIn = OE - 12, avg = (V.a0 + V.b0) / 2;
    const offOf = (x, z) => (Math.pow(Math.pow(Math.abs(x / V.a0), V.n) + Math.pow(Math.abs(z / V.b0), V.n), 1 / V.n) - 1) * avg;
    const shaded = (s, d) => { if (d.y <= 0.02) return true; const py = s.h + 1.0;
      for (let t = 1; t < 140; t += 1.5) { const x = s.x + d.x * t, y = py + d.y * t, z = s.z + d.z * t, o = offOf(x, z);
        if (o > roofIn && o < OE + 1.5) { const roofY = OT + 6.5 + (o - roofIn) / (OE + 1.5 - roofIn) * 2.5; if (y < roofY + 0.4 && y > roofY - 4) return true; }
        if (o >= OE && o < OE + 1.5 && y < OT + 9) return true; if (y > OT + 12) return false; }
      return false; };
    const s0 = this.sunAt(E.utc), u = E.utc.slice(); u[3] += 2.5; const s1 = this.sunAt(u);
    if (!V.open) { s0.el = -1; s1.el = -1; }
    this.sun = { day: s0.el > 0.05, el0: s0.el, az0: s0.az, d0: s0.d, d1: s1.d, day1: s1.el > 0.05 };
    Object.values(this.blocks).forEach((b) => { b.shade0 = 0; b.shade1 = 0; b.n = 0; });
    this.seats.forEach((s) => { const b = this.blocks[s.ti + '-' + s.sec]; s.sh0 = this.sun.day ? shaded(s, s0.d) : true; s.sh1 = this.sun.day1 ? shaded(s, s1.d) : true; b.n++; if (s.sh0) b.shade0++; if (s.sh1) b.shade1++; });
    Object.values(this.blocks).forEach((b) => { b.shadeStart = Math.round(b.shade0 / b.n * 100); b.shadeLater = Math.round(b.shade1 / b.n * 100); });
    // amenities on the outer concourse, one set per stand
    const plaza = this.ringPoly(V.a0 + OE + 7, V.b0 + OE + 7, V.n, 900), am = [];
    const kinds = [['Gate', 'G'], ['Washrooms', 'WC'], ['Food court', 'F'], ['Prayer area', 'P'], ['First aid', '+'], ['Washrooms', 'WC'], ['Food court', 'F'], ['Family zone', 'FZ']];
    for (let i = 0; i < 16; i++) { const p = this.atLen(plaza, (i / 16 + 0.0) * plaza.len); const k = i % 4 === 0 ? kinds[0] : kinds[1 + ((i >> 0) % 7)];
      const st = Math.floor((((i / 16) + 0.125) % 1) * 4); am.push({ name: k[0] === 'Gate' ? 'Gate ' + 'NESW'[st] + (1 + Math.floor(i / 4) % 2) : k[0], code: k[1], x: p.x, z: p.z, gate: k[0] === 'Gate' }); }
    const pk = this.ringPoly(V.a0 + OE + 48, V.b0 + OE + 48, V.n, 300); [0.15, 0.62].forEach((f, j) => { const p = this.atLen(pk, f * pk.len); am.push({ name: 'Parking ' + 'AB'[j], code: 'P', x: p.x, z: p.z, park: true }); });
    this.amen = am;
  }
  seatFacts(s) {
    const V = this.vd, b = this.blocks[s.ti + '-' + s.sec], rowSeats = this.seats.filter((q) => q.ti === s.ti && q.sec === s.sec && q.row === s.row), maxN = Math.max(...rowSeats.map((q) => q.num));
    const near = (pred) => { let best = 1e9; this.amen.forEach((a) => { if (pred(a)) best = Math.min(best, Math.hypot(a.x - s.x, a.z - s.z)); }); return best; };
    const gateM = near((a) => a.gate) + (this.tiers[s.ti].off + s.row * this.tiers[s.ti].cfg.d) * 0.6 + s.ti * 25, wc = near((a) => a.code === 'WC'), food = near((a) => a.code === 'F');
    const ends = s.stand === 0 || s.stand === 2;
    return { shade: !V.open ? 'Indoor · air-conditioned' : !this.sun.day ? 'Night match · floodlit' : (s.sh0 ? 'In shade at the start' : 'In the sun at the start') + (this.sun.day1 ? (s.sh1 ? ', shade later' : ', sun later') : ''),
      view: V.open ? (ends ? 'Behind the bowler\'s arm' : 'Square of the wicket') : (ends ? 'Behind the hoop' : 'Sideline view'), walk: 'Gate ' + 'NESW'[s.stand] + (1 + (s.sec % 2)) + ' · about ' + Math.max(1, Math.round(gateM / 70)) + ' min walk',
      wc: 'Washrooms ' + Math.round(wc) + ' m', food: 'Food ' + Math.round(food) + ' m', aisle: s.num === 1 || s.num === maxN, sun0: !!this.sun.day && !s.sh0 };
  }
  paintSeats() {
    if (!this.seatMeshes) return;
    const T = THREE, c = new T.Color(), V = this.vd, step = this.state.step, hs = this.hoverStand, hb = this.hoverBlock, cs = this.curStand, cb = this.curBlock, hov = this.hoverSeat, sel = this.selSet;
    this.seats.forEach((s, i) => {
      let col = s.mine ? '#35C47A' : s.taken ? V.sold : (s.alt ? V.alt : V.seat), dim = false;
      if (sel && sel.has(i)) col = '#FFC845';
      else if (step === 'overview') { if (hb && s.ti === hb.ti && s.sec === hb.sec && !s.taken) col = '#6FA8FF'; }
      else if (step === 'stand') { if (s.stand !== cs) dim = true; else if (hb && s.ti === hb.ti && s.sec === hb.sec && !s.taken) col = '#6FA8FF'; }
      else if (step === 'block') { const inB = cb && s.ti === cb.ti && s.sec === cb.sec; if (!inB) dim = true; else if (i === hov) col = '#FFE29A'; }
      const bb = this.blocks[s.ti + '-' + s.sec];
      if (!dim && this.state.priceMax && (step === 'overview' || step === 'stand') && bb.price > this.state.priceMax) dim = true;
      if (!dim && this.state.wantShade && this.sun && this.sun.day && (step === 'overview' || step === 'stand') && bb.shadeStart < 50) dim = true;
      if (this.state.sunLayer && this.sun && this.sun.day && !s.taken && !(sel && sel.has(i)) && col !== '#8FC0FF' && col !== '#6FA8FF') col = s.sh0 ? '#3D7BFF' : '#F2A541';
      c.set(col); if (dim) c.multiplyScalar(0.3); this.seatMeshes[0].setColorAt(i, c); this.seatMeshes[1].setColorAt(i, c);
    });
    this.seatMeshes.forEach((m) => { if (m.instanceColor) m.instanceColor.needsUpdate = true; });
  }

  buildCourt(root, M, V) {
    const T = THREE;
    const floor = new T.Mesh(new T.PlaneGeometry(V.a0 * 2.4, V.b0 * 2.4), new T.MeshStandardMaterial({ color: '#0C0E12', roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; root.add(floor);
    const ct = this.tex(1400, 750, (g, w, h) => { g.fillStyle = '#1B2747'; g.fillRect(0, 0, w, h); const m = 50, cw = w - m * 2, ch = h - m * 2;
      for (let i = 0; i < 60; i++) { g.fillStyle = i % 2 ? '#D3A26B' : '#CB9960'; g.fillRect(m, m + i * ch / 60, cw, ch / 60 + 1); }
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 5; g.strokeRect(m, m, cw, ch); g.beginPath(); g.moveTo(w / 2, m); g.lineTo(w / 2, h - m); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, 90, 0, Math.PI * 2); g.stroke();
      [m, w - m].forEach((x, k) => { const dir = k ? -1 : 1; g.fillStyle = '#22366A'; g.fillRect(k ? x - 290 : x, h / 2 - 120, 290, 240); g.strokeRect(k ? x - 290 : x, h / 2 - 120, 290, 240); g.beginPath(); g.arc(x + dir * 290, h / 2, 90, -Math.PI / 2, Math.PI / 2, k === 1); g.stroke(); g.beginPath(); if (k) g.arc(x - 60, h / 2, 330, Math.PI / 2 * 1.08, Math.PI * 1.46); else g.arc(x + 60, h / 2, 330, -Math.PI / 2 * 0.92, Math.PI / 2 * 0.92); g.stroke(); });
      g.fillStyle = 'rgba(20,30,60,0.75)'; g.font = '800 64px Archivo, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SEA HAWKS', w / 2, h / 2); });
    const court = new T.Mesh(new T.PlaneGeometry(30.5, 16.3), new T.MeshStandardMaterial({ map: ct, roughness: 0.35 })); court.rotation.x = -Math.PI / 2; court.position.y = 0.01; root.add(court);
    root.add(this.strip(16.4, 10.4, 6, 0, 0.9, this.ledMat(V.board), 26));
    const cs = []; [-1, 1].forEach((sg) => { [0, 1].forEach((r) => { for (let i = 0; i < 26; i++) cs.push({ x: -13 + i * 1.04, z: sg * (9.2 + r * 0.7), h: r * 0.2, nx: 0, nz: sg }); }); });
    this.addChairs(root, cs, M.courtChair, 1);
    [-1, 1].forEach((sg) => { const pole = new T.Mesh(new T.BoxGeometry(0.25, 3.4, 0.25), M.dark); pole.position.set(sg * 15.6, 1.7, 0); root.add(pole);
      const bb = new T.Mesh(new T.BoxGeometry(0.06, 1.05, 1.8), new T.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.55 })); bb.position.set(sg * 14.4, 3.4, 0); root.add(bb);
      const rim = new T.Mesh(new T.TorusGeometry(0.23, 0.02, 8, 24), new T.MeshStandardMaterial({ color: '#F06A2A' })); rim.rotation.x = Math.PI / 2; rim.position.set(sg * 14.1, 3.05, 0); root.add(rim); });
    this.addJumbo(root, V, 20); this.focus = new T.Vector3(0, 1, 0);
  }
  buildCricket(root, M, V) {
    const T = THREE, ra = V.a0 - 0.3, rb = V.b0 - 0.3;
    const gt = this.tex(2048, 1800, (g, w, h) => { g.fillStyle = '#2F6B33'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 30; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'; g.fillRect(i * w / 30, 0, w / 30, h); }
      g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 5; g.setLineDash([22, 16]); g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.27, h * 0.29, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#4A8443'; g.beginPath(); g.ellipse(w / 2, h / 2, 120, 260, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#CDB27E'; g.fillRect(w / 2 - 26, h / 2 - 170, 52, 340); g.fillStyle = '#FFFFFF'; [-140, 140].forEach((y) => g.fillRect(w / 2 - 34, h / 2 + y, 68, 4));
      g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 7; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 50, h / 2 - 50, 0, 0, Math.PI * 2); g.stroke(); });
    const grd = new T.Mesh(new T.CircleGeometry(1, 160), new T.MeshStandardMaterial({ map: gt, roughness: 0.95 })); grd.scale.set(ra, rb, 1); grd.rotation.x = -Math.PI / 2; grd.position.y = 0.05; grd.receiveShadow = true; root.add(grd);
    root.add(this.strip(ra - 2.4, rb - 2.4, 2, 0, 0.8, this.ledMat(V.board), 30));
    [-1, 1].forEach((sg) => { for (let k = 0; k < 3; k++) { const m = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.72, 6), M.white); m.position.set(-0.12 + k * 0.12, 0.36, sg * 10); root.add(m); } });
    this.focus = new T.Vector3(0, 1, 0);
  }
  addJumbo(root, V, y) {
    const T = THREE;
    const jt = this.tex(1024, 512, (g, w, h) => { g.fillStyle = '#070A12'; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 120px Archivo, Arial Black, sans-serif'; g.fillStyle = '#FFFFFF'; g.fillText(V.jumbo[0], w / 2, h * 0.42); g.font = '700 70px Archivo, Arial Black, sans-serif'; g.fillStyle = '#E8743B'; g.fillText(V.jumbo[1], w / 2, h * 0.72); });
    const scr = new T.MeshBasicMaterial({ map: jt, toneMapped: false }), side = new T.MeshStandardMaterial({ color: '#2A2B2F', roughness: 0.6 });
    const box = new T.Mesh(new T.BoxGeometry(7, 4, 7), [scr, scr, side, side, scr, scr]); box.position.set(0, y + 10, 0); root.add(box);
  }
  buildTable(S) {
    const T = THREE, sc = 0.9 / this.R;
    this.root.scale.set(sc, sc, sc); this.root.position.set(0, 0.76, 0);
    const wood = this.tex(1024, 512, (g, w, h) => { g.fillStyle = '#7A5A3E'; g.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { g.strokeStyle = 'rgba(40,24,12,' + (0.05 + Math.random() * 0.12) + ')'; g.lineWidth = 1 + Math.random() * 3; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 10, w * 0.6, y - 10, w, y + 4); g.stroke(); } });
    const table = new T.Mesh(new T.BoxGeometry(3.4, 0.06, 2.2), new T.MeshStandardMaterial({ map: wood, roughness: 0.6 })); table.position.set(0, 0.73, 0.2); table.receiveShadow = true; S.add(table);
    const floor = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshStandardMaterial({ color: '#2B241E', roughness: 1 })); floor.rotation.x = -Math.PI / 2; S.add(floor);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 8), new T.MeshStandardMaterial({ color: '#3D3730', roughness: 1 })); wall.position.set(0, 4, -3); S.add(wall);
    const ring = new T.Mesh(new T.RingGeometry(1.0, 1.02, 96), new T.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.55 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.765; S.add(ring);
    const lamp = new T.DirectionalLight('#FFE7C9', 1.4); lamp.position.set(2, 4, 2); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); const c2 = lamp.shadow.camera; c2.left = -1.5; c2.right = 1.5; c2.top = 1.5; c2.bottom = -1.5; c2.near = 0.5; c2.far = 10; S.add(lamp);
    this.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const s = this.defaultSeat(); const p = this.seats[s]; this.selSet = new Set([s]); this.paintSeats();
    const pin = new T.Mesh(new T.ConeGeometry(0.018, 0.05, 16), new T.MeshBasicMaterial({ color: '#FFC845', toneMapped: false })); pin.rotation.x = Math.PI; pin.position.set(p.x * sc, 0.76 + p.h * sc + 0.12, p.z * sc); S.add(pin);
    const line = new T.Mesh(new T.CylinderGeometry(0.002, 0.002, 0.1, 6), new T.MeshBasicMaterial({ color: '#FFC845' })); line.position.set(p.x * sc, 0.76 + p.h * sc + 0.05, p.z * sc); S.add(line);
  }
  defaultSeat() {
    const st = 1, ti = Math.min(1, this.tiers.length - 1);
    let i = this.seats.findIndex((s) => s.ti === ti && s.stand === st && s.row === 9 && s.num === 8 && this.blocks[s.ti + '-' + s.sec].free > 20);
    if (i < 0) i = this.seats.findIndex((s) => s.ti === ti && s.stand === st && s.row === 9);
    this.seats[i].taken = false; return i;
  }

  // ---------- camera ----------
  resetView() {
    const m = this.mode(), R = this.R, open = this.vd.open;
    if (m === 'table') { this.view = { yaw: 0.5, pitch: 0.62, dist: 2.5, lookYaw: 0, lookPitch: 0, fov: 42 }; this.target = new THREE.Vector3(0, 0.82, 0); }
    else { this.view = { yaw: m === 'hero' ? 0.4 : 0.25, pitch: m === 'hero' ? 0.62 : (open ? 1.18 : 0.95), dist: R * (m === 'hero' ? 1.7 : (open ? 2.15 : 2.05)), lookYaw: 0, lookPitch: 0, fov: 45 }; this.target = new THREE.Vector3(0, 2, 0); }
    this.camMode = 'orbit'; this.tw = null;
  }
  orbitPos() { const v = this.view; return new THREE.Vector3(this.target.x + v.dist * Math.cos(v.pitch) * Math.sin(v.yaw), this.target.y + v.dist * Math.sin(v.pitch), this.target.z + v.dist * Math.cos(v.pitch) * Math.cos(v.yaw)); }
  fly(pos, tgt, dur, arc, then) { this.camMode = 'tween'; this.tw = { p0: this.cam.position.clone(), t0: (this.curTgt || this.target).clone(), p1: pos, t1: tgt, s: performance.now(), d: dur, arc: arc || 0, then }; }
  frame() {
    const now = performance.now(), dt = Math.min(0.05, this.clock.getDelta()), m = this.mode(), cam = this.cam;
    if (this.tw) { let k = Math.min(1, (now - this.tw.s) / this.tw.d); k = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      cam.position.lerpVectors(this.tw.p0, this.tw.p1, k); cam.position.y += Math.sin(k * Math.PI) * this.tw.arc; const t = new THREE.Vector3().lerpVectors(this.tw.t0, this.tw.t1, k); cam.lookAt(t); this.curTgt = t;
      if (k >= 1) { const f = this.tw.then; this.tw = null; if (f) f(); } }
    else if (this.camMode === 'orbit') { if ((m === 'hero' && this.props.spin !== 'off') || (m === 'full' && !this.dragging && now - (this.lastInput || 0) > 4000)) this.view.yaw += dt * (m === 'hero' ? 0.06 : 0.025);
      if (m === 'table') this.view.yaw = 0.5 + Math.sin(now / 4000) * 0.12; cam.position.copy(this.orbitPos()); cam.lookAt(this.target); this.curTgt = this.target.clone(); }
    else if (this.camMode === 'fixed') { const p = this.fixedPos, t = this.fixedTgt, o = this.fixOrb || { yaw: 0, pitch: 0, zoom: 1 }, v = p.clone().sub(t), L = v.length(), r = L * o.zoom, yaw = Math.atan2(v.x, v.z) + o.yaw, pit = Math.asin(v.y / L) + o.pitch;
      cam.position.set(t.x + r * Math.cos(pit) * Math.sin(yaw), t.y + r * Math.sin(pit), t.z + r * Math.cos(pit) * Math.cos(yaw)); cam.lookAt(t); this.curTgt = t.clone(); }
    else if (this.camMode === 'seat') { const v = this.view; if (m === 'pov' && !this.dragging) v.lookYaw = Math.sin(now / 3500) * 0.35;
      cam.position.copy(this.eye); const yaw = this.baseYaw + v.lookYaw, pitch = this.basePitch + v.lookPitch; cam.lookAt(this.eye.x + Math.sin(yaw) * Math.cos(pitch), this.eye.y + Math.sin(pitch), this.eye.z + Math.cos(yaw) * Math.cos(pitch)); this.curTgt = null; }
    if (Math.abs(cam.fov - this.view.fov) > 0.05) { cam.fov += (this.view.fov - cam.fov) * 0.15; cam.updateProjectionMatrix(); }
    this.r.render(this.scene, cam);
    if (this.wantShot) { this.wantShot = false; try { this.setState({ shot: this.canvas.toDataURL('image/jpeg', 0.85) }); } catch (e) {} }
    if (this.state.step === 'block' && this.selSet && !this.tw) this.updateTag();
  }

  // ---------- interaction ----------
  bindPointer() {
    const c = this.canvas, m = this.mode(); let down = null;
    const setM = (e) => { const r = c.getBoundingClientRect(); this.mouse.x = (e.clientX - r.left) / r.width * 2 - 1; this.mouse.y = -((e.clientY - r.top) / r.height * 2 - 1); };
    c.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; this.dragging = false; this.lastInput = performance.now(); this.stopTour(); try { c.setPointerCapture(e.pointerId); } catch (er) {} });
    c.addEventListener('pointermove', (e) => { setM(e); this.lastInput = performance.now();
      if (down) { const dx = e.clientX - down.x, dy = e.clientY - down.y; if (Math.abs(dx) + Math.abs(dy) > 4) this.dragging = true;
        if (this.dragging) { down = { x: e.clientX, y: e.clientY };
          if (this.camMode === 'orbit' && m !== 'table') { this.view.yaw -= dx * 0.005; this.view.pitch = Math.max(0.2, Math.min(1.45, this.view.pitch + dy * 0.004)); }
          else if (this.camMode === 'fixed') { const o = this.fixOrb || (this.fixOrb = { yaw: 0, pitch: 0, zoom: 1 }); o.yaw = Math.max(-1.2, Math.min(1.2, o.yaw - dx * 0.005)); o.pitch = Math.max(-0.3, Math.min(0.7, o.pitch + dy * 0.004)); }
          else if (this.camMode === 'seat') { this.view.lookYaw -= dx * 0.004; this.view.lookPitch = Math.max(-0.6, Math.min(0.5, this.view.lookPitch + dy * 0.003)); } }
        return; }
      if (m === 'full' && !this.tw) this.hover(); });
    c.addEventListener('pointerup', (e) => { const wd = this.dragging; down = null; this.dragging = false; if (!wd && m === 'full') { setM(e); this.click(); } });
    c.addEventListener('pointerleave', () => { this.hoverRaw = null; if (this.hoverStand != null || this.hoverBlock) { this.hoverStand = null; this.hoverBlock = null; this.paintSeats(); } this.setState({ tip: null, hs: null }); });
    c.addEventListener('wheel', (e) => { if (m !== 'full') return; e.preventDefault(); this.lastInput = performance.now();
      if (this.camMode === 'orbit') this.view.dist = Math.max(this.R * 0.8, Math.min(this.R * 3.2, this.view.dist * (1 + e.deltaY * 0.001)));
      else if (this.camMode === 'seat') this.view.fov = Math.max(22, Math.min(70, this.view.fov + e.deltaY * 0.03));
      else if (this.camMode === 'fixed') { const o = this.fixOrb || (this.fixOrb = { yaw: 0, pitch: 0, zoom: 1 }); o.zoom = Math.max(0.45, Math.min(1.6, o.zoom * (1 + e.deltaY * 0.001))); } }, { passive: false });
  }
  pickBlock() {
    this.ray.setFromCamera(this.mouse, this.cam); const hit = this.ray.intersectObjects(this.tierMeshes.concat(this.seatMeshes), false)[0]; if (!hit) return null;
    let ti, sec; if (hit.object.userData.ti != null) { ti = hit.object.userData.ti; const t = this.tiers[ti]; sec = Math.min(t.secs - 1, Math.floor(this.fracOf(t.rp0, hit.point.x, hit.point.z) * t.secs)); }
    else { const s = this.seats[hit.instanceId]; ti = s.ti; sec = s.sec; }
    return this.blocks[ti + '-' + sec] || null;
  }
  project(v) { const p = v.clone().project(this.cam); return { x: Math.round((p.x + 1) / 2 * this.W), y: Math.round((1 - p.y) / 2 * this.H) }; }
  hover() {
    const st = this.state.step;
    if (st === 'overview' || st === 'stand') { let b = this.pickBlock(); if (st === 'stand' && b && b.stand !== this.curStand) b = null; if (b && this.state.priceMax && b.price > this.state.priceMax) b = null; if (b === this.hoverBlock) return; this.hoverBlock = b; this.paintSeats();
      if (!b) { this.setState({ tip: null }); this.canvas.style.cursor = st === 'overview' ? 'grab' : 'default'; return; } const p = this.project(b.c.clone().add(new THREE.Vector3(0, 2.5, 0))), soldOut = b.free === 0;
      this.canvas.style.cursor = soldOut ? 'not-allowed' : 'pointer';
      this.setState({ tip: { x: p.x, y: p.y, title: 'SECTION ' + b.num + ' · ' + this.vd.tiers[b.ti].name.toUpperCase(), line: soldOut ? 'Sold out' : b.free + ' seats left · from', price: soldOut ? '' : this.fmt(b.price), border: soldOut ? '#8A8F98' : '#FFC845', priceColor: soldOut ? '#5F6368' : '#111214' } }); }
    else if (st === 'block') { this.ray.setFromCamera(this.mouse, this.cam); const h = this.ray.intersectObjects(this.seatMeshes, false)[0];
      let raw = h ? h.instanceId : null; if (raw != null) { const s = this.seats[raw]; if (s.ti !== this.curBlock.ti || s.sec !== this.curBlock.sec) raw = null; }
      const id = raw != null && !this.seats[raw].taken ? raw : null;
      if (raw !== this.hoverRaw) { this.hoverRaw = raw; if (raw == null) this.setState({ hs: null }); else { const s = this.seats[raw], p = this.project(new THREE.Vector3(s.x, s.h + 1.5, s.z));
        this.setState({ hs: { x: p.x, y: p.y, label: 'ROW ' + this.rowL(s.row) + ' · SEAT ' + s.num, status: s.mine ? 'Already yours' : s.taken ? 'Sold' : 'Free · ' + this.fmt(this.curBlock.price), color: s.taken ? '#9AA1AB' : '#FFC845' } }); } }
      if (id !== this.hoverSeat) { this.hoverSeat = id; this.paintSeats(); this.canvas.style.cursor = id != null ? 'pointer' : (raw != null ? 'not-allowed' : 'grab'); } }
  }
  rowL(r) { return String(r + 1); }
  click() {
    const st = this.state.step; if (this.tw && st === 'block') return; // no seat picks while the camera is still flying in
    if (st === 'overview' || st === 'stand') { this.hover(); const b = this.hoverBlock; if (b && b.free) this.goBlock(b); else if (b) this.setState({ msg: 'Section ' + b.num + ' is sold out. Pick another section.' }); }
    else if (st === 'block') { this.hover(); if (this.hoverSeat != null) this.pickSeat(this.hoverSeat); }
  }
  pickSeat(id) {
    const need = this.state.need || 1, s0 = this.seats[id], row = [];
    this.seats.forEach((q, i) => { if (q.ti === s0.ti && q.sec === s0.sec && q.row === s0.row) row.push(i); });
    const at = row.indexOf(id); let run = null;
    for (let start = at; start > at - need && !run; start--) { if (start < 0 || start + need > row.length) continue; const ids = row.slice(start, start + need); if (ids.every((i) => !this.seats[i].taken)) run = ids; }
    if (!run) { this.setState({ msg: 'No ' + need + ' free seats side by side here. Try another row.' }); return false; }
    this.selSet = new Set(run); this.selIdx = run[0]; this.paintSeats(); this.setSeatState(); this.setState({ msg: null }); return true;
  }
  setSeatState() {
    const s = this.seats[this.selIdx], ids = [...this.selSet], nums = ids.map((i) => this.seats[i].num), b = this.blocks[s.ti + '-' + s.sec];
    this.setState({ seat: { row: this.rowL(s.row), num: nums.length > 1 ? Math.min(...nums) + ' to ' + Math.max(...nums) : String(nums[0]), count: ids.length, total: this.fmt(b.price * ids.length), price: b.price, gate: 'NESW'[s.stand] + (1 + (s.sec % 2)) } });
  }
  bestAvailable() {
    // pick the best-placed block that has `need` free seats side by side within the budget
    const need = this.state.need || 1, cap = this.state.priceMax, St = this.standsInfo || [];
    const order = (rows) => Array.from({ length: rows }, (_, r) => r).sort((a, b) => Math.abs(a - rows * 0.35) - Math.abs(b - rows * 0.35));
    const blocks = Object.values(this.blocks).filter((b) => b.free >= need && (!cap || b.price <= cap))
      .sort((a, b) => (b.stand % 2) - (a.stand % 2) || a.ti - b.ti || (St[a.stand] ? a.c.distanceTo(St[a.stand].c) - b.c.distanceTo(St[b.stand].c) : 0));
    for (const b of blocks) { const rows = this.tiers[b.ti].cfg.rows;
      for (const r of order(rows)) { const row = []; this.seats.forEach((q, i) => { if (q.ti === b.ti && q.sec === b.sec && q.row === r) row.push(i); });
        const mid = Math.floor(row.length / 2), starts = Array.from({ length: row.length - need + 1 }, (_, k) => k).sort((x, y) => Math.abs(x + need / 2 - mid) - Math.abs(y + need / 2 - mid));
        for (const k of starts) { const ids = row.slice(k, k + need); if (ids.length === need && ids.every((i) => !this.seats[i].taken)) return { b, ids }; } } }
    return null;
  }
  takeBest() {
    const best = this.bestAvailable(); this.stopTour(); this.tourT = [];
    if (!best) { this.setState({ msg: 'No ' + (this.state.need || 1) + ' seats together fit that budget. Try fewer seats or a higher budget.' }); return; }
    const pick = () => { this.selSet = new Set(best.ids); this.selIdx = best.ids[0]; this.paintSeats(); this.setSeatState(); };
    if (this.fb) { this._afterClip = () => this.tourT.push(setTimeout(() => { if (this.alive) pick(); }, 400)); this.spinFly(best.b); return; }
    this.goBlock(best.b); this.tourT.push(setTimeout(() => { if (this.alive) pick(); }, 2000));
  }
  setNeed(n) { this.setState({ need: n, msg: null }); if (this.selSet && this.selSet.size !== n) { this.selSet = null; this.selIdx = null; this.paintSeats(); this.setState({ seat: null, tag: null }); } }
  toggleCrowd() { const on = this.state.showCrowd === false; this.setState({ showCrowd: on }); (this.crowd || []).forEach((m) => { m.visible = on; }); }
  updateTag() { const s = this.seats[this.selIdx]; if (!s) return; const p = this.project(new THREE.Vector3(s.x, s.h + 1.3, s.z)), t = this.state.tag; if (!t || Math.abs(t.x - p.x) > 1 || Math.abs(t.y - p.y) > 1) this.setState({ tag: p }); }
  inward(c) { return new THREE.Vector3(-c.x, 0, -c.z).normalize(); }
  goStand(i) {
    const S = this.standsInfo[i], dir = this.inward(S.c), R = this.R;
    this.curStand = i; this.hoverStand = null; this.hoverBlock = null; this.curBlock = null; this.selSet = null; this.selIdx = null;
    this.setState({ step: 'stand', tip: null, hs: null, seat: null, msg: null, shot: null, stand: { name: S.name, nameUp: S.name.toUpperCase(), free: S.free.toLocaleString('en-US'), blocks: S.blocks } }); this.paintSeats();
    const k = this.vd.open ? 0.95 : 0.72, up = this.vd.open ? 0.3 : 0.2, pos = S.c.clone().add(dir.clone().multiplyScalar(R * k)).add(new THREE.Vector3(0, R * up, 0)), tgt = S.c.clone().add(new THREE.Vector3(0, 1, 0));
    this.fly(pos, tgt, 2200, R * 0.15, () => { this.camMode = 'fixed'; this.fixedPos = pos; this.fixedTgt = tgt; });
  }
  goBlock(b) {
    const dir = this.inward(b.c); this.fixOrb = { yaw: 0, pitch: 0, zoom: 1 }; this.curBlock = b; if (!this.fb && this.root) this.buildCrowd(this.root, b.c, 26); this.hoverBlock = null; this.hoverSeat = null; this.hoverRaw = null; this.selSet = null; this.selIdx = null;
    this.setState({ step: 'block', tip: null, hs: null, seat: null, tag: null, msg: null, block: { title: 'SECTION ' + b.num + ' · ' + this.vd.tiers[b.ti].name.toUpperCase() + ' · ' + this.STANDS()[b.stand].toUpperCase(), free: b.free, price: this.fmt(b.price) } }); this.paintSeats();
    const pos = b.c.clone().add(dir.multiplyScalar(21 + b.ti * 4)).add(new THREE.Vector3(0, 6, 0)), tgt = b.c.clone();
    this.fly(pos, tgt, 1900, 3, () => { this.camMode = 'fixed'; this.fixedPos = pos; this.fixedTgt = tgt; this.blockPos = pos; this.blockTgt = tgt; });
  }
  aim(eye) { const f = this.focus || new THREE.Vector3(), d = new THREE.Vector3().subVectors(f, eye); this.baseYaw = Math.atan2(d.x, d.z); this.basePitch = Math.atan2(d.y, Math.hypot(d.x, d.z)) * 0.85; this.view.lookYaw = 0; this.view.lookPitch = 0;
    return eye.clone().add(new THREE.Vector3(Math.sin(this.baseYaw) * Math.cos(this.basePitch), Math.sin(this.basePitch), Math.cos(this.baseYaw) * Math.cos(this.basePitch))); }
  goSeat(instant) {
    if (!this.selSet) { const d = this.defaultSeat(); this.selSet = new Set([d]); this.selIdx = d; const s = this.seats[d]; this.curStand = s.stand; this.curBlock = this.blocks[s.ti + '-' + s.sec]; if (this.mode() === 'full') this.setSeatState(); }
    const s = this.seats[this.selIdx]; this.eye = new THREE.Vector3(s.x - s.nx * 0.05, s.h + 1.15, s.z - s.nz * 0.05);
    const look = this.aim(this.eye); this.view.fov = this.mode() === 'pov' ? 62 : 55;
    if (!this.fb && this.root) this.buildCrowd(this.root, this.eye, 14);
    this.clearView(this.eye);
    if (this.mode() === 'full') this.setState({ step: 'seat', tag: null, hs: null, shot: null, vip: null }, () => this.paintSeats()); else this.paintSeats();
    if (this.fb && this.mode() === 'full') this.cubeStart(false);
    if (instant) { this.camMode = 'seat'; return; }
    this.fly(this.eye.clone(), look, 1800, 1.5, () => { this.camMode = 'seat'; this.wantShot = true; });
  }
  clearView(eye) {
    // hide the fans sitting right around the camera so heads never fill the frame
    if (!this.crowdLists) return; const d = new THREE.Object3D(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    this.crowd.forEach((m, k) => { this.crowdLists[k].forEach((s, i) => { const near = eye && Math.hypot(s.x - eye.x, s.z - eye.z) < 3.2 && Math.abs(s.h - (eye.y - 1.15)) < 1.6;
      if (near) m.setMatrixAt(i, zero); else { d.position.set(s.x, s.h, s.z); d.rotation.set(0, Math.atan2(-s.nx, -s.nz), 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); } }); m.instanceMatrix.needsUpdate = true; });
  }
  upgrade() {
    if (!this.suite) return; const s = this.seats[this.selIdx], su = this.suite, f = this.fracOf(su.rp, s.x, s.z), box = Math.floor(f * su.parts);
    const p = this.atLen(su.rp, (box + 0.5) * su.rp.len / su.parts); this.eye = new THREE.Vector3(p.x - p.nx * 0.75, su.H + 1.95, p.z - p.nz * 0.75); const look = this.aim(this.eye); this.view.fov = 58; if (!this.fb && this.root) this.buildCrowd(this.root, this.eye, 16); this.clearView(null);
    this.setState({ step: 'vip', shot: null, vip: { box: box + 1, price: this.suitePrice() } }); if (this.fb) this.cubeStart(true);
    this.fly(this.eye.clone(), look, 2000, 3, () => { this.camMode = 'seat'; this.wantShot = true; });
  }
  back() {
    this.stopTour(); const st = this.state.step;
    if (st === 'vip') { this.goSeat(false); }
    else if (st === 'seat') { this.fixOrb = { yaw: 0, pitch: 0, zoom: 1 }; this.clearView(null); this.setState({ step: 'block', shot: null }, () => this.paintSeats()); this.view.fov = 45; this.fly(this.blockPos, this.blockTgt, 1500, 1.5, () => { this.camMode = 'fixed'; this.fixedPos = this.blockPos; this.fixedTgt = this.blockTgt; }); }
    else if (st === 'block' || st === 'stand') { this.goOverview(); }
    else if (st === 'checkout') { this.cancelHold(); this.setState({ step: this.state.cart && this.state.cart.vip ? 'vip' : 'seat', cart: null }); }
    else if (st === 'booked') { this.clearView(null); this.goOverview(); }
  }
  book() { this.wantShot = true; this.setState({ step: 'booked' }); }
  startFallback() {
    // WebGL is unavailable: keep the same seat data and flow, drawn over pre-rendered stills
    const T = THREE; this.fb = true; this.cam = new T.PerspectiveCamera(45, 1.6, 0.3, 2500); this.ray = new T.Raycaster(); this.mouse = new T.Vector2();
    this.view = { yaw: 0, pitch: 0, dist: 1, lookYaw: 0, lookPitch: 0, fov: 45 };
    try { this.buildScene(); this.ttInit(); } catch (e) { this.setState({ err: String(e && e.message || e), loading: true }); return; }
    this.fly = (pos, tgt, dur, arc, then) => { if (then) then(); };
    this.setState({ loading: false, fbMode: true });
  }
  computeHot() {
    const cam = this.cam, t = this.tt || { r: 1, k: 0 }, K = ((Math.round(t.k) % 48) + 48) % 48, yaw = 0.25 + K * Math.PI * 2 / 48, pt = [1.1, 0.85, 0.6][t.r], dd = this.R * 2.05;
    cam.aspect = 1.6; cam.fov = 45; cam.updateProjectionMatrix(); cam.position.set(dd * Math.cos(pt) * Math.sin(yaw), 2 + dd * Math.sin(pt), dd * Math.cos(pt) * Math.cos(yaw)); cam.lookAt(0, 2, 0); cam.updateMatrixWorld(true);
    const v = new THREE.Vector3(), P = (x, y, z) => { v.set(x, y, z).project(cam); return [(v.x + 1) / 2 * 1600, (1 - v.y) / 2 * 1000]; };
    const groups = {}; this.seats.forEach((s) => { (groups[s.ti + '-' + s.sec] = groups[s.ti + '-' + s.sec] || []).push(P(s.x, s.h + 0.6, s.z)); });
    const hull = (pts) => { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = [];
      for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
      for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
      return lo.slice(0, -1).concat(up.slice(0, -1)); };
    this.hot = Object.keys(groups).map((k) => { const h = hull(groups[k]), b = this.blocks[k]; let cx = 0, cy = 0; h.forEach((p) => { cx += p[0]; cy += p[1]; }); return { k, b, pts: h.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), cx: cx / h.length, cy: cy / h.length }; });
    if (this.suite) { const su = this.suite, p = this.atLen(su.rp, su.rp.len * 0.5); const q = P(p.x, su.H + 2, p.z); this.vipPin = { x: q[0], y: q[1] }; }
    this.pinsFb = (this.amen || []).map((a) => { const q = P(a.x, 1, a.z); return Object.assign({}, a, { px: q[0], py: q[1] }); });
  }
  fbToScreen(x, y) { const W = (this.wrap && this.wrap.clientWidth) || 1440, H = (this.wrap && this.wrap.clientHeight) || 900, k = Math.max(W / 1600, H / 1000), t = this.tt || { z: 1, px: 0, py: 0 }; return { x: Math.round(t.px + t.z * ((W - 1600 * k) / 2 + x * k)), y: Math.round(t.py + t.z * ((H - 1000 * k) / 2 + y * k)) }; }
  fbHover(h) { if (this.state.step !== 'overview' || this._d || this.state.ttMove || this.state.flying) return; const b = h ? h.b : null; if (b && this.state.priceMax && b.price > this.state.priceMax) return; if (b === this.hoverBlock) return; this.hoverBlock = b;
    if (!b) { this.setState({ tip: null }); return; } this.preload(b); const p = this.fbToScreen(h.cx, h.cy), soldOut = b.free === 0;
    this.setState({ tip: { x: p.x, y: p.y, title: 'SECTION ' + b.num + ' · ' + this.vd.tiers[b.ti].name.toUpperCase(), line: soldOut ? 'Sold out' : b.free + ' seats left' + (this.sun && this.sun.day ? ' · ' + b.shadeStart + '% shade at start' : '') + ' · from', price: soldOut ? '' : this.fmt(b.price) } }); }
  fbPick(h) { if (this._dragMoved || this.state.flying) return; const b = h.b; if (this.state.priceMax && b.price > this.state.priceMax) { this.setState({ msg: 'Section ' + b.num + ' is above your budget.' }); return; } if (!b.free) { this.setState({ msg: 'Section ' + b.num + ' is sold out. Pick another section.' }); return; } this.spinFly(b); }
  preload(b) { this.img(this.clipSrc(b)); this.img(this.secSrc(b)); }
  playClip(b) {
    const src = this.clipSrc(b), sheet = this.secSrc(b); this.preload(b); clearInterval(this.clipT);
    this.hoverBlock = null; this.setState({ tip: null, cine: { src, f: 0, wait: true } });
    const start = () => { let f = 0; this.setState({ cine: { src, f: 0 } }); this.clipT = setInterval(() => { if (!this.alive) return clearInterval(this.clipT); f++; if (f >= 30) { clearInterval(this.clipT); this.goBlock(b); this.setState({ cine: null, fadeIn: Date.now() }); const after = this._afterClip; this._afterClip = null; if (after) after(); return; } this.setState({ cine: { src, f } }); }, 50); };
    const ims = [this.img(src), this.img(sheet)]; let n = 0; const go = () => { if (++n === 2) start(); };
    ims.forEach((im) => { if (im.complete && im.naturalWidth) go(); else { im.onload = go; im.onerror = go; } });
  }
  seatDots() {
    const b = this.curBlock; if (!b || !this.blockPos) return []; const cam = new THREE.PerspectiveCamera(45, 1.6, 0.3, 2500); cam.position.copy(this.blockPos); cam.lookAt(this.blockTgt); cam.updateMatrixWorld(true);
    const v = new THREE.Vector3(), out = []; this.seats.forEach((s, i) => { if (s.ti !== b.ti || s.sec !== b.sec) return; v.set(s.x, s.h + 0.62, s.z).project(cam); if (v.z > 1) return; out.push({ i, x: (v.x + 1) / 2 * 1600, y: (1 - v.y) / 2 * 1000, d: Math.hypot(s.x - this.blockPos.x, s.z - this.blockPos.z) }); });
    return out;
  }
  zoomToSeat() {
    const s = this.seats[this.selIdx]; if (!s) return; const dot = (this.seatDots() || []).find((d) => d.i === this.selIdx) || { x: 800, y: 500 };
    this.img(this.cubeSrc(false, s)); this.setState({ zoom: { ox: (dot.x / 16).toFixed(1), oy: (dot.y / 10).toFixed(1) } }); clearTimeout(this.zoomT);
    this.zoomT = setTimeout(() => { this.goSeat(false); this.setState({ zoom: null }); }, 1050);
  }
  // ===== no-WebGL mode: rotatable pre-rendered stadium + 360° seat view =====
  ZK() { return {"0_0": 4, "0_1": 35, "0_2": 23, "0_3": 11, "1_0": 3, "1_1": 33, "1_2": 21, "1_3": 9}; }
  ttSrc(r, k) { return '/assets/tt/' + r + '_' + String(((k % 48) + 48) % 48).padStart(2, '0') + '.jpg'; }
  secSrc(b) { return '/assets/sec/' + b.ti + '_' + b.sec + '.jpg'; }
  clipSrc(b) { return '/assets/clip/' + b.ti + '_' + b.stand + '.jpg'; }
  cubeSrc(vip, s) { return vip || !s ? '/assets/cube/vip.jpg' : '/assets/cube/' + s.ti + '_' + s.sec + '_' + (s.row < this.tiers[s.ti].cfg.rows / 2 ? 0 : 1) + '.jpg'; }
  img(u) { this._im = this._im || {}; let im = this._im[u]; if (!im) { im = new Image(); im.decoding = 'async'; im.src = u; this._im[u] = im; } return im; }
  ready(u) { const im = this._im && this._im[u]; return !!(im && im.complete && im.naturalWidth); }
  ttInit() {
    this.tt = { r: 1, k: 0, z: 1, px: 0, py: 0 }; this.hotCache = {};
    for (let k = 0; k < 48; k++) this.img(this.ttSrc(1, k)).onload = () => this.ttDraw();
    setTimeout(() => { for (let k = 0; k < 48; k++) { this.img(this.ttSrc(0, k)); this.img(this.ttSrc(2, k)); } }, 2500);
    this.computeHot(); this.setState({ hotKey: '1_0' });
  }
  ttVals() {
    const t = this.tt || { r: 1, k: 0, z: 1, px: 0, py: 0 }, K = ((t.k % 48) + 48) % 48, k0 = Math.floor(K), f = K - k0, u0 = this.ttSrc(t.r, k0), u1 = this.ttSrc(t.r, k0 + 1);
    if (this.ready(u0)) this._u0 = u0;
    const both = this._u0 === u0 && this.ready(u1) && f > 0.001;
    return { a: this._u0 ? 'url(' + this._u0 + ')' : 'none', b: both ? 'url(' + u1 + ')' : 'none', bo: both ? f.toFixed(3) : '0', tf: 'translate(' + t.px.toFixed(1) + 'px,' + t.py.toFixed(1) + 'px) scale(' + t.z.toFixed(3) + ')' };
  }
  ttDraw() {
    if (!this.ttA || !this.ttB || !this.ttS) return; const v = this.ttVals();
    if (this.ttA._bg !== v.a) { this.ttA.style.backgroundImage = v.a; this.ttA._bg = v.a; }
    if (this.ttB._bg !== v.b) { this.ttB.style.backgroundImage = v.b; this.ttB._bg = v.b; }
    this.ttB.style.opacity = v.bo; this.ttS.style.transform = v.tf;
  }
  ttMoving(on) { if (this.ttH) this.ttH.style.opacity = on ? '0' : '1'; if (on && !this.state.ttMove) this.setState({ ttMove: true, tip: null }); }
  ttSettle() {
    const t = this.tt; cancelAnimationFrame(this.ttRaf); const k = Math.round(t.k);
    this.ttAnim(k, 220, () => { t.k = ((k % 48) + 48) % 48; this.hoverBlock = null; this.computeHot(); this.ttDraw(); if (this.ttH) this.ttH.style.opacity = '1'; this.setState({ ttMove: false, hotKey: t.r + '_' + t.k }); });
  }
  ttAnim(k1, ms, done) {
    const t = this.tt, k0 = t.k, t0 = performance.now(); cancelAnimationFrame(this.ttRaf);
    const step = (now) => { if (!this.alive) return; let a = Math.min(1, (now - t0) / ms); a = a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2; t.k = k0 + (k1 - k0) * a; this.ttDraw(); if (a < 1) this.ttRaf = requestAnimationFrame(step); else if (done) done(); };
    this.ttRaf = requestAnimationFrame(step);
  }
  ttDown(e) { if (e.button > 0) return; cancelAnimationFrame(this.ttRaf); const t = this.tt; this._dragMoved = false; this._d = { x: e.clientX, y: e.clientY, k: t.k, r: t.r, lx: e.clientX, lt: performance.now(), v: 0 }; }
  ttMove(e) {
    const d = this._d; if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y, t = this.tt;
    if (!this._dragMoved && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!this._dragMoved) { this._dragMoved = true; this.ttMoving(true); }
    const now = performance.now(), dt = Math.max(1, now - d.lt); d.v = 0.8 * d.v + 0.2 * (-(e.clientX - d.lx) / 12 / dt); d.lx = e.clientX; d.lt = now;
    t.k = d.k - dx / 12; const r = Math.max(0, Math.min(2, d.r - Math.round(dy / 80))); if (r !== t.r) { t.r = r; this.ttPre(r); }
    this.ttDraw();
  }
  ttUp() {
    const d = this._d; this._d = null; if (!d || !this._dragMoved) return; let v = d.v, last = performance.now(); const t = this.tt;
    const glide = (now) => { if (!this.alive) return; const dt = now - last; last = now; t.k += v * dt; v *= Math.pow(0.93, dt / 16); this.ttDraw(); if (Math.abs(v) > 0.002) this.ttRaf = requestAnimationFrame(glide); else this.ttSettle(); };
    if (Math.abs(v) > 0.004) this.ttRaf = requestAnimationFrame(glide); else this.ttSettle();
  }
  ttPre(r) { for (let k = 0; k < 48; k++) this.img(this.ttSrc(r, k)); }
  ttZoom(f, cx, cy) {
    const t = this.tt, W = (this.wrap && this.wrap.clientWidth) || 1440, H = (this.wrap && this.wrap.clientHeight) || 900; if (cx == null) { cx = W / 2; cy = H / 2; }
    const z = Math.max(1, Math.min(2.8, t.z * f)); t.px = cx - (cx - t.px) * z / t.z; t.py = cy - (cy - t.py) * z / t.z; t.z = z;
    t.px = Math.min(0, Math.max(W - W * z, t.px)); t.py = Math.min(0, Math.max(H - H * z, t.py)); this.ttDraw(); this.setState({ ttZ: z });
  }
  ttWheel(e) { const r = this.wrap ? this.wrap.getBoundingClientRect() : { left: 0, top: 0 }; this.ttZoom(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top); }
  ttTurn(n) { this.ttMoving(true); const k = Math.round(this.tt.k) + n; this.ttAnim(k, 600, () => this.ttSettle()); }
  ttTilt(n) { const t = this.tt, r = Math.max(0, Math.min(2, t.r + n)); if (r === t.r) return; t.r = r; this.ttPre(r); this.ttMoving(true); this.ttDraw(); this.ttSettle(); }
  ttReset() { const t = this.tt; t.z = 1; t.px = 0; t.py = 0; t.r = 1; this.ttMoving(true); this.ttAnim(Math.round(t.k / 48) * 48, 700, () => this.ttSettle()); this.setState({ ttZ: 1 }); }
  spinFly(b) {
    const t = this.tt, kz = this.ZK()[b.ti + '_' + b.stand]; this.preload(b); this.hoverBlock = null; this.setState({ tip: null, flying: true }); this.ttMoving(true);
    t.z = 1; t.px = 0; t.py = 0; if (t.r !== 1) t.r = 1;
    let K = ((t.k % 48) + 48) % 48, dk = kz - K; if (dk > 24) dk -= 48; if (dk < -24) dk += 48; t.k = K;
    this.ttAnim(K + dk, Math.min(1300, 260 + Math.abs(dk) * 40), () => { t.k = kz; this.setState({ flying: false, ttMove: false }); this.playClip(b); });
  }
  // ----- 360° seat view: six pre-rendered cube faces re-projected onto a 2D canvas (works without WebGL) -----
  panoData(u) {
    this._pd = this._pd || {}; if (this._pd[u]) return this._pd[u]; if (!this.ready(u)) return null;
    const im = this.img(u), W = im.naturalWidth, H = im.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = { px: new Uint32Array(g.getImageData(0, 0, W, H).data.buffer), W, S: W / 3 };
    this._pd = { [u]: d }; return d;
  }
  cDraw(fine) {
    const cv = this.panoC, c = this.cv; if (!cv || !c) return; const d = this.panoData(this.cubeU); if (!d) return;
    const r = cv.getBoundingClientRect(), k = fine ? 1 : 0.5, w = Math.max(2, Math.round(r.width * k)), h = Math.max(2, Math.round(r.height * k));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const g = cv.getContext('2d'), out = g.createImageData(w, h), o = new Uint32Array(out.data.buffer), P = d.px, S = d.S, W = d.W, S1 = S - 1;
    const y = c.yaw * Math.PI / 180, p = c.pitch * Math.PI / 180, tv = Math.tan(c.fov * Math.PI / 360), th = tv * w / h;
    const fx = Math.sin(y) * Math.cos(p), fy = Math.sin(p), fz = -Math.cos(y) * Math.cos(p), rx = Math.cos(y), rz = Math.sin(y), ux = -Math.sin(y) * Math.sin(p), uy = Math.cos(p), uz = Math.cos(y) * Math.sin(p);
    const hs = S / 2, sample = fine ? (col, row, u, v) => {
      const X = (u + 1) * hs - 0.5, Y = (1 - v) * hs - 0.5, x0 = X < 0 ? 0 : (X > S1 ? S1 : X | 0), y0 = Y < 0 ? 0 : (Y > S1 ? S1 : Y | 0), x1 = x0 < S1 ? x0 + 1 : S1, y1 = y0 < S1 ? y0 + 1 : S1, ax = X - x0 < 0 ? 0 : X - x0 > 1 ? 1 : X - x0, ay = Y - y0 < 0 ? 0 : Y - y0 > 1 ? 1 : Y - y0;
      const b0 = (row * S + y0) * W + col * S, b1 = (row * S + y1) * W + col * S, a = P[b0 + x0], b = P[b0 + x1], cc = P[b1 + x0], e = P[b1 + x1];
      const m = (sh) => { const t = ((a >>> sh) & 255) * (1 - ax) + ((b >>> sh) & 255) * ax, q = ((cc >>> sh) & 255) * (1 - ax) + ((e >>> sh) & 255) * ax; return (t * (1 - ay) + q * ay) & 255; };
      return (255 << 24) | (m(16) << 16) | (m(8) << 8) | m(0); }
      : (col, row, u, v) => { let X = ((u + 1) * hs) | 0, Y = ((1 - v) * hs) | 0; if (X > S1) X = S1; if (Y > S1) Y = S1; if (X < 0) X = 0; if (Y < 0) Y = 0; return P[(row * S + Y) * W + col * S + X]; };
    let i = 0;
    for (let j = 0; j < h; j++) { const sy = (1 - 2 * (j + 0.5) / h) * tv, bx = fx + ux * sy, by = fy + uy * sy, bz = fz + uz * sy;
      for (let q = 0; q < w; q++, i++) { const sx = (2 * (q + 0.5) / w - 1) * th, dx = bx + rx * sx, dy = by, dz = bz + rz * sx, ax = dx < 0 ? -dx : dx, ay = dy < 0 ? -dy : dy, az = dz < 0 ? -dz : dz;
        if (ax >= ay && ax >= az) o[i] = dx > 0 ? sample(0, 0, dz / ax, dy / ax) : sample(1, 0, -dz / ax, dy / ax);
        else if (ay >= az) o[i] = dy > 0 ? sample(2, 0, dx / ay, dz / ay) : sample(0, 1, dx / ay, -dz / ay);
        else o[i] = dz > 0 ? sample(1, 1, -dx / az, dy / az) : sample(2, 1, dx / az, dy / az); } }
    g.putImageData(out, 0, 0);
    if (!fine) { clearTimeout(this.fineT); this.fineT = setTimeout(() => this.cDraw(true), 140); }
  }
  courtDir(eye) { const f = this.focus || new THREE.Vector3(), d = new THREE.Vector3().subVectors(f, eye); return { yaw: Math.atan2(d.x, -d.z) * 180 / Math.PI, pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) * 180 / Math.PI * 0.85 - 5 }; }
  cubeStart(vip) {
    const s = this.seats[this.selIdx]; let eye;
    if (vip) { const su = this.suite, f = this.fracOf(su.rp, s.x, s.z), box = Math.floor(f * su.parts), p = this.atLen(su.rp, (box + 0.5) * su.rp.len / su.parts); eye = new THREE.Vector3(p.x - p.nx * 0.75, su.H + 1.95, p.z - p.nz * 0.75); }
    else eye = new THREE.Vector3(s.x, s.h + 1.15, s.z);
    const u = this.cubeSrc(vip, s), court = this.courtDir(eye); this.cubeU = u; this.courtV = court;
    this.cv = vip ? { yaw: court.yaw - 35, pitch: court.pitch, fov: 92 } : { yaw: court.yaw + 180, pitch: 14, fov: 78 };
    this.setState({ cubeU: u, cubeReady: this.ready(u), fadeIn: Date.now() });
    const go = () => { if (!this.alive || this.cubeU !== u) return; this.setState({ cubeReady: true }); this.cDraw(true); this.makeShot(u, court.yaw); setTimeout(() => this.cAnim({ yaw: vip ? court.yaw : court.yaw + 360, pitch: court.pitch, fov: 72 }, vip ? 1500 : 2100), vip ? 250 : 350); };
    const im = this.img(u); if (this.ready(u)) go(); else { im.addEventListener('load', go, { once: true }); }
  }
  cAnim(to, ms, done) {
    const c = this.cv, from = { yaw: c.yaw, pitch: c.pitch, fov: c.fov }, t0 = performance.now(); cancelAnimationFrame(this.cRaf);
    const step = (now) => { if (!this.alive || !this.cv) return; let a = Math.min(1, (now - t0) / ms); a = a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
      ['yaw', 'pitch', 'fov'].forEach((k) => { c[k] = from[k] + (to[k] - from[k]) * a; }); this.cDraw(a >= 1); if (a < 1) this.cRaf = requestAnimationFrame(step); else if (done) done(); };
    this.cRaf = requestAnimationFrame(step);
  }
  cDown(e) { if (e.button > 0 || !this.cv) return; cancelAnimationFrame(this.cRaf); this._cd = { x: e.clientX, y: e.clientY, yaw: this.cv.yaw, pitch: this.cv.pitch }; }
  cMove(e) { const d = this._cd; if (!d) return; const k = this.cv.fov / ((this.wrap && this.wrap.clientHeight) || 900); this.cv.yaw = d.yaw - (e.clientX - d.x) * k; this.cv.pitch = Math.max(-75, Math.min(75, d.pitch + (e.clientY - d.y) * k)); this.cDraw(); }
  cUp() { this._cd = null; }
  cWheel(e) { if (!this.cv) return; this.cv.fov = Math.max(35, Math.min(95, this.cv.fov * Math.exp(e.deltaY * 0.001))); this.cDraw(); }
  cLook(dy, dp, df) { if (!this.cv) return; const c = this.cv; this.cAnim({ yaw: c.yaw + dy, pitch: Math.max(-75, Math.min(75, c.pitch + dp)), fov: Math.max(35, Math.min(95, c.fov + df)) }, 450); }
  cCourt() { if (!this.cv || !this.courtV) return; let y = this.courtV.yaw; while (y - this.cv.yaw > 180) y -= 360; while (this.cv.yaw - y > 180) y += 360; this.cAnim({ yaw: y, pitch: this.courtV.pitch, fov: 72 }, 700); }
  makeShot(u, yaw) {
    try { const im = this.img(u), f = [5, 0, 4, 1][((Math.round(yaw / 90) % 4) + 4) % 4], fw = im.naturalWidth / 3, c = document.createElement('canvas'); c.width = 960; c.height = 540;
      c.getContext('2d').drawImage(im, (f % 3) * fw, Math.floor(f / 3) * fw + fw * 0.2, fw, fw * 0.5625, 0, 0, 960, 540); this.setState({ shot: c.toDataURL('image/jpeg', 0.85) }); } catch (e) { /* thumbnail is optional */ }
  }
  goVip() {
    if (!this.suite) return; let id = this.selIdx; if (id == null) { id = this.defaultSeat(); this.selSet = new Set([id]); this.selIdx = id; const s = this.seats[id]; this.curBlock = this.blocks[s.ti + '-' + s.sec]; this.setSeatState(); }
    this.upgrade();
  }
  goOverview() {
    this.selSet = null; this.selIdx = null; this.curStand = null; this.curBlock = null; this.hoverBlock = null; this.view.fov = 45;
    this.setState({ step: 'overview', seat: null, tag: null, hs: null, tip: null, msg: null, booking: null, vip: null }, () => this.paintSeats());
    this.view = { yaw: Math.atan2(this.cam.position.x, this.cam.position.z), pitch: this.vd.open ? 1.18 : 0.95, dist: this.R * (this.vd.open ? 2.15 : 2.05), lookYaw: 0, lookPitch: 0, fov: 45 }; this.target = new THREE.Vector3(0, 2, 0);
    this.fly(this.orbitPos(), this.target.clone(), 1800, 0, () => { this.camMode = 'orbit'; });
  }
  stopTour() { (this.tourT || []).forEach(clearTimeout); this.tourT = []; }
  tour() {
    this.stopTour(); this.tourT = []; const d = this.defaultSeat(), s = this.seats[d], b = this.blocks[s.ti + '-' + s.sec];
    const q = (ms, f) => this.tourT.push(setTimeout(() => { if (this.alive) f(); }, ms));
    if (this.fb) { this.selSet = null; this.selIdx = null; this.setState({ step: 'overview', seat: null, tip: null, msg: null }); this._afterClip = () => q(700, () => { if (this.pickSeat(d)) this.zoomToSeat(); }); this.spinFly(b); return; }
    this.selSet = null; this.curStand = null; this.curBlock = null;
    this.setState({ step: 'overview', seat: null, tip: null, hs: null, shot: null, msg: null }, () => this.paintSeats());
    this.view = { yaw: 0.25, pitch: 1.4, dist: this.R * 2.3, lookYaw: 0, lookPitch: 0, fov: 45 }; this.target = new THREE.Vector3(0, 2, 0);
    this.fly(this.orbitPos(), this.target.clone(), 1400, 0, () => { this.camMode = 'orbit'; });
    q(1600, () => this.goBlock(b)); q(4000, () => { this.pickSeat(d); this.updateTag(); }); q(5200, () => this.goSeat(false));
  }
  pickEvent(id) { this.stopTour(); this.selSet = null; this.selIdx = null; this.curStand = null; this.curBlock = null; this.hoverStand = null; this.hoverBlock = null; this.cancelHold();
    const same = true;
    this.setState({ eventId: id, drawer: null, step: 'overview', seat: null, tip: null, tag: null, hs: null, shot: null, msg: null, cart: null }, () => { this.buildScene(); if (this.fb) this.computeHot(); });
  }
  setPrice(v) { this.setState({ priceMax: v }, () => this.paintSeats()); }
  addToCart(vip) {
    const s = this.seats[this.selIdx], b = this.curBlock, ids = [...(this.selSet || [this.selIdx])], V = this.vd;
    const unit = vip ? this.suitePrice() : b.price, seats = ids.map((i) => ({ row: this.rowL(this.seats[i].row), num: this.seats[i].num }));
    const cart = { ids, vip: !!vip, box: vip && this.state.vip ? this.state.vip.box : null, section: b.num, tier: vip ? 'Premier suite' : V.tiers[b.ti].name, stand: this.STANDS()[s.stand], gate: 'NESW'[s.stand] + (1 + (s.sec % 2)), seats, unit, count: seats.length };
    this.wantShot = true;
    this.setState({ cart, step: 'checkout', ck: 'details', holdUntil: Date.now() + 600000, now: Date.now(), tried: false, promo: '', promoOk: false, promoMsg: '' });
    clearInterval(this.holdT); this.holdT = setInterval(() => { if (!this.alive) return; const left = (this.state.holdUntil || 0) - Date.now(); if (left <= 0) { this.cancelHold(); this.setState({ step: 'seat', cart: null, msg: 'Your 10 minute hold ended, so the seats went back on sale.' }); } else this.setState({ now: Date.now() }); }, 1000);
  }
  cancelHold() { clearInterval(this.holdT); this.holdT = null; }
  totals() { const c = this.state.cart; if (!c) return { sub: 0, fee: 0, disc: 0, total: 0 }; const sub = c.unit * c.count, fee = 150 * c.count, disc = this.state.promoOk ? Math.round(sub * 0.1) : 0; return { sub, fee, disc, total: sub + fee - disc }; }
  formOk() { const f = this.state.f || {}; const e = {}; if (!f.name || f.name.trim().length < 3) e.name = 'Enter your full name'; if (!/^(\+92|0)3\d{2}[\s-]?\d{7}$/.test((f.phone || '').trim())) e.phone = 'Use a Pakistani mobile number, e.g. 0300 1234567'; if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((f.email || '').trim())) e.email = 'Enter a valid email'; return e; }
  payOk() { return {}; // prototype: payment is simulated, any input is accepted
  }
  payOkReal() { const f = this.state.f || {}, m = this.state.pm || 'card', e = {}; if (m === 'card') { if ((f.card || '').replace(/\s/g, '').length < 16) e.card = 'Card number needs 16 digits'; if (!/^\d{2}\s?\/\s?\d{2}$/.test((f.exp || '').trim())) e.exp = 'MM / YY'; if (!/^\d{3,4}$/.test((f.cvc || '').trim())) e.cvc = '3 digits'; } else if (!/^(\+92|0)3\d{2}[\s-]?\d{7}$/.test((f.wallet || '').trim())) e.wallet = 'Wallet number, e.g. 0300 1234567'; return e; }
  toPay() { if (Object.keys(this.formOk()).length) { this.setState({ tried: true }); return; } this.setState({ ck: 'pay', tried: false }); }
  pay() {
    if (Object.keys(this.payOk()).length) { this.setState({ tried: true }); return; }
    const c = this.state.cart, f = this.state.f || {}, e = this.ev(), t = this.totals(), ref = 'TR-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const holders = c.seats.map((x, i) => ((f['h' + i] || '').trim() || f.name.trim()));
    const bk = { eventId: e.id, keys: c.ids.map((i) => { const q = this.seats[i]; return q.ti + '-' + q.sec + '-' + q.row + '-' + q.num; }), unit: c.unit, count: c.count, sub: t.sub, fee: t.fee, disc: t.disc, totalN: t.total, tier: c.tier, section: c.section, vip: c.vip, box: c.box, stand: c.stand, name: f.name.trim(), email: (f.email || '').trim(), phone: (f.phone || '').trim(), pm: this.state.pm || 'card', bookedAt: Date.now(), ref, event: e.home + ' vs ' + e.away, when: e.day + ' · ' + e.time, iso: e.iso, venue: this.vd.nameA + ' ' + this.vd.nameB, place: (c.vip ? 'Premier suite ' + c.box : 'Section ' + c.section) + ' · ' + c.seats.map((x) => 'R' + x.row + ' S' + x.num).join(', '), gate: c.gate, total: this.fmt(t.total), status: 'Confirmed', tickets: c.seats.map((x, i) => ({ row: x.row, num: x.num, holder: holders[i] })) };
    this.cancelHold(); this.setState({ step: 'booked', booking: bk, cart: null }); if (this.props.onBooked) this.props.onBooked(bk);
  }
  setF(k, v) { const f = Object.assign({}, this.state.f || {}); f[k] = v; this.setState({ f }); }
  applyPromo() { const ok = (this.state.promo || '').trim().toUpperCase() === 'TIER10'; this.setState({ promoOk: ok, promoMsg: ok ? '10% off applied' : 'That code is not valid' }); }
  calendar(bk) {
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TIER//EN', 'BEGIN:VEVENT', 'UID:' + bk.ref + '@tier', 'DTSTAMP:20261122T000000Z', 'DTSTART:' + bk.iso, 'DURATION:PT3H', 'SUMMARY:' + bk.event, 'LOCATION:' + bk.venue, 'DESCRIPTION:' + bk.place + ' · Gate ' + bk.gate + ' · Booking ' + bk.ref, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    try { const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); const a = document.createElement('a'); a.href = url; a.download = bk.ref + '.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); } catch (e) {}
  }
  cancelBooking(ref) { this.setState({ bookings: (this.state.bookings || []).map((b) => b.ref === ref ? Object.assign({}, b, { status: 'Refund requested' }) : b) }); }

  renderVals() {
    const st = this.state, mode = this.mode(), V = this.V()[this.venueKey()], step = st.step, full = mode === 'full', E = this.ev();
    const hints = st.fbMode ? { overview: 'Drag to turn the arena · scroll to zoom · click a section to fly in', block: 'Click a blue seat to sit in it', seat: 'Drag in any direction to look around · scroll to zoom', vip: 'Premier suite · drag to look around' } : { overview: 'Hover a section for its price · click to fly in · drag to turn · scroll to zoom', stand: 'Hover a section · click to fly in', block: 'Click a blue seat · drag to orbit the section', seat: 'Drag to look around · scroll to zoom', vip: 'Premier suite · drag to look around' };
    const tiers = []; if (V.courtside) tiers.push(V.courtside);
    const t0 = V.tiers.map((t, i) => ({ name: t.name, price: 'from ' + this.fmt(Math.round(V.base[i] * this.mult() / 100) * 100), color: i === 0 ? '#1D4CD8' : '#24489F' }));
    tiers.push(t0[0], { name: 'Premier suites', price: this.fmt(this.suitePrice()), color: '#D9773F' }, ...t0.slice(1));
    if (V.courtside) tiers[0] = { name: V.courtside.name, price: V.courtside.price, color: '#E9ECF1' };
    const seat = st.seat || { row: '', num: '', count: 0, total: '', price: 0, gate: '' };
    const cb = this.curBlock, vip = st.vip, c = st.cart, f = st.f || {}, t = this.totals(), m = st.pm || 'card';
    const fe = st.tried ? (st.ck === 'pay' ? this.payOk() : this.formOk()) : {};
    const bd = (k) => fe[k] ? '#FF8A70' : 'rgba(255,255,255,0.1)';
    const err = { name: fe.name || '', phone: fe.phone || '', email: fe.email || '', nameOn: !!fe.name, phoneOn: !!fe.phone, emailOn: !!fe.email, nameB: bd('name'), phoneB: bd('phone'), emailB: bd('email'), cardB: bd('card'), expB: bd('exp'), cvcB: bd('cvc'), walletB: bd('wallet'), payOn: st.ck === 'pay' && Object.keys(fe).length > 0, pay: Object.values(fe).join(' · ') };
    const left = Math.max(0, (st.holdUntil || 0) - (st.now || Date.now())), mm = Math.floor(left / 60000), ss = Math.floor(left / 1000) % 60;
    const ev = this.EV(); let lastV = null;
    const events = ev.map((x) => { const head = x.venue !== lastV; lastV = x.venue; const cur = x.id === E.id; const vv = this.V()[x.venue];
      return { head, venue: vv.nameA + ' ' + vv.nameB + (x.venue === 'oval' ? ' · HYDERABAD' : ' · KARACHI'), title: x.home + ' vs ' + x.away, sub: x.sport + ' · ' + x.time, dd: x.day.split(' ')[1], mo: x.day.split(' ')[2].toUpperCase(), tag: cur ? 'Selected' : 'From ' + this.fmt(Math.min(...vv.base)), tagColor: cur ? '#FFC845' : '#A1A7B0', bg: cur ? 'rgba(255,200,69,0.08)' : 'transparent', cur: cur ? 'true' : 'false', pick: () => this.pickEvent(x.id) }; });
    const caps = [null].concat(V.base.map((x) => Math.round(x * this.mult() / 100) * 100).sort((a, b) => a - b));
    const budgets = caps.map((v) => { const on = (st.priceMax || null) === v; return { label: v ? 'Up to ' + this.fmt(v).replace('PKR ', 'PKR ') : 'Any price', on: on ? 'true' : 'false', bg: on ? '#F4F5F7' : 'transparent', fg: on ? '#0A0B0D' : '#F4F5F7', border: on ? '#F4F5F7' : 'rgba(255,255,255,0.18)', pick: () => this.setPrice(v) }; });
    const bks = st.bookings || [];
    const bookList = bks.map((x) => ({ ref: x.ref, event: x.event, when: x.when, venue: x.venue, place: x.place, gate: x.gate, total: x.total, status: x.status, sBg: x.status === 'Confirmed' ? 'rgba(127,224,160,0.14)' : 'rgba(255,138,112,0.14)', sFg: x.status === 'Confirmed' ? '#7FE0A0' : '#FF8A70', canCancel: x.status === 'Confirmed', cal: () => this.calendar(x), cancel: () => this.cancelBooking(x.ref) }));
    const set = (k) => (e) => this.setF(k, e.target.value);
    const bk = st.booking || { event: '', when: '', venue: '', ref: '', tickets: [], place: '', total: '', gate: '' };
    const panel = st.drawer === 'tickets' || st.drawer === 'events';
    const selS = this.selIdx != null && this.seats ? this.seats[this.selIdx] : null;
    let fbRows = [];
    if (st.fbMode && step === 'block' && cb) { const rows = {}; this.seats.forEach((s, i) => { if (s.ti === cb.ti && s.sec === cb.sec) (rows[s.row] = rows[s.row] || []).push(i); });
      fbRows = Object.keys(rows).sort((a, b) => b - a).map((r) => ({ label: this.rowL(+r), seats: rows[r].map((i) => { const s = this.seats[i], mine = this.selSet && this.selSet.has(i);
        return { n: String(s.num), bg: mine ? '#FFC845' : (s.taken ? '#132457' : '#1D4CD8'), fg: mine ? '#1A1205' : (s.taken ? '#5A6A96' : '#FFFFFF'), dis: !!s.taken, label: 'Row ' + this.rowL(s.row) + ' seat ' + s.num + (s.taken ? ', booked' : ', available'), pick: () => { if (!s.taken) this.pickSeat(i); } }; }) })); }
    return {
      setCanvas: this.setCanvas, setWrap: this.setWrap, uid: this.uid,
      rootPos: full ? 'position:relative' : 'position:absolute;inset:0', rootH: full ? '100vh' : '100%', rootMin: full ? '640px' : '0px',
      loadText: st.err ? '3D could not start: ' + st.err : 'LOADING STADIUM', loading: !!st.loading, noGL: false, ui: full,
      cursor: step === 'seat' || step === 'vip' ? 'grab' : 'pointer',
      v: { nameA: V.nameA, nameB: V.nameB, tiers }, e: { title: E.home + ' vs ' + E.away, when: E.day + ' · ' + E.time },
      showBack: step !== 'overview' && step !== 'stand' && step !== 'booked', backLabel: { block: 'Stadium', seat: 'Section', vip: 'My seat', checkout: 'Seat view' }[step] || 'Back',
      back: () => this.back(), toggleEvents: () => this.setState({ drawer: st.drawer === 'events' ? null : 'events' }), toggleTickets: () => this.setState({ drawer: st.drawer === 'tickets' ? null : 'tickets' }),
      evOpen: st.drawer === 'events', tkOpen: st.drawer === 'tickets', events, hasBookings: bks.length > 0, bookCount: String(bks.length), noBookings: bks.length === 0, bookList,
      tipOn: (step === 'overview' || step === 'stand') && !!st.tip && !panel, tip: st.tip || { x: 0, y: 0, title: '', line: '', price: '' },
      hsOn: step === 'block' && !!st.hs, hs: st.hs || { x: 0, y: 0, label: '', status: '', color: '' },
      tagOn: step === 'block' && !!st.tag && !!st.seat, tag: st.tag || { x: 0, y: 0 }, seat,
      msgOn: !!st.msg, msg: st.msg || '', clearMsg: () => this.setState({ msg: null }),
      hintOn: !!hints[step] && !panel && !st.cine, hint: hints[step] || '', hintBottom: step === 'overview' || step === 'stand' ? '30px' : '104px',
      isOverview: (step === 'overview' || step === 'stand') && !st.cine, budgets, tour: () => this.tour(),
      isBlock: step === 'block' && !st.cine, block: st.block || { title: '', free: 0, price: '' }, hasSeat: !!st.seat, noSeat: !st.seat, goSeat: () => st.fbMode ? this.zoomToSeat() : this.goSeat(false),
      needs: [1, 2, 3, 4].map((n) => { const on = (st.need || 1) === n; return { n: String(n), on: on ? 'true' : 'false', bg: on ? '#FFC845' : 'transparent', fg: on ? '#1A1205' : '#F4F5F7', border: on ? '#FFC845' : 'rgba(255,255,255,0.18)', pick: () => this.setNeed(n) }; }),
      crowdOn: st.showCrowd !== false, crowdBg: st.showCrowd === false ? 'rgba(255,255,255,0.2)' : '#FFC845', crowdKnob: st.showCrowd === false ? '3px' : '21px', toggleCrowd: () => this.toggleCrowd(),
      isSeat: step === 'seat', isVip: step === 'vip', tk: { section: cb ? cb.num : '', vipTitle: vip ? 'PREMIER SUITE ' + vip.box : '', vipPrice: this.fmt(this.suitePrice()) },
      upgrade: () => this.upgrade(), checkout: () => this.addToCart(false), checkoutVip: () => this.addToCart(true),
      isCheckout: step === 'checkout' && !!c, shotOn: !!st.shot, shot: st.shot || '',
      hold: { text: mm + ':' + String(ss).padStart(2, '0'), bg: left < 120000 ? 'rgba(255,138,112,0.16)' : 'rgba(255,200,69,0.12)', fg: left < 120000 ? '#FF8A70' : '#FFC845' },
      c: { place: c ? (c.vip ? 'Premier suite ' + c.box : 'Section ' + c.section + ' · Row ' + c.seats[0].row) + ' · Seat' + (c.count > 1 ? 's ' : ' ') + c.seats.map((x) => x.num).join(', ') : '' },
      ckSteps: [['1', 'Your details', 'details'], ['2', 'Payment', 'pay']].map(([n, l, k]) => { const on = (st.ck || 'details') === k, done = k === 'details' && st.ck === 'pay'; return { n: done ? '✓' : n, label: l, bg: on ? 'rgba(255,200,69,0.1)' : 'rgba(255,255,255,0.04)', fg: on ? '#F4F5F7' : '#A1A7B0', dot: on || done ? '#FFC845' : 'rgba(255,255,255,0.3)' }; }),
      ckDetails: (st.ck || 'details') === 'details', ckPay: st.ck === 'pay',
      f: { name: f.name || '', phone: f.phone || '', email: f.email || '', card: f.card || '', exp: f.exp || '', cvc: f.cvc || '', wallet: f.wallet || '' }, err,
      fName: set('name'), fPhone: set('phone'), fEmail: set('email'), fCard: set('card'), fExp: set('exp'), fCvc: set('cvc'), fWallet: set('wallet'),
      multi: !!c && c.count > 1, holders: c ? c.seats.map((x, i) => ({ label: 'Seat ' + x.num, val: f['h' + i] || '', set: set('h' + i) })) : [],
      pms: [['card', 'Card', 'Visa, Mastercard'], ['jazzcash', 'JazzCash', 'Mobile wallet'], ['easypaisa', 'Easypaisa', 'Mobile wallet']].map(([k, l, sub]) => { const on = m === k; return { label: l, sub, on: on ? 'true' : 'false', bg: on ? 'rgba(255,200,69,0.08)' : '#16181D', border: on ? '#FFC845' : 'rgba(255,255,255,0.1)', pick: () => this.setState({ pm: k, tried: false }) }; }),
      payCard: m === 'card', payWallet: m !== 'card', pmName: m === 'jazzcash' ? 'JazzCash' : 'Easypaisa',
      promo: st.promo || '', fPromo: (e) => this.setState({ promo: e.target.value, promoMsg: '' }), applyPromo: () => this.applyPromo(), promoMsgOn: !!st.promoMsg, promoMsg: st.promoMsg || '', promoColor: st.promoOk ? '#7FE0A0' : '#FF8A70',
      tot: { line: c ? c.count + ' × ' + (c.vip ? 'Premier suite' : c.tier) + ' · ' + this.fmt(c.unit) : '', sub: this.fmt(t.sub), fee: this.fmt(t.fee), discOn: t.disc > 0, disc: this.fmt(t.disc), total: this.fmt(t.total) },
      ckBack: () => st.ck === 'pay' ? this.setState({ ck: 'details', tried: false }) : this.back(), ckBackLabel: st.ck === 'pay' ? 'Back' : 'Change seats',
      ckNext: () => st.ck === 'pay' ? this.pay() : this.toPay(), ckNextLabel: st.ck === 'pay' ? 'Pay ' + this.fmt(t.total) : 'Continue to payment',
      isBooked: step === 'booked' && !!st.booking, bk, calBk: () => this.calendar(bk),
      goVip: () => this.goVip(), hasVip: !!this.suite,
      sunDay: !!(this.sun && this.sun.day), sunText: !this.V()[this.venueKey()].open ? 'Indoor arena: no sun or rain, air-conditioned at 22°C.' : this.sun ? (this.sun.day ? 'Day match: the sun is ' + Math.round(this.sun.el0 * 57.3) + '° high, from the ' + ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round(((this.sun.az0 * 57.3) % 360) / 45) % 8] + '. Blue seats below are in the shade at the start.' : 'Night match under floodlights, so sun and shade do not matter.') : '',
      sunTitle: this.V()[this.venueKey()].open ? 'SUN AND SHADE' : 'COMFORT', sunLayerOn: !!st.sunLayer, wantShadeOn: !!st.wantShade,
      tSun: () => this.setState({ sunLayer: !st.sunLayer }, () => this.paintSeats()), tShade: () => this.setState({ wantShade: !st.wantShade }, () => this.paintSeats()),
      sunBg: st.sunLayer ? '#FFC845' : 'rgba(255,255,255,0.2)', sunKnob: st.sunLayer ? '21px' : '3px', shBg: st.wantShade ? '#FFC845' : 'rgba(255,255,255,0.2)', shKnob: st.wantShade ? '21px' : '3px',
      pinsOn: !!st.fbMode && (step === 'overview' || step === 'stand') && !panel && !st.cine && !st.ttMove && !st.flying, pins: (st.fbMode && this.pinsFb ? this.pinsFb : []).map((a) => { const q = this.fbToScreen(a.px, a.py); return { x: q.x, y: q.y, code: a.code, name: a.name, bg: a.gate ? '#F4F5F7' : (a.park ? '#3A4150' : 'rgba(12,13,17,0.92)'), fg: a.gate ? '#0A0B0D' : '#F4F5F7' }; }),
      facts: selS && this.amen ? this.seatFacts(selS) : { shade: '', view: '', walk: '', wc: '', food: '', aisle: false, sun0: false },
      fbOv: !!st.fbMode && (step === 'overview' || step === 'stand') && !st.cine, fbBgOn: false,
      hot: (st.fbMode && this.hot ? this.hot : []).map((h) => { const over = st.priceMax && h.b.price > st.priceMax, on = this.hoverBlock === h.b; return { pts: h.pts, fill: over ? 'rgba(4,5,7,0.55)' : (on ? 'rgba(143,192,255,0.38)' : 'rgba(255,255,255,0.001)'), stroke: on ? '#BFD8FF' : 'rgba(255,255,255,0.0)', label: 'Section ' + h.b.num + ', ' + this.vd.tiers[h.b.ti].name + ', ' + (h.b.free ? h.b.free + ' seats from ' + this.fmt(h.b.price) : 'sold out'), enter: () => this.fbHover(h), leave: () => this.fbHover(null), pick: () => this.fbPick(h) }; }),
      vipOn: !!st.fbMode && (step === 'overview' || step === 'stand') && !!this.vipPin && !st.cine && !st.ttMove && !st.flying, vipPin: this.vipPin ? this.fbToScreen(this.vipPin.x, this.vipPin.y) : { x: 0, y: 0 },
      fbMap: !!st.fbMode && step === 'block' && !!cb && !!st.listView, rows: fbRows,
      fbOn: !!st.fbMode, listView: !!st.listView, toggleList: () => this.setState({ listView: !st.listView }), listLabel: st.listView ? 'Show seats on the photo' : 'Show seat list instead',
      cineOn: !!st.cine, cine: st.cine ? { bg: 'url(' + st.cine.src + ')', pos: ((st.cine.f % 6) * 20) + '% ' + (Math.floor(st.cine.f / 6) * 25) + '%', wait: !!st.cine.wait } : { bg: '', pos: '0 0', wait: false },
      secOn: !!st.fbMode && step === 'block' && !!cb && !st.cine, secBg: cb ? 'url(' + this.secSrc(cb) + ')' : '', zoomTf: st.zoom ? 'scale(4.2)' : 'scale(1)', zoomOrigin: st.zoom ? st.zoom.ox + '% ' + st.zoom.oy + '%' : '50% 50%',
      dots: st.fbMode && step === 'block' && cb && !st.listView ? this.seatDots().map((d) => { const s2 = this.seats[d.i], mine = this.selSet && this.selSet.has(d.i), r = Math.max(6, Math.min(10, 190 / d.d)); return { x: d.x.toFixed(1), y: d.y.toFixed(1), r: r.toFixed(1), fill: mine ? '#FFC845' : (s2.taken ? 'rgba(10,14,30,0.55)' : 'rgba(64,120,255,0.92)'), stroke: mine ? '#FFFFFF' : (s2.taken ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)'), label: 'Row ' + this.rowL(s2.row) + ' seat ' + s2.num + (s2.taken ? ', booked' : ', available'), cur: s2.taken ? 'not-allowed' : 'pointer', pick: () => { if (!s2.taken && !st.zoom && this.pickSeat(d.i)) this.zoomToSeat(); } }; }) : [],
      panoOn: !!st.fbMode && (step === 'seat' || step === 'vip' || step === 'checkout' || step === 'booked'), cubeOp: st.cubeReady ? '1' : '0', cubeWait: !st.cubeReady && !!st.cubeU,
      setPanoC: this.setPanoC, cDown: (e) => this.cDown(e), cMove: (e) => this.cMove(e), cUp: () => this.cUp(), cWheel: (e) => this.cWheel(e),
      cL: () => this.cLook(-35, 0, 0), cR: () => this.cLook(35, 0, 0), cUpB: () => this.cLook(0, 15, 0), cDnB: () => this.cLook(0, -15, 0), cIn: () => this.cLook(0, 0, -12), cOut: () => this.cLook(0, 0, 12), cCourt: () => this.cCourt(),
      tt: this.ttVals(), hotOp: st.ttMove || st.flying ? '0' : '1', ttCur: st.ttMove ? 'grabbing' : 'grab', ttCtl: !st.flying && !panel, setTtS: this.setTtS, setTtA: this.setTtA, setTtB: this.setTtB, setTtH: this.setTtH,
      ttDown: (e) => this.ttDown(e), ttMove: (e) => this.ttMove(e), ttUp: () => this.ttUp(), ttWheel: (e) => this.ttWheel(e),
      ttL: () => this.ttTurn(-6), ttR: () => this.ttTurn(6), ttUpB: () => this.ttTilt(-1), ttDnB: () => this.ttTilt(1), ttIn: () => this.ttZoom(1.35), ttOut: () => this.ttZoom(1 / 1.35), ttRst: () => this.ttReset(),
      fade: st.fadeIn && Date.now() - st.fadeIn < 50 ? '0' : '1',
      shotBg: st.shot ? 'url(' + st.shot + ')' : 'none', shotSize: 'cover', shotPos: 'center',
    };
  }
}
