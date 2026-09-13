# Тренажёр «Единицы, приставки и стандартный вид» — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать один браузерный тренажёр по физике для 7–9 классов с двумя возрастными режимами: перевод единиц и приставки для 7 класса; стандартный вид, степени десяти, приставки и единицы для 8–9 классов.

**Architecture:** Приложение размещается в `physics/units-prefixes-scientific-notation/` и состоит из независимых ES-модулей: справочные данные, чистая математика/проверка, генератор заданий, механика попыток и прогресса, UI-оркестратор. Все вычисления и генерация тестируются через встроенный `node:test`; UI остаётся на vanilla HTML/CSS/JS без новых зависимостей.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, `localStorage`, Node.js built-in `node:test` + `assert/strict`, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-13-units-prefixes-scientific-notation-trainer-design.md`

## Global Constraints

- 7 класс: не вводить стандартный вид как понятие и не требовать отрицательных степеней.
- 8–9 классы: использовать определение `a · 10ⁿ`, где `1 ≤ |a| < 10`, `n` — целое число.
- Один тренажёр, два режима; все карточки доступны сразу, без жёсткой блокировки.
- Основные блоки предлагают 10 / 15 / 20 заданий; по умолчанию 15.
- Первая ошибка даёт диагностическую подсказку и вторую попытку; после второй ошибки показывается решение.
- «Чистое» решение: верно с первой попытки, без подсказки и без кнопки «Правило».
- Порог освоения основного блока: 80% чистых решений.
- В 7 классе обязательные приставки: мега-, кило-, санти-, милли-; микро- не используется.
- В 8–9 классах основной набор: гига-, мега-, кило-, санти-, милли-, микро-, нано-; дека-, гекто-, деци- — редко.
- Массу в заданиях «Переведи в СИ» приводить к `кг`.
- Площади/объёмы идут только в отдельной карточке.
- Поддерживать русскую запятую и точку во вводе; математическое отображение степеней — верхним индексом.
- Не присоединять произвольную приставку к произвольной единице: разрешённые сочетания задаются данными.
- Без новых npm-зависимостей.

---

## File Map

- Create: `physics/units-prefixes-scientific-notation/data.js` — приставки, единицы, режимы, блоки и разрешённые сочетания.
- Create: `physics/units-prefixes-scientific-notation/logic.js` — преобразования чисел, стандартный вид, конвертация единиц, проверка ответа.
- Create: `physics/units-prefixes-scientific-notation/generator.js` — шаблоны и случайная выборка заданий без дублей.
- Create: `physics/units-prefixes-scientific-notation/progress.js` — две попытки, clean-pass, итоговый процент и `localStorage`.
- Create: `physics/units-prefixes-scientific-notation/app.js` — состояние приложения, навигация, рендер заданий и события.
- Create: `physics/units-prefixes-scientific-notation/index.html` — экраны и доступная разметка.
- Create: `physics/units-prefixes-scientific-notation/styles.css` — адаптивный сенсорный интерфейс.
- Create: `tests/units-prefixes-scientific-notation.test.mjs` — тесты данных, математики, генерации и прогресса.
- Modify: `index.html` — одна библиотечная карточка с `data-grades="7 8 9"`.

---

### Task 1: Справочник приставок и физических единиц

**Files:**
- Create: `physics/units-prefixes-scientific-notation/data.js`
- Create: `tests/units-prefixes-scientific-notation.test.mjs`

**Interfaces:**
- Produces: `PREFIXES`, `UNITS`, `MODE_BLOCKS`, `getUnit(id)`, `getPrefix(id)`, `unitsForMode(mode)`.
- `mode` is `'7' | '89'`.
- Unit shape: `{ id, symbol, dimension, factorToSI, prefixId, modes, systemUnitId, power }`.

- [ ] **Step 1: Write failing data tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFIXES, UNITS, MODE_BLOCKS, getUnit, getPrefix, unitsForMode
} from '../physics/units-prefixes-scientific-notation/data.js';

test('core prefixes have exact factors and grade availability', () => {
  assert.equal(getPrefix('mega').factor, 1e6);
  assert.equal(getPrefix('kilo').factor, 1e3);
  assert.equal(getPrefix('centi').factor, 1e-2);
  assert.equal(getPrefix('milli').factor, 1e-3);
  assert.equal(getPrefix('micro').factor, 1e-6);
  assert.equal(getPrefix('nano').factor, 1e-9);
  assert.ok(getPrefix('milli').modes.includes('7'));
  assert.ok(!getPrefix('micro').modes.includes('7'));
});

test('grade 7 physical set includes mechanics units and SI mass target', () => {
  const ids = new Set(unitsForMode('7').map(unit => unit.id));
  for (const id of ['km','m','cm','mm','s','ms','kg','g','mg','N','kN','Pa','kPa','J','kJ','MJ','W','kW','MW']) {
    assert.ok(ids.has(id), id);
  }
  assert.equal(getUnit('g').systemUnitId, 'kg');
  assert.equal(getUnit('mg').systemUnitId, 'kg');
  assert.equal(getUnit('kg').factorToSI, 1);
  assert.equal(getUnit('g').factorToSI, 1e-3);
  assert.equal(getUnit('mg').factorToSI, 1e-6);
});

test('area and volume factors use square/cube scaling', () => {
  assert.equal(getUnit('cm2').factorToSI, 1e-4);
  assert.equal(getUnit('mm2').factorToSI, 1e-6);
  assert.equal(getUnit('cm3').factorToSI, 1e-6);
  assert.equal(getUnit('dm3').factorToSI, 1e-3);
  assert.equal(getUnit('L').factorToSI, 1e-3);
  assert.equal(getUnit('mL').factorToSI, 1e-6);
});
```

