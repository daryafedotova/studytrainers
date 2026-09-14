import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, RULES, tasksFor } from '../math/grade-5-6/divisibility-detector/bank.js';

test('grade routes match approved MVP', () => {
  assert.deepEqual(ROUTES['5'].map(x => x.id), ['learn','yes-no','detector','pair','fractions']);
  assert.deepEqual(ROUTES['6'].map(x => x.id), ['learn','yes-no','detector','pair','gcd','gcd-fractions']);
});

test('rules contain exactly 2, 3, 5, 9, 10', () => {
  assert.deepEqual(Object.keys(RULES).map(Number), [2,3,5,9,10]);
});

test('bank contains contrast, error, fraction, and gcd examples', () => {
  const grade5 = ROUTES['5'].flatMap(block => tasksFor('5',block.id));
  const grade6 = ROUTES['6'].flatMap(block => tasksFor('6',block.id));
  assert.ok(grade5.some(t => t.number === 735));
  assert.ok(grade5.some(t => t.number === 730));
  assert.ok(grade5.some(t => t.type === 'detector-error' && t.number === 435));
  assert.ok(grade5.some(t => t.type === 'fraction-step' && t.numerator === 126 && t.denominator === 180));
  assert.ok(grade5.some(t => t.type === 'fraction-error' && t.numerator === 150 && t.denominator === 216));
  assert.ok(grade6.some(t => t.type === 'gcd' && t.left === 84 && t.right === 126));
  assert.ok(grade6.some(t => t.type === 'gcd' && t.left === 14 && t.right === 25));
  assert.ok(grade6.some(t => t.type === 'gcd-error' && t.left === 48 && t.right === 72));
  assert.ok(grade6.some(t => t.type === 'fraction-gcd' && t.numerator === 84 && t.denominator === 126));
});

test('learning tasks are not scored', () => {
  assert.ok(tasksFor('5','learn').every(task => task.learningOnly === true));
  assert.ok(tasksFor('6','learn').every(task => task.learningOnly === true));
});
