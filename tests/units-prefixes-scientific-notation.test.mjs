import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFIXES, UNITS, MODE_BLOCKS, getUnit, getPrefix, unitsForMode
} from '../physics/units-prefixes-scientific-notation/data.js';

test('core prefixes have exact factors and grade availability', () => {
  assert.equal(getPrefix('mega').factor, 1e6);
  assert.equal(getPrefix('kilo').factor, 1e3);
  assert.equal(getPrefix('centi').factor, 1e-2);
  assert.equal(getPrefix('milli').factor, 1e-3);
  assert.equal(getPrefix('micro').factor, 1e-6);
  assert.equal(getPrefix('nano').factor, 1e-9);
  assert.ok(getPrefix('milli').modes.includes('7'));
  assert.ok(!getPrefix('micro').modes.includes('7'));
});

test('grade 7 physical set includes mechanics units and SI mass target', () => {
  const ids = new Set(unitsForMode('7').map(unit => unit.id));
  for (const id of ['km','m','cm','mm','s','ms','kg','g','mg','N','kN','Pa','kPa','J','kJ','MJ','W','kW','MW']) {
    assert.ok(ids.has(id), id);
  }
  assert.equal(getUnit('g').systemUnitId, 'kg');
  assert.equal(getUnit('mg').systemUnitId, 'kg');
  assert.equal(getUnit('kg').factorToSI, 1);
  assert.equal(getUnit('g').factorToSI, 1e-3);
  assert.equal(getUnit('mg').factorToSI, 1e-6);
});

test('area and volume factors use square/cube scaling', () => {
  assert.equal(getUnit('cm2').factorToSI, 1e-4);
  assert.equal(getUnit('mm2').factorToSI, 1e-6);
  assert.equal(getUnit('cm3').factorToSI, 1e-6);
  assert.equal(getUnit('dm3').factorToSI, 1e-3);
  assert.equal(getUnit('L').factorToSI, 1e-3);
  assert.equal(getUnit('mL').factorToSI, 1e-6);
});

import {
  parseNumericInput, approxEqual, toScientific, fromScientific,
  normalizeScientific, convertValue, validateResponse
} from '../physics/units-prefixes-scientific-notation/logic.js';

test('accepts comma and dot as decimal separator', () => {
  assert.equal(parseNumericInput('3,5'), 3.5);
  assert.equal(parseNumericInput('3.5'), 3.5);
  assert.ok(Number.isNaN(parseNumericInput('3,5,2')));
});

test('normalizes positive, small and negative numbers to scientific notation', () => {
  assert.deepEqual(toScientific(3200000), {mantissa:3.2, exponent:6});
  assert.deepEqual(toScientific(0.00042), {mantissa:4.2, exponent:-4});
  assert.deepEqual(toScientific(-0.0042), {mantissa:-4.2, exponent:-3});
  assert.throws(() => toScientific(0), /zero/i);
  assert.deepEqual(normalizeScientific(0.7,-3), {mantissa:7, exponent:-4});
  assert.deepEqual(normalizeScientific(25,-6), {mantissa:2.5, exponent:-5});
});

test('converts physical units through SI factors', () => {
  assert.ok(approxEqual(convertValue(240,'cm','m'), 2.4));
  assert.ok(approxEqual(convertValue(3500,'g','kg'), 3.5));
  assert.ok(approxEqual(convertValue(2.5,'kJ','J'), 2500));
  assert.ok(approxEqual(convertValue(250,'cm3','m3'), 2.5e-4));
  assert.ok(approxEqual(convertValue(2.5,'L','cm3'), 2500));
});

test('validation separates numeric and unit errors', () => {
  const task = {answerType:'number-unit', answer:{number:2.5, unitId:'kJ'}};
  const result = validateResponse(task,{number:'2,5',unitId:'J'});
  assert.equal(result.ok,false);
  assert.equal(result.details.number,true);
  assert.equal(result.details.unit,false);
});

test('scientific validation checks mantissa and exponent independently', () => {
  const task = {answerType:'scientific', answer:{mantissa:4.2,exponent:-4}};
  const result = validateResponse(task,{mantissa:'4,2',exponent:'-3'});
  assert.equal(result.details.mantissa,true);
  assert.equal(result.details.exponent,false);
});

import { createTask, pickTaskSet } from '../physics/units-prefixes-scientific-notation/generator.js';

