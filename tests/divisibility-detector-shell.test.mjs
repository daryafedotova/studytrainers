import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const htmlPath = new URL('../math/grade-5-6/divisibility-detector/index.html', import.meta.url);
const cssPath = new URL('../math/grade-5-6/divisibility-detector/styles.css', import.meta.url);

test('static app shell exposes mount and module bootstrap', () => {
  const html = fs.readFileSync(htmlPath,'utf8');
  assert.match(html,/id="app"/);
  assert.match(html,/type="module"[^>]+src="\.\/app\.js"/);
  assert.match(html,/Детектор делимости/i);
});

test('stylesheet includes large touch targets', () => {
  const css = fs.readFileSync(cssPath,'utf8');
  assert.match(css,/--touch-target:\s*48px/);
  assert.match(css,/--detector-size:\s*64px/);
});
