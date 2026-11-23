import React from 'react';

import { code128 } from '../barcode.js';

export default function Barcode({ value, height = 56, className = '' }) {
  const widths = code128(value).split('').map(Number), total = widths.reduce((a, b) => a + b, 0) + 20;
  let x = 10; const bars = [];
  widths.forEach((w, i) => { if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height={height} />); x += w; });
  return (
    <svg viewBox={`0 0 ${total} ${height}`} preserveAspectRatio="none" role="img" aria-label={'Barcode ' + value} className={className}>
      <rect width={total} height={height} fill="#fff" /><g fill="#000">{bars}</g>
    </svg>
  );
}