test('picks exactly requested task count without duplicate signatures', () => {
  const tasks = pickTaskSet({mode:'7',blockId:'mixed',count:20,rng:Math.random});
  assert.equal(tasks.length,20);
  assert.equal(new Set(tasks.map(task => task.signature)).size,20);
});

test('grade 7 generated tasks never require negative exponents', () => {
  for (const blockId of MODE_BLOCKS['7']) {
    const tasks = pickTaskSet({mode:'7',blockId,count:20,rng:Math.random});
    for (const task of tasks) {
      assert.notEqual(task.answerType,'scientific');
      assert.equal(task.metadata?.usesNegativeExponent ?? false,false);
    }
  }
});

test('grade 8-9 mantissa shift includes prefix exponent and normalized result', () => {
  const task = createTask({mode:'89',blockId:'mantissa-shift',rng:()=>0});
  assert.equal(task.answerType,'multi-part');
  assert.ok(task.solutionSteps.length >= 3);
  assert.ok(Number.isInteger(task.answer.exponent));
});

test('rare prefixes are capped in a 20-question run', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'prefix-drill',count:20,rng:Math.random});
  assert.ok(tasks.filter(task => task.metadata?.rarePrefix).length <= 2);
});

test('grade 7 mixed run contains more than one physical dimension', () => {
  const tasks = pickTaskSet({mode:'7',blockId:'mixed',count:15,rng:Math.random});
  assert.ok(new Set(tasks.map(task => task.metadata.dimension)).size >= 3);
});

test('area-volume generator covers liter and cubic-unit relations', () => {
  const tasks = pickTaskSet({mode:'7',blockId:'area-volume',substage:'liters',count:20,rng:Math.random});
  assert.ok(tasks.some(task => ['L','mL'].includes(task.metadata.fromUnitId)));
  assert.ok(tasks.some(task => ['cm3','dm3','m3'].includes(task.metadata.toUnitId)));
});

import {
  createTaskRecord, markHintUsed, markRuleUsed, registerAttempt,
  isClean, summarize, saveBestResult, loadBestResult
} from '../physics/units-prefixes-scientific-notation/progress.js';

test('only first-attempt answers without help are clean', () => {
  let a = createTaskRecord('a');
  a = registerAttempt(a,true);
  assert.equal(isClean(a),true);
  let b = createTaskRecord('b');
  b = registerAttempt(b,false);
  b = registerAttempt(b,true);
  assert.equal(isClean(b),false);
  let c = markHintUsed(createTaskRecord('c'));
  c = registerAttempt(c,true);
  assert.equal(isClean(c),false);
  let d = markRuleUsed(createTaskRecord('d'));
  d = registerAttempt(d,true);
  assert.equal(isClean(d),false);
});

test('mastery threshold is 80 percent clean answers', () => {
  const records = Array.from({length:10},(_,i) => ({
    taskId:String(i), attempts:1, hintUsed:false, ruleUsed:false, solved:true, clean:i<8
  }));
  assert.deepEqual(summarize(records),{total:10,solved:10,clean:8,percent:80,mastered:true});
});

test('best result never decreases', () => {
  const memory = new Map();
  const storage = {
    getItem:key => memory.has(key) ? memory.get(key) : null,
    setItem:(key,value) => memory.set(key,String(value))
  };
  saveBestResult('7','to-si',80,storage);
  saveBestResult('7','to-si',60,storage);
  assert.equal(loadBestResult('7','to-si',storage),80);
  saveBestResult('7','to-si',93,storage);
  assert.equal(loadBestResult('7','to-si',storage),93);
});

test('every grade 7 main block can supply a full 20-question run', () => {
  for (const blockId of ['prefix-drill','to-si','use-prefix','mixed']) {
    assert.equal(pickTaskSet({mode:'7',blockId,count:20,rng:Math.random}).length,20);
  }
  for (const substage of ['area','volume','liters','mixed']) {
    assert.equal(pickTaskSet({mode:'7',blockId:'area-volume',substage,count:20,rng:Math.random}).length,20);
  }
});

test('every grade 8-9 main practice block can supply requested run sizes', () => {
  for (const blockId of ['to-scientific','from-scientific','prefix-drill','prefix-power','unit-conversion','mixed']) {
    for (const count of [10,15,20]) {
      assert.equal(pickTaskSet({mode:'89',blockId,count,rng:Math.random}).length,count);
    }
  }
});