- [ ] **Step 2: Run the tests and verify module-not-found failure**

Run:

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected: FAIL because `data.js` does not exist.

- [ ] **Step 3: Implement exact reference data**

Create `data.js` with these exact prefix factors:

```js
export const PREFIXES = [
  {id:'giga', name:'гига', symbol:'Г', factor:1e9, exponent:9, modes:['89'], rare:false},
  {id:'mega', name:'мега', symbol:'М', factor:1e6, exponent:6, modes:['7','89'], rare:false},
  {id:'kilo', name:'кило', symbol:'к', factor:1e3, exponent:3, modes:['7','89'], rare:false},
  {id:'hecto', name:'гекто', symbol:'г', factor:1e2, exponent:2, modes:['89'], rare:true},
  {id:'deca', name:'дека', symbol:'да', factor:1e1, exponent:1, modes:['89'], rare:true},
  {id:'deci', name:'деци', symbol:'д', factor:1e-1, exponent:-1, modes:['89'], rare:true},
  {id:'centi', name:'санти', symbol:'с', factor:1e-2, exponent:-2, modes:['7','89'], rare:false},
  {id:'milli', name:'милли', symbol:'м', factor:1e-3, exponent:-3, modes:['7','89'], rare:false},
  {id:'micro', name:'микро', symbol:'мк', factor:1e-6, exponent:-6, modes:['89'], rare:false},
  {id:'nano', name:'нано', symbol:'н', factor:1e-9, exponent:-9, modes:['89'], rare:false},
];
```

Populate `UNITS` with explicit allowed entries, not automatic prefix composition:

- 7 class core: `km,m,cm,mm`; `s,ms`; `kg,g,mg`; `N,kN`; `Pa,kPa`; `J,kJ,MJ`; `W,kW,MW`.
- 7 area/volume: `m2,cm2,mm2`; `m3,dm3,cm3`; `L,mL`.
- 8–9 additions: `um,nm`; `us,ns`; `A,mA,uA`; `V,mV,kV`; `Hz,kHz,MHz,GHz`; `MPa`.

Use exact SI factors. Example entries:

```js
export const UNITS = [
  {id:'m',symbol:'м',dimension:'length',factorToSI:1,prefixId:null,modes:['7','89'],systemUnitId:'m',power:1},
  {id:'km',symbol:'км',dimension:'length',factorToSI:1e3,prefixId:'kilo',modes:['7','89'],systemUnitId:'m',power:1},
  {id:'cm',symbol:'см',dimension:'length',factorToSI:1e-2,prefixId:'centi',modes:['7','89'],systemUnitId:'m',power:1},
  {id:'mm',symbol:'мм',dimension:'length',factorToSI:1e-3,prefixId:'milli',modes:['7','89'],systemUnitId:'m',power:1},
  {id:'kg',symbol:'кг',dimension:'mass',factorToSI:1,prefixId:null,modes:['7','89'],systemUnitId:'kg',power:1},
  {id:'g',symbol:'г',dimension:'mass',factorToSI:1e-3,prefixId:null,modes:['7','89'],systemUnitId:'kg',power:1},
  {id:'mg',symbol:'мг',dimension:'mass',factorToSI:1e-6,prefixId:'milli',modes:['7','89'],systemUnitId:'kg',power:1},
  {id:'cm2',symbol:'см²',dimension:'area',factorToSI:1e-4,prefixId:'centi',modes:['7','89'],systemUnitId:'m2',power:2},
  {id:'cm3',symbol:'см³',dimension:'volume',factorToSI:1e-6,prefixId:'centi',modes:['7','89'],systemUnitId:'m3',power:3},
  {id:'L',symbol:'л',dimension:'volume',factorToSI:1e-3,prefixId:null,modes:['7','89'],systemUnitId:'m3',power:3},
  {id:'mL',symbol:'мл',dimension:'volume',factorToSI:1e-6,prefixId:'milli',modes:['7','89'],systemUnitId:'m3',power:3},
];
```

