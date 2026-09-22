# Космическая экспедиция: НОД и НОК — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать и опубликовать новый React-тренажёр для 6 класса, который через космическую кампанию обучает простым числам, разложению на простые множители, НОД и НОК, сохраняет прогресс по имени и завершает обучение трёхфазным боем с боссом.

**Architecture:** Отдельное Vite/React-приложение в `react-apps/gcd-lcm-space/` с чистыми математическими и прогресс-модулями, отдельными генераторами заданий и React-компонентами для профиля, карты, обычных уровней и босса. Чистая логика тестируется Node test runner напрямую из `tests/`; публикация идёт в `math/grade-6/gcd-lcm-space/` через отдельный GitHub Actions workflow по существующему паттерну репозитория.

**Tech Stack:** React 19, Vite 7, Framer Motion 13, canvas-confetti 1.9, lucide-react 1.43, Web Audio API, localStorage, Node 22 `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-22-gcd-lcm-space-campaign-design.md`

## Global Constraints

- Целевая аудитория: 6 класс.
- Полное прохождение: 40–60 минут, с возможностью проходить кампанию частями.
- Восемь учебных уровней + финальный босс.
- Следующий обычный уровень открывается после прохождения предыдущего хотя бы на 1 звезду.
- Финальный босс открывается при 18/24 звёздах.
- За обычный уровень выдаётся 1–3 звезды; лучший результат не уменьшается.
- Финальный босс: 3 жизни, три фазы, реальный проигрыш; жизни не используются на обычных уровнях.
- Ключ localStorage: `studytrainers.gcd-lcm-space.v1`.
- Без серверной части, аккаунтов и облачной синхронизации.
- Основная работа тренажёра не должна зависеть от сети.
- Скорость не влияет на учебную оценку; таймер не является условием успеха.
- Не включать формулу `НОД(a,b) · НОК(a,b) = a · b` в первую версию.
- Не включать НОД/НОК трёх и более чисел в первую версию.
- Не включать полноценные текстовые задачи отдельным модулем в первую версию.
- Интерфейс работает от 320 px; сенсорные цели предпочтительно 44–48 px и больше.
- Любой drag-and-drop имеет кликабельную/тап-альтернативу.
- Цвет не является единственным сигналом правильности.
- Постоянная кнопка «← В библиотеку» доступна на всех основных экранах.
- Публичный маршрут: `math/grade-6/gcd-lcm-space/`.

## Review Focus

- Повреждённый JSON или неизвестная версия localStorage: приложение не падает, остальные данные библиотеки не затрагиваются, новый профиль можно создать.
- Имена `" Маша "`, `"маша"` и `"МАША"` должны разрешаться в один локальный профиль, сохраняя исходное displayName первого созданного профиля.
- Границы звёздности: ровно 65% даёт право на 2 звезды при допустимом мини-боссе; ровно 85% даёт право на 3 только при идеальном мини-боссе.
- Генераторы должны сохранять математические инварианты и диапазон школьной сложности, включая взаимно простые пары, случай делимости одного числа на другое и разные показатели одинакового простого множителя.
- Критический урон босса не должен позволять завершить фазу без выполнения всех обязательных заданий; каждая ошибка снимает ровно одну жизнь.

---

## File Map

### Новое React-приложение
- `react-apps/gcd-lcm-space/index.html` — Vite entry HTML.
- `react-apps/gcd-lcm-space/package.json` — зависимости и build script.
- `react-apps/gcd-lcm-space/vite.config.js` — single-file Vite build.
- `react-apps/gcd-lcm-space/src/main.jsx` — React bootstrap.
- `react-apps/gcd-lcm-space/src/App.jsx` — крупный роутинг состояния приложения.
- `react-apps/gcd-lcm-space/src/styles.css` — общий космический UI, адаптивность, reduced motion.

### Чистая логика
- `react-apps/gcd-lcm-space/src/lib/math.js` — простые числа, факторизация, НОД, НОК, делители, кратные.
- `react-apps/gcd-lcm-space/src/lib/task-generators.js` — генераторы контролируемых заданий всех уровней и босса.
- `react-apps/gcd-lcm-space/src/lib/scoring.js` — first-try accuracy, звёзды, комбо, очки, звания.
- `react-apps/gcd-lcm-space/src/lib/progress-store.js` — localStorage, нормализация имени, миграционно-безопасная загрузка профилей.
- `react-apps/gcd-lcm-space/src/lib/campaign.js` — конфигурация 8 уровней, названия, цели, открытия.
- `react-apps/gcd-lcm-space/src/lib/audio.js` — безопасные Web Audio сигналы.

### UI
- `react-apps/gcd-lcm-space/src/components/AppShell.jsx` — фон, постоянная библиотечная ссылка, звук.
- `react-apps/gcd-lcm-space/src/components/ProfileGate.jsx` — создание/возврат/сброс профиля.
- `react-apps/gcd-lcm-space/src/components/CampaignMap.jsx` — маршрут, точки уровней, босс, mission card.
- `react-apps/gcd-lcm-space/src/components/LevelRunner.jsx` — briefing → mission → miniboss → result.
- `react-apps/gcd-lcm-space/src/components/BriefingRenderer.jsx` — интерактивная теория.
- `react-apps/gcd-lcm-space/src/components/TaskRenderer.jsx` — диспетчер типов заданий.
- `react-apps/gcd-lcm-space/src/components/tasks/ChoiceTask.jsx` — одиночный выбор.
- `react-apps/gcd-lcm-space/src/components/tasks/MultiSelectTask.jsx` — множественный выбор.
- `react-apps/gcd-lcm-space/src/components/tasks/FactorTreeTask.jsx` — дерево множителей с tap-first управлением.
- `react-apps/gcd-lcm-space/src/components/tasks/FactorBuilderTask.jsx` — сборка простых множителей/степеней.
- `react-apps/gcd-lcm-space/src/components/tasks/SortTask.jsx` — категории/общие множители.
- `react-apps/gcd-lcm-space/src/components/tasks/NumericTask.jsx` — числовой ввод.
- `react-apps/gcd-lcm-space/src/components/tasks/ErrorFinderTask.jsx` — поиск ошибочного шага.
- `react-apps/gcd-lcm-space/src/components/BossBattle.jsx` — 3 жизни, 3 фазы, здоровье, комбо, диагностика.
- `react-apps/gcd-lcm-space/src/components/ResultCard.jsx` — итоговая карточка и PNG export.

