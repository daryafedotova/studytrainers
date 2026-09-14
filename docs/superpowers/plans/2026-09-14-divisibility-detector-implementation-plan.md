# Divisibility Detector MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static GitHub Pages MVP for grades 5–6 that teaches divisibility by 2, 3, 5, 9, 10 and applies those rules to common divisors, fraction reduction, and grade-6 GCD work using a fixed, methodically controlled task bank.

**Architecture:** Create a no-build ES-module application under `math/grade-5-6/divisibility-detector/`. Keep arithmetic/domain rules in pure modules (`logic.js`), fixed curriculum content in `bank.js`, attempt/mastery state in `progress.js`, and DOM rendering/navigation in `app.js`. The UI is a single-page state machine driven by route/block/task data; no server and no runtime generator are used in the MVP.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript ES modules, Node.js 22 built-in `node:test`, GitHub Pages, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-14-divisibility-detector-trainer-design.md`

## Global Constraints

- MVP uses a small fixed bank of examples; no full number generator before user testing.
- Grade 5 never requires GCD terminology or a one-step maximal reduction.
- Grade 5 fraction reduction accepts any mathematically correct step using the available divisibility rules.
- Grade 6 includes a visible step-by-step GCD scratchpad and accepts any correct order of common prime divisors from `2, 3, 5, 7`.
- Training tasks use two attempts: first error gives a targeted hint; second error gives the full explanation.
- A solution is clean only when correct on the first attempt with no hint/rule support used before the answer.
- Mastery threshold is 80% clean solutions.
- No timer and no speed score.
- UI must be usable with mouse and touch; interactive controls use large hit targets.
- App must run directly from GitHub Pages without a build step.

---

### Task 1: Core divisibility and fraction arithmetic

**Files:**
- Create: `math/grade-5-6/divisibility-detector/logic.js`
- Create: `tests/divisibility-detector-logic.test.mjs`

**Interfaces:**
- Produces: `DIVISORS`, `digitSum(number)`, `divisibilitySet(number)`, `sameNumberSet(a,b)`, `commonDivisibilitySet(a,b)`, `canReduceBy(numerator,denominator,divisor)`, `reduceFractionBy(numerator,denominator,divisor)`, `availableReductionDivisors(numerator,denominator)`, `gcd(a,b)`, `isCommonDivisor(a,b,divisor)`, `dividePairBy(a,b,divisor)`, `validateQuotients(a,b,divisor,left,right)`, `commonPrimeDivisors(a,b)`.
- Consumes: nothing.

- [ ] **Step 1: Write failing arithmetic tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DIVISORS, digitSum, divisibilitySet, commonDivisibilitySet,
  canReduceBy, reduceFractionBy, availableReductionDivisors,
  gcd, isCommonDivisor, dividePairBy, validateQuotients,
  commonPrimeDivisors
} from '../math/grade-5-6/divisibility-detector/logic.js';

test('detects all supported divisibility rules', () => {
  assert.deepEqual(DIVISORS, [2,3,5,9,10]);
  assert.deepEqual(divisibilitySet(630), [2,3,5,9,10]);
  assert.deepEqual(divisibilitySet(735), [3,5]);
  assert.deepEqual(divisibilitySet(123), [3]);
  assert.deepEqual(divisibilitySet(742), [2]);
});

test('computes digit sum without string-format dependence', () => {
  assert.equal(digitSum(738), 18);
  assert.equal(digitSum(10035), 9);
});

test('finds intersection of rules for two numbers', () => {
  assert.deepEqual(commonDivisibilitySet(126,180), [2,3,9]);
  assert.deepEqual(commonDivisibilitySet(14,25), []);
});

test('reduces fractions by any valid supported divisor', () => {
  assert.equal(canReduceBy(126,180,9), true);
  assert.deepEqual(reduceFractionBy(126,180,9), {numerator:14, denominator:20});
  assert.deepEqual(availableReductionDivisors(14,20), [2]);
  assert.equal(canReduceBy(150,210,10), false);
});

test('supports GCD scratchpad arithmetic', () => {
  assert.equal(gcd(84,126), 42);
  assert.equal(isCommonDivisor(84,126,2), true);
  assert.deepEqual(dividePairBy(84,126,2), {left:42,right:63});
  assert.deepEqual(validateQuotients(84,126,2,'42','63'), {left:true,right:true,ok:true});
  assert.deepEqual(commonPrimeDivisors(14,21), [7]);
  assert.deepEqual(commonPrimeDivisors(14,25), []);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
node --test tests/divisibility-detector-logic.test.mjs
```

