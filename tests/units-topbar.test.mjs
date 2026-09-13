import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../physics/units-prefixes-scientific-notation/index.html', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../physics/units-prefixes-scientific-notation/app.js', import.meta.url), 'utf8');
const stylesCss = readFileSync(new URL('../physics/units-prefixes-scientific-notation/styles.css', import.meta.url), 'utf8');

test('start screen topbar keeps non-library controls hidden before a mode is chosen', () => {
  assert.match(indexHtml, /id="home-btn"[^>]*hidden/);
  assert.match(indexHtml, /id="progress-pill"[^>]*hidden/);
  assert.match(indexHtml, /id="rule-btn"[^>]*hidden/);
});

test('home, progress and rule controls follow the active screen state', () => {
  assert.match(appJs, /const inTask=id==='task-screen'/);
  assert.match(appJs, /progressPill\.hidden=!inTask/);
  assert.match(appJs, /ruleBtn\.hidden=!inTask/);
  assert.match(appJs, /homeBtn\.hidden=id==='mode-screen'/);
});

test('CSS respects hidden controls and shows the stage pill only during a task', () => {
  assert.match(stylesCss, /\[hidden\]\s*\{\s*display\s*:\s*none\s*!important\s*;?\s*\}/);
  assert.match(stylesCss, /#stage-pill\s*\{\s*display\s*:\s*none\s*;?\s*\}/);
  assert.match(stylesCss, /\.shell:has\(#task-screen\.active\)\s+#stage-pill\s*\{\s*display\s*:\s*inline-flex\s*;?\s*\}/);
});