Add lookup functions with `Map` indices and `MODE_BLOCKS` containing exact block IDs:

```js
export const MODE_BLOCKS = {
  '7': ['prefix-drill','to-si','use-prefix','mixed','area-volume'],
  '89': ['mantissa-warmup','to-scientific','from-scientific','prefix-drill','prefix-power','mantissa-shift','unit-conversion','mixed','area-volume'],
};
```

- [ ] **Step 4: Run tests**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected: PASS for data tests.

- [ ] **Step 5: Commit**

```bash
git add physics/units-prefixes-scientific-notation/data.js tests/units-prefixes-scientific-notation.test.mjs
git commit -m "feat: add unit and prefix reference data"
```

---

### Task 2: Чистая математика, стандартный вид и конвертация

**Files:**
- Create: `physics/units-prefixes-scientific-notation/logic.js`
- Modify: `tests/units-prefixes-scientific-notation.test.mjs`

**Interfaces:**
- Consumes: `getUnit(id)` from `data.js`.
- Produces: `parseNumericInput`, `approxEqual`, `toScientific`, `fromScientific`, `normalizeScientific`, `convertValue`, `validateResponse`.

- [ ] **Step 1: Add failing tests for parsing, scientific notation and unit conversion**

```js
import {
  parseNumericInput, approxEqual, toScientific, fromScientific,
  normalizeScientific, convertValue, validateResponse
} from '../physics/units-prefixes-scientific-notation/logic.js';

test('accepts comma and dot as decimal separator', () => {
  assert.equal(parseNumericInput('3,5'), 3.5);
  assert.equal(parseNumericInput('3.5'), 3.5);
  assert.ok(Number.isNaN(parseNumericInput('3,5,2')));
});

test('normalizes positive, small and negative numbers to scientific notation', () => {
  assert.deepEqual(toScientific(3200000), {mantissa:3.2, exponent:6});
  assert.deepEqual(toScientific(0.00042), {mantissa:4.2, exponent:-4});
  assert.deepEqual(toScientific(-0.0042), {mantissa:-4.2, exponent:-3});
  assert.throws(() => toScientific(0), /zero/i);
  assert.deepEqual(normalizeScientific(0.7,-3), {mantissa:7, exponent:-4});
  assert.deepEqual(normalizeScientific(25,-6), {mantissa:2.5, exponent:-5});
});

test('converts physical units through SI factors', () => {
  assert.ok(approxEqual(convertValue(240,'cm','m'), 2.4));
  assert.ok(approxEqual(convertValue(3500,'g','kg'), 3.5));
  assert.ok(approxEqual(convertValue(2.5,'kJ','J'), 2500));
  assert.ok(approxEqual(convertValue(250,'cm3','m3'), 2.5e-4));
  assert.ok(approxEqual(convertValue(2.5,'L','cm3'), 2500));
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected: FAIL because `logic.js` does not exist.

- [ ] **Step 3: Implement pure conversion functions**

Use the following behavior:

```js
import { getUnit } from './data.js';

export function parseNumericInput(raw) {
  const normalized = String(raw).trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return NaN;
  return Number(normalized);
}

export function approxEqual(a, b, relTol = 1e-9, absTol = 1e-12) {
  const diff = Math.abs(a - b);
  return diff <= Math.max(absTol, relTol * Math.max(Math.abs(a), Math.abs(b)));
}

export function normalizeScientific(mantissa, exponent) {
  if (!Number.isFinite(mantissa) || !Number.isInteger(exponent)) throw new TypeError('invalid scientific value');
  if (mantissa === 0) throw new RangeError('zero has no normalized scientific form');
  let m = mantissa;
  let e = exponent;
  while (Math.abs(m) >= 10) { m /= 10; e += 1; }
  while (Math.abs(m) < 1) { m *= 10; e -= 1; }
  return {mantissa:Number(m.toPrecision(12)), exponent:e};
}

export function toScientific(value) {
  if (!Number.isFinite(value)) throw new TypeError('value must be finite');
  if (value === 0) throw new RangeError('zero has no normalized scientific form');
  return normalizeScientific(value, 0);
}

export function fromScientific(mantissa, exponent) {
  return mantissa * (10 ** exponent);
}

export function convertValue(value, fromUnitId, toUnitId) {
  const from = getUnit(fromUnitId);
  const to = getUnit(toUnitId);
  if (from.dimension !== to.dimension) throw new RangeError('incompatible dimensions');
  return value * from.factorToSI / to.factorToSI;
}
```

Implement `validateResponse(task, response)` with per-answer-part details so UI can highlight only the wrong component. Supported `task.answerType` values: `number-unit`, `scientific`, `number`, `choice`, `multi-part`.

- [ ] **Step 4: Add validation tests**

```js
test('validation separates numeric and unit errors', () => {
  const task = {answerType:'number-unit', answer:{number:2.5, unitId:'kJ'}};
  const result = validateResponse(task,{number:'2,5',unitId:'J'});
  assert.equal(result.ok,false);
  assert.equal(result.details.number,true);
  assert.equal(result.details.unit,false);
});