### Тесты и публикация
- `tests/gcd-lcm-math.test.mjs`
- `tests/gcd-lcm-generators.test.mjs`
- `tests/gcd-lcm-scoring.test.mjs`
- `tests/gcd-lcm-progress.test.mjs`
- `tests/gcd-lcm-campaign.test.mjs`
- `tests/gcd-lcm-boss.test.mjs`
- `tests/gcd-lcm-library.test.mjs`
- `.github/workflows/build-gcd-lcm-space.yml`
- `index.html` — новая карточка и счётчик материалов.
- `math/grade-6/gcd-lcm-space/` — сгенерированный Pages build после workflow.

---

### Task 1: Scaffold app and lock the mathematical core

**Files:**
- Create: `react-apps/gcd-lcm-space/index.html`
- Create: `react-apps/gcd-lcm-space/package.json`
- Create: `react-apps/gcd-lcm-space/vite.config.js`
- Create: `react-apps/gcd-lcm-space/src/main.jsx`
- Create: `react-apps/gcd-lcm-space/src/App.jsx`
- Create: `react-apps/gcd-lcm-space/src/styles.css`
- Create: `react-apps/gcd-lcm-space/src/lib/math.js`
- Test: `tests/gcd-lcm-math.test.mjs`

**Interfaces:**
- Produces: `isPrime(n): boolean`, `primeFactorization(n): number[]`, `factorizationToPowers(factors): Array<{prime:number, exponent:number}>`, `gcd(a,b): number`, `lcm(a,b): number`, `divisors(n): number[]`, `firstMultiples(n,count): number[]`.
- Consumes: none.

- [ ] **Step 1: Write failing math tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPrime, primeFactorization, factorizationToPowers,
  gcd, lcm, divisors, firstMultiples
} from '../react-apps/gcd-lcm-space/src/lib/math.js';

test('classifies primes, composites, and 1', () => {
  assert.equal(isPrime(1), false);
  assert.equal(isPrime(2), true);
  assert.equal(isPrime(29), true);
  assert.equal(isPrime(49), false);
});

test('factorizes and compacts repeated primes', () => {
  assert.deepEqual(primeFactorization(60), [2,2,3,5]);
  assert.deepEqual(factorizationToPowers([2,2,2,3,3]), [
    {prime:2, exponent:3},
    {prime:3, exponent:2}
  ]);
});

test('computes gcd and lcm school cases', () => {
  assert.equal(gcd(72,108), 36);
  assert.equal(gcd(24,25), 1);
  assert.equal(lcm(18,24), 72);
  assert.equal(lcm(12,36), 36);
  assert.equal(lcm(8,15), 120);
});

test('lists divisors and first multiples', () => {
  assert.deepEqual(divisors(12), [1,2,3,4,6,12]);
  assert.deepEqual(firstMultiples(6,5), [6,12,18,24,30]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/gcd-lcm-math.test.mjs`  
Expected: FAIL because `src/lib/math.js` does not exist.

- [ ] **Step 3: Implement the pure math module**

```js
function toPositiveInteger(value, name = 'value') {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(`${name} must be a positive integer`);
  }
  return n;
}

export function isPrime(value) {
  const n = toPositiveInteger(value);
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

export function primeFactorization(value) {
  let n = toPositiveInteger(value);
  const factors = [];
  for (let d = 2; d * d <= n; d += d === 2 ? 1 : 2) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
  }
  if (n > 1) factors.push(n);
  return factors;
}

export function factorizationToPowers(factors) {
  const counts = new Map();
  for (const prime of factors) counts.set(prime, (counts.get(prime) ?? 0) + 1);
  return [...counts.entries()].sort((a,b) => a[0] - b[0])
    .map(([prime, exponent]) => ({prime, exponent}));
}

export function gcd(a,b) {
  let x = toPositiveInteger(a, 'a');
  let y = toPositiveInteger(b, 'b');
  while (y) [x,y] = [y, x % y];
  return x;
}

export function lcm(a,b) {
  const x = toPositiveInteger(a, 'a');
  const y = toPositiveInteger(b, 'b');
  return (x / gcd(x,y)) * y;
}

export function divisors(value) {
  const n = toPositiveInteger(value);
  const out = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
}

export function firstMultiples(value, count) {
  const n = toPositiveInteger(value);
  const c = toPositiveInteger(count, 'count');
  return Array.from({length:c}, (_,i) => n * (i + 1));
}
```

- [ ] **Step 4: Scaffold Vite with the same dependency versions as «Мастер умножения»**

```json
{
  "name": "gcd-lcm-space-campaign",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {"build": "vite build"},
  "dependencies": {
    "canvas-confetti": "1.9.4",
    "framer-motion": "13.2.0",
    "lucide-react": "1.43.0",
    "react": "19.2.6",
    "react-dom": "19.2.6"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "5.1.1",
    "vite": "7.3.2",
    "vite-plugin-singlefile": "2.3.0"
  }
}
```

Use the established Vite config:

```js
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  build: { target: "es2020" }
});
```

- [ ] **Step 5: Run math tests and a first build**

Run:
```bash
node --test tests/gcd-lcm-math.test.mjs
cd react-apps/gcd-lcm-space && npm install --no-audit --no-fund && npm run build
```

Expected: math tests PASS; Vite produces `dist/index.html`.

- [ ] **Step 6: Commit**

```bash
git add react-apps/gcd-lcm-space tests/gcd-lcm-math.test.mjs
git commit -m "feat: scaffold GCD LCM space trainer and math core"
```

---

### Task 2: Build controlled task generators for all eight levels

**Files:**
- Create: `react-apps/gcd-lcm-space/src/lib/task-generators.js`
- Test: `tests/gcd-lcm-generators.test.mjs`

**Interfaces:**
- Consumes: math helpers from `math.js`.
- Produces: `generateLevelTasks(levelId, rng): Task[]`, `generateMiniBossTasks(levelId, rng): Task[]`, `generateBossPhaseTasks(phase, rng): Task[]`.
- Task contract:
```ts
{
  id: string,
  type: 'choice'|'multi'|'factor-tree'|'factor-builder'|'sort'|'numeric'|'error-finder',
  prompt: string,
  data: object,
  answer: unknown,
  skill: 'primes'|'factorization'|'powers'|'common-factors'|'gcd'|'multiples'|'lcm'|'mixed',
  hint: string
}
```

- [ ] **Step 1: Write failing invariant tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { gcd, lcm, primeFactorization } from '../react-apps/gcd-lcm-space/src/lib/math.js';
import {
  generateLevelTasks, generateMiniBossTasks, generateBossPhaseTasks
} from '../react-apps/gcd-lcm-space/src/lib/task-generators.js';

const seeded = (() => {
  let x = 123456789;
  return () => ((x = (1103515245 * x + 12345) % 2147483648) / 2147483648);
})();

test('every level generates the required mission volume', () => {
  for (let level = 1; level <= 8; level += 1) {
    const tasks = generateLevelTasks(level, seeded);
    assert.ok(tasks.length >= 5 && tasks.length <= 8);
    assert.ok(tasks.every(t => t.id && t.type && t.prompt && t.skill && t.hint));
  }
});

test('gcd and lcm numeric tasks carry mathematically correct answers', () => {
  for (const level of [5,7,8]) {
    for (const task of generateLevelTasks(level, seeded)) {
      if (task.data?.operation === 'gcd') {
        assert.equal(task.answer, gcd(task.data.a, task.data.b));
      }
      if (task.data?.operation === 'lcm') {
        assert.equal(task.answer, lcm(task.data.a, task.data.b));
      }
    }
  }
});

test('factorization tasks multiply back to the source number', () => {
  for (const level of [2,3,4,5,7]) {
    for (const task of generateLevelTasks(level, seeded)) {
      if (task.data?.number && task.data?.factors) {
        assert.deepEqual(task.data.factors, primeFactorization(task.data.number));
      }
    }
  }
});

test('special pair families are represented over repeated generation', () => {
  const seen = new Set();
  for (let i = 0; i < 80; i += 1) {
    for (const task of generateLevelTasks(7, seeded)) {
      if (task.data?.pairKind) seen.add(task.data.pairKind);
    }
  }
  assert.ok(seen.has('coprime'));
  assert.ok(seen.has('one-divides-other'));
  assert.ok(seen.has('shared-prime-different-exponents'));
});

test('boss phases have mandatory pedagogical tasks', () => {
  assert.ok(generateBossPhaseTasks(1, seeded).length >= 3);
  assert.ok(generateBossPhaseTasks(2, seeded).every(t => ['common-factors','gcd'].includes(t.skill)));
  assert.ok(generateBossPhaseTasks(3, seeded).some(t => t.skill === 'mixed'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/gcd-lcm-generators.test.mjs`  