Expected: FAIL because `logic.js` does not exist.

- [ ] **Step 3: Implement minimal pure arithmetic API**

Implement integer validation, positive-number normalization, supported rule checks, fraction reduction, Euclidean GCD, and common-prime checks restricted to `[2,3,5,7]` for the scratchpad. `reduceFractionBy` must throw for invalid reduction rather than silently rounding.

- [ ] **Step 4: Run tests and verify GREEN**

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

### Task 2: Attempt state, clean solutions, and mastery

**Files:**
- Create: `math/grade-5-6/divisibility-detector/progress.js`
- Create: `tests/divisibility-detector-progress.test.mjs`

**Interfaces:**
- Produces: `createTaskRecord(taskId, skills=[])`, `markRuleUsed(record)`, `markHintUsed(record)`, `registerAttempt(record, result)`, `isClean(record)`, `summarize(records)`, `summarizeSkills(records)`, `saveBlockBest(key,percent,storage)`, `loadBlockBest(key,storage)`.
- Consumes: plain task IDs/skill labels only.

- [ ] **Step 1: Write failing progress tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaskRecord, markRuleUsed, markHintUsed, registerAttempt,
  isClean, summarize, summarizeSkills
} from '../math/grade-5-6/divisibility-detector/progress.js';

test('only a correct unsupported first attempt is clean', () => {
  let a = createTaskRecord('a',['9']);
  a = registerAttempt(a,{ok:true});
  assert.equal(isClean(a), true);

  let b = createTaskRecord('b',['9']);
  b = registerAttempt(b,{ok:false});
  b = registerAttempt(b,{ok:true});
  assert.equal(isClean(b), false);

  let c = markRuleUsed(createTaskRecord('c',['9']));
  c = registerAttempt(c,{ok:true});
  assert.equal(isClean(c), false);
});

test('mastery starts at 80 percent clean', () => {
  const records = Array.from({length:10},(_,i) => ({
    taskId:String(i), skills:['3'], attempts:1, solved:true,
    hintUsed:false, ruleUsed:false, clean:i<8
  }));
  assert.equal(summarize(records).percent, 80);
  assert.equal(summarize(records).mastered, true);
});

