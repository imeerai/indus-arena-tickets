import React, { useEffect, useRef, useState } from 'react';
import Stadium from '../engine/Stadium.js';

const hasWebGL = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };

// Slowly turning live model on the home page; a still render stands in when the browser has no WebGL.
export default function HeroStadium() {
  const canvas = useRef(null), [gl] = useState(hasWebGL), [ready, setReady] = useState(false);
  useEffect(() => {
    if (!gl) return;
    const eng = new Stadium({ mode: 'hero' }); eng.canvas = canvas.current; eng.alive = true;
    const off = eng.subscribe(() => { if (eng.state.loading === false) setReady(true); });
    eng.boot(); if (eng.fb) setReady(false);
    return () => { off(); eng.componentWillUnmount(); };
  }, [gl]);
  return (
    <div className="absolute inset-0">
      {(!gl || !ready) && <img src="/assets/tt/1_06.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
      {gl && <canvas ref={canvas} aria-hidden="true" className={'absolute inset-0 h-full w-full cursor-grab transition-opacity duration-1000 ' + (ready ? 'opacity-100' : 'opacity-0')} />}
    </div>
  );
}
