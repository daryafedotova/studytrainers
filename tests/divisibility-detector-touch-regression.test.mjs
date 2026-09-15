import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const cssPath = new URL('../math/grade-5-6/divisibility-detector/styles.css', import.meta.url);

test('compact detector buttons keep the 64px detector touch size', () => {
  const css = fs.readFileSync(cssPath,'utf8');
  assert.doesNotMatch(css,/\.detector-row\.compact\s+\.detector-button\s*\{[^}]*\b(?:width|min-width|height):\s*56px/s);
  assert.match(css,/\.detector-row\.compact\s+\.detector-button\s*\{[^}]*width:\s*var\(--detector-size\)[^}]*min-width:\s*var\(--detector-size\)[^}]*height:\s*var\(--detector-size\)/s);
});