Expected: FAIL because generator module does not exist.

- [ ] **Step 3: Implement deterministic helper primitives and explicit pair families**

```js
import { gcd, lcm, primeFactorization, factorizationToPowers, firstMultiples, isPrime } from './math.js';

const choice = (items, rng) => items[Math.floor(rng() * items.length)];
const uid = (() => { let n = 0; return prefix => `${prefix}-${++n}`; })();

const PAIRS = {
  coprime: [[8,15],[14,25],[16,27],[21,32]],
  oneDividesOther: [[12,36],[15,45],[18,54],[24,72]],
  sharedPrimeDifferentExponents: [[24,36],[40,100],[72,108],[48,80]],
  general: [[18,30],[42,70],[60,90],[84,126]]
};

function pairTask(operation, pairKind, rng) {
  const [a,b] = choice(PAIRS[pairKind], rng);
  return {
    id: uid(operation),
    type: 'numeric',
    prompt: operation === 'gcd' ? `Найди НОД(${a}; ${b})` : `Найди НОК(${a}; ${b})`,
    data: {operation, a, b, pairKind},
    answer: operation === 'gcd' ? gcd(a,b) : lcm(a,b),
    skill: operation,
    hint: operation === 'gcd'
      ? 'Разложи оба числа и возьми общие простые множители с наименьшими показателями.'
      : 'Собери минимальный набор множителей, которого хватает для обоих чисел.'
  };
}
```

Implement one explicit generator function per level, then dispatch through:

```js
const LEVEL_GENERATORS = {
  1: generatePrimeTasks,
  2: generateFactorizationTasks,
  3: generatePowerTasks,
  4: generateCommonFactorTasks,
  5: generateGcdTasks,
  6: generateMultipleTasks,
  7: generateLcmTasks,
  8: generateMixedTasks
};

export function generateLevelTasks(levelId, rng = Math.random) {
  const fn = LEVEL_GENERATORS[levelId];
  if (!fn) throw new RangeError('unknown level');
  return fn(rng);
}
```

Each generator must use a fixed pedagogical mix rather than pure random choice. For example level 7 returns exactly:
```js
[
  pairTask('lcm','general',rng),
  pairTask('lcm','coprime',rng),
  pairTask('lcm','oneDividesOther',rng),
  pairTask('lcm','sharedPrimeDifferentExponents',rng),
  makeMissingFactorTask(rng),
  makePowerChoiceTask(rng),
  makeLcmErrorFinderTask(rng)
]
```

- [ ] **Step 4: Add mini-boss and boss-phase generators**

```js
export function generateMiniBossTasks(levelId, rng = Math.random) {
  const all = generateLevelTasks(levelId, rng);
  const preferred = all.filter(task =>
    ['numeric','factor-builder','sort','factor-tree'].includes(task.type)
  );
  return (preferred.length >= 2 ? preferred : all).slice(0, levelId >= 5 ? 2 : 3)
    .map(task => ({...task, id: `mini-${task.id}`, miniboss: true}));
}

export function generateBossPhaseTasks(phase, rng = Math.random) {
  if (phase === 1) {
    return [
      makePrimeClassificationTask(rng),
      makeFactorTreeTask(rng),
      makePowerCompressionTask(rng),
      makeFactorizationChoiceTask(rng)
    ].map(t => ({...t, bossPhase: 1}));
  }
  if (phase === 2) {
    return [
      makeCommonFactorSortTask(rng),
      pairTask('gcd','sharedPrimeDifferentExponents',rng),
      pairTask('gcd','coprime',rng)
    ].map(t => ({...t, bossPhase: 2}));
  }
  if (phase === 3) {
    return [
      pairTask('lcm','oneDividesOther',rng),
      pairTask('lcm','coprime',rng),
      makeMixedOperationChoiceTask(rng),
      makeFullMixedTask(rng)
    ].map(t => ({...t, bossPhase: 3}));
  }
  throw new RangeError('unknown boss phase');
}
```

- [ ] **Step 5: Run generator and math tests**

Run: `node --test tests/gcd-lcm-math.test.mjs tests/gcd-lcm-generators.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add react-apps/gcd-lcm-space/src/lib/task-generators.js tests/gcd-lcm-generators.test.mjs
git commit -m "feat: add controlled GCD LCM task generators"
```

---

### Task 3: Implement scoring, stars, ranks, and persistent profiles

**Files:**
- Create: `react-apps/gcd-lcm-space/src/lib/scoring.js`
- Create: `react-apps/gcd-lcm-space/src/lib/progress-store.js`
- Test: `tests/gcd-lcm-scoring.test.mjs`
- Test: `tests/gcd-lcm-progress.test.mjs`

**Interfaces:**
- Produces: `evaluateLevelAttempt(attempt): LevelEvaluation`, `rankFor(profile): string`, `applyLevelResult(profile, levelId, evaluation): Profile`, `normalizeProfileName(name): string`, `loadProfile(name, storage): Profile|null`, `createProfile(name): Profile`, `saveProfile(profile, storage): void`, `resetProfile(name, storage): void`.
- Consumes: none.