test('scientific validation checks mantissa and exponent independently', () => {
  const task = {answerType:'scientific', answer:{mantissa:4.2,exponent:-4}};
  const result = validateResponse(task,{mantissa:'4,2',exponent:'-3'});
  assert.equal(result.details.mantissa,true);
  assert.equal(result.details.exponent,false);
});
```

- [ ] **Step 5: Run tests**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add physics/units-prefixes-scientific-notation/logic.js tests/units-prefixes-scientific-notation.test.mjs
git commit -m "feat: add conversion and scientific notation logic"
```

---

### Task 3: Генератор шаблонных заданий

**Files:**
- Create: `physics/units-prefixes-scientific-notation/generator.js`
- Modify: `tests/units-prefixes-scientific-notation.test.mjs`

**Interfaces:**
- Consumes: `PREFIXES`, `UNITS`, `getUnit`, `getPrefix`, `convertValue`, `toScientific`, `normalizeScientific`.
- Produces: `createTask({mode, blockId, substage, rng})`, `pickTaskSet({mode, blockId, substage, count, rng})`.
- Task shape: `{id, signature, mode, blockId, substage, answerType, prompt, answer, hintKey, ruleKey, solutionSteps, metadata}`.

- [ ] **Step 1: Add failing generator tests**

```js
import { createTask, pickTaskSet } from '../physics/units-prefixes-scientific-notation/generator.js';

test('picks exactly requested task count without duplicate signatures', () => {
  const tasks = pickTaskSet({mode:'7',blockId:'mixed',count:20,rng:Math.random});
  assert.equal(tasks.length,20);
  assert.equal(new Set(tasks.map(task => task.signature)).size,20);
});

test('grade 7 generated tasks never require negative exponents', () => {
  for (const blockId of MODE_BLOCKS['7']) {
    const tasks = pickTaskSet({mode:'7',blockId,count:20,rng:Math.random});
    for (const task of tasks) {
      assert.notEqual(task.answerType,'scientific');
      assert.equal(task.metadata?.usesNegativeExponent ?? false,false);
    }
  }
});

test('grade 8-9 mantissa shift includes prefix exponent and normalized result', () => {
  const task = createTask({mode:'89',blockId:'mantissa-shift',rng:()=>0});
  assert.equal(task.answerType,'multi-part');
  assert.ok(task.solutionSteps.length >= 3);
  assert.ok(Number.isInteger(task.answer.exponent));
});

test('rare prefixes are capped in a 20-question run', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'prefix-drill',count:20,rng:Math.random});
  assert.ok(tasks.filter(task => task.metadata?.rarePrefix).length <= 2);
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected: FAIL because generator exports are missing.

- [ ] **Step 3: Implement deterministic template generation**

Use bounded value pools rather than arbitrary random floats. Include these pools:

```js
const VALUE_POOLS = {
  simple: [0.2,0.4,0.5,0.8,1.2,1.5,2.4,2.5,3.2,3.5,4.5,6.4,7.5,8.2],
  integers: [12,15,20,25,32,40,45,60,75,120,150,240,250,350,450,600,750],
  large: [1200,1500,2400,2500,3200,4500,7500,12000,25000,320000,1500000,3200000],
  small: [0.8,0.25,0.08,0.04,0.007,0.0042,0.00056,0.00042,0.000008],
};
```

Build block-specific template functions so each one chooses only approved unit pairs. For `to-si`, always set target to each unit's `systemUnitId`; this guarantees `g`/`mg → kg`. For `area-volume`, require `substage` in `area | volume | liters | mixed` and emit pedagogical solution steps.

For scientific blocks, never generate zero. In 8–9 mode, include negative source values only as a small explicit template group capped at 2 tasks per run.

Implement `pickTaskSet` by repeatedly calling `createTask`, rejecting duplicate `signature`s and enforcing rare-prefix/negative-number caps; stop with a clear `RangeError` if 500 attempts cannot fill the requested count.

- [ ] **Step 4: Add coverage tests for physical variety and volume identities**

```js
test('grade 7 mixed run contains more than one physical dimension', () => {
  const tasks = pickTaskSet({mode:'7',blockId:'mixed',count:15,rng:Math.random});
  assert.ok(new Set(tasks.map(task => task.metadata.dimension)).size >= 3);
});

test('area-volume generator covers liter and cubic-unit relations', () => {
  const tasks = pickTaskSet({mode:'7',blockId:'area-volume',substage:'liters',count:20,rng:Math.random});
  assert.ok(tasks.some(task => ['L','mL'].includes(task.metadata.fromUnitId)));
  assert.ok(tasks.some(task => ['cm3','dm3','m3'].includes(task.metadata.toUnitId)));
});
```

- [ ] **Step 5: Run tests**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add physics/units-prefixes-scientific-notation/generator.js tests/units-prefixes-scientific-notation.test.mjs
git commit -m "feat: add controlled task generator"
```

