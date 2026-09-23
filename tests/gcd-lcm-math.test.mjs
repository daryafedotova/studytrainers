import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPrime, primeFactorization, factorizationToPowers,
  gcd, lcm, divisors, firstMultiples, formatPrimePowers
} from '../react-apps/gcd-lcm-space/src/lib/math.js';

test('classifies primes, composites, and 1', () => {
  assert.equal(isPrime(1), false);
  assert.equal(isPrime(2), true);
  assert.equal(isPrime(29), true);
  assert.equal(isPrime(49), false);
});

test('factorizes and compacts repeated primes', () => {
  assert.deepEqual(primeFactorization(60), [2,2,3,5]);
  assert.deepEqual(factorizationToPowers([2,2,2,3,3]), [
    {prime:2, exponent:3},
    {prime:3, exponent:2}
  ]);
});

test('computes gcd and lcm school cases', () => {
  assert.equal(gcd(72,108), 36);
  assert.equal(gcd(24,25), 1);
  assert.equal(lcm(18,24), 72);
  assert.equal(lcm(12,36), 36);
  assert.equal(lcm(8,15), 120);
});

test('lists divisors and first multiples', () => {
  assert.deepEqual(divisors(12), [1,2,3,4,6,12]);
  assert.deepEqual(firstMultiples(6,5), [6,12,18,24,30]);
});

test('formats factorization with readable superscripts', () => {
  assert.equal(formatPrimePowers(72), '2³ · 3²');
  assert.equal(formatPrimePowers(35), '5 · 7');
});
