import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../physics/units-prefixes-scientific-notation/index.html', import.meta.url), 'utf8');
const appJs = readFileSync(new URL('../physics/units-prefixes-scientific-notation/app.js', import.meta.url), 'utf8');
const stylesCss = readFileSync(new URL('../physics/units-prefixes-scientific-notation/styles.css', import.meta.url), 'utf8');

test('start screen topbar shows only the library link before a mode is chosen', () => {
  assert.match(indexHtml, /id="home-btn"[^>]*hidden/);
  assert.match(indexHtml, /id="stage-pill"[^>]*hidden/);
  assert.match(indexHtml, /id="progress-pill"[^>]*hidden/);
  assert.match(indexHtml, /id="rule-btn"[^>]*hidden/);
});

test('task-only status controls are shown only on the task screen', () => {
  assert.match(appJs, /const inTask=id==='task-screen'/);
  assert.match(appJs, /stagePill\.hidden=!inTask/);
  assert.match(appJs, /progressPill\.hidden=!inTask/);
  assert.match(appJs, /ruleBtn\.hidden=!inTask/);
  assert.match(appJs, /homeBtn\.hidden=id==='mode-screen'/);
});

test('CSS does not override native hidden state of topbar controls', () => {
  assert.match(stylesCss, /\[hidden\]\s*\{\s*display\s*:\s*none\s*!important\s*;?\s*\}/);
});