---

### Task 4: Механика двух попыток, «Правило» и прогресс

**Files:**
- Create: `physics/units-prefixes-scientific-notation/progress.js`
- Modify: `tests/units-prefixes-scientific-notation.test.mjs`

**Interfaces:**
- Produces: `createTaskRecord(taskId)`, `markHintUsed(record)`, `markRuleUsed(record)`, `registerAttempt(record, correct)`, `isClean(record)`, `summarize(records)`, `saveBestResult`, `loadBestResult`.
- Storage key: `studytrainers:units-prefixes:<mode>:<blockId>`.

- [ ] **Step 1: Add failing progress tests**

```js
import {
  createTaskRecord, markHintUsed, markRuleUsed, registerAttempt,
  isClean, summarize, saveBestResult, loadBestResult
} from '../physics/units-prefixes-scientific-notation/progress.js';

test('only first-attempt answers without help are clean', () => {
  let a = createTaskRecord('a');
  a = registerAttempt(a,true);
  assert.equal(isClean(a),true);

  let b = createTaskRecord('b');
  b = registerAttempt(b,false);
  b = registerAttempt(b,true);
  assert.equal(isClean(b),false);

  let c = markHintUsed(createTaskRecord('c'));
  c = registerAttempt(c,true);
  assert.equal(isClean(c),false);

  let d = markRuleUsed(createTaskRecord('d'));
  d = registerAttempt(d,true);
  assert.equal(isClean(d),false);
});

test('mastery threshold is 80 percent clean answers', () => {
  const records = Array.from({length:10},(_,i) => ({
    taskId:String(i), attempts:1, hintUsed:false, ruleUsed:false, solved:true, clean:i<8
  }));
  assert.deepEqual(summarize(records),{total:10,solved:10,clean:8,percent:80,mastered:true});
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected: FAIL because `progress.js` does not exist.

- [ ] **Step 3: Implement immutable record transitions and storage helpers**

```js
export function createTaskRecord(taskId) {
  return {taskId, attempts:0, hintUsed:false, ruleUsed:false, solved:false, clean:false};
}

export function markHintUsed(record) {
  return {...record, hintUsed:true, clean:false};
}

export function markRuleUsed(record) {
  return {...record, ruleUsed:true, clean:false};
}

export function registerAttempt(record, correct) {
  const attempts = record.attempts + 1;
  const clean = Boolean(correct && attempts === 1 && !record.hintUsed && !record.ruleUsed);
  return {...record, attempts, solved:record.solved || correct, clean:record.clean || clean};
}

export function isClean(record) { return record.clean === true; }

export function summarize(records) {
  const total = records.length;
  const solved = records.filter(r => r.solved).length;
  const clean = records.filter(r => r.clean).length;
  const percent = total ? Math.round(clean / total * 100) : 0;
  return {total, solved, clean, percent, mastered:percent >= 80};
}
```

`saveBestResult(mode, blockId, percent, storage)` saves only if `percent` is greater than the stored value. `loadBestResult` returns an integer 0–100 or `null`. Accept an injected storage object so tests do not depend on browser globals.

- [ ] **Step 4: Test persistence behavior**

```js
test('best result never decreases', () => {
  const memory = new Map();
  const storage = {
    getItem:key => memory.has(key) ? memory.get(key) : null,
    setItem:(key,value) => memory.set(key,String(value))
  };
  saveBestResult('7','to-si',80,storage);
  saveBestResult('7','to-si',60,storage);
  assert.equal(loadBestResult('7','to-si',storage),80);
  saveBestResult('7','to-si',93,storage);
  assert.equal(loadBestResult('7','to-si',storage),93);
});
```

- [ ] **Step 5: Run tests and commit**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
git add physics/units-prefixes-scientific-notation/progress.js tests/units-prefixes-scientific-notation.test.mjs
git commit -m "feat: add attempt and mastery tracking"
```

---

### Task 5: Каркас UI, выбор режима и карточек

**Files:**
- Create: `physics/units-prefixes-scientific-notation/index.html`
- Create: `physics/units-prefixes-scientific-notation/styles.css`
- Create: `physics/units-prefixes-scientific-notation/app.js`

**Interfaces:**
- Consumes: `MODE_BLOCKS`, generator exports, `validateResponse`, progress exports.
- Produces browser screens: mode chooser, block chooser, length chooser, task screen, result screen, rule modal.

- [ ] **Step 1: Create semantic HTML shell**

Build one `<main>` with these screen IDs:

