# Divisibility Detector MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static GitHub Pages MVP for grades 5–6 that teaches divisibility by 2, 3, 5, 9, 10 and applies those rules to common divisors, fraction reduction, and grade-6 GCD work using a fixed, methodically controlled task bank.

**Architecture:** Create a no-build ES-module application under `math/grade-5-6/divisibility-detector/`. Keep arithmetic rules in `logic.js`, fixed curriculum content in `bank.js`, response checking/feedback in `validation.js`, attempt/mastery state in `progress.js`, and DOM/navigation in `app.js`. The UI is a single-page state machine; the MVP has no server and no runtime number generator.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript ES modules, Node.js 22 built-in `node:test`, GitHub Pages, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-14-divisibility-detector-trainer-design.md`

## Global Constraints

- MVP uses a small fixed bank of examples; no full number generator before user testing.
- Grade 5 never requires GCD terminology or maximal one-step reduction.
- Grade 5 accepts any mathematically correct reduction step using supported divisibility rules.
- Grade 6 uses a visible step-by-step GCD scratchpad and accepts any correct order of common prime divisors from `2, 3, 5, 7`.
- Training tasks allow two attempts: first error gives a targeted hint; second error gives a full explanation.
- A solution is clean only when correct on the first attempt with no rule/hint opened before the answer.
- Mastery threshold is 80% clean solutions.
- No timer and no speed score.
- Touch targets are at least 48px; detector buttons are at least 64px.
- App must run directly from GitHub Pages without a build step.

---

### Task 1: Core divisibility, fraction, and GCD arithmetic

**Files:**
- Create: `math/grade-5-6/divisibility-detector/logic.js`
- Create: `tests/divisibility-detector-logic.test.mjs`

**Interfaces:**
- Produces: `DIVISORS`, `GCD_PRIMES`, `digitSum(number)`, `divisibilitySet(number)`, `commonDivisibilitySet(a,b)`, `canReduceBy(numerator,denominator,divisor)`, `reduceFractionBy(numerator,denominator,divisor)`, `availableReductionDivisors(numerator,denominator)`, `gcd(a,b)`, `isCommonDivisor(a,b,divisor)`, `dividePairBy(a,b,divisor)`, `validateQuotients(a,b,divisor,left,right)`, `commonPrimeDivisors(a,b)`.
- Consumes: nothing.

- [ ] **Step 1: Write failing arithmetic tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIVISORS, GCD_PRIMES, digitSum, divisibilitySet,
  commonDivisibilitySet, canReduceBy, reduceFractionBy,
  availableReductionDivisors, gcd, isCommonDivisor,
  dividePairBy, validateQuotients, commonPrimeDivisors
} from '../math/grade-5-6/divisibility-detector/logic.js';

test('detects all supported divisibility rules', () => {
  assert.deepEqual(DIVISORS, [2,3,5,9,10]);
  assert.deepEqual(GCD_PRIMES, [2,3,5,7]);
  assert.deepEqual(divisibilitySet(630), [2,3,5,9,10]);
  assert.deepEqual(divisibilitySet(735), [3,5]);
  assert.deepEqual(divisibilitySet(123), [3]);
  assert.deepEqual(divisibilitySet(742), [2]);
});

test('computes digit sums', () => {
  assert.equal(digitSum(738), 18);
  assert.equal(digitSum(10035), 9);
});

test('finds common supported rules for two numbers', () => {
  assert.deepEqual(commonDivisibilitySet(126,180), [2,3,9]);
  assert.deepEqual(commonDivisibilitySet(14,25), []);
});

test('reduces fractions by any valid supported divisor', () => {
  assert.equal(canReduceBy(126,180,9), true);
  assert.deepEqual(reduceFractionBy(126,180,9), {numerator:14,denominator:20});
  assert.deepEqual(availableReductionDivisors(14,20), [2]);
  assert.equal(canReduceBy(150,210,10), false);
  assert.throws(() => reduceFractionBy(150,210,10), /cannot reduce/i);
});

test('supports GCD scratchpad arithmetic', () => {
  assert.equal(gcd(84,126), 42);
  assert.equal(isCommonDivisor(84,126,2), true);
  assert.deepEqual(dividePairBy(84,126,2), {left:42,right:63});
  assert.deepEqual(validateQuotients(84,126,2,'42','63'), {left:true,right:true,ok:true});
  assert.deepEqual(validateQuotients(84,126,2,'41','63'), {left:false,right:true,ok:false});
  assert.deepEqual(commonPrimeDivisors(14,21), [7]);
  assert.deepEqual(commonPrimeDivisors(14,25), []);
});
```

