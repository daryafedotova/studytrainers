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

test('practice setup offers 5, 10, 15, 20 tasks and defaults to 10', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/function\s+renderPracticeSetup\b|const\s+renderPracticeSetup\s*=/);
  assert.match(source,/practiceCount:\s*10/);
  assert.match(source,/const\s+options\s*=\s*\[5,10,15,20\]/);
  assert.match(source,/data-practice-count=['"]\$\{count\}['"]/);
  assert.match(source,/tasksFor\([^)]*count:\s*state\.practiceCount/);
});

test('detector exposes explicit none-applicable answer and mutually exclusive selection', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/data-detector-none/);
  assert.match(source,/Ни один признак не подходит/);
  assert.match(source,/noneApplicable:false/);
  assert.match(source,/divisors:nextNone\s*\?\s*\[\]/);
});

test('pair tasks use one shared divisor selector plus explicit no-common answer', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/data-pair-divisor/);
  assert.match(source,/data-pair-none/);
  assert.match(source,/Ни один признак не подходит обоим/);
  assert.doesNotMatch(source,/data-left-divisor/);
  assert.doesNotMatch(source,/data-right-divisor/);
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

test('app passes precise validation errors into attempt and hint tracking', () => {
  const source = fs.readFileSync(appPath,'utf8');
  assert.match(source,/registerAttempt\(record,result\.ok,result\.skillErrors/);
  assert.match(source,/markHintUsed\(record,result\.skillErrors/);
});

test('detector reveals correct, wrong, and missed outcomes only after checking', () => {
  const appSource = fs.readFileSync(appPath,'utf8');
  const css = fs.readFileSync(cssPath,'utf8');
  assert.match(appSource,/is-correct/);
  assert.match(appSource,/is-wrong/);
  assert.match(appSource,/is-missed/);
  assert.match(appSource,/state\.taskState\.complete/);
  assert.match(css,/\.detector-button\.is-correct/);
  assert.match(css,/\.detector-button\.is-wrong/);
  assert.match(css,/\.detector-button\.is-missed/);
});

test('page background includes a subtle mathematical SVG pattern', () => {
  const css = fs.readFileSync(cssPath,'utf8');
  assert.match(css,/background-image:\s*url\(["']?data:image\/svg\+xml/i);
  assert.match(css,/(÷|%C3%B7|×|%C3%97)/i);
  assert.match(css,/(opacity|fill-opacity)/i);
});