- [ ] **Step 1: Write scoring boundary tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLevelAttempt } from '../react-apps/gcd-lcm-space/src/lib/scoring.js';

const attempt = (correct, total, miniBossErrors, hints = 0) => ({
  firstTryCorrect: correct,
  total,
  miniBossErrors,
  hintsUsed: hints,
  bestCombo: correct
});

test('65 percent boundary earns two stars with at most one miniboss error', () => {
  assert.equal(evaluateLevelAttempt(attempt(13,20,1)).stars, 2);
});

test('85 percent boundary needs a perfect miniboss for three stars', () => {
  assert.equal(evaluateLevelAttempt(attempt(17,20,0,0)).stars, 3);
  assert.equal(evaluateLevelAttempt(attempt(17,20,1,0)).stars, 2);
  assert.equal(evaluateLevelAttempt(attempt(17,20,0,1)).stars, 3);
});

test('completed weak attempt still earns one star', () => {
  assert.equal(evaluateLevelAttempt(attempt(3,10,3,4)).stars, 1);
});
```

- [ ] **Step 2: Write persistence tests including Review Focus cases**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY, normalizeProfileName, createProfile,
  loadProfile, saveProfile, resetProfile, applyLevelResult
} from '../react-apps/gcd-lcm-space/src/lib/progress-store.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: k => map.has(k) ? map.get(k) : null,
    setItem: (k,v) => map.set(k,String(v)),
    removeItem: k => map.delete(k)
  };
}

test('profile names ignore case and surrounding spaces', () => {
  assert.equal(normalizeProfileName(' Маша '), 'маша');
  assert.equal(normalizeProfileName('МАША'), 'маша');
});

test('save and load resolve case variants to one profile', () => {
  const storage = memoryStorage();
  const profile = createProfile('Маша');
  saveProfile(profile, storage);
  assert.equal(loadProfile(' маша ', storage).displayName, 'Маша');
});

test('corrupt storage returns null instead of throwing', () => {
  const storage = memoryStorage({[STORAGE_KEY]:'{broken'});
  assert.doesNotThrow(() => loadProfile('Маша', storage));
  assert.equal(loadProfile('Маша', storage), null);
});

test('unknown storage version is ignored safely', () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: JSON.stringify({version:99, profiles:{маша:{displayName:'Маша'}}})
  });
  assert.equal(loadProfile('Маша', storage), null);
});

test('reset deletes only the selected profile', () => {
  const storage = memoryStorage();
  saveProfile(createProfile('Маша'), storage);
  saveProfile(createProfile('Петя'), storage);
  resetProfile('МАША', storage);
  assert.equal(loadProfile('Маша', storage), null);
  assert.equal(loadProfile('Петя', storage).displayName, 'Петя');
});

test('completing a level unlocks the next level and never lowers best stars', () => {
  let profile = createProfile('Маша');
  profile = applyLevelResult(profile, 1, {stars:2, firstTryAccuracy:70, points:500, bestCombo:3, miniBossErrors:1});
  assert.equal(profile.levels['2'].unlocked, true);
  profile = applyLevelResult(profile, 1, {stars:1, firstTryAccuracy:40, points:100, bestCombo:1, miniBossErrors:2});
  assert.equal(profile.levels['1'].bestStars, 2);
});
```

- [ ] **Step 3: Implement star evaluation and ranks**

```js
export function evaluateLevelAttempt(attempt) {
  const percent = attempt.total
    ? Math.round((attempt.firstTryCorrect / attempt.total) * 100)
    : 0;
  let stars = 1;
  if (percent >= 65 && attempt.miniBossErrors <= 1) stars = 2;
  if (percent >= 85 && attempt.miniBossErrors === 0) stars = 3;
  return {
    stars,
    firstTryAccuracy: percent,
    points: attempt.firstTryCorrect * 100 + attempt.bestCombo * 25 + (stars - 1) * 250,
    bestCombo: attempt.bestCombo,
    miniBossErrors: attempt.miniBossErrors
  };
}

export function rankFor({starsTotal = 0, bossDefeated = false}) {
  if (bossDefeated) return 'Мастер числовой галактики';
  if (starsTotal >= 20) return 'Командир экспедиции';
  if (starsTotal >= 15) return 'Исследователь';
  if (starsTotal >= 10) return 'Навигатор';
  if (starsTotal >= 5) return 'Пилот';
  return 'Курсант';
}
```

- [ ] **Step 4: Implement versioned profile storage**

Use:
```js
export const STORAGE_KEY = 'studytrainers.gcd-lcm-space.v1';
const VERSION = 1;
export const normalizeProfileName = name => String(name).trim().toLocaleLowerCase('ru-RU');

export function createProfile(displayName) {
  const now = new Date().toISOString();
  return {
    displayName: String(displayName).trim(),
    createdAt: now,
    updatedAt: now,
    levels: Object.fromEntries(Array.from({length:8}, (_,i) => [
      String(i + 1),
      {unlocked:i === 0, completed:false, bestStars:0, bestFirstTryAccuracy:0, bestMiniBossErrors:null, bestCombo:0, attempts:0}
    ])),
    expeditionPoints: 0,
    achievements: [],
    bossDefeated: false,
    bestBossResult: null
  };
}

function readRoot(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '{"version":1,"profiles":{}}');
    if (parsed.version !== VERSION || !parsed.profiles || typeof parsed.profiles !== 'object') {
      return {version:VERSION, profiles:{}};
    }
    return parsed;
  } catch {
    return {version:VERSION, profiles:{}};
  }
}
```

`applyLevelResult` must preserve max stars/accuracy/combo, increment attempts, unlock `levelId + 1`, recompute `starsTotal`, and set `bossUnlocked = starsTotal >= 18`.

- [ ] **Step 5: Run scoring/progress tests**