test('skill summary separates supported rules', () => {
  const records = [
    {taskId:'a',skills:['9'],clean:false,solved:true},
    {taskId:'b',skills:['9'],clean:true,solved:true},
    {taskId:'c',skills:['5'],clean:true,solved:true}
  ];
  assert.deepEqual(summarizeSkills(records).find(x => x.skill === '9'), {
    skill:'9', total:2, clean:1, percent:50
  });
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-progress.test.mjs
```

Expected: FAIL because the module is missing.

- [ ] **Step 3: Implement immutable record helpers**

`registerAttempt` increments attempts, marks solved on a successful attempt, and caches `clean` only when it is the first attempt and no help was used. `summarize` returns `{total, solved, clean, percent, mastered}` with `mastered: percent >= 80`.

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

### Task 3: Fixed curriculum bank and route map

**Files:**
- Create: `math/grade-5-6/divisibility-detector/bank.js`
- Create: `tests/divisibility-detector-bank.test.mjs`

**Interfaces:**
- Produces: `ROUTES`, `RULES`, `TASK_BANK`, `tasksFor(grade,blockId)`, `blockFor(grade,blockId)`.
- Task types: `learn`, `yes-no-reason`, `detector`, `detector-error`, `pair`, `fraction-step`, `fraction-error`, `gcd`, `gcd-error`, `fraction-gcd`.
- Each training task includes `id`, `type`, `skills`, `prompt`, and type-specific data.

- [ ] **Step 1: Write failing bank tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, RULES, tasksFor } from '../math/grade-5-6/divisibility-detector/bank.js';

test('grade routes match the approved MVP', () => {
  assert.deepEqual(ROUTES['5'].map(x => x.id), ['learn','yes-no','detector','pair','fractions']);
  assert.deepEqual(ROUTES['6'].map(x => x.id), ['learn','yes-no','detector','pair','gcd','gcd-fractions']);
});

test('rules include exactly 2, 3, 5, 9, 10', () => {
  assert.deepEqual(Object.keys(RULES).map(Number), [2,3,5,9,10]);
});

test('fixed bank contains key contrast and application examples', () => {
  const grade5 = ROUTES['5'].flatMap(block => tasksFor('5',block.id));
  const grade6 = ROUTES['6'].flatMap(block => tasksFor('6',block.id));
  assert.ok(grade5.some(t => t.number === 735));
  assert.ok(grade5.some(t => t.number === 730));
  assert.ok(grade5.some(t => t.type === 'detector-error'));
  assert.ok(grade5.some(t => t.type === 'fraction-step' && t.numerator === 126 && t.denominator === 180));
  assert.ok(grade6.some(t => t.type === 'gcd' && t.left === 84 && t.right === 126));
  assert.ok(grade6.some(t => t.type === 'fraction-gcd' && t.numerator === 84 && t.denominator === 126));
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-bank.test.mjs
```

- [ ] **Step 3: Implement the fixed bank**

Use the approved examples: `735`, `730`, `734`, `123`, `126`, `124`, `540`, `630`, `729`, `742`; pairs `42/108`, `126/180`, `84/126`, `14/25`; grade-5 fractions `126/180`, `150/210`; grade-6 GCD/fractions `84/126`, `48/72`, `36/108`, `14/25`. Include at least one fixed `detector-error` task (`435` with the false `10`) and one `gcd-error` task (`НОД(48,72)=12`).

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

### Task 4: Response validation and two-attempt feedback contracts

**Files:**
- Create: `math/grade-5-6/divisibility-detector/validation.js`
- Create: `tests/divisibility-detector-validation.test.mjs`

**Interfaces:**
- Consumes: tasks from `bank.js`, arithmetic helpers from `logic.js`.
- Produces: `validateTask(task,response) -> {ok, details, skillErrors}`, `feedbackFor(task,result,attemptNumber) -> {kind,text,focus?}`.

- [ ] **Step 1: Write failing validation tests**

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
  const wrongReason = validateTask(yesNo,{yes:true,reasonId:'last-digit'});
  assert.equal(wrongReason.ok,false);
  assert.equal(wrongReason.details.conclusion,true);
  assert.equal(wrongReason.details.reason,false);
});

test('detector requires the full exact set', () => {
  const task = {type:'detector',number:735};
  assert.equal(validateTask(task,{divisors:[3,5]}).ok,true);
  assert.equal(validateTask(task,{divisors:[5]}).ok,false);
  assert.equal(validateTask(task,{divisors:[3,5,10]}).ok,false);
});

test('first and second feedback differ', () => {
  const task = {type:'detector',number:735};
  const result = validateTask(task,{divisors:[5]});
  assert.match(feedbackFor(task,result,1).text,/сумм/i);
  assert.match(feedbackFor(task,result,2).text,/7\s*\+\s*3\s*\+\s*5/);
});
```

Add tests for `pair`, `fraction-step`, `gcd` quotient validation, early `no-more-common`, and `gcd-error` diagnosis.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-validation.test.mjs
```

- [ ] **Step 3: Implement task validators and targeted feedback**

Keep feedback deterministic and task-type aware. First attempt must point to the strategy without exposing the answer; second attempt may reveal the full arithmetic/explanation. For fraction arithmetic errors, preserve which quotient was already correct.

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

### Task 5: Static shell, route screen, and visual system

**Files:**
- Create: `math/grade-5-6/divisibility-detector/index.html`
- Create: `math/grade-5-6/divisibility-detector/styles.css`
- Create: `math/grade-5-6/divisibility-detector/app.js`

**Interfaces:**
- `index.html` owns semantic page regions and modal-free containers.
- `app.js` imports `bank.js`, `logic.js`, `validation.js`, `progress.js` and renders all screen states.
- CSS exposes reusable classes for route cards, detector buttons, feedback panels, fractions, and GCD scratch rows.

- [ ] **Step 1: Add a static-structure test before the shell**