- [ ] **Step 2: Run test and verify RED**

```bash
node --test tests/divisibility-detector-logic.test.mjs
```

Expected: FAIL because `logic.js` does not exist.

- [ ] **Step 3: Implement minimal arithmetic API**

Use exact integer arithmetic. Normalize inputs with `Math.abs(Number(value))` only after confirming finite integer values. `reduceFractionBy` throws when the divisor is not an integer greater than 1 or does not divide both terms. `gcd` uses Euclid's algorithm. `commonPrimeDivisors` checks only `[2,3,5,7]`.

- [ ] **Step 4: Run tests and syntax check**

```bash
node --test tests/divisibility-detector-logic.test.mjs
node --check math/grade-5-6/divisibility-detector/logic.js
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/logic.js tests/divisibility-detector-logic.test.mjs
git commit -m "feat: add divisibility detector core logic"
```

---

### Task 2: Attempt state, clean solutions, mastery, and persistence

**Files:**
- Create: `math/grade-5-6/divisibility-detector/progress.js`
- Create: `tests/divisibility-detector-progress.test.mjs`

**Interfaces:**
- Produces: `createTaskRecord(taskId,skills=[])`, `markRuleUsed(record)`, `markHintUsed(record)`, `registerAttempt(record,ok)`, `isClean(record)`, `summarize(records)`, `summarizeSkills(records)`, `saveBlockBest(key,percent,storage)`, `loadBlockBest(key,storage)`.

- [ ] **Step 1: Write failing progress tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaskRecord, markRuleUsed, markHintUsed, registerAttempt,
  isClean, summarize, summarizeSkills, saveBlockBest, loadBlockBest
} from '../math/grade-5-6/divisibility-detector/progress.js';

test('only correct unsupported first attempts are clean', () => {
  let a = createTaskRecord('a',['9']);
  a = registerAttempt(a,true);
  assert.equal(isClean(a), true);

  let b = createTaskRecord('b',['9']);
  b = registerAttempt(b,false);
  b = registerAttempt(b,true);
  assert.equal(isClean(b), false);

  let c = markRuleUsed(createTaskRecord('c',['9']));
  c = registerAttempt(c,true);
  assert.equal(isClean(c), false);

  let d = markHintUsed(createTaskRecord('d',['9']));
  d = registerAttempt(d,true);
  assert.equal(isClean(d), false);
});

test('mastery begins at 80 percent clean', () => {
  const records = Array.from({length:10},(_,i) => ({
    taskId:String(i), skills:['3'], attempts:1, solved:true,
    hintUsed:false, ruleUsed:false, clean:i<8
  }));
  assert.deepEqual(summarize(records), {total:10,solved:10,clean:8,percent:80,mastered:true});
});

test('skill summary calculates clean percentage per tag', () => {
  const records = [
    {taskId:'a',skills:['9'],clean:false,solved:true},
    {taskId:'b',skills:['9'],clean:true,solved:true},
    {taskId:'c',skills:['5'],clean:true,solved:true}
  ];
  assert.deepEqual(summarizeSkills(records), [
    {skill:'5',total:1,clean:1,percent:100},
    {skill:'9',total:2,clean:1,percent:50}
  ]);
});

