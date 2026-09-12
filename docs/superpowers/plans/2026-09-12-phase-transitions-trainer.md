# Phase Transitions Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and integrate an interactive Grade 8 physics trainer for recognizing, interpreting, and constructing temperature-time phase-transition graphs.

**Architecture:** A dependency-free static web app under `physics/grade-8/phase-transitions/`. Pure validation and graph-domain logic live in `logic.js` so they can be covered by Node's built-in test runner. Task banks live in `data.js`, browser orchestration in `app.js`, and all graphs are SVG rendered from point arrays. The root library page receives one new Physics Grade 8 card.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, SVG, Node.js built-in `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-12-phase-transitions-trainer-design.md`

## Global Constraints

- Four phase transitions only: melting, crystallization, boiling, condensation.
- Level 1: 10 highlighted-section tasks; 8/10 clean first-attempt answers unlock Level 2.
- Level 2: 10 full-graph questions with mixed answer formats; 8/10 unlock the bonus level.
- Bonus: 6 node-based graph-construction tasks, ending with direction reversals and up to four transitions.
- Vertical axis is `T, °C`; horizontal axis is `t, время`.
- Time duration is checked only when an individual task explicitly defines time coordinates.
- Touch-first controls: tap selection must work everywhere; drag-and-drop is optional, never required.
- Numeric keyboard is used only for temperature answers.
- Responsive layout must work on phones, desktops, and interactive panels.
- No external libraries or network dependencies.

---

### Task 1: Pure domain logic and tests

**Files:**
- Create: `physics/grade-8/phase-transitions/logic.js`
- Create: `tests/phase-transitions.test.mjs`

**Interfaces:**
- Produces `segmentDirection(a,b)`, `segmentKind(a,b)`, `phaseProcess(beforeState, afterState)`, `validateLevel1Answer(task,answer)`, `validateLevel2Answer(task,answer)`, `validateBonusPath(task,points)`, `isCleanPass(record)`.

- [ ] **Step 1: Write failing tests** covering horizontal/rising/falling segment classification, the four transitions, numeric temperature tolerance, 8/10 clean-pass threshold semantics, and bonus path validation with a direction reversal.
- [ ] **Step 2: Run** `node --test tests/phase-transitions.test.mjs` and verify failure because `logic.js` does not yet exist.
- [ ] **Step 3: Implement minimal pure functions** in `logic.js`.
- [ ] **Step 4: Run** `node --test tests/phase-transitions.test.mjs` and verify all tests pass.

### Task 2: Task banks

**Files:**
- Create: `physics/grade-8/phase-transitions/data.js`
- Modify: `tests/phase-transitions.test.mjs`

**Interfaces:**
- Produces `LEVEL1_TASKS`, `LEVEL2_TASKS`, `BONUS_TASKS`, `ANSWER_OPTIONS`.
- Each graph task exposes point arrays as `{x:number,y:number,label?:string}` and one or more segment indices.

- [ ] **Step 1: Extend tests** to assert exactly 10 Level 1 tasks, 10 Level 2 tasks, 6 bonus tasks, all transition types represented, and valid graph point ordering.
- [ ] **Step 2: Run tests** and verify failure because `data.js` is missing.
- [ ] **Step 3: Add the complete approved task bank** from the spec, using original wording and numeric values.
- [ ] **Step 4: Run tests** and verify pass.

### Task 3: App shell and responsive visual system

**Files:**
- Create: `physics/grade-8/phase-transitions/index.html`
- Create: `physics/grade-8/phase-transitions/styles.css`

**Interfaces:**
- Provides screens `intro-screen`, `level1-screen`, `level2-screen`, `bonus-screen`, `result-screen`.
- Provides shared containers for progress, rule modal, feedback, SVG graph, answer area, and navigation.

- [ ] **Step 1: Create semantic HTML** with the approved three-stage structure, rule modal, progress indicators, large touch targets, and library backlink.
- [ ] **Step 2: Add responsive CSS** matching the existing trainer family while visually differentiating Levels 1, 2, and Bonus.
- [ ] **Step 3: Verify HTML structure** with a parser and verify no duplicate ids.

### Task 4: SVG graph renderer and Level 1

**Files:**
- Create: `physics/grade-8/phase-transitions/app.js`
- Modify: `tests/phase-transitions.test.mjs`

**Interfaces:**
- Browser app imports `logic.js` and `data.js`.
- SVG renderer maps point arrays into axes, grid, polyline segments, point labels, and optional highlighted/clickable segments.

- [ ] **Step 1: Add tests** for graph bounds helpers and clean-record accounting.
- [ ] **Step 2: Verify tests fail** before helper implementation.
- [ ] **Step 3: Implement Level 1**: render highlighted segment, tap-to-select answer cards, numeric temperature input, hint, first-attempt tracking, 10-task progression, 8/10 gate.
- [ ] **Step 4: Run unit tests and `node --check`** for all JS files.

### Task 5: Level 2 mixed question formats

**Files:**
- Modify: `physics/grade-8/phase-transitions/app.js`
- Modify: `physics/grade-8/phase-transitions/styles.css`

**Interfaces:**
- Supports answer types: `segment`, `singleChoice`, `multiChoice`, `number`.

- [ ] **Step 1: Add failing validation tests** for each Level 2 answer type.
- [ ] **Step 2: Implement rendering and validation** for segment taps, single choice, multi-select, and numeric temperature.
- [ ] **Step 3: Implement 8/10 unlock logic** and retry option if threshold is not met.
- [ ] **Step 4: Run tests and syntax checks**.

### Task 6: Bonus graph builder

**Files:**
- Modify: `physics/grade-8/phase-transitions/app.js`
- Modify: `physics/grade-8/phase-transitions/styles.css`

**Interfaces:**
- Node grid accepts one point per progression column, auto-connects selected nodes, and exposes undo, clear, hint, and check actions.

- [ ] **Step 1: Add failing tests** for one-direction paths, two phase-transition plateaus, and final direction-reversal paths.
- [ ] **Step 2: Implement node selection and SVG preview** with large touch targets and automatic segment connection.
- [ ] **Step 3: Implement diagnostic feedback** for missing plateau, wrong transition temperature, wrong direction, or wrong sequence.
- [ ] **Step 4: Run tests and syntax checks**.

### Task 7: Results, accessibility, and integration

**Files:**
- Modify: `physics/grade-8/phase-transitions/app.js`
- Modify: `physics/grade-8/phase-transitions/index.html`
- Modify: `index.html`

**Interfaces:**
- Final diagnostics show recognition, aggregate state, graph temperature reading, graph interpretation, and bonus graph construction.
- Root library card links to `physics/grade-8/phase-transitions/`.

- [ ] **Step 1: Add result diagnostics and restart controls**.
- [ ] **Step 2: Add keyboard focus states, ARIA labels, and non-color-only selected states**.
- [ ] **Step 3: Add Physics Grade 8 library card** and increment material counter from 3 to 4.
- [ ] **Step 4: Run the complete verification suite**: `node --test tests/phase-transitions.test.mjs`, `node --check` on every JS file, HTML duplicate-id check, and inspect generated SVG/DOM structure in a local static server.

### Task 8: Review and delivery

**Files:** all changed files.

- [ ] **Step 1: Compare branch with `main`** and verify only intended files changed.
- [ ] **Step 2: Re-read the design spec** and check every requirement against implementation.
- [ ] **Step 3: Create a pull request** from `feature/phase-transitions-trainer` to `main` with verification evidence and screenshots/preview notes if available.