test('mantissa warmup is exactly five learning questions', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'mantissa-warmup',count:5,rng:Math.random});
  assert.equal(tasks.length,5);
  assert.ok(tasks.every(task => task.metadata.learningOnly));
});

test('mantissa shift learning block supplies six tasks', () => {
  assert.equal(pickTaskSet({mode:'89',blockId:'mantissa-shift',count:6,rng:Math.random}).length,6);
});

test('grade 7 SI mass tasks always target kilograms', () => {
  const tasks = pickTaskSet({mode:'7',blockId:'to-si',count:20,rng:Math.random});
  for (const task of tasks.filter(task => task.metadata.dimension === 'mass')) {
    assert.equal(task.answer.unitId,'kg');
  }
});

test('grade 7 task text never exposes negative-power notation', () => {
  for (const blockId of MODE_BLOCKS['7']) {
    const tasks = pickTaskSet({mode:'7',blockId,count:20,rng:Math.random});
    const text = tasks.flatMap(task => [task.prompt ?? '', ...(task.solutionSteps ?? [])]).join(' ');
    assert.doesNotMatch(text,/10\s*(?:\^\s*-|⁻)/);
  }
});

test('grade 8-9 area-volume substages can supply 20 unique tasks', () => {
  for (const substage of ['area','volume','liters','mixed']) {
    assert.equal(pickTaskSet({mode:'89',blockId:'area-volume',substage,count:20,rng:Math.random}).length,20);
  }
});

test('mantissa shift always includes the canonical 0.7 mm example in a six-task run', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'mantissa-shift',count:6,rng:Math.random});
  assert.ok(tasks.some(task => task.prompt.includes('0,7 мм')));
});

test('to-SI tasks ask for SI rather than revealing the target unit in the prompt', () => {
  const task = createTask({mode:'7',blockId:'to-si',rng:()=>0});
  assert.match(task.prompt,/в СИ/);
  assert.doesNotMatch(task.prompt,new RegExp(`в ${getUnit(task.answer.unitId).symbol.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\.$`));
});

test('long prefix drill includes rare prefixes but never more than two', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'prefix-drill',count:20,rng:()=>0.37});
  const rare=tasks.filter(task=>task.metadata?.rarePrefix);
  assert.ok(rare.length >= 1);
  assert.ok(rare.length <= 2);
});

test('volume identities are exact', () => {
  assert.ok(approxEqual(convertValue(1,'mL','cm3'),1));
  assert.ok(approxEqual(convertValue(1,'L','dm3'),1));
  assert.ok(approxEqual(convertValue(1,'m3','L'),1000));
  assert.ok(approxEqual(convertValue(1,'m2','cm2'),10000));
  assert.ok(approxEqual(convertValue(1,'m3','cm3'),1000000));
});

test('canonical mantissa-shift example is 0.7 mm = 0.7·10^-3 m = 7·10^-4 m', () => {
  const task=createTask({mode:'89',blockId:'mantissa-shift',rng:()=>0});
  assert.deepEqual(task.answer,{prefixMantissa:0.7,prefixExponent:-3,mantissa:7,exponent:-4,unitId:'m'});
});

test('standard-form runs include at least one negative source but cap them at two', () => {
  const tasks=pickTaskSet({mode:'89',blockId:'to-scientific',count:20,rng:()=>0.41});
  const negatives=tasks.filter(task=>task.metadata?.negativeNumber);
  assert.ok(negatives.length>=1);
  assert.ok(negatives.length<=2);
});

import { readFileSync } from 'node:fs';

test('trainer shell contains all required screens and rule dialog', () => {
  const html=readFileSync(new URL('../physics/units-prefixes-scientific-notation/index.html',import.meta.url),'utf8');
  for (const id of ['mode-screen','blocks-screen','length-screen','task-screen','result-screen','rule-dialog']) {
    assert.match(html,new RegExp(`id="${id}"`));
  }
  assert.match(html,/7 класс — Единицы и приставки/);
  assert.match(html,/8–9 класс — Стандартный вид и единицы/);
});

test('8-9 theory includes the exact standard-form definition', () => {
  const app=readFileSync(new URL('../physics/units-prefixes-scientific-notation/app.js',import.meta.url),'utf8');
  assert.match(app,/1 ≤ \|a\| &lt; 10/);
  assert.match(app,/a · 10<sup>n<\/sup>/);
});
