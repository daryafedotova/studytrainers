import { tasksFor } from './bank.js';
import { lcmSearchStep } from './logic.js';

const app = document.querySelector('#app');
const STORAGE_KEY = 'divisibility-detector:6:lcm';
const ROUTE_DESCRIPTION = 'Подбирай кратные большего числа, пока не найдёшь первое общее кратное.';
const SKILL_LABELS = {
  'lcm-base':'Выбор числа для подбора',
  'lcm-check':'Проверка кратных',
  'lcm-finish':'Первое общее кратное',
};

let session = null;

function freshProgress() {
  return {
    phase:'choose-base',
    multiplier:1,
    history:[],
    feedback:null,
    complete:false,
    result:null,
    clean:true,
    skillErrors:new Set(),
  };
}

function startSession() {
  session = {
    tasks:tasksFor('6','lcm'),
    index:0,
    records:[],
    progress:freshProgress(),
  };
}

function currentTask() {
  return session?.tasks?.[session.index] ?? null;
}

function feedbackMarkup(feedback) {
  if (!feedback) return '';
  const className = feedback.kind === 'success' ? 'feedback-success' : 'feedback-hint';
  return `<div class="feedback ${className}">${feedback.text}</div>`;
}

function lcmHistoryMarkup(history) {
  if (!history.length) return '';
  return `<div class="lcm-history" aria-label="Проверенные кратные">
    ${history.map(step => `<div class="lcm-history-row ${step.isCommon ? 'is-common' : ''}">
      <span>${step.larger} × ${step.multiplier} = ${step.candidate}</span>
      <strong>${step.isCommon ? 'подходит' : 'не подходит'}</strong>
    </div>`).join('')}
  </div>`;
}

function updateTopbar() {
  const ruleButton = app.querySelector('.rule-btn');
  if (ruleButton) ruleButton.hidden = true;
  const counter = app.querySelector('.topbar-title small');
  if (counter && session) counter.textContent = `${session.index + 1} / ${session.tasks.length}`;
}

function markError(skill, text) {
  const progress = session.progress;
  progress.clean = false;
  progress.skillErrors.add(skill);
  progress.feedback = {kind:'hint',text};
  renderLcmTask();
}

function chooseBase(value) {
  const task = currentTask();
  const expected = Math.max(task.left, task.right);
  if (value !== expected) {
    markError('lcm-base', `Для подбора удобнее начать с большего числа — ${expected}. Его кратные будут расти быстрее.`);
    return;
  }
  session.progress.phase = 'search';
  session.progress.feedback = {
    kind:'success',
    text:`Берём большее число ${expected} и последовательно проверяем его кратные.`,
  };
  renderLcmTask();
}

function answerCandidate(answer) {
  const task = currentTask();
  const progress = session.progress;
  const step = lcmSearchStep(task.left, task.right, progress.multiplier);

  if (answer !== step.isCommon) {
    if (step.isCommon) {
      markError('lcm-finish', `${step.candidate} делится на ${step.smaller} без остатка. Это первое общее кратное — здесь нужно остановиться.`);
    } else {
      markError('lcm-check', `${step.candidate} не делится на ${step.smaller} без остатка. Это число ещё не подходит.`);
    }
    return;
  }

  progress.history.push(step);
  if (step.isCommon) {
    progress.complete = true;
    progress.result = step.candidate;
    progress.feedback = {kind:'success',text:`Нашли первое общее кратное: ${step.candidate}.`};
  } else {
    progress.multiplier += 1;
    progress.feedback = {kind:'success',text:`${step.candidate} не подходит. Проверяем следующее кратное числа ${step.larger}.`};
  }
  renderLcmTask();
}

function finishCurrentTask() {
  const progress = session.progress;
  session.records.push({
    clean:progress.clean,
    skillErrors:[...progress.skillErrors],
  });
  if (session.index + 1 >= session.tasks.length) {
    renderLcmResults();
    return;
  }
  session.index += 1;
  session.progress = freshProgress();
  renderLcmTask();
}

function bindLcmControls() {
  app.querySelectorAll('[data-lcm-base]').forEach(button => {
    button.addEventListener('click', () => chooseBase(Number(button.dataset.lcmBase)));
  });
  app.querySelectorAll('[data-lcm-answer]').forEach(button => {
    button.addEventListener('click', () => answerCandidate(button.dataset.lcmAnswer === 'true'));
  });
  app.querySelector('[data-lcm-next]')?.addEventListener('click', finishCurrentTask);
}