Run: `node --test tests/gcd-lcm-scoring.test.mjs tests/gcd-lcm-progress.test.mjs`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add react-apps/gcd-lcm-space/src/lib/scoring.js react-apps/gcd-lcm-space/src/lib/progress-store.js tests/gcd-lcm-scoring.test.mjs tests/gcd-lcm-progress.test.mjs
git commit -m "feat: persist GCD LCM campaign progress"
```

---

### Task 4: Define campaign configuration and build the profile/map shell

**Files:**
- Create: `react-apps/gcd-lcm-space/src/lib/campaign.js`
- Create: `react-apps/gcd-lcm-space/src/components/AppShell.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/ProfileGate.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/CampaignMap.jsx`
- Modify: `react-apps/gcd-lcm-space/src/App.jsx`
- Modify: `react-apps/gcd-lcm-space/src/styles.css`
- Test: `tests/gcd-lcm-campaign.test.mjs`

**Interfaces:**
- Produces: `CAMPAIGN_LEVELS`, `getCampaignState(profile)`, profile-to-map flow.
- Consumes: `ProgressStore`, `rankFor`.

- [ ] **Step 1: Write campaign unlocking tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getCampaignState } from '../react-apps/gcd-lcm-space/src/lib/campaign.js';
import { createProfile } from '../react-apps/gcd-lcm-space/src/lib/progress-store.js';

test('only first level is initially available', () => {
  const state = getCampaignState(createProfile('Ира'));
  assert.equal(state.levels[0].unlocked, true);
  assert.equal(state.levels[1].unlocked, false);
  assert.equal(state.bossUnlocked, false);
});

test('boss stays locked at 17 stars and unlocks at 18', () => {
  const p = createProfile('Ира');
  p.levels['1'].bestStars = 3;
  p.levels['2'].bestStars = 3;
  p.levels['3'].bestStars = 3;
  p.levels['4'].bestStars = 3;
  p.levels['5'].bestStars = 3;
  p.levels['6'].bestStars = 2;
  assert.equal(getCampaignState(p).bossUnlocked, false);
  p.levels['6'].bestStars = 3;
  assert.equal(getCampaignState(p).bossUnlocked, true);
});
```

- [ ] **Step 2: Implement exact campaign metadata**

```js
export const CAMPAIGN_LEVELS = [
  {id:1, icon:'🪐', title:'Планета Простых чисел', duration:'4–5 мин', skill:'primes'},
  {id:2, icon:'☄️', title:'Астероидное поле множителей', duration:'6–7 мин', skill:'factorization'},
  {id:3, icon:'🛰️', title:'Станция Степеней', duration:'4–5 мин', skill:'powers'},
  {id:4, icon:'🌌', title:'Сектор Общих множителей', duration:'5 мин', skill:'common-factors'},
  {id:5, icon:'🔵', title:'Планета НОД', duration:'6–7 мин', skill:'gcd'},
  {id:6, icon:'🛸', title:'Орбита Кратных', duration:'4–5 мин', skill:'multiples'},
  {id:7, icon:'🟣', title:'Планета НОК', duration:'6–7 мин', skill:'lcm'},
  {id:8, icon:'🌫️', title:'Туманность НОД–НОК', duration:'5–6 мин', skill:'mixed'}
];

export function getCampaignState(profile) {
  const starsTotal = Object.values(profile.levels).reduce((sum,l) => sum + (l.bestStars || 0), 0);
  return {
    starsTotal,
    bossUnlocked: starsTotal >= 18,
    levels: CAMPAIGN_LEVELS.map(level => ({
      ...level,
      ...profile.levels[String(level.id)]
    }))
  };
}
```

- [ ] **Step 3: Implement the shell with a persistent library link**

```jsx
export function AppShell({soundOn, onToggleSound, children}) {
  return (
    <div className="app-shell">
      <div className="space-background" aria-hidden="true" />
      <a className="library-link" href="../../../">← В библиотеку</a>
      <button className="sound-toggle" type="button" onClick={onToggleSound}
        aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}>
        {soundOn ? '🔊' : '🔇'}
      </button>
      <main>{children}</main>
    </div>
  );
}
```

The relative library link from `math/grade-6/gcd-lcm-space/` must resolve to repository root.

- [ ] **Step 4: Implement profile gate and map state flow**

`App.jsx` owns:
```js
const [profile, setProfile] = useState(null);
const [screen, setScreen] = useState('profile');
const [selectedLevel, setSelectedLevel] = useState(null);
const [soundOn, setSoundOn] = useState(true);
```

ProfileGate must:
- trim empty names and refuse submit;
- use `loadProfile`;
- present «С возвращением» when found;
- require confirmation before reset.

CampaignMap must:
- render all eight nodes and the visible locked boss;
- disable locked nodes with `aria-disabled="true"`;
- show `${starsTotal}/24 ⭐`;
- show `Нужно ещё ${Math.max(0,18-starsTotal)} ⭐` on locked boss;
- open a mission card before starting a level.

- [ ] **Step 5: Add responsive map CSS**

