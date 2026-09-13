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