```html
<section class="screen active" id="mode-screen"></section>
<section class="screen" id="blocks-screen"></section>
<section class="screen" id="length-screen"></section>
<section class="screen" id="task-screen"></section>
<section class="screen" id="result-screen"></section>
<dialog id="rule-dialog"></dialog>
```

Top bar must always contain:

```html
<a class="top-btn" href="../../#physics">← В библиотеку</a>
<button class="top-btn" id="home-btn" type="button">К разделам</button>
<button class="top-btn" id="rule-btn" type="button">? Правило</button>
```

`rule-btn` is hidden on screens where no active learning block exists.

- [ ] **Step 2: Implement app state and screen navigation**

Use one explicit state object:

```js
const state = {
  mode: null,
  blockId: null,
  substage: null,
  length: 15,
  tasks: [],
  index: 0,
  records: [],
  currentRecord: null,
  feedback: null,
};
```

Implement `showScreen(id)`, `selectMode(mode)`, `selectBlock(blockId)`, `startRun(count)`, `renderTask()`, `finishRun()`.

Mode screen copy:
- `7 класс — Единицы и приставки`
- `8–9 класс — Стандартный вид и единицы`

Block screen must show all cards immediately and visually number the recommended route without locking cards.

- [ ] **Step 3: Implement large touch-friendly CSS**

Required interaction sizes:

```css
button, select, input { min-height: 48px; }
.mode-card, .block-card { min-height: 150px; }
.answer-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.number-input { min-width:140px; font-size:clamp(1.1rem,2vw,1.45rem); }
@media (max-width:700px) { .answer-row > * { flex:1 1 100%; } }
```

Use light panels, clear focus states, no drag-and-drop, no hover-only controls.

- [ ] **Step 4: Verify JavaScript syntax**

```bash
node --check physics/units-prefixes-scientific-notation/app.js
node --check physics/units-prefixes-scientific-notation/data.js
node --check physics/units-prefixes-scientific-notation/logic.js
node --check physics/units-prefixes-scientific-notation/generator.js
node --check physics/units-prefixes-scientific-notation/progress.js
```

Expected: no output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add physics/units-prefixes-scientific-notation/index.html physics/units-prefixes-scientific-notation/styles.css physics/units-prefixes-scientific-notation/app.js
git commit -m "feat: add trainer navigation shell"
```

---

### Task 6: Реализовать учебные блоки 7 класса

**Files:**
- Modify: `physics/units-prefixes-scientific-notation/app.js`
- Modify: `physics/units-prefixes-scientific-notation/styles.css`
- Modify: `physics/units-prefixes-scientific-notation/generator.js`
- Modify: `tests/units-prefixes-scientific-notation.test.mjs`

**Interfaces:**
- Blocks: `prefix-drill`, `to-si`, `use-prefix`, `mixed`, `area-volume`.
- Area-volume substages: `area`, `volume`, `liters`, `mixed`.

- [ ] **Step 1: Add coverage test that each 7-class block can generate 20 unique tasks**

```js
test('every grade 7 main block can supply a full 20-question run', () => {
  for (const blockId of ['prefix-drill','to-si','use-prefix','mixed']) {
    assert.equal(pickTaskSet({mode:'7',blockId,count:20,rng:Math.random}).length,20);
  }
  for (const substage of ['area','volume','liters','mixed']) {
    assert.equal(pickTaskSet({mode:'7',blockId:'area-volume',substage,count:20,rng:Math.random}).length,20);
  }
});
```

- [ ] **Step 2: Run test and fix any generator bank gaps**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected before fix: at least one block may fail to reach 20 unique signatures. Expand approved templates/value pools until PASS without relaxing no-duplicate rules.

- [ ] **Step 3: Render grade-7 answer types**

Implement these UI forms:

```html
<div class="answer-row" data-answer-type="number-unit">
  <input inputmode="decimal" class="number-input" aria-label="Числовое значение">
  <select class="unit-select" aria-label="Единица измерения"></select>
</div>
```

For prefix matching, use large answer buttons/selects rather than free text. Ensure no `10⁻n` notation appears in grade-7 rules, hints, prompts or solution steps.

- [ ] **Step 4: Add area/volume intro panels**

Show the exact school relationships before each substage:

- area: `1 м = 100 см → 1 м² = 100² см² = 10 000 см²`;
- volume: `1 м³ = 100³ см³ = 1 000 000 см³`;
- liters: `1 мл = 1 см³`, `1 л = 1 дм³`, `1 м³ = 1000 л`.

- [ ] **Step 5: Wire two-attempt feedback**

First wrong answer:
- leave inputs enabled;
- highlight only failed response parts using `validation.details`;
- show one diagnostic hint;
- increment attempt record.

Second wrong answer:
- disable answer inputs;
- render `task.solutionSteps` vertically;
- enable `Следующее →`.

- [ ] **Step 6: Run tests and manual grade-7 smoke check**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
node --check physics/units-prefixes-scientific-notation/app.js
```

