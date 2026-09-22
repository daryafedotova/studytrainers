import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('library exposes the sixth-grade GCD LCM space trainer', () => {
  assert.match(html, /Космическая экспедиция: НОД и НОК/);
  assert.match(html, /math\/grade-6\/gcd-lcm-space\//);
  assert.match(html, /data-grades="6"/);
});

test('library material counter is incremented to eight', () => {
  assert.match(html, />8 материалов</);
});
