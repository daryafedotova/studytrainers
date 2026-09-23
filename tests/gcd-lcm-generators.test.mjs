import test from 'node:test';
import assert from 'node:assert/strict';
import { gcd, lcm, primeFactorization } from '../react-apps/gcd-lcm-space/src/lib/math.js';
import {
  generateLevelTasks, generateMiniBossTasks, generateBossPhaseTasks
} from '../react-apps/gcd-lcm-space/src/lib/task-generators.js';

function seededRng(seed = 123456789) {
  let x = seed;
  return () => ((x = (1103515245 * x + 12345) % 2147483648) / 2147483648);
}

test('every level generates the required mission volume and complete task contract', () => {
  const rng = seededRng();
  for (let level = 1; level <= 8; level += 1) {
    const tasks = generateLevelTasks(level, rng);
    assert.ok(tasks.length >= 5 && tasks.length <= 8, `level ${level} length`);
    assert.ok(tasks.every(t => t.id && t.type && t.prompt && t.skill && t.hint));
  }
});

test('gcd and lcm numeric tasks carry mathematically correct answers', () => {
  const rng = seededRng(42);
  for (const level of [5,7,8]) {
    for (const task of generateLevelTasks(level, rng)) {
      if (task.type === 'numeric' && task.data?.operation === 'gcd' && typeof task.answer === 'number') {
        assert.equal(task.answer, gcd(task.data.a, task.data.b));
      }
      if (task.type === 'numeric' && task.data?.operation === 'lcm' && typeof task.answer === 'number') {
        assert.equal(task.answer, lcm(task.data.a, task.data.b));
      }
    }
  }
});

test('factorization tasks multiply back to the source number', () => {
  const rng = seededRng(99);
  for (const level of [2,3,4,5,7]) {
    for (const task of generateLevelTasks(level, rng)) {
      if (task.data?.number && task.data?.factors) {
        assert.deepEqual(task.data.factors, primeFactorization(task.data.number));
      }
    }
  }
});

test('special pair families are represented over repeated generation', () => {
  const rng = seededRng(7);
  const seen = new Set();
  for (let i = 0; i < 40; i += 1) {
    for (const task of generateLevelTasks(7, rng)) {
      if (task.data?.pairKind) seen.add(task.data.pairKind);
    }
  }
  assert.ok(seen.has('coprime'));
  assert.ok(seen.has('one-divides-other'));
  assert.ok(seen.has('shared-prime-different-exponents'));
});

test('boss phases have mandatory pedagogical tasks', () => {
  const rng = seededRng(123);
  assert.ok(generateBossPhaseTasks(1, rng).length >= 3);
  assert.ok(generateBossPhaseTasks(2, rng).every(t => ['common-factors','gcd'].includes(t.skill)));
  assert.ok(generateBossPhaseTasks(3, rng).some(t => t.skill === 'mixed'));
});

test('minibosses contain two or three independent tasks', () => {
  const rng = seededRng(456);
  for (let level = 1; level <= 8; level += 1) {
    const tasks = generateMiniBossTasks(level, rng);
    assert.ok(tasks.length >= 2 && tasks.length <= 3);
    assert.ok(tasks.every(t => t.miniboss === true));
  }
});

test('GCD factor-choice tasks always offer enough copies of every required prime', () => {
  const rng = seededRng(20260923);
  for (let round = 0; round < 120; round += 1) {
    const tasks = generateLevelTasks(5, rng).filter(task => task.id.includes('gcd-factors'));
    for (const task of tasks) {
      if (task.type !== 'multi') continue;
      for (const prime of new Set(task.answer)) {
        const required = task.answer.filter(value => value === prime).length;
        const offered = task.data.options.filter(value => value === prime).length;
        assert.ok(offered >= required, `НОД(${task.data.a}; ${task.data.b}): нужно ${required}×${prime}, предложено ${offered}`);
      }
    }
  }
});

test('GCD factor-choice tasks never require submitting an empty multi-select answer', () => {
  const rng = seededRng(20260924);
  for (let round = 0; round < 120; round += 1) {
    const tasks = generateLevelTasks(5, rng).filter(task => task.id.includes('gcd-factors'));
    for (const task of tasks) {
      assert.ok(task.type !== 'multi' || task.answer.length > 0, `НОД(${task.data.a}; ${task.data.b}) produced an impossible empty multi-select`);
    }
  }
});