Manual checks:
1. `3500 г → 3,5 кг` in «Переведи в СИ».
2. `2500 Дж → 2,5 кДж` in «Используй приставку».
3. No negative exponents anywhere in 7-class mode.
4. `2,5 л → 2500 см³` can appear in mixed liters/volume practice.

- [ ] **Step 7: Commit**

```bash
git add physics/units-prefixes-scientific-notation/app.js physics/units-prefixes-scientific-notation/styles.css physics/units-prefixes-scientific-notation/generator.js tests/units-prefixes-scientific-notation.test.mjs
git commit -m "feat: add grade 7 units practice"
```

---

### Task 7: Реализовать блоки 8–9 класса и стандартный вид

**Files:**
- Modify: `physics/units-prefixes-scientific-notation/app.js`
- Modify: `physics/units-prefixes-scientific-notation/generator.js`
- Modify: `physics/units-prefixes-scientific-notation/styles.css`
- Modify: `tests/units-prefixes-scientific-notation.test.mjs`

**Interfaces:**
- Blocks: `mantissa-warmup`, `to-scientific`, `from-scientific`, `prefix-drill`, `prefix-power`, `mantissa-shift`, `unit-conversion`, `mixed`, `area-volume`.

- [ ] **Step 1: Add full-run coverage tests for 8–9 blocks**

```js
test('every grade 8-9 main practice block can supply requested run sizes', () => {
  for (const blockId of ['to-scientific','from-scientific','prefix-drill','prefix-power','unit-conversion','mixed']) {
    for (const count of [10,15,20]) {
      assert.equal(pickTaskSet({mode:'89',blockId,count,rng:Math.random}).length,count);
    }
  }
});

test('mantissa warmup is exactly five learning questions', () => {
  const tasks = pickTaskSet({mode:'89',blockId:'mantissa-warmup',count:5,rng:Math.random});
  assert.equal(tasks.length,5);
  assert.ok(tasks.every(task => task.metadata.learningOnly));
});

test('mantissa shift learning block supplies six tasks', () => {
  assert.equal(pickTaskSet({mode:'89',blockId:'mantissa-shift',count:6,rng:Math.random}).length,6);
});
```

- [ ] **Step 2: Run and close generator gaps**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
```

Expected after fixes: PASS.

- [ ] **Step 3: Render the definition and five-question mantissa warmup**

Display before warmup:

```html
<div class="theory-card">
  <strong>Стандартный вид числа</strong>
  <p>Число записано в стандартном виде, если оно имеет вид <span class="formula">a · 10<sup>n</sup></span>, где <span class="formula">1 ≤ |a| &lt; 10</span>, а <span class="formula">n</span> — целое число.</p>
</div>
```

Warmup uses answer choices only and never contributes to mastery percent.

- [ ] **Step 4: Render scientific input as two fields**

```html
<div class="scientific-answer">
  <input class="mantissa-input" inputmode="decimal" aria-label="Мантисса">
  <span>· 10</span>
  <input class="exponent-input exponent-box" inputmode="numeric" aria-label="Показатель степени">
</div>
```

Mirror entered exponent in a nearby `<sup>` preview so input remains easy while display remains mathematically correct.

- [ ] **Step 5: Render prefix → power → normalized mantissa chains**

For `mantissa-shift`, show multi-part answers and step feedback for examples such as:

- `0,7 мм = 0,7 · 10⁻³ м = 7 · 10⁻⁴ м`;
- `25 мкА = 25 · 10⁻⁶ А = 2,5 · 10⁻⁵ А`;
- `0,03 кВт = 0,03 · 10³ Вт = 3 · 10¹ Вт`.

The first two tasks may expose an extra hint panel before submission; using it marks the task non-clean.

- [ ] **Step 6: Implement 8–9 area/volume rules via powers**

Show:

- `1 см² = (10⁻²)² м² = 10⁻⁴ м²`;
- `1 см³ = (10⁻²)³ м³ = 10⁻⁶ м³`;
- normalized result example `35 см² = 35 · 10⁻⁴ м² = 3,5 · 10⁻³ м²`.

- [ ] **Step 7: Run tests and manual 8–9 smoke check**

```bash
node --test tests/units-prefixes-scientific-notation.test.mjs
node --check physics/units-prefixes-scientific-notation/app.js
```

Manual checks:
1. `0,00042 → 4,2 · 10⁻⁴`.
2. `6,3 · 10⁵ → 630000`.
3. `мкА → микро → 10⁻⁶`.
4. `0,7 мм → 0,7 · 10⁻³ м → 7 · 10⁻⁴ м`.
5. Rare prefixes never dominate a run.
6. Only 1–2 negative-number source examples appear when that template group is selected.

- [ ] **Step 8: Commit**

```bash
git add physics/units-prefixes-scientific-notation/app.js physics/units-prefixes-scientific-notation/generator.js physics/units-prefixes-scientific-notation/styles.css tests/units-prefixes-scientific-notation.test.mjs
git commit -m "feat: add grade 8-9 scientific notation practice"
```

---

### Task 8: Результаты, сохранение лучших процентов и библиотечная интеграция

**Files:**
- Modify: `physics/units-prefixes-scientific-notation/app.js`
- Modify: `physics/units-prefixes-scientific-notation/index.html`
- Modify: `physics/units-prefixes-scientific-notation/styles.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: `summarize`, `saveBestResult`, `loadBestResult`.
- Produces: final result screen and one library card visible for physics grades 7, 8 and 9.

