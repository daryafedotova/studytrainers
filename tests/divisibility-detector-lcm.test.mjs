import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as logic from '../math/grade-5-6/divisibility-detector/logic.js';
import { ROUTES, tasksFor } from '../math/grade-5-6/divisibility-detector/bank.js';

const appPath = new URL('../math/grade-5-6/divisibility-detector/app.js', import.meta.url);
const cssPath = new URL('../math/grade-5-6/divisibility-detector/styles.css', import.meta.url);

test('LCM search checks successive multiples of the larger number', () => {
  assert.equal(typeof logic.lcmSearchStep, 'function');
  if (typeof logic.lcmSearchStep !== 'function') return;
  assert.deepEqual(logic.lcmSearchStep(12,18,1), {
    smaller:12, larger:18, multiplier:1, candidate:18, isCommon:false
  });
  assert.deepEqual(logic.lcmSearchStep(12,18,2), {
    smaller:12, larger:18, multiplier:2, candidate:36, isCommon:true
  });
  assert.deepEqual(logic.lcmSearchStep(6,18,1), {
    smaller:6, larger:18, multiplier:1, candidate:18, isCommon:true
  });
});

test('LCM helper returns the least positive common multiple', () => {
  assert.equal(typeof logic.lcm, 'function');
  if (typeof logic.lcm !== 'function') return;
  assert.equal(logic.lcm(12,18),36);
  assert.equal(logic.lcm(6,18),18);
  assert.equal(logic.lcm(15,20),60);
  assert.equal(logic.lcm(9,12),36);
});

test('grade 6 places LCM between GCD and GCD fraction reduction', () => {
  assert.deepEqual(
    ROUTES['6'].map(block => block.id),
    ['learn','yes-no','detector','pair','gcd','lcm','gcd-fractions']
  );
  assert.equal(ROUTES['6'].find(block => block.id === 'lcm')?.title, '6. Подбери НОК');
  assert.equal(ROUTES['6'].find(block => block.id === 'gcd-fractions')?.title, '7. Сократи через НОД');
});

test('LCM bank includes direct, two-step and longer searches', () => {
  const tasks = tasksFor('6','lcm');
  assert.ok(tasks.length >= 5);
  for (const [left,right] of [[6,18],[12,18],[8,12],[9,12],[15,20]]) {
    assert.ok(tasks.some(task => task.type === 'lcm-search' && task.left === left && task.right === right));
  }
  assert.ok(tasks.every(task => task.skills.includes('lcm-check')));
});

test('app renders the guided LCM selection flow', () => {
  const source = fs.readFileSync(appPath,'utf8');
  const css = fs.readFileSync(cssPath,'utf8');
  assert.match(source,/function\s+renderLcmTask\b|const\s+renderLcmTask\s*=/);
  assert.match(source,/Берём большее число/);
  assert.match(source,/Делится ли/);
  assert.match(source,/НОК\(/);
  assert.match(css,/\.lcm-search/);
});