Extend `tests/divisibility-detector-bank.test.mjs` with a source-file test that reads the eventual HTML and asserts required mount points and module script:

```js
import fs from 'node:fs';

const htmlPath = new URL('../math/grade-5-6/divisibility-detector/index.html', import.meta.url);

test('app shell exposes the required static regions', () => {
  const html = fs.readFileSync(htmlPath,'utf8');
  assert.match(html,/id="app"/);
  assert.match(html,/type="module"[^>]+src="\.\/app\.js"/);
  assert.match(html,/Детектор делимости/i);
});
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-bank.test.mjs
```

Expected: FAIL because `index.html` does not exist.

- [ ] **Step 3: Create the HTML/CSS/app bootstrap**

Create a light, touch-friendly app with a topbar, `#app` mount, 5/6 grade cards, route cards, and a reusable rule panel. Minimum touch target: 48px; detector controls should be larger (about 64px). Avoid permanent color per divisor; use color only for selected/feedback states.

- [ ] **Step 4: Verify static shell and syntax**

```bash
node --test tests/divisibility-detector-bank.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
```

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/index.html math/grade-5-6/divisibility-detector/styles.css math/grade-5-6/divisibility-detector/app.js tests/divisibility-detector-bank.test.mjs
git commit -m "feat: add divisibility detector app shell"
```

---

### Task 6: Learning, yes/no, detector, and common-pair screens

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/styles.css`
- Modify: `tests/divisibility-detector-validation.test.mjs`

**Interfaces:**
- App renderers: `renderLearningTask`, `renderYesNoTask`, `renderDetectorTask`, `renderPairTask`.
- Shared controls: rule button, attempt feedback, next task button, progress counter.

- [ ] **Step 1: Add validation regression tests for the four screen families**

Add cases proving: `735` detector accepts exactly `[3,5]`; `435` error task accepts turning off `10`; `126/180` pair yields `[2,3,9]`; correct conclusion with wrong reason is not solved.

- [ ] **Step 2: Run tests and verify RED where behavior is missing**

```bash
node --test tests/divisibility-detector-validation.test.mjs
```

- [ ] **Step 3: Implement the four UI flows**

Learning flow: show the two-strategy model and fixed rule microcycles. Yes/no flow: require conclusion then reason before check. Detector flow: toggle any subset of `2,3,5,9,10`; detector-error starts from the supplied wrong set and asks the learner to correct it. Pair flow: learner checks both numbers first; only after submit show the common set.

- [ ] **Step 4: Verify tests and JS syntax**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
```

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/styles.css tests/divisibility-detector-validation.test.mjs
git commit -m "feat: add divisibility practice screens"
```

---

### Task 7: Grade-5 fraction reduction with multiple valid paths

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/styles.css`
- Modify: `tests/divisibility-detector-validation.test.mjs`

**Interfaces:**
- Uses `availableReductionDivisors` and `reduceFractionBy` from `logic.js`.
- UI state stores `fractionHistory: [{numerator,denominator,divisor?}]` rather than one predefined answer path.

- [ ] **Step 1: Add failing path-independence tests**

```js
test('126/180 accepts different valid first reduction steps', () => {
  const task = {type:'fraction-step',numerator:126,denominator:180};
  assert.equal(validateTask(task,{divisor:9}).ok,true);
  assert.equal(validateTask(task,{divisor:3}).ok,true);
  assert.equal(validateTask(task,{divisor:2}).ok,true);
  assert.equal(validateTask(task,{divisor:5}).ok,false);
});
```

Also assert `150/210` rejects `10` and that after `126/180 ÷ 9 -> 14/20`, `2` is still available.

- [ ] **Step 2: Run and verify RED if needed**

```bash
node --test tests/divisibility-detector-validation.test.mjs
```

- [ ] **Step 3: Implement fraction chain UI**

Show each accepted reduction as a persistent chain (`126/180 → 14/20 → 7/10`). Recompute valid supported divisors after every step. Include `Нет` only when no supported common divisor remains. For fixed `fraction-error` tasks, keep the displayed wrong step and ask the learner to identify the invalid divisor/step.

- [ ] **Step 4: Verify**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
```

- [ ] **Step 5: Commit**