function renderLcmTask() {
  if (!session) startSession();
  const task = currentTask();
  const panel = app.querySelector('.panel');
  if (!task || !panel) return;
  updateTopbar();

  const progress = session.progress;
  const left = task.left;
  const right = task.right;
  const larger = Math.max(left, right);
  const smaller = Math.min(left, right);

  if (progress.complete) {
    panel.innerHTML = `<div class="task-card lcm-search">
      <p class="task-kicker">Подбор НОК</p>
      <h2>НОК(${left}; ${right})</h2>
      ${lcmHistoryMarkup(progress.history)}
      <div class="lcm-result">
        <span>Первое общее кратное</span>
        <strong>НОК(${left}; ${right}) = ${progress.result}</strong>
        <p>${progress.result} : ${smaller} = ${progress.result / smaller}, поэтому ${progress.result} кратно обоим числам.</p>
      </div>
      ${feedbackMarkup(progress.feedback)}
      <button class="btn btn-primary" type="button" data-lcm-next>${session.index + 1 === session.tasks.length ? 'К результатам' : 'Следующее задание'}</button>
    </div>`;
    bindLcmControls();
    return;
  }

  if (progress.phase === 'choose-base') {
    panel.innerHTML = `<div class="task-card lcm-search">
      <p class="task-kicker">Подбор НОК</p>
      <h2>НОК(${left}; ${right})</h2>
      <p class="question">С какого числа начнём подбор кратных?</p>
      <p class="task-note">Выбери число, кратные которого будем проверять.</p>
      <div class="lcm-pair">
        <button class="lcm-number-button" type="button" data-lcm-base="${left}">${left}</button>
        <button class="lcm-number-button" type="button" data-lcm-base="${right}">${right}</button>
      </div>
      ${feedbackMarkup(progress.feedback)}
    </div>`;
    bindLcmControls();
    return;
  }

  const step = lcmSearchStep(left, right, progress.multiplier);
  panel.innerHTML = `<div class="task-card lcm-search">
    <p class="task-kicker">Подбор НОК</p>
    <h2>НОК(${left}; ${right})</h2>
    <p class="lcm-method">Берём большее число <strong>${larger}</strong> и проверяем его кратные по порядку.</p>
    ${lcmHistoryMarkup(progress.history)}
    <div class="lcm-current">
      <span>Кратное № ${step.multiplier}</span>
      <strong>${step.larger} × ${step.multiplier} = ${step.candidate}</strong>
    </div>
    <p class="question">Делится ли ${step.candidate} на ${step.smaller} без остатка?</p>
    <div class="yes-no-row" role="group" aria-label="Проверка кратного">
      <button type="button" class="choice-button" data-lcm-answer="true">ДА</button>
      <button type="button" class="choice-button" data-lcm-answer="false">НЕТ</button>
    </div>
    ${feedbackMarkup(progress.feedback)}
  </div>`;
  bindLcmControls();
}

function saveBest(percent) {
  const currentRaw = globalThis.localStorage?.getItem(STORAGE_KEY);
  const current = currentRaw === null ? 0 : Number(currentRaw);
  const best = Math.max(Number.isFinite(current) ? current : 0, percent);
  globalThis.localStorage?.setItem(STORAGE_KEY,String(best));
  return best;
}

function skillSummary() {
  const total = session.records.length;
  return Object.entries(SKILL_LABELS).map(([skill,label]) => {
    const clean = session.records.filter(record => !record.skillErrors.includes(skill)).length;
    const percent = total ? Math.round(clean * 100 / total) : 0;
    return {skill,label,clean,total,percent};
  });
}

function renderLcmResults() {
  const panel = app.querySelector('.panel');
  if (!panel || !session) return;
  const total = session.records.length;
  const clean = session.records.filter(record => record.clean).length;
  const percent = total ? Math.round(clean * 100 / total) : 0;
  saveBest(percent);
  const skills = skillSummary();
  const counter = app.querySelector('.topbar-title small');
  if (counter) counter.textContent = `${total} / ${total}`;

  panel.innerHTML = `<div class="results-panel lcm-search">
    <p class="task-kicker">Тренировка завершена</p>
    <h1>${percent >= 80 ? 'НОК освоен ✓' : 'Продолжи тренировку НОК'}</h1>
    <div class="score-circle"><strong>${percent}%</strong><span>чистых решений</span></div>
    <p class="results-main">Чисто решено: <strong>${clean} из ${total} — ${percent}%.</strong></p>
    <p class="task-note">Чистое решение — без ошибочного выбора числа и без ошибок при проверке кратных.</p>
    <div class="skill-results">
      ${skills.map(item => `<div><span>${item.label}</span><strong>${item.percent}%</strong><em>${item.percent >= 80 ? 'уверенно' : 'повторить'}</em></div>`).join('')}
    </div>
    <div class="results-actions">
      <button class="btn" type="button" data-lcm-routes>К разделам</button>
      <button class="btn btn-primary" type="button" data-lcm-retry>Пройти НОК ещё раз</button>
    </div>
  </div>`;

  app.querySelector('[data-lcm-retry]')?.addEventListener('click', () => {
    startSession();
    renderLcmTask();
  });
  app.querySelector('[data-lcm-routes]')?.addEventListener('click', () => {
    app.querySelector('[data-routes]')?.click();
  });
}

function patchPassiveUi() {
  const gradeDescription = app.querySelector('[data-grade="6"] p');
  if (gradeDescription && gradeDescription.textContent !== 'Признаки делимости, НОД, НОК и сокращение дробей.') {
    gradeDescription.textContent = 'Признаки делимости, НОД, НОК и сокращение дробей.';
  }
  const route = app.querySelector('[data-block="lcm"]');
  const routeDescription = route?.querySelector('p');
  if (routeDescription && routeDescription.textContent !== ROUTE_DESCRIPTION) {
    routeDescription.textContent = ROUTE_DESCRIPTION;
  }
}

function isLcmPlaceholder() {
  const title = app.querySelector('.panel .task-card > h2');
  return Boolean(title?.textContent?.trim().startsWith('Подбери НОК'));
}

function enhanceLcmRoute() {
  patchPassiveUi();
  if (app.querySelector('.lcm-search')) return;
  if (isLcmPlaceholder()) {
    if (!session) startSession();
    renderLcmTask();
    return;
  }
  if (app.querySelector('.route-grid') || app.querySelector('[data-grade="6"]')) {
    session = null;
    const ruleButton = app.querySelector('.rule-btn');
    if (ruleButton) ruleButton.hidden = false;
  }
}

if (app) {
  const observer = new MutationObserver(enhanceLcmRoute);
  observer.observe(app,{childList:true,subtree:true});
  enhanceLcmRoute();
}
