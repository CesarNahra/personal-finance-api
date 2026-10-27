import test from 'node:test';
import assert from 'node:assert/strict';

import { toCents, fromCents } from '../src/utils/money.js';

test('Monetary values should be converted to integer cents', () => {
  assert.equal(toCents(1), 100);
  assert.equal(toCents(1.15), 115);
  assert.equal(toCents(10.50), 1050);
  assert.equal(toCents(125.50), 12550);
});

test('Integer cents should be converted to monetary values', () => {
  assert.equal(fromCents(100), 1);
  assert.equal(fromCents(115), 1.15);
  assert.equal(fromCents(1050), 10.5);
  assert.equal(fromCents(12550), 125.5);
});

test('Monetary values with more than two decimal places should be rejected', () => {
  assert.throws(
    () => toCents(10.999),
    {
      name: 'TypeError',
      message: 'Amount must have no more than two decimal places.'
    }
  );
});

test('Invalid monetary values should be rejected', () => {
  assert.throws(() => toCents(0), TypeError);
  assert.throws(() => toCents(-10), TypeError);
  assert.throws(() => toCents(Number.NaN), TypeError);
  assert.throws(() => toCents(Number.POSITIVE_INFINITY), TypeError);
});

test('Amounts outside the safe integer range should be rejected', () => {
  assert.throws(
    () => toCents(Number.MAX_SAFE_INTEGER),
    RangeError
  );
});