```bash
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/styles.css tests/divisibility-detector-validation.test.mjs
git commit -m "feat: add grade 5 stepwise fraction reduction"
```

---

### Task 8: Grade-6 GCD scratchpad and GCD-based fraction reduction

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/styles.css`
- Modify: `tests/divisibility-detector-validation.test.mjs`

**Interfaces:**
- GCD working state: `{rows:[{left,right,divisor?}], factors:[], pendingDivisor:null, quotientDraft:{left:'',right:''}}`.
- Uses `commonPrimeDivisors`, `dividePairBy`, `validateQuotients`, `gcd`.

- [ ] **Step 1: Add failing scratchpad behavior tests**

```js
test('gcd path accepts 2→3→7 and 3→2→7 for 84 and 126', () => {
  assert.equal(gcd(84,126),42);
  assert.deepEqual(commonPrimeDivisors(84,126).sort((a,b)=>a-b), [2,3,7]);
  assert.deepEqual(dividePairBy(84,126,3), {left:28,right:42});
  assert.deepEqual(commonPrimeDivisors(28,42), [2,7]);
});

test('14 and 25 can finish immediately with gcd 1', () => {
  assert.deepEqual(commonPrimeDivisors(14,25), []);
  assert.equal(gcd(14,25),1);
});
```

- [ ] **Step 2: Run tests**

```bash
node --test tests/divisibility-detector-logic.test.mjs tests/divisibility-detector-validation.test.mjs
```

- [ ] **Step 3: Implement scratchpad UI**

At each row show buttons `2,3,5,7,Общих больше нет`. After choosing a valid divisor, reveal two quotient inputs and validate them independently; keep a correct field intact when the other is wrong. On successful quotient validation append the next row and factor. `Общих больше нет` is valid only when `commonPrimeDivisors` returns empty. When finished, require the learner to enter the final GCD before revealing the product statement.

- [ ] **Step 4: Implement `fraction-gcd` continuation**

Reuse the same scratchpad inside the fraction task. After correct GCD entry, collapse the scratchpad to `НОД(a,b)=g`, then ask for `a:g` and `b:g`; validate numerator and denominator independently.

- [ ] **Step 5: Verify and commit**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/styles.css tests/divisibility-detector-*.test.mjs
git commit -m "feat: add grade 6 gcd scratchpad"
```

---

### Task 9: Results, best scores, and weak-skill retry queue

**Files:**
- Modify: `math/grade-5-6/divisibility-detector/app.js`
- Modify: `math/grade-5-6/divisibility-detector/progress.js`
- Modify: `tests/divisibility-detector-progress.test.mjs`

**Interfaces:**
- Use block key format `divisibility-detector:<grade>:<blockId>` in `localStorage`.
- Fixed weak-skill retry: select bank tasks tagged with the two lowest skill percentages; do not generate new numbers.

- [ ] **Step 1: Add failing persistence and weak-skill tests**

```js
test('best block result never decreases', () => {
  const map = new Map();
  const storage = {
    getItem:k => map.get(k) ?? null,
    setItem:(k,v) => map.set(k,String(v))
  };
  saveBlockBest('divisibility-detector:5:detector',80,storage);
  saveBlockBest('divisibility-detector:5:detector',60,storage);
  assert.equal(loadBlockBest('divisibility-detector:5:detector',storage),80);
});
```

Add a test that `summarizeSkills` ranks `9` below `5` when the former has lower clean percentage.

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-progress.test.mjs
```

- [ ] **Step 3: Implement results UI**

Show `Чисто решено: N из M — P%`, mastered at `>=80%`, skill diagnostics for rules 2/3/5/9/10, and GCD-specific diagnostic counters when applicable. Route cards show best result or `Пройдено` for learning-only blocks.

- [ ] **Step 4: Implement fixed weak-skill practice**

Build a retry queue only from existing bank tasks whose `skills` intersect the weakest one or two skills. Keep unrelated fixed tasks in the queue so the learner cannot assume every item targets the same rule.

- [ ] **Step 5: Verify and commit**

```bash
node --test tests/divisibility-detector-*.test.mjs
node --check math/grade-5-6/divisibility-detector/app.js
git add math/grade-5-6/divisibility-detector/app.js math/grade-5-6/divisibility-detector/progress.js tests/divisibility-detector-progress.test.mjs
git commit -m "feat: add detector results and retry practice"
```

---

### Task 10: Library integration and verification workflow

**Files:**
- Modify: `index.html`
- Create: `.github/workflows/verify-divisibility-detector.yml`
- Create: `tests/divisibility-detector-library.test.mjs`

**Interfaces:**
- Library link: `math/grade-5-6/divisibility-detector/`.
- Card metadata: mathematics, grades 5 and 6, general domain.

- [ ] **Step 1: Write the failing library-card test**

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
```

