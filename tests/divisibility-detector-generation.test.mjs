import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gcd } from '../math/grade-5-6/divisibility-detector/logic.js';

const generatorPath = new URL('../math/grade-5-6/divisibility-detector/practice-generator.js', import.meta.url);
const bankPath = new URL('../math/grade-5-6/divisibility-detector/bank.js', import.meta.url);

function seeded(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function digitSum(number) {
  return String(Math.abs(number)).split('').reduce((sum,digit) => sum + Number(digit),0);
}

async function loadGenerator() {
  if (!fs.existsSync(generatorPath)) return null;
  return import(generatorPath.href);
}

test('practice generator module exists', () => {
  assert.equal(fs.existsSync(generatorPath), true);
});

test('theory stays fixed while practice blocks are generated', async () => {
  const generator = await loadGenerator();
  if (!generator) return;
  assert.equal(typeof generator.generatePracticeTasks, 'function');
  assert.equal(generator.generatePracticeTasks('5','learn',{rng:seeded(1)}), null);

  for (const [grade,block] of [
    ['5','yes-no'],['5','detector'],['5','pair'],['5','fractions'],
    ['6','yes-no'],['6','detector'],['6','pair'],['6','gcd'],['6','gcd-fractions'],
  ]) {
    const tasks = generator.generatePracticeTasks(grade,block,{rng:seeded(10)});
    assert.ok(Array.isArray(tasks) && tasks.length > 0, `${grade}/${block} should generate tasks`);
    assert.equal(new Set(tasks.map(generator.taskSignature)).size,tasks.length,`${grade}/${block} should be unique within one run`);
  }
});

test('two fresh runs can produce different practice sets', async () => {
  const generator = await loadGenerator();
  if (!generator) return;
  const first = generator.generatePracticeTasks('5','detector',{rng:seeded(11)}).map(generator.taskSignature);
  const second = generator.generatePracticeTasks('5','detector',{rng:seeded(99)}).map(generator.taskSignature);
  assert.notDeepEqual(second,first);
});

test('recent task signatures are avoided on the next run', async () => {
  const generator = await loadGenerator();
  if (!generator) return;
  const first = generator.generatePracticeTasks('6','gcd',{rng:seeded(42)});
  const recent = first.map(generator.taskSignature);
  const second = generator.generatePracticeTasks('6','gcd',{rng:seeded(42),recentSignatures:recent});
  const overlap = second.map(generator.taskSignature).filter(signature => recent.includes(signature));
  assert.deepEqual(overlap,[]);
});

test('weak-skill generation creates fresh tasks that target the requested skills', async () => {
  const generator = await loadGenerator();
  if (!generator) return;
  const tasks = generator.generatePracticeTasks('5','yes-no',{
    rng:seeded(7),
    skillFilter:['9','3/9'],
    count:6,
  });
  assert.equal(tasks.length,6);
  assert.ok(tasks.every(task => task.skills.some(skill => ['9','3/9'].includes(String(skill)))));
});

test('detector weak-skill runs use real 3/9 and 5/10 contrast numbers', async () => {
  const generator = await loadGenerator();
  if (!generator) return;
  const threeNine = generator.generatePracticeTasks('5','detector',{rng:seeded(21),skillFilter:['3/9'],count:6});
  assert.ok(threeNine.every(task => digitSum(task.number) % 3 === 0));
  const fiveTen = generator.generatePracticeTasks('5','detector',{rng:seeded(22),skillFilter:['5/10'],count:6});
  assert.ok(fiveTen.every(task => [0,5].includes(task.number % 10)));
});

test('generated grade-5 reducible fractions have no hidden common factor', async () => {
  const generator = await loadGenerator();
  if (!generator) return;
  const tasks = generator.generatePracticeTasks('5','fractions',{rng:seeded(31),count:12});
  const allowedGcds = new Set([2,3,5,6,9,10]);
  const regular = tasks.filter(task => task.type === 'fraction-step');
  assert.ok(regular.length >= 8);
  assert.ok(regular.every(task => allowedGcds.has(gcd(task.numerator,task.denominator))));
});

test('bank integrates generation without regenerating during the same run', () => {
  const source = fs.readFileSync(bankPath,'utf8');
  assert.match(source,/generatePracticeTasks/);
  assert.match(source,/recentSignatures|recentTask/);
  assert.match(source,/skillFilter/);
  assert.match(source,/practiceRunCache|practiceRunVersion/);
});
