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

const appPath = new URL('../math/grade-5-6/divisibility-detector/app.js', import.meta.url);

test('app implements primary practice renderers', () => {
  const source = fs.readFileSync(appPath,'utf8');
  for (const name of ['renderLearningTask','renderYesNoTask','renderDetectorTask','renderPairTask']) {
    assert.match(source,new RegExp(`function\\s+${name}\\b|const\\s+${name}\\s*=`));
  }
  assert.match(source,/Почему\?/);
  assert.match(source,/Проверить/);
});

test('app contains grade-5 fraction renderer', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/function\s+renderFractionTask\b|const\s+renderFractionTask\s*=/);
  assert.match(source,/Можно сократить ещё\?/);
});

test('app contains gcd scratchpad renderers', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/function\s+renderGcdTask\b|const\s+renderGcdTask\s*=/);
  assert.match(source,/function\s+renderGcdFractionTask\b|const\s+renderGcdFractionTask\s*=/);
  assert.match(source,/Общих больше нет/);
});

test('app contains results screen and clean-solution wording', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/function\s+renderResults\b|const\s+renderResults\s*=/);
  assert.match(source,/Чисто решено/);
  assert.match(source,/Потренировать слабые места/);
});

test('route status distinguishes a stored zero-percent result from no attempt', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/hasBlockBest/);
  assert.match(source,/hasBest\s*\?\s*`Лучший результат:/);
});