- [ ] **Step 2: Run and verify RED**

```bash
node --test tests/divisibility-detector-library.test.mjs
```

- [ ] **Step 3: Add library card and update visible material count**

Add a mathematics 5–6 card describing divisibility rules and fraction reduction. Change the hard-coded `material-counter` text from `4 материала` to the actual current card count after insertion.

- [ ] **Step 4: Add CI workflow**

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
node --check math/grade-5-6/divisibility-detector/logic.js
node --check math/grade-5-6/divisibility-detector/bank.js
node --check math/grade-5-6/divisibility-detector/progress.js
node --check math/grade-5-6/divisibility-detector/validation.js
node --check math/grade-5-6/divisibility-detector/app.js
git add index.html .github/workflows/verify-divisibility-detector.yml tests/divisibility-detector-library.test.mjs
git commit -m "feat: publish divisibility detector in library"
```

---

### Task 11: Manual MVP acceptance pass

**Files:**
- Modify only files needed to fix failures discovered during this pass.

**Interfaces:**
- Published target: `https://daryafedotova.github.io/studytrainers/math/grade-5-6/divisibility-detector/`

- [ ] **Step 1: Run all automated checks**

```bash
node --test tests/*.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 2: Check every app module syntax**

```bash
for f in math/grade-5-6/divisibility-detector/*.js; do node --check "$f"; done
```

Expected: no output/errors.

- [ ] **Step 3: Manually verify grade-5 route**

Verify: choose grade 5; all five route cards open; learning block explains both strategies; yes/no requires a reason; detector supports multi-select and `Найди ошибку`; pair reveals intersection only after submit; `126/180` can reduce by 9 then 2 and also by an alternative correct path; `150/210 ÷ 10` is rejected with a targeted hint.

- [ ] **Step 4: Manually verify grade-6 route**

Verify: choose grade 6; GCD scratchpad accepts `84/126` via `2→3→7` and `3→2→7`; a wrong quotient only marks the wrong field; `14/25` correctly finishes with GCD 1; `84/126` reduces through GCD 42 to `2/3`; the fixed `НОД(48,72)=12` diagnosis identifies a correct partial reduction but incorrect GCD claim.

- [ ] **Step 5: Manually verify touch/responsive behavior**

At desktop and narrow viewport widths, verify: no horizontal overflow, detector buttons remain at least 48px targets, fraction notation remains readable, GCD rows stack cleanly, no modal is required for hints.

- [ ] **Step 6: Verify GitHub Pages after merge/push**

Confirm the library card opens the published trainer and the deployed page loads CSS/JS without 404s. Only then report the MVP ready for user testing.

---

## Self-Review Notes

- **Spec coverage:** All 14 MVP readiness criteria are represented: grade selection, route maps, learning, yes/no reasoning, detector/error tasks, common-pair intersection, grade-5 path-independent reduction, grade-6 scratchpad, local arithmetic correction, two-level feedback, clean/support distinction, touch UI, Pages deployment, and no full generator.
- **YAGNI:** Full random generation, difficulty distributions, divisors above 7, composite divisor buttons, timers, speed scores, and complex adaptive scheduling are deliberately excluded.
- **Boundaries:** `logic.js` contains mathematics only; `bank.js` contains fixed curriculum content; `validation.js` converts responses into correctness/feedback; `progress.js` owns attempts/mastery/persistence; `app.js` owns DOM state/rendering.
- **Test strategy:** Domain behavior is unit-tested with Node; DOM-heavy rendering is kept thin and covered by source-contract tests plus the manual acceptance pass. No browser automation dependency is introduced for the MVP.
