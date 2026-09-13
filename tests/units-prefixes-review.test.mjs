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

test('mantissa warmup does not keep every correct answer in the middle card', () => {
  let state = 123456789;
  const rng = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const tasks = pickTaskSet({mode:'89',blockId:'mantissa-warmup',count:5,rng});
  const positions = tasks.map(task => task.choices.indexOf(task.answer));
  assert.ok(positions.every(position => position >= 0), 'every answer must remain present in choices');
  assert.ok(new Set(positions).size >= 2, `expected varied answer positions, got ${positions.join(',')}`);
});

test('scientific notation in the task prompt cannot split exponent onto a separate line', () => {
  const css = readFileSync(new URL('../physics/units-prefixes-scientific-notation/styles.css', import.meta.url), 'utf8');
  assert.match(css, /\.task-prompt\s+\.formula\s*\{[^}]*white-space\s*:\s*nowrap/i);
});

test('library units card reuses a complete visual card theme', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /class="trainer-card division-card physics-units-card"[^>]*data-subject="physics"[^>]*data-grades="7 8 9"/);
});
