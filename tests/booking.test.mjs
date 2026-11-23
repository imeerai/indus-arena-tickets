// Run with: npm test. Checks the money and ticket-code logic that must never break.
import assert from 'node:assert/strict';
import { code128 } from '../src/barcode.js';
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
const { canCancel, refundOf } = await import('../src/store.js');
// Code 128 for "TR-1": start B, 4 chars, checksum, stop -> 7 symbols of 6 modules + stop's extra bar
const bars = code128('TR-1');
assert.equal(bars.length, 6 * 6 + 7);
assert.equal(bars.slice(0, 6), '211214'); // start code B
assert.ok(bars.endsWith('2331112')); // stop pattern
const e1 = { eventId: 'e1', status: 'Confirmed' };
assert.equal(canCancel(e1, Date.UTC(2026, 10, 20)), true, 'cancel allowed 8 days before');
assert.equal(canCancel(e1, Date.UTC(2026, 10, 27, 15)), false, 'no cancel inside 48 hours');
assert.equal(canCancel({ ...e1, transferredTo: { name: 'X' } }, Date.UTC(2026, 10, 20)), false, 'sender cannot cancel after a transfer');
assert.equal(refundOf({ totalN: 16500, fee: 300 }), 16200);
console.log('booking tests passed');
