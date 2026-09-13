import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTask, pickTaskSet } from '../physics/units-prefixes-scientific-notation/generator.js';

test('milligram prefix drill teaches milli relative to gram', () => {
  const samples = Array.from({length:100},(_,i)=>createTask({mode:'7',blockId:'prefix-drill',rng:()=>i/100}));
  const task = samples.find(item => item.metadata?.fromUnitId === 'mg' && item.answerType === 'number-unit');
  assert.ok(task, 'expected an mg equivalence task');
  assert.equal(task.answer.unitId, 'g');
  assert.equal(task.metadata.toUnitId, 'g');
  assert.match(task.prompt, /мг в г/);
});

test('8-9 prefix exponent choices are shown as powers of ten', () => {
  const samples = Array.from({length:100},(_,i)=>createTask({mode:'89',blockId:'prefix-drill',rng:()=>i/100}));
  const task = samples.find(item => /показателю степени 10/.test(item.prompt || ''));
  assert.ok(task, 'expected a prefix exponent task');
  assert.match(task.answer, /^10/);
  assert.ok(task.choices.every(choice => /^10/.test(choice)));
});

test('8-9 prefix drill contains reverse power-to-name questions', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'prefix-drill',count:10,rng:()=>0.37});
  assert.ok(tasks.some(task => /^Как называется приставка, соответствующая 10/.test(task.prompt || '')));
});

test('8-9 mixed run always includes mantissa normalization', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'mixed',count:10,rng:()=>0.51});
  assert.ok(tasks.some(task => task.answerType === 'multi-part' && /мантисс|· 10/.test((task.solutionSteps || []).join(' '))));
});

test('library units card has a complete visual theme', () => {
  const css = readFileSync(new URL('../assets/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.physics-units-card\s*\{[^}]*background:/s);
  assert.match(css, /\.physics-units-card \.trainer-badge\s*\{/);
  assert.match(css, /\.physics-units-card \.new-badge\s*\{/);
  assert.match(css, /\.physics-units-card \.open-btn\s*\{/);
});
