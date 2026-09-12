# Phase Transitions Trainer Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revise the Grade 8 phase-transition trainer so both core levels cover heating, cooling, and phase transitions, while simplifying Level 1 with dropdowns and fixing review issues before publishing to `main`.

**Architecture:** Keep the dependency-free static app in `physics/grade-8/phase-transitions/`. Extend `data.js` to a stratified Level 1 task bank and revised Level 2 questions, extend `logic.js` with task-set selection and dynamic Level 1 validation, and adapt `app.js`/HTML/CSS to the new field model. Preserve the existing SVG and bonus graph builder.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, SVG, Node.js built-in `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-12-phase-transitions-trainer-design.md`

## Global Constraints

- Level 1 run contains exactly 10 tasks covering all 10 process categories once each.
- Level 1 bank contains at least two variants per category.
- Level 1 uses `<select>` controls for categorical answers and numeric input only for transition temperature.
- Level 2 contains heating/cooling questions as well as phase-transition questions.
- Bonus task 5 explicitly states initial temperature `−10 °C`.
- Top bar contains a persistent `← В библиотеку` link.
- SVG axis labels must not be clipped.
- No external libraries or network dependencies.

---

### Task 1: Update tests for the revised learning model

**Files:**
- Modify: `tests/phase-transitions.test.mjs`

**Interfaces:**
- Expect `pickLevel1Set(tasks, random?)` from `logic.js`.
- Expect slope Level 1 answers with `kind: 'slope'` and phase answers with `kind: 'phase'`.

- [ ] **Step 1:** Add tests proving the Level 1 bank has at least 20 tasks and exactly 10 distinct categories.
- [ ] **Step 2:** Add a test proving `pickLevel1Set` returns 10 tasks with one task from each category.
- [ ] **Step 3:** Add validation tests for slope and phase Level 1 answer schemas.
- [ ] **Step 4:** Add tests proving Level 2 contains both heating and cooling questions.
- [ ] **Step 5:** Run the test suite and confirm the new tests fail before implementation.

### Task 2: Domain logic and task bank

**Files:**
- Modify: `physics/grade-8/phase-transitions/logic.js`
- Modify: `physics/grade-8/phase-transitions/data.js`

**Interfaces:**
- `pickLevel1Set(tasks, random=Math.random) -> Task[]` returns one randomized task per category.
- `validateLevel1Answer(task, answer)` validates different field sets for `slope` and `phase` tasks.

- [ ] **Step 1:** Implement `pickLevel1Set` and dynamic Level 1 validation.
- [ ] **Step 2:** Expand Level 1 to at least 20 tasks, two per category.
- [ ] **Step 3:** Revise Level 2 to include heating/ cooling of solid, liquid, and gas alongside phase transitions.
- [ ] **Step 4:** Add `−10 °C` to the wording of bonus task 5.
- [ ] **Step 5:** Run tests and confirm all pass.

### Task 3: Level 1 interface revision

**Files:**
- Modify: `physics/grade-8/phase-transitions/index.html`
- Modify: `physics/grade-8/phase-transitions/app.js`
- Modify: `physics/grade-8/phase-transitions/styles.css`

**Interfaces:**
- The Level 1 renderer chooses fields based on `task.kind`.
- Categorical fields render as native `<select>` elements.

- [ ] **Step 1:** Replace the Level 1 helper copy with `Опиши выделенный участок, отвечая на вопросы справа.`
- [ ] **Step 2:** Render four dropdown fields for slope tasks and six fields for phase tasks.
- [ ] **Step 3:** Put neutral context in the task pill instead of the correct process name.
- [ ] **Step 4:** Move/add the Level 1 hint control near the task header without duplicating it.
- [ ] **Step 5:** Preserve first-attempt and hint-use scoring.

### Task 4: Review fixes and navigation

**Files:**
- Modify: `physics/grade-8/phase-transitions/index.html`
- Modify: `physics/grade-8/phase-transitions/app.js`
- Modify: `physics/grade-8/phase-transitions/styles.css`

- [ ] **Step 1:** Add persistent `← В библиотеку` to the top bar.
- [ ] **Step 2:** Increase SVG top/left margins and move `T, °C` so it is never clipped.
- [ ] **Step 3:** Update intro/rule text to mention heating and cooling, not only phase transitions.
- [ ] **Step 4:** Update final skill labels to `Распознавание участков` and related revised metrics.

### Task 5: Verification and publish

**Files:** all changed files.

- [ ] **Step 1:** Run `node --test tests/phase-transitions.test.mjs`.
- [ ] **Step 2:** Run `node --check` on `logic.js`, `data.js`, and `app.js`.
- [ ] **Step 3:** Verify HTML IDs are unique and required controls exist.
- [ ] **Step 4:** Compare `feature/phase-transitions-trainer` with `main` and review only intended changes.
- [ ] **Step 5:** Fast-forward `main` to the verified feature commit.
- [ ] **Step 6:** Verify the GitHub Pages deployment workflow completes successfully before reporting publication.