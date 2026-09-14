import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIVISORS, GCD_PRIMES, digitSum, divisibilitySet,
  commonDivisibilitySet, canReduceBy, reduceFractionBy,
  availableReductionDivisors, gcd, isCommonDivisor,
  dividePairBy, validateQuotients, commonPrimeDivisors
} from '../math/grade-5-6/divisibility-detector/logic.js';

test('detects all supported divisibility rules', () => {
  assert.deepEqual(DIVISORS, [2,3,5,9,10]);
  assert.deepEqual(GCD_PRIMES, [2,3,5,7]);
  assert.deepEqual(divisibilitySet(630), [2,3,5,9,10]);
  assert.deepEqual(divisibilitySet(735), [3,5]);
  assert.deepEqual(divisibilitySet(123), [3]);
  assert.deepEqual(divisibilitySet(742), [2]);
});

test('computes digit sums', () => {
  assert.equal(digitSum(738), 18);
  assert.equal(digitSum(10035), 9);
});

test('finds common supported rules for two numbers', () => {
  assert.deepEqual(commonDivisibilitySet(126,180), [2,3,9]);
  assert.deepEqual(commonDivisibilitySet(14,25), []);
});

test('reduces fractions by any valid supported divisor', () => {
  assert.equal(canReduceBy(126,180,9), true);
  assert.deepEqual(reduceFractionBy(126,180,9), {numerator:14,denominator:20});
  assert.deepEqual(availableReductionDivisors(14,20), [2]);
  assert.equal(canReduceBy(150,216,10), false);
  assert.throws(() => reduceFractionBy(150,216,10), /cannot reduce/i);
});

test('supports GCD scratchpad arithmetic', () => {
  assert.equal(gcd(84,126), 42);
  assert.equal(isCommonDivisor(84,126,2), true);
  assert.deepEqual(dividePairBy(84,126,2), {left:42,right:63});
  assert.deepEqual(validateQuotients(84,126,2,'42','63'), {left:true,right:true,ok:true});
  assert.deepEqual(validateQuotients(84,126,2,'41','63'), {left:false,right:true,ok:false});
  assert.deepEqual(commonPrimeDivisors(14,21), [7]);
  assert.deepEqual(commonPrimeDivisors(14,25), []);
});