Use CSS grid/absolute path only for presentation; DOM order remains 1→8→boss. At `max-width: 760px`, switch to one-column vertical path. Add:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
button, a { min-height: 44px; }
:focus-visible { outline: 3px solid #fde68a; outline-offset: 3px; }
```

- [ ] **Step 6: Run tests and build**

Run:
```bash
node --test tests/gcd-lcm-campaign.test.mjs tests/gcd-lcm-progress.test.mjs
cd react-apps/gcd-lcm-space && npm run build
```

Expected: PASS and successful build.

- [ ] **Step 7: Commit**

```bash
git add react-apps/gcd-lcm-space/src tests/gcd-lcm-campaign.test.mjs
git commit -m "feat: add campaign profiles and space map"
```

---

### Task 5: Implement briefing, task renderer, and levels 1–4

**Files:**
- Create: `react-apps/gcd-lcm-space/src/components/BriefingRenderer.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/TaskRenderer.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/LevelRunner.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/tasks/ChoiceTask.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/tasks/MultiSelectTask.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/tasks/FactorTreeTask.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/tasks/FactorBuilderTask.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/tasks/SortTask.jsx`
- Modify: `react-apps/gcd-lcm-space/src/App.jsx`
- Modify: `react-apps/gcd-lcm-space/src/styles.css`

**Interfaces:**
- Consumes: `generateLevelTasks`, `generateMiniBossTasks`, `evaluateLevelAttempt`.
- Produces: `onComplete(levelId, evaluation)` from LevelRunner.
- Common renderer contract: each task component receives `task`, `disabled`, `onSubmit(answer)`.

- [ ] **Step 1: Implement TaskRenderer as a strict dispatcher**

```jsx
const renderers = {
  choice: ChoiceTask,
  multi: MultiSelectTask,
  'factor-tree': FactorTreeTask,
  'factor-builder': FactorBuilderTask,
  sort: SortTask
};

export function TaskRenderer(props) {
  const Renderer = renderers[props.task.type];
  if (!Renderer) return <p role="alert">Неизвестный тип задания.</p>;
  return <Renderer {...props} />;
}
```

- [ ] **Step 2: Implement tap-first interaction primitives**

For multi/select/sort builders, do not require drag. A selected token is moved by choosing token → choosing target zone. Example state:
```js
const [selectedId, setSelectedId] = useState(null);
function moveSelected(target) {
  if (!selectedId) return;
  onMove({itemId:selectedId, target});
  setSelectedId(null);
}
```

FactorTreeTask must let the learner tap a composite leaf, then choose a factor pair. A leaf is complete only when `isPrime(value)`.

- [ ] **Step 3: Implement briefings 1–4 as configuration-driven steps**

Briefing content must explicitly include:
```js
const BRIEFINGS = {
  1: [
    {title:'Простое число', body:'Имеет ровно два натуральных делителя: 1 и само число.', example:'7 → 1 и 7'},
    {title:'Составное число', body:'Имеет больше двух натуральных делителей.', example:'12 → 1, 2, 3, 4, 6, 12'},
    {title:'А число 1?', body:'1 не является ни простым, ни составным.', example:'У 1 только один натуральный делитель.'}
  ],
  2: [
    {title:'Разложение', body:'Разложить число на простые множители — представить его произведением простых чисел.', example:'60 = 2·2·3·5'},
    {title:'Дерево множителей', body:'Разбивай составные ветви, пока на концах не останутся только простые числа.', example:'60 → 6·10 → 2·3·2·5'},
    {title:'Последовательное деление', body:'Дели число на простые числа 2, 3, 5, 7… пока не получишь 1.', example:'60 : 2 : 2 : 3 : 5'}
  ],
  3: [
    {title:'Повторяющиеся множители', body:'Одинаковые множители можно записать степенью.', example:'2·2·2·3·3 = 2³·3²'}
  ],
  4: [
    {title:'Общая часть', body:'Сопоставь одинаковые простые множители двух разложений.', example:'60 и 90 имеют общую часть 2·3·5'}
  ]
};
```

- [ ] **Step 4: Implement LevelRunner state machine**

Required states:
```js
'briefing' -> 'mission' -> 'miniboss' -> 'result'
```

Track:
```js
{
  total,
  firstTryCorrect,
  hintsUsed,
  miniBossErrors,
  currentCombo,
  bestCombo,
  attemptsByTask
}
```

On wrong mission answer:
- mark first attempt dirty;
- increment hintsUsed only when the hint panel is actually opened;
- reset combo;
- allow correction.

On wrong mini-boss answer:
- increment miniBossErrors;
- no step-by-step hint;
- allow completion.

- [ ] **Step 5: Add result screen for ordinary levels**

Result screen shows stars, accuracy, best combo, points earned, and buttons:
- «На карту»
- «Пройти ещё раз»

Call `onComplete(levelId, evaluateLevelAttempt(stats))` exactly once.

- [ ] **Step 6: Manually smoke levels 1–4 and build**

Run:
```bash
cd react-apps/gcd-lcm-space && npm run build
```

Manual checks:
- level 1 correctly treats 1 as neither category;
- factor tree cannot finish with composite leaves;
- power builder shows superscripts clearly;
- common-factor sorting works by taps on touch-sized controls;
- opening a hint after a correct answer does not retroactively dirty that answer.

- [ ] **Step 7: Commit**

```bash
git add react-apps/gcd-lcm-space/src
git commit -m "feat: add interactive learning flow for levels one to four"
```

---

### Task 6: Add numeric/error task types and complete levels 5–8

**Files:**
- Create: `react-apps/gcd-lcm-space/src/components/tasks/NumericTask.jsx`
- Create: `react-apps/gcd-lcm-space/src/components/tasks/ErrorFinderTask.jsx`
- Modify: `react-apps/gcd-lcm-space/src/components/TaskRenderer.jsx`
- Modify: `react-apps/gcd-lcm-space/src/components/BriefingRenderer.jsx`
- Modify: `react-apps/gcd-lcm-space/src/components/LevelRunner.jsx`
- Modify: `react-apps/gcd-lcm-space/src/styles.css`

**Interfaces:**
- Consumes: generator tasks for levels 5–8.
- Produces: full standard campaign loop for all eight levels.

- [ ] **Step 1: Add numeric and error-finder renderer mappings**

```jsx
const renderers = {
  choice: ChoiceTask,
  multi: MultiSelectTask,
  'factor-tree': FactorTreeTask,
  'factor-builder': FactorBuilderTask,
  sort: SortTask,
  numeric: NumericTask,
  'error-finder': ErrorFinderTask
};
```

NumericTask parses trimmed integer input and refuses empty/NaN submit.

- [ ] **Step 2: Add exact briefings 5–8**

```js
BRIEFINGS[5] = [
  {title:'Алгоритм НОД', body:'1) Разложи оба числа. 2) Найди общие простые множители. 3) Возьми их с наименьшими показателями. 4) Перемножь.', example:'72 = 2³·3², 108 = 2²·3³ → НОД = 2²·3² = 36'}
];
BRIEFINGS[6] = [
  {title:'Кратные числа', body:'Кратные числа получаются умножением данного числа на 1, 2, 3, …', example:'6, 12, 18, 24, …'},
  {title:'Общее кратное', body:'Оно находится сразу в нескольких рядах кратных. Самое маленькое положительное — НОК.', example:'6 и 8 → первое общее 24'}
];
BRIEFINGS[7] = [
  {title:'Алгоритм НОК', body:'Собери минимальный набор простых множителей, которого хватает для обоих чисел.', example:'18 = 2·3², 24 = 2³·3 → НОК = 2³·3² = 72'},
  {title:'Через степени', body:'Для каждого простого множителя бери наибольший показатель из двух разложений.', example:'max(2¹,2³)=2³; max(3²,3¹)=3²'}
];
BRIEFINGS[8] = [
  {title:'НОД или НОК?', body:'НОД ищет крупнейшую общую часть; НОК — наименьшее число, кратное обоим.', example:'Общий делитель → НОД. Общее кратное → НОК.'}
];
```

- [ ] **Step 3: Ensure level 5 full solutions expose intermediate work**

For GCD numeric tasks, render factorization helper rows before final answer when `task.data.showWork !== false`. The learner must be able to reveal/check:
- factorization of a;
- factorization of b;
- selected common prime powers;
- final numeric answer.

Do not auto-fill the final answer from selected factors.

- [ ] **Step 4: Ensure level 6 teaches meaning before algorithm**

All level 6 tasks must use lists of multiples or divisibility checks; do not call prime factorization in the visible solution for the mini-boss.

- [ ] **Step 5: Ensure level 7 visualizes “missing factors” before max-exponent wording**

FactorBuilderTask for LCM must support two zones:
```js
{baseFactors: [...primeFactorization(a)], missingFactors: []}
```
and validate that the combined multiset equals `primeFactorization(lcm(a,b))`.

- [ ] **Step 6: Ensure level 8 hides topical labels**

During mission and mini-boss, do not show “Сейчас тренируем НОД” or “Сейчас тренируем НОК”. Only the individual prompt may name the requested operation when that is the task.

- [ ] **Step 7: Build and run all pure tests**

Run:
```bash
node --test tests/gcd-lcm-*.test.mjs
cd react-apps/gcd-lcm-space && npm run build
```

Expected: all current tests PASS; build succeeds.

- [ ] **Step 8: Commit**

```bash
git add react-apps/gcd-lcm-space/src
git commit -m "feat: complete GCD and LCM campaign levels"
```

---

### Task 7: Implement the three-phase boss with lives and mandatory gates

**Files:**
- Create: `react-apps/gcd-lcm-space/src/components/BossBattle.jsx`
- Test: `tests/gcd-lcm-boss.test.mjs`
- Modify: `react-apps/gcd-lcm-space/src/App.jsx`
- Modify: `react-apps/gcd-lcm-space/src/styles.css`
- Modify: `react-apps/gcd-lcm-space/src/lib/scoring.js`

**Interfaces:**
- Produces: `createBossState(phases)`, `applyBossAnswer(state, {correct, skill})`, `bossCanAdvance(state)`, `completeBoss(profile, result)`.
- Consumes: `generateBossPhaseTasks`, TaskRenderer.

- [ ] **Step 1: Write boss-state tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBossState, applyBossAnswer, bossCanAdvance
} from '../react-apps/gcd-lcm-space/src/lib/scoring.js';

test('boss starts with three lives', () => {
  assert.equal(createBossState([3,3,4]).lives, 3);
});

test('each wrong submission removes exactly one life and resets combo', () => {
  let state = {...createBossState([3,3,4]), combo: 2};
  state = applyBossAnswer(state, {correct:false, skill:'lcm'});
  assert.equal(state.lives, 2);
  assert.equal(state.combo, 0);
  assert.equal(state.errors.lcm, 1);
});

test('three wrong answers cause defeat', () => {
  let state = createBossState([3,3,4]);
  for (let i = 0; i < 3; i += 1) state = applyBossAnswer(state, {correct:false, skill:'gcd'});
  assert.equal(state.status, 'defeat');
});

test('critical damage never skips mandatory phase tasks', () => {
  let state = createBossState([3,3,4]);
  state = {...state, combo:2};
  state = applyBossAnswer(state, {correct:true, skill:'factorization'});
  assert.equal(state.critical, true);
  assert.equal(bossCanAdvance(state), false);
  assert.equal(state.completedInPhase, 1);
});
```

- [ ] **Step 2: Implement boss state as task-count truth, health as presentation**

```js
export function createBossState(phaseTaskCounts) {
  return {
    lives: 3,
    phase: 1,
    phaseTaskCounts,
    completedInPhase: 0,
    completedTotal: 0,
    combo: 0,
    bestCombo: 0,
    errors: {factorization:0, gcd:0, lcm:0, mixed:0},
    status: 'fighting',
    critical: false
  };
}

export function bossCanAdvance(state) {
  return state.completedInPhase >= state.phaseTaskCounts[state.phase - 1];
}

export function applyBossAnswer(state, {correct, skill}) {
  if (!correct) {
    const lives = state.lives - 1;
    return {
      ...state,
      lives,
      combo: 0,
      critical: false,
      errors: {...state.errors, [skill]:(state.errors[skill] ?? 0) + 1},
      status: lives <= 0 ? 'defeat' : 'fighting'
    };
  }
  const combo = state.combo + 1;
  return {
    ...state,
    combo,
    bestCombo: Math.max(state.bestCombo, combo),
    completedInPhase: state.completedInPhase + 1,
    completedTotal: state.completedTotal + 1,
    critical: combo % 3 === 0
  };
}
```

Health percentage is derived from `completedTotal / totalMandatoryTasks`; critical hit adds animation/bonus points, not task completion.

- [ ] **Step 3: Build BossBattle UI**

BossBattle must show:
- `❤️❤️❤️` with lost hearts visually empty;
- phase label;
- health bar;
- current task;
- combo;
- visible boss core with three visual layers.

On phase completion:
- play a 1–2 second transition;
- increment phase;
- reset `completedInPhase`;
- keep lives and combo.

On defeat:
- show error counts grouped as «Разложение», «НОД», «НОК/смешанные»;
- buttons «Повторить бой» and «Вернуться на карту».

- [ ] **Step 4: Implement victory persistence**

Victory result:
```js
{
  livesRemaining,
  bestCombo,
  errors,
  completedAt: new Date().toISOString()
}
```

Set `profile.bossDefeated = true`; preserve best boss result by:
1. more lives remaining;
2. if tied, larger bestCombo.

- [ ] **Step 5: Run boss tests and build**

Run:
```bash
node --test tests/gcd-lcm-boss.test.mjs tests/gcd-lcm-scoring.test.mjs
cd react-apps/gcd-lcm-space && npm run build
```

Expected: PASS and successful build.

- [ ] **Step 6: Commit**

```bash
git add react-apps/gcd-lcm-space/src tests/gcd-lcm-boss.test.mjs
git commit -m "feat: add three-phase singularity boss battle"
```

---

### Task 8: Add sound, achievements, result PNG, polish, and accessibility

**Files:**
- Create: `react-apps/gcd-lcm-space/src/lib/audio.js`
- Create: `react-apps/gcd-lcm-space/src/components/ResultCard.jsx`
- Modify: `react-apps/gcd-lcm-space/src/App.jsx`
- Modify: `react-apps/gcd-lcm-space/src/components/LevelRunner.jsx`
- Modify: `react-apps/gcd-lcm-space/src/components/BossBattle.jsx`
- Modify: `react-apps/gcd-lcm-space/src/styles.css`

**Interfaces:**
- Produces: `playTone(kind, enabled)`, `downloadResultCard(profile, bossResult)`.
- Consumes: profile/result objects.

- [ ] **Step 1: Implement failure-safe Web Audio**

```js
export function playTone(kind, enabled = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const tones = {
      correct:[660,0.12], wrong:[180,0.16], star:[880,0.18],
      unlock:[520,0.22], critical:[980,0.22], life:[130,0.24], victory:[1040,0.35]
    };
    const [freq,duration] = tones[kind] || tones.correct;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}
```

- [ ] **Step 2: Add achievements as derived badges**

Implement only:
- «Охотник за простыми» — level 1 has 3 stars;
- «Факторизатор» — levels 2 and 3 each have at least 2 stars;
- «Мастер НОД» — level 5 has 3 stars;
- «Мастер НОК» — level 7 has 3 stars;
- «Без единой ошибки» — any level has 3 stars with 100% first-try accuracy.

Do not add currencies or upgrades.

- [ ] **Step 3: Implement Canvas PNG export**

`downloadResultCard(profile, bossResult)` creates a 1200×675 canvas, draws:
- dark space gradient;
- title;
- displayName;
- rank;
- `${starsTotal}/24 ⭐`;
- expedition points;
- best combo;
- remaining lives;
- «Ядро Сингулярности побеждено».

Then:
```js
canvas.toBlob(blob => {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nod-nok-${profile.displayName || 'result'}.png`;
  a.click();
  URL.revokeObjectURL(url);
}, 'image/png');
```

- [ ] **Step 4: Apply visual polish without hiding instructional state**

Add:
- nebula gradients;
- star field;
- route glow;
- three boss shield layers;
- short Framer Motion transitions;
- confetti on 3-star result and boss victory;
- no long blocking animations;
- no hover-only controls.

All interactive elements receive visible text/ARIA labels. Incorrect/correct feedback includes icon + text in addition to color.

- [ ] **Step 5: Manual accessibility/touch pass**

At widths 320, 375, 768, 1280:
- no horizontal page scroll;
- mission buttons ≥44 px;
- keyboard tab reaches library link, sound, answer controls and map nodes;
- focus remains visible;
- drag-style exercises work entirely through taps;
- reduced-motion mode removes shake/zoom without removing state changes.

- [ ] **Step 6: Build and commit**

Run: `cd react-apps/gcd-lcm-space && npm run build`  
Expected: PASS.

```bash
git add react-apps/gcd-lcm-space/src
git commit -m "feat: polish space campaign rewards and accessibility"
```

---

### Task 9: Integrate with the trainer library and add CI/build publication

**Files:**
- Modify: `index.html`
- Create: `tests/gcd-lcm-library.test.mjs`
- Create: `.github/workflows/build-gcd-lcm-space.yml`

**Interfaces:**
- Produces: library card and automated Pages build.
- Consumes: completed React app.

- [ ] **Step 1: Write failing library integration test**

```js
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
```

- [ ] **Step 2: Add the card to `index.html`**

Insert a math card:
```html
<article class="trainer-card multiplication-card" data-subject="math" data-grades="6" data-domain="general">
  <div class="trainer-topline">
    <span class="trainer-badge">Математика · 6 класс</span>
    <span class="new-badge">НОД и НОК</span>
  </div>
  <h3>Космическая экспедиция: НОД и НОК</h3>
  <p>Пройди 8 космических миссий: простые числа, разложение на множители, НОД и НОК. Собери звёзды и победи финального босса.</p>
  <a class="open-btn" href="math/grade-6/gcd-lcm-space/">Открыть тренажёр <span aria-hidden="true">→</span></a>