- [ ] **Step 1: Render the final result summary**

The result screen must show exactly these metrics:

```html
<p>Решено: <strong id="solved-result"></strong></p>
<p>С первой попытки: <strong id="clean-result"></strong></p>
<p id="mastery-result"></p>
```

Example generated copy: `Решено: 15/15`, `С первой попытки: 13/15 — 87%`, `Навык освоен ✓`.

Do not save results for `mantissa-warmup` and `mantissa-shift` because they are learning-only blocks.

- [ ] **Step 2: Show best result on block cards**

On the block selection screen, read `localStorage` and render `Лучший результат: 93%` only when a stored result exists. A new lower result must not replace it.

- [ ] **Step 3: Make «Правило» invalidate clean status immediately**

Before opening `rule-dialog`, call `markRuleUsed(state.currentRecord)`. Closing the dialog must not restore clean eligibility.

- [ ] **Step 4: Add one library card**

Insert into root `index.html`:

```html
<article class="trainer-card physics-units-card" data-subject="physics" data-grades="7 8 9" data-domain="general">
  <div class="trainer-topline">
    <span class="trainer-badge">Физика · 7–9 класс</span>
    <span class="new-badge">Единицы СИ</span>
  </div>
  <h3>Единицы, приставки и стандартный вид</h3>
  <p>Два режима: 7 класс — перевод единиц и приставки; 8–9 класс — степени десяти, стандартный вид и преобразование физических величин.</p>
  <a class="open-btn" href="physics/units-prefixes-scientific-notation/">Открыть тренажёр <span aria-hidden="true">→</span></a>
</article>
```

Do not modify `assets/library.js`; it already supports cards with multiple values in `data-grades` and recalculates the visible counter dynamically.

- [ ] **Step 5: Run the complete automated suite**

```bash
node --test tests/phase-transitions.test.mjs tests/units-prefixes-scientific-notation.test.mjs
node --check physics/units-prefixes-scientific-notation/app.js
node --check physics/units-prefixes-scientific-notation/data.js
node --check physics/units-prefixes-scientific-notation/logic.js
node --check physics/units-prefixes-scientific-notation/generator.js
node --check physics/units-prefixes-scientific-notation/progress.js
```

Expected: all tests PASS; all syntax checks exit 0.

- [ ] **Step 6: Perform manual browser verification before claiming completion**

Check desktop, narrow/mobile width and touch interaction. Run these exact scenarios:

1. 7 class → «Переведи в СИ» → 10 tasks; verify mass target is kg.
2. 7 class → «Площадь и объём» → each of four substages.
3. 8–9 → read standard-form definition → complete 5 mantissa warmups.
4. 8–9 → 15-task standard-form run; verify negative exponents display as superscripts.
5. 8–9 → mantissa-shift block; verify `0,7 мм` chain.
6. Make one wrong answer then correct second answer; final clean count must not include it.
7. Open «Правило» before a correct answer; final clean count must not include it.
8. Fail twice; solution steps must appear before next task is enabled.
9. Complete a block at 80%; result says mastered.
10. Re-run with a lower score; best percentage on block card stays unchanged.
11. Root library filters `#physics-7`, `#physics-8`, `#physics-9` all show the new card.

- [ ] **Step 7: Commit**

```bash
git add physics/units-prefixes-scientific-notation/app.js physics/units-prefixes-scientific-notation/index.html physics/units-prefixes-scientific-notation/styles.css index.html
git commit -m "feat: publish units and scientific notation trainer"
```

---

## Final Verification Gate

Before reporting the trainer as complete:

```bash
node --test tests/phase-transitions.test.mjs tests/units-prefixes-scientific-notation.test.mjs
```

Then verify the published GitHub Pages URL after deployment:

`https://daryafedotova.github.io/studytrainers/physics/units-prefixes-scientific-notation/`

Also verify library visibility in:

- `https://daryafedotova.github.io/studytrainers/#physics-7`
- `https://daryafedotova.github.io/studytrainers/#physics-8`
- `https://daryafedotova.github.io/studytrainers/#physics-9`

Do not claim deployment success until the Pages workflow for the implementation commit has completed successfully and the published page opens with the expected content.