test('best stored result never decreases', () => {
  const map = new Map();
  const storage = {
    getItem:k => map.has(k) ? map.get(k) : null,
    setItem:(k,v) => map.set(k,String(v))
  };
  saveBlockBest('divisibility-detector:5:detector',80,storage);
  saveBlockBest('divisibility-detector:5:detector',60,storage);
  assert.equal(loadBlockBest('divisibility-detector:5:detector',storage),80);
  saveBlockBest('divisibility-detector:5:detector',90,storage);
  assert.equal(loadBlockBest('divisibility-detector:5:detector',storage),90);
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-progress.test.mjs
```

- [ ] **Step 3: Implement immutable progress helpers**

`registerAttempt` returns a new record, increments `attempts`, marks `solved` on success, and sets `clean=true` only for success on attempt 1 when neither help flag is set. `summarizeSkills` returns records sorted lexicographically by skill string so test output is stable.

- [ ] **Step 4: Run and verify GREEN**

```bash
node --test tests/divisibility-detector-progress.test.mjs
node --check math/grade-5-6/divisibility-detector/progress.js
```

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/progress.js tests/divisibility-detector-progress.test.mjs
git commit -m "feat: add detector mastery tracking"
```

---

### Task 3: Fixed curriculum bank and grade routes

**Files:**
- Create: `math/grade-5-6/divisibility-detector/bank.js`
- Create: `tests/divisibility-detector-bank.test.mjs`

**Interfaces:**
- Produces: `ROUTES`, `RULES`, `TASK_BANK`, `tasksFor(grade,blockId)`, `blockFor(grade,blockId)`.
- Task types: `learn`, `yes-no-reason`, `detector`, `detector-error`, `pair`, `fraction-step`, `fraction-error`, `gcd`, `gcd-error`, `fraction-gcd`.
- Every training task contains `id`, `type`, `skills`, `prompt` plus type-specific data.

- [ ] **Step 1: Write failing bank tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, RULES, tasksFor } from '../math/grade-5-6/divisibility-detector/bank.js';

test('grade routes match approved MVP', () => {
  assert.deepEqual(ROUTES['5'].map(x => x.id), ['learn','yes-no','detector','pair','fractions']);
  assert.deepEqual(ROUTES['6'].map(x => x.id), ['learn','yes-no','detector','pair','gcd','gcd-fractions']);
});

test('rules contain exactly 2, 3, 5, 9, 10', () => {
  assert.deepEqual(Object.keys(RULES).map(Number), [2,3,5,9,10]);
});

test('bank contains contrast, error, fraction, and gcd examples', () => {
  const grade5 = ROUTES['5'].flatMap(block => tasksFor('5',block.id));
  const grade6 = ROUTES['6'].flatMap(block => tasksFor('6',block.id));
  assert.ok(grade5.some(t => t.number === 735));
  assert.ok(grade5.some(t => t.number === 730));
  assert.ok(grade5.some(t => t.type === 'detector-error' && t.number === 435));
  assert.ok(grade5.some(t => t.type === 'fraction-step' && t.numerator === 126 && t.denominator === 180));
  assert.ok(grade5.some(t => t.type === 'fraction-error' && t.numerator === 150 && t.denominator === 210));
  assert.ok(grade6.some(t => t.type === 'gcd' && t.left === 84 && t.right === 126));
  assert.ok(grade6.some(t => t.type === 'gcd' && t.left === 14 && t.right === 25));
  assert.ok(grade6.some(t => t.type === 'gcd-error' && t.left === 48 && t.right === 72));
  assert.ok(grade6.some(t => t.type === 'fraction-gcd' && t.numerator === 84 && t.denominator === 126));
});

test('learning tasks are not scored', () => {
  assert.ok(tasksFor('5','learn').every(task => task.learningOnly === true));
  assert.ok(tasksFor('6','learn').every(task => task.learningOnly === true));
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-bank.test.mjs
```

- [ ] **Step 3: Implement the fixed bank**

Use fixed examples from the spec: single numbers `735, 730, 734, 123, 126, 124, 540, 630, 729, 742`; pairs `42/108, 126/180, 84/126, 14/25`; grade-5 fractions `126/180, 150/210`; grade-6 GCD/fractions `84/126, 48/72, 36/108, 14/25`. Define `435` as the detector-error example with supplied wrong set `[3,5,10]`. Define the GCD-error example as `claimedGcd:12` for `48/72` with shown reduced fraction `4/6`.

- [ ] **Step 4: Run and verify GREEN**

```bash
node --test tests/divisibility-detector-bank.test.mjs
node --check math/grade-5-6/divisibility-detector/bank.js
```

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/bank.js tests/divisibility-detector-bank.test.mjs
git commit -m "feat: add fixed divisibility curriculum bank"
```

---

### Task 4: Response validation and two-level feedback

**Files:**
- Create: `math/grade-5-6/divisibility-detector/validation.js`
- Create: `tests/divisibility-detector-validation.test.mjs`

**Interfaces:**
- Consumes: tasks from `bank.js`, arithmetic helpers from `logic.js`.
- Produces: `validateTask(task,response) -> {ok,details,skillErrors}`, `feedbackFor(task,result,attemptNumber) -> {kind,text,focus}`.

- [ ] **Step 1: Write failing validator tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTask, feedbackFor } from '../math/grade-5-6/divisibility-detector/validation.js';

const yesNo = {
  type:'yes-no-reason', divisor:3, number:738,
  answer:{yes:true,reasonId:'sum-18-div3'}
};

test('yes/no requires both conclusion and reason', () => {
  assert.equal(validateTask(yesNo,{yes:true,reasonId:'sum-18-div3'}).ok,true);
  const result = validateTask(yesNo,{yes:true,reasonId:'last-digit'});
  assert.equal(result.ok,false);
  assert.equal(result.details.conclusion,true);
  assert.equal(result.details.reason,false);
});

test('detector requires exact complete set', () => {
  const task = {type:'detector',number:735};
  assert.equal(validateTask(task,{divisors:[3,5]}).ok,true);
  assert.equal(validateTask(task,{divisors:[5]}).ok,false);
  assert.equal(validateTask(task,{divisors:[3,5,10]}).ok,false);
});

test('detector-error requires correcting supplied wrong set', () => {
  const task = {type:'detector-error',number:435,shownDivisors:[3,5,10]};
  assert.equal(validateTask(task,{divisors:[3,5]}).ok,true);
  assert.equal(validateTask(task,{divisors:[3,5,10]}).ok,false);
});

test('pair response must be correct for both numbers before intersection is accepted', () => {
  const task = {type:'pair',left:126,right:180};
  assert.equal(validateTask(task,{left:[2,3,9],right:[2,3,5,9,10]}).ok,true);
  assert.equal(validateTask(task,{left:[2,3],right:[2,3,5,9,10]}).ok,false);
});

test('grade-5 fraction accepts any valid current divisor', () => {
  const task = {type:'fraction-step',numerator:126,denominator:180};
  assert.equal(validateTask(task,{divisor:9}).ok,true);
  assert.equal(validateTask(task,{divisor:3}).ok,true);
  assert.equal(validateTask(task,{divisor:2}).ok,true);
  assert.equal(validateTask(task,{divisor:5}).ok,false);
});

test('gcd quotient fields are validated independently', () => {
  const task = {type:'gcd',left:84,right:126,phase:'quotients',divisor:2};
  const result = validateTask(task,{left:'41',right:'63'});
  assert.equal(result.ok,false);
  assert.deepEqual(result.details,{left:false,right:true});
});

test('early no-more-common is rejected while a supported common prime exists', () => {
  const task = {type:'gcd',left:14,right:21,phase:'choose-divisor'};
  assert.equal(validateTask(task,{noMore:true}).ok,false);
  assert.equal(validateTask({...task,left:14,right:25},{noMore:true}).ok,true);
});

test('gcd error distinguishes partial reduction from true gcd', () => {
  const task = {type:'gcd-error',left:48,right:72,claimedGcd:12,reduced:{numerator:4,denominator:6}};
  assert.equal(validateTask(task,{diagnosis:'valid-reduction-wrong-gcd'}).ok,true);
  assert.equal(validateTask(task,{diagnosis:'all-correct'}).ok,false);
});

test('first and second feedback differ', () => {
  const task = {type:'detector',number:735};
  const result = validateTask(task,{divisors:[5]});
  assert.match(feedbackFor(task,result,1).text,/сумм/i);
  assert.match(feedbackFor(task,result,2).text,/7\s*\+\s*3\s*\+\s*5/);
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-validation.test.mjs
```

- [ ] **Step 3: Implement validators and feedback**

`validateTask` delegates mathematical checks to `logic.js`; it does not duplicate divisibility formulas. For array answers compare sets order-independently. `feedbackFor(...,1)` names the strategy to re-check without revealing the final answer. `feedbackFor(...,2)` includes the concrete last digit, digit sum, common divisor, or quotient as appropriate.

- [ ] **Step 4: Run and verify GREEN**

```bash
node --test tests/divisibility-detector-validation.test.mjs
node --check math/grade-5-6/divisibility-detector/validation.js
```

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/validation.js tests/divisibility-detector-validation.test.mjs
git commit -m "feat: validate detector learning flows"
```

---

### Task 5: App shell, grade selection, route cards, and visual system

**Files:**
- Create: `math/grade-5-6/divisibility-detector/index.html`
- Create: `math/grade-5-6/divisibility-detector/styles.css`
- Create: `math/grade-5-6/divisibility-detector/app.js`
- Create: `tests/divisibility-detector-shell.test.mjs`

**Interfaces:**
- `index.html` contains only the semantic shell and `#app` mount.
- `app.js` imports `bank.js`, `logic.js`, `validation.js`, `progress.js`.
- App state shape: `{screen:'home'|'routes'|'task'|'results', grade:null|'5'|'6', blockId:null|string, taskIndex:0, records:[], taskState:{}}`.

- [ ] **Step 1: Write failing shell contract test**

```js
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
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-shell.test.mjs
```

- [ ] **Step 3: Create shell and route UI**

Home screen text is exactly `ДЕТЕКТОР ДЕЛИМОСТИ` plus the approved subtitle. Show two large cards: `5 класс` and `6 класс`. Route screen maps `ROUTES[grade]` to clickable cards and does not lock any card. Topbar includes `← Разделы`, current block title, progress, and `? Правило` while a task is open.

CSS uses light surfaces, high contrast, no permanent divisor colors, `--touch-target:48px`, `--detector-size:64px`, and responsive stacking below 720px.

- [ ] **Step 4: Run tests and syntax check**

```bash
node --test tests/divisibility-detector-shell.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
```

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/index.html math/grade-5-6/divisibility-detector/styles.css math/grade-5-6/divisibility-detector/app.js tests/divisibility-detector-shell.test.mjs
git commit -m "feat: add divisibility detector app shell"
```

---

### Task 6: Learning, yes/no, detector, error-finding, and common-pair UI

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/styles.css`
- Modify: `tests/divisibility-detector-shell.test.mjs`

**Interfaces:**
- App renderers: `renderLearningTask(task)`, `renderYesNoTask(task)`, `renderDetectorTask(task)`, `renderPairTask(task)`.
- Shared submit path calls `validateTask`, updates the current progress record, then calls `feedbackFor` when needed.

- [ ] **Step 1: Add failing source-contract tests for required controls**

```js
const appPath = new URL('../math/grade-5-6/divisibility-detector/app.js', import.meta.url);

test('app implements primary practice renderers', () => {
  const source = fs.readFileSync(appPath,'utf8');
  for (const name of ['renderLearningTask','renderYesNoTask','renderDetectorTask','renderPairTask']) {
    assert.match(source,new RegExp(`function\\s+${name}\\b|const\\s+${name}\\s*=`));
  }
  assert.match(source,/Почему\?/);
  assert.match(source,/Проверить/);
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-shell.test.mjs
```

- [ ] **Step 3: Implement learning and practice renderers**

Learning: first show the two strategies, then the fixed microcycle for all five rules and contrast screens 5/10 and 3/9. Yes/no: require a `Да/Нет` choice and a reason before enabling `Проверить`. Detector: render toggles `2,3,5,9,10`; detector-error starts with `shownDivisors` already active so the learner edits the set. Pair: render two independent detector groups and reveal `Оба числа делятся на ...` only after a correct submission.

- [ ] **Step 4: Wire two-attempt feedback and rule support**

First incorrect submit keeps the task interactive, marks hint used, and shows first-level feedback inline. Second incorrect submit marks the task unresolved/assisted, reveals full explanation, and enables `Дальше`. Opening `? Правило` in a training block marks rule used; in `learn` it does not affect scoring.

- [ ] **Step 5: Run and commit**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/styles.css tests/divisibility-detector-shell.test.mjs
git commit -m "feat: add divisibility practice screens"
```

---

### Task 7: Grade-5 fraction reduction with path-independent steps

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/styles.css`
- Modify: `tests/divisibility-detector-validation.test.mjs`

**Interfaces:**
- Fraction UI state: `{history:[{numerator,denominator,divisor:null|number}], current:{numerator,denominator}}`.
- Uses `availableReductionDivisors` and `reduceFractionBy`; no predefined reduction path.

- [ ] **Step 1: Add failing path-independence regression tests**

```js
test('after reducing 126/180 by 9, only supported common divisor 2 remains', async () => {
  const { reduceFractionBy, availableReductionDivisors } = await import('../math/grade-5-6/divisibility-detector/logic.js');
  const next = reduceFractionBy(126,180,9);
  assert.deepEqual(next,{numerator:14,denominator:20});
  assert.deepEqual(availableReductionDivisors(next.numerator,next.denominator),[2]);
});

test('150/210 cannot be reduced by 10', () => {
  const task = {type:'fraction-error',numerator:150,denominator:210,shownDivisor:10};
  assert.equal(validateTask(task,{diagnosis:'invalid-divisor'}).ok,true);
});
```

- [ ] **Step 2: Run tests**

```bash
node --test tests/divisibility-detector-logic.test.mjs tests/divisibility-detector-validation.test.mjs
```

- [ ] **Step 3: Implement fraction chain**

Render the fraction vertically with a horizontal bar. Buttons are the currently valid subset of `2,3,5,9,10`; additionally show `Нет` only when `availableReductionDivisors` is empty. On each correct reduction append `→ ÷d → newFraction` to visible history and recompute choices from the new terms. A `fraction-error` task displays the supplied incorrect chain and asks which step is invalid.

- [ ] **Step 4: Run and commit**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/styles.css tests/divisibility-detector-validation.test.mjs
git commit -m "feat: add grade 5 stepwise fraction reduction"
```

---

### Task 8: Grade-6 GCD scratchpad and GCD-based fraction reduction

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/styles.css`
- Modify: `tests/divisibility-detector-logic.test.mjs`
- Modify: `tests/divisibility-detector-shell.test.mjs`

**Interfaces:**
- GCD state: `{rows:[{left,right,divisor:null|number}], factors:[], phase:'choose-divisor'|'quotients'|'final-gcd', pendingDivisor:null|number, draft:{left:'',right:''}}`.
- Renderer: `renderGcdTask(task)` and `renderGcdFractionTask(task)`.

- [ ] **Step 1: Add GCD path tests**

```js
test('84 and 126 support multiple correct prime-factor orders', () => {
  assert.deepEqual(commonPrimeDivisors(84,126), [2,3,7]);
  assert.deepEqual(dividePairBy(84,126,2), {left:42,right:63});
  assert.deepEqual(commonPrimeDivisors(42,63), [3,7]);

  assert.deepEqual(dividePairBy(84,126,3), {left:28,right:42});
  assert.deepEqual(commonPrimeDivisors(28,42), [2,7]);
});

test('14 and 25 terminate immediately with gcd 1', () => {
  assert.deepEqual(commonPrimeDivisors(14,25), []);
  assert.equal(gcd(14,25),1);
});
```

- [ ] **Step 2: Add failing renderer-contract test**

```js
test('app contains gcd scratchpad renderers', () => {
  const source = fs.readFileSync(new URL('../math/grade-5-6/divisibility-detector/app.js', import.meta.url),'utf8');
  assert.match(source,/function\s+renderGcdTask\b|const\s+renderGcdTask\s*=/);
  assert.match(source,/function\s+renderGcdFractionTask\b|const\s+renderGcdFractionTask\s*=/);
  assert.match(source,/Общих больше нет/);
});
```

- [ ] **Step 3: Run and verify RED for renderer contract**

```bash
node --test tests/divisibility-detector-logic.test.mjs tests/divisibility-detector-shell.test.mjs
```

- [ ] **Step 4: Implement scratchpad**

At each row show `2,3,5,7,Общих больше нет`. A valid divisor opens two quotient inputs. Validate each field independently; a correct field becomes read-only/green while the incorrect field remains editable with local feedback. After both are correct append the next row and factor. `Общих больше нет` is accepted only when `commonPrimeDivisors(left,right)` is empty. Then ask the learner to enter final GCD; compare with `gcd(originalLeft,originalRight)`.

- [ ] **Step 5: Implement `fraction-gcd` continuation**

Reuse the scratchpad inside the fraction task. After correct GCD entry collapse it to `НОД(a,b)=g`, render `a:g` and `b:g` inputs, validate them independently, then show the final reduced fraction. For `14/25`, GCD 1 yields feedback `Дробь уже несократима` rather than a pointless divide-by-1 step.

- [ ] **Step 6: Run and commit**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/styles.css tests/divisibility-detector-logic.test.mjs tests/divisibility-detector-shell.test.mjs
git commit -m "feat: add grade 6 gcd scratchpad"
```

---

### Task 9: Results and fixed weak-skill retry

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/bank.js`
- Modify: `tests/divisibility-detector-progress.test.mjs`
- Modify: `tests/divisibility-detector-bank.test.mjs`

**Interfaces:**
- Storage key format: `divisibility-detector:<grade>:<blockId>`.
- `weakSkillTasks(grade,blockId,skillSummary)` returns fixed-bank tasks; no generated numbers.

- [ ] **Step 1: Add failing weak-skill selection test**

```js
import { weakSkillTasks } from '../math/grade-5-6/divisibility-detector/bank.js';

test('weak-skill retry favors weakest rule but keeps contrast tasks', () => {
  const summary = [
    {skill:'3',total:4,clean:4,percent:100},
    {skill:'9',total:4,clean:1,percent:25},
    {skill:'5',total:4,clean:3,percent:75}
  ];
  const tasks = weakSkillTasks('5','detector',summary);
  assert.ok(tasks.length >= 4);
  assert.ok(tasks.filter(t => t.skills.includes('9')).length >= 2);
  assert.ok(tasks.some(t => !t.skills.includes('9')));
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-bank.test.mjs tests/divisibility-detector-progress.test.mjs
```

- [ ] **Step 3: Implement results screen and retry selection**

Results text format: `Чисто решено: N из M — P%.` followed by `Навык освоен` for `P >= 80`, otherwise `Продолжи тренировку`. For rule blocks show rows for available skill tags; for GCD show counters for `gcd-divisor`, `gcd-arithmetic`, and `gcd-finish` tags. Route cards display `Лучший результат: P%` using stored best scores; learning blocks display `Пройдено ✓` after completion. `weakSkillTasks` takes the two lowest non-empty skill percentages, returns fixed matching tasks first, then adds at least one task not carrying those skill tags when available.

- [ ] **Step 4: Run and commit**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/bank.js tests/divisibility-detector-progress.test.mjs tests/divisibility-detector-bank.test.mjs
git commit -m "feat: add detector results and retry practice"
```

---

### Task 10: Library integration and CI verification

**Files:**
- Modify: `index.html`
- Create: `.github/workflows/verify-divisibility-detector.yml`
- Create: `tests/divisibility-detector-library.test.mjs`

**Interfaces:**
- Library URL: `math/grade-5-6/divisibility-detector/`.
- Card metadata: `data-subject="math" data-grades="5 6" data-domain="general"`.

- [ ] **Step 1: Write failing library test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const library = fs.readFileSync(new URL('../index.html', import.meta.url),'utf8');

test('library exposes divisibility detector for grades 5 and 6', () => {
  assert.match(library,/href="math\/grade-5-6\/divisibility-detector\/"/);
  assert.match(library,/Детектор делимости/);
  assert.match(library,/data-grades="5 6"/);
});

test('library material counter matches seven cards', () => {
  assert.match(library,/id="material-counter">7 материалов</);
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-library.test.mjs
```

- [ ] **Step 3: Add library card and correct counter**

Add one mathematics card after the decimal-division card. Badge: `Математика · 5–6 класс`; topic badge: `Делимость`; title: `Детектор делимости`; description: `Признаки делимости на 2, 3, 5, 9 и 10, общие делители, сокращение дробей и НОД для 6 класса.`; link: `math/grade-5-6/divisibility-detector/`. Change counter text to exactly `7 материалов`.

- [ ] **Step 4: Add workflow**

```yaml
name: Verify divisibility detector

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Run detector tests
        run: node --test tests/divisibility-detector-*.test.mjs
      - name: Check syntax
        run: |
          node --check math/grade-5-6/divisibility-detector/logic.js
          node --check math/grade-5-6/divisibility-detector/bank.js
          node --check math/grade-5-6/divisibility-detector/progress.js
          node --check math/grade-5-6/divisibility-detector/validation.js
          node --check math/grade-5-6/divisibility-detector/app.js
```

- [ ] **Step 5: Run full verification and commit**

```bash
node --test tests/*.test.mjs
for f in math/grade-5-6/divisibility-detector/*.js; do node --check "$f"; done
git add index.html .github/workflows/verify-divisibility-detector.yml tests/divisibility-detector-library.test.mjs
git commit -m "feat: publish divisibility detector in library"
```

---

### Task 11: Manual MVP acceptance pass

**Files:**
- Modify only a file whose behavior fails one of the exact checks below; every fix starts with a failing regression test in the relevant `tests/divisibility-detector-*.test.mjs` file.

**Published target:** `https://daryafedotova.github.io/studytrainers/math/grade-5-6/divisibility-detector/`

- [ ] **Step 1: Run all automated checks**

```bash
node --test tests/*.test.mjs
for f in math/grade-5-6/divisibility-detector/*.js; do node --check "$f"; done
```

Expected: all tests pass; syntax commands emit no errors.

- [ ] **Step 2: Verify grade-5 route manually**

Check all of these exact behaviors: 5-class route has 5 cards; learning presents both `последняя цифра` and `сумма цифр`; yes/no cannot submit without a reason; detector 735 accepts exactly 3 and 5; detector-error 435 is fixed by removing 10; pair 126/180 reveals common set 2,3,9 only after submit; `126/180 ÷ 9 -> 14/20 ÷ 2 -> 7/10` works; `126/180 ÷ 3` is also accepted; `150/210 ÷ 10` is rejected on first attempt with a hint rather than full answer.

- [ ] **Step 3: Verify grade-6 route manually**

Check: route has 6 cards; GCD 84/126 accepts `2→3→7` and `3→2→7`; a wrong `84÷2=41` leaves correct `126÷2=63` intact; `14/25` accepts `Общих больше нет` and final GCD 1; `84/126` reduces through GCD 42 to `2/3`; GCD-error `НОД(48,72)=12` is diagnosed as valid partial reduction but incorrect GCD claim.

- [ ] **Step 4: Verify results and help semantics**

Complete one 10-item training run with 8 clean answers and confirm 80% mastery. Open `? Правило` before one otherwise-correct training answer and confirm that answer is solved but not clean. Confirm a first wrong answer receives a strategy hint and a second wrong answer receives full explanation.

- [ ] **Step 5: Verify responsive/touch layout**

At widths 1280px, 768px, and 390px confirm no horizontal overflow; detector buttons remain at least 64px; generic buttons remain at least 48px; pair cards stack at 390px; GCD quotient inputs remain fully visible; inline feedback does not cover controls.

- [ ] **Step 6: Verify deployment**

After the final main commit, confirm the root library shows `7 материалов`, the new card opens the target Pages URL, and the browser network console has no 404 for `styles.css`, `app.js`, `bank.js`, `logic.js`, `validation.js`, or `progress.js`. Only then report the MVP ready for user testing.

---

## Self-Review Notes

- **Spec coverage:** All 14 MVP readiness criteria are mapped to implementation tasks and acceptance checks.
- **No placeholders:** There are no `TBD`, `TODO`, unnamed error-handling steps, or deferred test descriptions.
- **Type/name consistency:** The same module/function names are used across tasks: `logic.js`, `bank.js`, `validation.js`, `progress.js`, `app.js`; `divisibilitySet`, `commonDivisibilitySet`, `availableReductionDivisors`, `gcd`, `commonPrimeDivisors`, `validateTask`, and progress helpers retain the same signatures throughout.
- **YAGNI:** Full random generation, probability balancing, difficulty distributions, divisors above 7, composite GCD buttons, timers, speed scoring, and complex adaptive scheduling are excluded from this MVP.
- **Testing:** Mathematics/state logic is automated with Node; DOM rendering is kept thin and guarded by source contracts plus an exact manual acceptance matrix, avoiding a new browser-test dependency for the MVP.