</article>
```

Change `7 материалов` to `8 материалов`.

- [ ] **Step 3: Add build workflow following repository convention**

```yaml
name: Build GCD LCM space trainer

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths:
      - 'react-apps/gcd-lcm-space/**'
      - '.github/workflows/build-gcd-lcm-space.yml'

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Run trainer tests
        run: node --test tests/gcd-lcm-*.test.mjs
      - name: Install dependencies
        working-directory: react-apps/gcd-lcm-space
        run: npm install --no-audit --no-fund
      - name: Build
        working-directory: react-apps/gcd-lcm-space
        run: npm run build
      - name: Publish trainer into Pages tree
        run: |
          rm -rf math/grade-6/gcd-lcm-space
          mkdir -p math/grade-6/gcd-lcm-space
          cp -R react-apps/gcd-lcm-space/dist/. math/grade-6/gcd-lcm-space/
      - name: Commit built trainer and lockfile
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add react-apps/gcd-lcm-space/package-lock.json math/grade-6/gcd-lcm-space
          if git diff --cached --quiet; then
            echo "No build changes"
          else
            git commit -m "Build GCD LCM space trainer [skip ci]"
            git push
          fi
```

- [ ] **Step 4: Run integration tests**

Run:
```bash
node --test tests/gcd-lcm-*.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Build locally once and verify the generated artifact**

