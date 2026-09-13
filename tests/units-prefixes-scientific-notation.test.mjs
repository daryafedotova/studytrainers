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
