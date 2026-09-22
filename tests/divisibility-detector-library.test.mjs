import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const library = fs.readFileSync(new URL('../index.html', import.meta.url),'utf8');

test('library exposes divisibility detector for grades 5 and 6', () => {
  assert.match(library,/href="math\/grade-5-6\/divisibility-detector\/"/);
  assert.match(library,/Детектор делимости/);
  assert.match(library,/data-grades="5 6"/);
});

test('library material counter matches eight cards', () => {
  assert.match(library,/id="material-counter">8 материалов</);
});