Run:
```bash
cd react-apps/gcd-lcm-space
npm install --no-audit --no-fund
npm run build
test -f dist/index.html
```

Expected: `dist/index.html` exists and is self-contained aside from browser APIs.

- [ ] **Step 6: Commit**

```bash
git add index.html tests/gcd-lcm-library.test.mjs .github/workflows/build-gcd-lcm-space.yml react-apps/gcd-lcm-space/package-lock.json
git commit -m "feat: publish GCD LCM trainer through library"
```

---

### Task 10: Full verification, regression check, and branch readiness

**Files:**
- Verify all files above.
- No new production files unless verification reveals a defect.

**Interfaces:**
- Consumes: entire feature branch.
- Produces: verified branch ready for review/integration.

- [ ] **Step 1: Run the complete repository test suite**

Run:
```bash
node --test tests/*.test.mjs
```

Expected: all existing tests plus new GCD/LCM tests PASS.

- [ ] **Step 2: Run syntax checks on pure modules**

Run:
```bash
node --check react-apps/gcd-lcm-space/src/lib/math.js
node --check react-apps/gcd-lcm-space/src/lib/task-generators.js
node --check react-apps/gcd-lcm-space/src/lib/scoring.js
node --check react-apps/gcd-lcm-space/src/lib/progress-store.js
node --check react-apps/gcd-lcm-space/src/lib/campaign.js
node --check react-apps/gcd-lcm-space/src/lib/audio.js
```

Expected: no syntax errors.

- [ ] **Step 3: Run production build**

Run:
```bash
cd react-apps/gcd-lcm-space && npm run build
```

Expected: Vite exits 0 and writes `dist/index.html`.

- [ ] **Step 4: Manual end-to-end campaign smoke**

Use one fresh profile and verify:
1. first level open, others locked;
2. complete each ordinary level;
3. stars persist after reload;
4. next level opens after 1 star;
5. boss remains locked below 18;
6. boss opens at 18;
7. three boss errors produce defeat without erasing campaign;
8. retry starts boss with 3 lives;
9. victory persists and final rank appears;
10. PNG result downloads;
11. «← В библиотеку» works from start, map, level, defeat and victory screens.

- [ ] **Step 5: Verify profile edge cases**

Manual:
- create `Маша`;
- reload and enter ` маша ` → same profile;
- corrupt only `studytrainers.gcd-lcm-space.v1` in DevTools → app recovers without affecting other localStorage keys;
- create a second profile → resetting first leaves second intact.

- [ ] **Step 6: Verify responsive/touch/reduced-motion behavior**

Manual at 320 px and touch emulation:
- no clipped math;
- map is vertical;
- answer controls large enough;
- factor/sort tasks usable without drag;
- focus visible by keyboard;
- reduced motion eliminates intense transitions.

- [ ] **Step 7: Commit only if verification required fixes**

```bash
git add -A
git commit -m "fix: address GCD LCM campaign verification findings"
```

If no files changed, do not create an empty commit.

- [ ] **Step 8: Request code review before integration**

Use `superpowers:requesting-code-review` on the completed feature branch, then use `superpowers:finishing-a-development-branch` only after the review is addressed and verification is green.
