import { ROUTES, RULES, blockFor, tasksFor, weakSkillTasks } from './bank.js';
import {
divisibilitySet, commonDivisibilitySet, digitSum,
availableReductionDivisors, reduceFractionBy, gcd,
dividePairBy, commonPrimeDivisors
} from './logic.js';
import { validateTask, feedbackFor } from './validation.js';
import {
createTaskRecord, markRuleUsed, markHintUsed, registerAttempt,
loadBlockBest, hasBlockBest, saveBlockBest, summarize, summarizeSkills
} from './progress.js';
const app = document.querySelector('#app');
const state = {
screen:'home',
grade:null,
blockId:null,
taskIndex:0,
records:[],
taskQueue:null,
taskState:{},
};
function setState(patch) {
Object.assign(state, patch);
render();
}
function storageKey(grade, blockId) {
return `divisibility-detector:${grade}:${blockId}`;
}
function currentTasks() {
return state.taskQueue ?? tasksFor(state.grade,state.blockId);
}
function currentTask() {
return currentTasks()[state.taskIndex] ?? null;
}
function freshTaskState(task) {
const base = {
feedback:null,
complete:false,
ruleOpen:false,
learningChoice:null,
learningRevealed:false,
yes:null,
reasonId:null,
divisors:task?.type === 'detector-error' ? [...(task.shownDivisors ?? [])] : [],
leftDivisors:[],
rightDivisors:[],
record:task && !task.learningOnly ? createTaskRecord(task.id,task.skills ?? []) : null,
};
if (task?.type === 'fraction-step') {
base.fractionCurrent = {numerator:task.numerator,denominator:task.denominator};
base.fractionHistory = [{numerator:task.numerator,denominator:task.denominator,divisor:null}];
}
if (task?.type === 'fraction-error') base.fractionDiagnosis = null;
if (task?.type === 'gcd' || task?.type === 'fraction-gcd') {
const left = task.type === 'fraction-gcd' ? task.numerator : task.left;
const right = task.type === 'fraction-gcd' ? task.denominator : task.right;
base.gcdRows = [{left,right,divisor:null}];
base.gcdFactors = [];
base.gcdPhase = 'choose-divisor';
base.pendingDivisor = null;
base.gcdDraft = {left:'',right:''};
base.gcdFieldStatus = {left:null,right:null};
base.gcdValue = '';
base.gcdComputed = null;
base.reducedDraft = {numerator:'',denominator:''};
base.reducedStatus = {left:null,right:null};
}
if (task?.type === 'gcd-error') base.gcdDiagnosis = null;
return base;
}
function renderHome() {
app.innerHTML = `
<section class="screen">
<div class="hero-card">
<p class="eyebrow">Математика · 5–6 класс</p>
<h1>ДЕТЕКТОР ДЕЛИМОСТИ</h1>
<p class="subtitle">Научись быстро определять, на что делится число, и применять признаки при сокращении дробей.</p>
</div>
<div class="grade-grid" aria-label="Выберите класс">
<button class="grade-card" type="button" data-grade="5">
<span class="grade-number">5</span>
<h2>5 класс</h2>
<p>Признаки делимости и сокращение дробей по шагам.</p>
</button>
<button class="grade-card" type="button" data-grade="6">
<span class="grade-number">6</span>
<h2>6 класс</h2>
<p>Признаки делимости, НОД и сокращение дробей.</p>
</button>
</div>
</section>`;
app.querySelectorAll('[data-grade]').forEach(button => {
button.addEventListener('click', () => setState({screen:'routes',grade:button.dataset.grade,blockId:null,taskIndex:0,records:[],taskQueue:null,taskState:{}}));
});
}
function routeDescription(grade, blockId) {
const text = {
learn: grade === '5' ? 'Разберись, куда смотреть и как формулируются пять признаков.' : 'Быстро восстанови пять признаков перед практикой.',
'yes-no':'Ответь «да» или «нет» и обязательно объясни почему.',
detector:'Найди все подходящие признаки и исправляй готовые ошибки.',
pair:'Проверь два числа и найди признаки, подходящие обоим.',
fractions:'Сокращай дроби по шагам любым правильным путём.',
gcd:'Найди НОД во встроенном пошаговом черновике.',
'gcd-fractions':'Найди НОД и сократи дробь рационально.',
};
return text[blockId] ?? '';
}
function renderRoutes() {
const routes = ROUTES[state.grade] ?? [];
app.innerHTML = `
<section class="screen">
<div class="panel">
<div class="panel-header">
<div>
<span class="badge">${state.grade} класс</span>
<h1>Маршрут тренировки</h1>
<p>Разделы доступны сразу. Нумерация показывает рекомендуемый порядок.</p>
</div>
<button class="btn" type="button" data-home>← К выбору класса</button>
</div>
<div class="route-grid">
${routes.map(block => {
const key = storageKey(state.grade,block.id);
const hasBest = !block.learningOnly && hasBlockBest(key);
const best = block.learningOnly ? null : loadBlockBest(key);
const learned = block.learningOnly && globalThis.localStorage?.getItem(`${key}:completed`) === '1';
return `<button class="route-card" type="button" data-block="${block.id}">
<h3>${block.title}</h3>
<p>${routeDescription(state.grade,block.id)}</p>
<div class="route-status">${block.learningOnly ? (learned ? 'Пройдено ✓' : 'Обучающий блок') : hasBest ? `Лучший результат: ${best}%` : 'Можно начать сразу'}</div>
</button>`;
}).join('')}
</div>
</div>
</section>`;
app.querySelector('[data-home]').addEventListener('click', () => setState({screen:'home',grade:null,blockId:null,taskQueue:null}));
app.querySelectorAll('[data-block]').forEach(button => button.addEventListener('click', () => startBlock(button.dataset.block)));
}
function startBlock(blockId) {
const task = tasksFor(state.grade,blockId)[0] ?? null;
setState({screen:'task',blockId,taskIndex:0,records:[],taskQueue:null,taskState:freshTaskState(task)});
}
function taskTopbar(block, tasks) {
return `<div class="topbar">
<button type="button" data-routes>← Разделы</button>
<div class="topbar-title">
<strong>${block?.title ?? 'Тренировка'}</strong>
<small>${tasks.length ? `${state.taskIndex + 1} / ${tasks.length}` : ''}</small>
</div>
<button type="button" class="rule-btn" data-rule>? Правило</button>
</div>`;
}
function rulePanel(task) {
if (!state.taskState.ruleOpen) return '';
const divisors = task?.divisor ? [task.divisor] : [2,3,5,9,10];
return `<aside class="rule-panel" aria-label="Правило">
<strong>Правило</strong>
${divisors.map(divisor => `<p><b>${divisor}:</b> ${RULES[divisor].short}</p>`).join('')}
</aside>`;
}
function renderLearningTask(task) {
if (task.stage === 'strategies') {
return `<div class="task-card learning-card">
<p class="task-kicker">Сначала — общая схема</p>
<h2>Есть всего два способа проверки</h2>
<div class="strategy-grid">
<article class="strategy-card"><strong>2 · 5 · 10</strong><span>Смотрим на последнюю цифру</span></article>
<article class="strategy-card"><strong>3 · 9</strong><span>Считаем сумму цифр</span></article>
</div>
<button class="btn btn-primary" type="button" data-next>Понятно, дальше</button>
</div>`;
}
if (task.stage === 'rule') {
const correctStrategy = RULES[task.divisor].strategy;
const revealed = state.taskState.learningRevealed;
return `<div class="task-card learning-card">
<p class="task-kicker">Увидел → сформулировал → применил</p>
<h2>${task.prompt}</h2>
<div class="big-number">${task.number}</div>
<p class="question">Что нужно проверить?</p>
<div class="choice-row">
<button class="choice-button ${state.taskState.learningChoice === 'last-digit' ? 'is-selected' : ''}" type="button" data-learn-strategy="last-digit">Последнюю цифру</button>
<button class="choice-button ${state.taskState.learningChoice === 'digit-sum' ? 'is-selected' : ''}" type="button" data-learn-strategy="digit-sum">Сумму цифр</button>
</div>
${state.taskState.learningChoice && !revealed ? `<div class="feedback feedback-hint">${state.taskState.learningChoice === correctStrategy ? 'Верно. Нажми ещё раз, чтобы открыть правило.' : 'Попробуй другой способ проверки.'}</div>` : ''}
${revealed ? `<div class="rule-reveal"><strong>${RULES[task.divisor].short}</strong>${learningExample(task)}</div><button class="btn btn-primary" type="button" data-next>Дальше</button>` : ''}
</div>`;
}
if (task.stage === 'contrast') {
const answer = task.divisor === 10 ? 730 : 126;
const revealed = state.taskState.learningRevealed;
return `<div class="task-card learning-card">
<p class="task-kicker">Не перепутай</p>
<h2>${task.prompt}</h2>
<p class="question">Какое число делится на ${task.divisor}?</p>
<div class="contrast-row">
${task.numbers.map(number => `<button type="button" class="number-choice ${state.taskState.learningChoice === String(number) ? 'is-selected' : ''}" data-learn-number="${number}">${number}</button>`).join('')}
</div>
${state.taskState.learningChoice && !revealed ? `<div class="feedback feedback-hint">Проверь ${task.divisor === 10 ? 'последнюю цифру' : 'сумму цифр'} ещё раз.</div>` : ''}
${revealed ? `<div class="rule-reveal">${contrastExplanation(task)}</div><button class="btn btn-primary" type="button" data-next>Дальше</button>` : ''}
<span class="sr-only">Правильный ответ: ${answer}</span>
</div>`;
}
return renderDetectorTask({...task,type:'detector',learningOnly:true,prompt:'Какие признаки подходят числу 540?'});
}
function learningExample(task) {
if ([3,9].includes(task.divisor)) {
const sum = digitSum(task.number);
return `<p>${String(task.number).split('').join(' + ')} = ${sum}</p>`;
}
return `<p>Последняя цифра: <strong>${String(task.number).slice(-1)}</strong></p>`;
}
function contrastExplanation(task) {
if (task.divisor === 10) {
return `<p><strong>735</strong> заканчивается на 5 → делится на 5, но не на 10.</p><p><strong>730</strong> заканчивается на 0 → делится и на 5, и на 10.</p>`;
}
return `<p><strong>123:</strong> 1 + 2 + 3 = 6 → делится на 3, но не на 9.</p><p><strong>126:</strong> 1 + 2 + 6 = 9 → делится и на 3, и на 9.</p>`;
}
function renderYesNoTask(task) {
const ready = state.taskState.yes !== null && state.taskState.reasonId;
return `<div class="task-card">
<p class="task-kicker">Сначала вывод, потом обоснование</p>
<h2>${task.prompt}</h2>
<div class="big-number">${task.number}</div>
<div class="yes-no-row" role="group" aria-label="Ответ">
<button type="button" class="choice-button ${state.taskState.yes === true ? 'is-selected' : ''}" data-yes="true">ДА</button>
<button type="button" class="choice-button ${state.taskState.yes === false ? 'is-selected' : ''}" data-yes="false">НЕТ</button>
</div>
<h3 class="why-title">Почему?</h3>
<div class="reason-list">
${task.reasons.map(reason => `<button type="button" class="reason-button ${state.taskState.reasonId === reason.id ? 'is-selected' : ''}" data-reason="${reason.id}">${reason.text}</button>`).join('')}
</div>
${feedbackMarkup()}
${state.taskState.complete ? `<button class="btn btn-primary" type="button" data-next>Дальше</button>` : `<button class="btn btn-primary" type="button" data-check ${ready ? '' : 'disabled'}>Проверить</button>`}
</div>`;
}
function detectorButtons(selected, prefix = 'divisor') {
return [2,3,5,9,10].map(divisor => `<button type="button" class="detector-button" aria-pressed="${selected.includes(divisor)}" data-${prefix}="${divisor}">${divisor}</button>`).join('');
}
function renderDetectorTask(task) {
const selected = state.taskState.divisors ?? [];
const expected = divisibilitySet(task.number);
const successAnalysis = state.taskState.complete && validateTask({type:'detector',number:task.number},{divisors:selected}).ok;
return `<div class="task-card detector-card">
<p class="task-kicker">${task.type === 'detector-error' ? 'Найди ошибку' : 'Детектор делимости'}</p>
<h2>${task.prompt}</h2>
${task.type === 'detector-error' ? '<p class="task-note">Измени готовый набор так, чтобы он стал правильным.</p>' : ''}
<div class="big-number scan-number">${task.number}</div>
<div class="detector-row" role="group" aria-label="Признаки делимости">${detectorButtons(selected)}</div>
${successAnalysis ? analysisMarkup(task.number,expected) : ''}
${feedbackMarkup()}
${state.taskState.complete ? `<button class="btn btn-primary" type="button" data-next>Дальше</button>` : `<button class="btn btn-primary" type="button" data-check>Проверить</button>`}
</div>`;
}
function renderPairTask(task) {
const intersection = commonDivisibilitySet(task.left,task.right);
return `<div class="task-card">
<p class="task-kicker">Два числа — одна проверка</p>
<h2>${task.prompt}</h2>
<div class="pair-grid">
<section class="number-panel">
<div class="pair-number">${task.left}</div>
<div class="detector-row compact">${detectorButtons(state.taskState.leftDivisors,'left-divisor')}</div>
</section>
<section class="number-panel">
<div class="pair-number">${task.right}</div>
<div class="detector-row compact">${detectorButtons(state.taskState.rightDivisors,'right-divisor')}</div>
</section>
</div>
${state.taskState.complete ? `<div class="intersection-card"><span>Оба числа делятся на</span><strong>${intersection.length ? intersection.join(', ') : 'ни на одно из изученных чисел'}</strong></div>` : ''}
${feedbackMarkup()}
${state.taskState.complete ? `<button class="btn btn-primary" type="button" data-next>Дальше</button>` : `<button class="btn btn-primary" type="button" data-check>Проверить</button>`}
</div>`;
}
function fractionMarkup(numerator, denominator, className = '') {
return `<span class="fraction ${className}"><span>${numerator}</span><span>${denominator}</span></span>`;
}
function renderFractionTask(task) {
if (task.type === 'fraction-error') {
return `<div class="task-card fraction-task">
<p class="task-kicker">Найди ошибку</p>
<h2>${task.prompt}</h2>
<div class="fraction-error-line">
${fractionMarkup(task.numerator,task.denominator,'fraction-large')}
<span class="step-arrow">÷ ${task.shownDivisor}</span>
</div>
<p class="question">Ученик решил сократить дробь на ${task.shownDivisor}. Верно ли это?</p>
<div class="reason-list">
<button type="button" class="reason-button ${state.taskState.fractionDiagnosis === 'invalid-divisor' ? 'is-selected' : ''}" data-fraction-diagnosis="invalid-divisor">Есть ошибка: на ${task.shownDivisor} сокращать нельзя</button>
<button type="button" class="reason-button ${state.taskState.fractionDiagnosis === 'all-correct' ? 'is-selected' : ''}" data-fraction-diagnosis="all-correct">Шаг выполнен верно</button>
</div>
${feedbackMarkup()}
${state.taskState.complete ? `<button class="btn btn-primary" type="button" data-next>Дальше</button>` : `<button class="btn btn-primary" type="button" data-check ${state.taskState.fractionDiagnosis ? '' : 'disabled'}>Проверить</button>`}
</div>`;
}
const current = state.taskState.fractionCurrent ?? {numerator:task.numerator,denominator:task.denominator};
const history = state.taskState.fractionHistory ?? [{numerator:task.numerator,denominator:task.denominator,divisor:null}];
const available = availableReductionDivisors(current.numerator,current.denominator);
return `<div class="task-card fraction-task">
<p class="task-kicker">Сокращение по шагам</p>
<h2>${task.prompt}</h2>
<div class="fraction-history" aria-label="Ход сокращения">
${history.map((item,index) => `${index ? `<span class="step-arrow">÷ ${item.divisor} →</span>` : ''}${fractionMarkup(item.numerator,item.denominator,index === history.length - 1 ? 'fraction-current' : '')}`).join('')}
</div>
${state.taskState.complete ? `<div class="feedback feedback-success">Дробь сокращена полностью. Получили ${current.numerator}/${current.denominator}.</div>` : `
<p class="question">${history.length > 1 ? 'Можно сократить ещё?' : 'На какое число можно сократить дробь?'}</p>
<div class="choice-row fraction-divisors">
${available.map(divisor => `<button type="button" class="detector-button" data-fraction-divisor="${divisor}">${divisor}</button>`).join('')}
${available.length === 0 ? `<button type="button" class="choice-button" data-fraction-none>Нет</button>` : ''}
</div>
${feedbackMarkup()}
`}
${state.taskState.complete ? `<button class="btn btn-primary" type="button" data-next>Дальше</button>` : ''}
</div>`;
}
function gcdHistoryMarkup() {
const rows = state.taskState.gcdRows ?? [];
const factors = state.taskState.gcdFactors ?? [];
return `<div class="gcd-history">${rows.map((row,index) => `
${index ? `<div class="gcd-divider">↓ ÷ ${factors[index - 1]}</div>` : ''}
<div class="gcd-row"><span>${row.left}</span><span>${row.right}</span></div>
`).join('')}</div>`;
}
function gcdScratchpadControls(task, isFraction) {
const rows = state.taskState.gcdRows ?? [];
const current = rows[rows.length - 1];
const phase = state.taskState.gcdPhase;
if (state.taskState.complete) {
return `${feedbackMarkup()}<button class="btn btn-primary" type="button" data-next>Дальше</button>`;
}
if (phase === 'choose-divisor') {
return `<div class="gcd-controls">
<p class="question">На какое число делятся оба текущих числа?</p>
<div class="choice-row gcd-divisors">
${[2,3,5,7].map(value => `<button type="button" class="detector-button" data-gcd-divisor="${value}">${value}</button>`).join('')}
</div>
<button type="button" class="choice-button no-more-button" data-gcd-none>Общих больше нет</button>
${feedbackMarkup()}
</div>`;
}
if (phase === 'quotients') {
const divisor = state.taskState.pendingDivisor;
const status = state.taskState.gcdFieldStatus ?? {};
const leftClass = status.left === true ? 'is-correct' : status.left === false ? 'is-wrong' : '';
const rightClass = status.right === true ? 'is-correct' : status.right === false ? 'is-wrong' : '';
return `<div class="gcd-controls">
<p class="question">Вычисли оба частных</p>
<div class="quotient-grid">
<label>${current.left} : ${divisor} = <input class="math-input ${leftClass}" inputmode="numeric" data-gcd-left value="${state.taskState.gcdDraft.left}" ${status.left === true ? 'readonly' : ''}></label>
<label>${current.right} : ${divisor} = <input class="math-input ${rightClass}" inputmode="numeric" data-gcd-right value="${state.taskState.gcdDraft.right}" ${status.right === true ? 'readonly' : ''}></label>
</div>
${feedbackMarkup()}
<button type="button" class="btn btn-primary" data-gcd-check-quotients>Проверить вычисления</button>
</div>`;
}
if (phase === 'final-gcd') {
const factors = state.taskState.gcdFactors ?? [];
const productText = factors.length ? factors.join(' · ') : '1';
const originalLeft = isFraction ? task.numerator : task.left;
const originalRight = isFraction ? task.denominator : task.right;
return `<div class="gcd-controls final-gcd-card">
<p>Общие множители: <strong>${productText}</strong></p>
<label class="final-gcd-input">НОД(${originalLeft}, ${originalRight}) = <input class="math-input" inputmode="numeric" data-gcd-final value="${state.taskState.gcdValue}"></label>
${feedbackMarkup()}
<button type="button" class="btn btn-primary" data-gcd-check-final>Проверить НОД</button>
</div>`;
}
if (phase === 'reduce' && isFraction) {
const g = state.taskState.gcdComputed;
const status = state.taskState.reducedStatus ?? {};
return `<div class="gcd-controls gcd-reduce-stage">
<div class="gcd-summary">НОД(${task.numerator}, ${task.denominator}) = <strong>${g}</strong></div>
<p class="question">Теперь сократи дробь за один шаг</p>
<div class="quotient-grid">
<label>${task.numerator} : ${g} = <input class="math-input ${status.left === true ? 'is-correct' : status.left === false ? 'is-wrong' : ''}" inputmode="numeric" data-reduced-numerator value="${state.taskState.reducedDraft.numerator}" ${status.left === true ? 'readonly' : ''}></label>
<label>${task.denominator} : ${g} = <input class="math-input ${status.right === true ? 'is-correct' : status.right === false ? 'is-wrong' : ''}" inputmode="numeric" data-reduced-denominator value="${state.taskState.reducedDraft.denominator}" ${status.right === true ? 'readonly' : ''}></label>
</div>
${feedbackMarkup()}
<button type="button" class="btn btn-primary" data-reduced-check>Проверить дробь</button>
</div>`;
}
return '';
}
function renderGcdTask(task) {
if (task.type === 'gcd-error') {
return `<div class="task-card gcd-task">
<p class="task-kicker">Найди ошибку</p>
<h2>${task.prompt}</h2>
<div class="worked-solution">
<p>Ученик написал: <strong>НОД(${task.left}, ${task.right}) = ${task.claimedGcd}</strong></p>
<p>${fractionMarkup(task.left,task.right)} → ÷ ${task.claimedGcd} → ${fractionMarkup(task.reduced.numerator,task.reduced.denominator)}</p>
</div>
<div class="reason-list">
<button class="reason-button ${state.taskState.gcdDiagnosis === 'all-correct' ? 'is-selected' : ''}" data-gcd-diagnosis="all-correct">Всё сделано правильно</button>
<button class="reason-button ${state.taskState.gcdDiagnosis === 'invalid-reduction' ? 'is-selected' : ''}" data-gcd-diagnosis="invalid-reduction">Само сокращение выполнено неверно</button>
<button class="reason-button ${state.taskState.gcdDiagnosis === 'valid-reduction-wrong-gcd' ? 'is-selected' : ''}" data-gcd-diagnosis="valid-reduction-wrong-gcd">Сокращение верное, но указан не НОД</button>
</div>
${feedbackMarkup()}
${state.taskState.complete ? `<button class="btn btn-primary" type="button" data-next>Дальше</button>` : `<button class="btn btn-primary" type="button" data-check ${state.taskState.gcdDiagnosis ? '' : 'disabled'}>Проверить</button>`}
</div>`;
}
return `<div class="task-card gcd-task">
<p class="task-kicker">Виртуальный черновик</p>
<h2>НОД(${task.left}, ${task.right})</h2>
${gcdHistoryMarkup()}
${gcdScratchpadControls(task,false)}
</div>`;
}
function renderGcdFractionTask(task) {
return `<div class="task-card gcd-task">
<p class="task-kicker">Сокращение через НОД</p>
<h2>${task.prompt}</h2>
<div class="gcd-source-fraction">${fractionMarkup(task.numerator,task.denominator,'fraction-large')}</div>
${state.taskState.gcdPhase === 'reduce' ? '' : gcdHistoryMarkup()}
${gcdScratchpadControls(task,true)}
</div>`;
}
function analysisMarkup(number, expected) {
const last = String(number).slice(-1);
const sum = digitSum(number);
const lastRules = expected.filter(value => [2,5,10].includes(value));
const sumRules = expected.filter(value => [3,9].includes(value));
return `<div class="analysis-grid">
<article><span>Последняя цифра</span><strong>${last}</strong><p>${lastRules.length ? `Подходят: ${lastRules.join(', ')}` : '2, 5 и 10 не подходят'}</p></article>
<article><span>Сумма цифр</span><strong>${String(number).split('').join(' + ')} = ${sum}</strong><p>${sumRules.length ? `Подходят: ${sumRules.join(', ')}` : '3 и 9 не подходят'}</p></article>
</div>`;
}
function feedbackMarkup() {
const feedback = state.taskState.feedback;
if (!feedback) return '';
return `<div class="feedback ${feedback.kind === 'solution' ? 'feedback-solution' : feedback.kind === 'success' ? 'feedback-success' : 'feedback-hint'}">${feedback.text}</div>`;
}
function placeholderTask(task) {
return `<div class="task-card"><h2>${task.prompt}</h2><p class="task-note">Этот тип задания подключается на следующем этапе реализации.</p></div>`;
}
function taskContent(task) {
if (task.type === 'learn') return renderLearningTask(task);
if (task.type === 'yes-no-reason') return renderYesNoTask(task);
if (task.type === 'detector' || task.type === 'detector-error') return renderDetectorTask(task);
if (task.type === 'pair') return renderPairTask(task);
if (task.type === 'fraction-step' || task.type === 'fraction-error') return renderFractionTask(task);
if (task.type === 'gcd' || task.type === 'gcd-error') return renderGcdTask(task);
if (task.type === 'fraction-gcd') return renderGcdFractionTask(task);
return placeholderTask(task);
}
function renderTaskShell() {
const block = blockFor(state.grade,state.blockId);
const tasks = currentTasks();
const task = currentTask();
if (!task) {
setState({screen:'routes',blockId:null});
return;
}
app.innerHTML = `<section class="screen">
${taskTopbar(block,tasks)}
<div class="panel">
${rulePanel(task)}
${taskContent(task)}
</div>
</section>`;
bindTaskHandlers(task);
}
function bindTaskHandlers(task) {
app.querySelector('[data-routes]')?.addEventListener('click', () => setState({screen:'routes',blockId:null,taskIndex:0,records:[],taskQueue:null,taskState:{}}));
app.querySelector('[data-rule]')?.addEventListener('click', () => {
let record = state.taskState.record;
if (!task.learningOnly && record) record = markRuleUsed(record);
state.taskState = {...state.taskState,ruleOpen:!state.taskState.ruleOpen,record};
render();
});
app.querySelector('[data-next]')?.addEventListener('click', nextTask);
if (task.type === 'learn') bindLearningHandlers(task);
if (task.type === 'yes-no-reason') bindYesNoHandlers(task);
if (task.type === 'detector' || task.type === 'detector-error') bindDetectorHandlers(task);
if (task.type === 'pair') bindPairHandlers(task);
if (task.type === 'fraction-step' || task.type === 'fraction-error') bindFractionHandlers(task);
if (task.type === 'gcd' || task.type === 'gcd-error' || task.type === 'fraction-gcd') bindGcdHandlers(task);
}
function bindLearningHandlers(task) {
app.querySelectorAll('[data-learn-strategy]').forEach(button => button.addEventListener('click', () => {
const choice = button.dataset.learnStrategy;
const correct = choice === RULES[task.divisor].strategy;
state.taskState = {...state.taskState,learningChoice:choice,learningRevealed:correct};
render();
}));
app.querySelectorAll('[data-learn-number]').forEach(button => button.addEventListener('click', () => {
const choice = button.dataset.learnNumber;
const expected = task.divisor === 10 ? '730' : '126';
state.taskState = {...state.taskState,learningChoice:choice,learningRevealed:choice === expected};
render();
}));
if (task.stage === 'check') bindDetectorHandlers({...task,type:'detector',learningOnly:true});
}
function bindYesNoHandlers(task) {
app.querySelectorAll('[data-yes]').forEach(button => button.addEventListener('click', () => {
state.taskState = {...state.taskState,yes:button.dataset.yes === 'true',feedback:null};
render();
}));
app.querySelectorAll('[data-reason]').forEach(button => button.addEventListener('click', () => {
state.taskState = {...state.taskState,reasonId:button.dataset.reason,feedback:null};
render();
}));
app.querySelector('[data-check]')?.addEventListener('click', () => submitTraining(task,{yes:state.taskState.yes,reasonId:state.taskState.reasonId}));
}
function toggle(list,value) {
return list.includes(value) ? list.filter(item => item !== value) : [...list,value];
}
function bindDetectorHandlers(task) {
app.querySelectorAll('[data-divisor]').forEach(button => button.addEventListener('click', () => {
const divisor = Number(button.dataset.divisor);
state.taskState = {...state.taskState,divisors:toggle(state.taskState.divisors ?? [],divisor),feedback:null};
render();
}));
app.querySelector('[data-check]')?.addEventListener('click', () => {
if (task.learningOnly) {
const result = validateTask({type:'detector',number:task.number},{divisors:state.taskState.divisors});
state.taskState = result.ok
? {...state.taskState,complete:true,feedback:{kind:'success',text:'Верно. Все подходящие признаки найдены.'}}
: {...state.taskState,feedback:{kind:'hint',text:'Проверь последнюю цифру и сумму цифр ещё раз.'}};
render();
return;
}
submitTraining(task,{divisors:state.taskState.divisors});
});
}
function bindPairHandlers(task) {
app.querySelectorAll('[data-left-divisor]').forEach(button => button.addEventListener('click', () => {
const value = Number(button.dataset.leftDivisor);
state.taskState = {...state.taskState,leftDivisors:toggle(state.taskState.leftDivisors,value),feedback:null};
render();
}));
app.querySelectorAll('[data-right-divisor]').forEach(button => button.addEventListener('click', () => {
const value = Number(button.dataset.rightDivisor);
state.taskState = {...state.taskState,rightDivisors:toggle(state.taskState.rightDivisors,value),feedback:null};
render();
}));
app.querySelector('[data-check]')?.addEventListener('click', () => submitTraining(task,{left:state.taskState.leftDivisors,right:state.taskState.rightDivisors}));
}
function bindFractionHandlers(task) {
if (task.type === 'fraction-error') {
app.querySelectorAll('[data-fraction-diagnosis]').forEach(button => button.addEventListener('click', () => {
state.taskState = {...state.taskState,fractionDiagnosis:button.dataset.fractionDiagnosis,feedback:null};
render();
}));
app.querySelector('[data-check]')?.addEventListener('click', () => submitTraining(task,{diagnosis:state.taskState.fractionDiagnosis}));
return;
}
app.querySelectorAll('[data-fraction-divisor]').forEach(button => button.addEventListener('click', () => {
const divisor = Number(button.dataset.fractionDivisor);
const current = state.taskState.fractionCurrent;
const next = reduceFractionBy(current.numerator,current.denominator,divisor);
const history = [...state.taskState.fractionHistory,{...next,divisor}];
const canContinue = availableReductionDivisors(next.numerator,next.denominator).length > 0;
const fullyReduced = gcd(next.numerator,next.denominator) === 1;
let record = state.taskState.record;
let complete = false;
let feedback = null;
if (!canContinue && fullyReduced) {
record = registerAttempt(record,true);
complete = true;
feedback = {kind:'success',text:'Верно. Дробь сокращена до несократимого вида.'};
}
state.taskState = {...state.taskState,fractionCurrent:next,fractionHistory:history,record,complete,feedback};
render();
}));
app.querySelector('[data-fraction-none]')?.addEventListener('click', () => {
const current = state.taskState.fractionCurrent;
if (gcd(current.numerator,current.denominator) === 1) {
let record = registerAttempt(state.taskState.record,true);
state.taskState = {...state.taskState,record,complete:true,feedback:{kind:'success',text:'Верно. Дробь уже несократима.'}};
} else {
let record = registerAttempt(state.taskState.record,false,['fraction']);
record = markHintUsed(record,['fraction']);
state.taskState = {...state.taskState,record,feedback:{kind:'hint',text:'У числителя и знаменателя ещё есть общий делитель.'}};
}
render();
});
}
function noteGcdError(dynamicTask,result,fieldStatus = null) {
let record = registerAttempt(state.taskState.record,false,result.skillErrors);
record = markHintUsed(record,result.skillErrors);
const feedback = feedbackFor(dynamicTask,result,record.attempts);
state.taskState = {
...state.taskState,
record,
feedback,
...(fieldStatus ? {gcdFieldStatus:fieldStatus} : {}),
};
render();
}
function bindGcdHandlers(task) {
if (task.type === 'gcd-error') {
app.querySelectorAll('[data-gcd-diagnosis]').forEach(button => button.addEventListener('click', () => {
state.taskState = {...state.taskState,gcdDiagnosis:button.dataset.gcdDiagnosis,feedback:null};
render();
}));
app.querySelector('[data-check]')?.addEventListener('click', () => submitTraining(task,{diagnosis:state.taskState.gcdDiagnosis}));
return;
}
const isFraction = task.type === 'fraction-gcd';
const rows = state.taskState.gcdRows ?? [];
const current = rows[rows.length - 1];
app.querySelectorAll('[data-gcd-divisor]').forEach(button => button.addEventListener('click', () => {
const divisor = Number(button.dataset.gcdDivisor);
const dynamic = {type:'gcd',left:current.left,right:current.right,phase:'choose-divisor'};
const result = validateTask(dynamic,{divisor});
if (!result.ok) return noteGcdError(dynamic,result);
state.taskState = {...state.taskState,pendingDivisor:divisor,gcdPhase:'quotients',gcdDraft:{left:'',right:''},gcdFieldStatus:{left:null,right:null},feedback:null};
render();
}));
app.querySelector('[data-gcd-none]')?.addEventListener('click', () => {
const dynamic = {type:'gcd',left:current.left,right:current.right,phase:'choose-divisor'};
const result = validateTask(dynamic,{noMore:true});
if (!result.ok) return noteGcdError(dynamic,result);
state.taskState = {...state.taskState,gcdPhase:'final-gcd',feedback:null};
render();
});
const leftInput = app.querySelector('[data-gcd-left]');
const rightInput = app.querySelector('[data-gcd-right]');
leftInput?.addEventListener('input', event => { state.taskState.gcdDraft.left = event.target.value; });
rightInput?.addEventListener('input', event => { state.taskState.gcdDraft.right = event.target.value; });
app.querySelector('[data-gcd-check-quotients]')?.addEventListener('click', () => {
const divisor = state.taskState.pendingDivisor;
const dynamic = {type:'gcd',left:current.left,right:current.right,phase:'quotients',divisor};
const result = validateTask(dynamic,state.taskState.gcdDraft);
if (!result.ok) return noteGcdError(dynamic,result,{left:result.details.left,right:result.details.right});
const next = dividePairBy(current.left,current.right,divisor);
state.taskState = {
...state.taskState,
gcdRows:[...rows,{...next,divisor}],
gcdFactors:[...state.taskState.gcdFactors,divisor],
gcdPhase:'choose-divisor',pendingDivisor:null,gcdDraft:{left:'',right:''},gcdFieldStatus:{left:null,right:null},feedback:null,
};
render();
});
const finalInput = app.querySelector('[data-gcd-final]');
finalInput?.addEventListener('input', event => { state.taskState.gcdValue = event.target.value; });
app.querySelector('[data-gcd-check-final]')?.addEventListener('click', () => {
const originalLeft = isFraction ? task.numerator : task.left;
const originalRight = isFraction ? task.denominator : task.right;
const dynamic = {type:'gcd',left:originalLeft,right:originalRight,originalLeft,originalRight,phase:'final-gcd'};
const result = validateTask(dynamic,{gcd:state.taskState.gcdValue});
if (!result.ok) return noteGcdError(dynamic,result);
const computed = result.details.expected;
if (isFraction) {
if (computed === 1) {
const record = registerAttempt(state.taskState.record,true);
state.taskState = {...state.taskState,record,gcdComputed:1,complete:true,feedback:{kind:'success',text:'НОД = 1. Дробь уже несократима.'}};
} else {
state.taskState = {...state.taskState,gcdComputed:computed,gcdPhase:'reduce',feedback:{kind:'success',text:`НОД найден: ${computed}. Теперь сократи дробь.`}};
}
} else {
const record = registerAttempt(state.taskState.record,true);
state.taskState = {...state.taskState,record,gcdComputed:computed,complete:true,feedback:{kind:'success',text:`Верно. НОД = ${computed}.`}};
}
render();
});
const reducedNumerator = app.querySelector('[data-reduced-numerator]');
const reducedDenominator = app.querySelector('[data-reduced-denominator]');
reducedNumerator?.addEventListener('input', event => { state.taskState.reducedDraft.numerator = event.target.value; });
reducedDenominator?.addEventListener('input', event => { state.taskState.reducedDraft.denominator = event.target.value; });
app.querySelector('[data-reduced-check]')?.addEventListener('click', () => {
const dynamic = {...task,phase:'reduced-fraction'};
const result = validateTask(dynamic,state.taskState.reducedDraft);
if (!result.ok) {
let record = registerAttempt(state.taskState.record,false,result.skillErrors);
record = markHintUsed(record,result.skillErrors);
state.taskState = {...state.taskState,record,reducedStatus:{left:result.details.left,right:result.details.right},feedback:{kind:'hint',text:'НОД найден верно. Проверь только неверное деление при сокращении.'}};
render();
return;
}
const record = registerAttempt(state.taskState.record,true);
state.taskState = {...state.taskState,record,reducedStatus:{left:true,right:true},complete:true,feedback:{kind:'success',text:`Верно. Получилась дробь ${state.taskState.reducedDraft.numerator}/${state.taskState.reducedDraft.denominator}.`}};
render();
});
}
function submitTraining(task,response) {
if (state.taskState.complete) return;
const result = validateTask(task,response);
let record = state.taskState.record ?? createTaskRecord(task.id,task.skills ?? []);
record = registerAttempt(record,result.ok,result.skillErrors);
if (result.ok) {
state.taskState = {...state.taskState,record,complete:true,feedback:{kind:'success',text:'Верно! Решение принято.'}};
render();
return;
}
record = markHintUsed(record,result.skillErrors);
const attempt = record.attempts;
const feedback = feedbackFor(task,result,attempt);
state.taskState = {...state.taskState,record,feedback,complete:attempt >= 2};
render();
}
function nextTask() {
const task = currentTask();
const tasks = currentTasks();
const records = task && !task.learningOnly && state.taskState.record
? [...state.records,state.taskState.record]
: state.records;
const nextIndex = state.taskIndex + 1;
if (nextIndex >= tasks.length) {
finishBlock(records);
return;
}
const next = tasks[nextIndex];
setState({taskIndex:nextIndex,records,taskState:freshTaskState(next)});
}
function finishBlock(records) {
const block = blockFor(state.grade,state.blockId);
const key = storageKey(state.grade,state.blockId);
if (block?.learningOnly) {
globalThis.localStorage?.setItem(`${key}:completed`,'1');
} else {
const summary = summarize(records);
saveBlockBest(key,summary.percent);
}
setState({screen:'results',records,taskState:{}});
}
function skillLabel(skill) {
const labels = {
'2':'Признак 2','3':'Признак 3','5':'Признак 5','9':'Признак 9','10':'Признак 10',
'3/9':'Не путать 3 и 9','5/10':'Не путать 5 и 10',fraction:'Сокращение дробей',
'gcd-divisor':'Выбор общего делителя','gcd-arithmetic':'Вычисления в НОД','gcd-finish':'Завершение НОД'
};
return labels[skill] ?? skill;
}
function renderResults() {
const block = blockFor(state.grade,state.blockId);
if (block?.learningOnly) {
app.innerHTML = `<section class="screen"><div class="panel results-panel">
<p class="task-kicker">Обучение завершено</p>
<h1>Признаки изучены</h1>
<p class="subtitle">Теперь попробуй определять делимость без подсказок.</p>
<div class="results-actions"><button class="btn btn-primary" type="button" data-results-routes>К разделам</button></div>
</div></section>`;
app.querySelector('[data-results-routes]').addEventListener('click', () => setState({screen:'routes',blockId:null,taskIndex:0,records:[],taskQueue:null,taskState:{}}));
return;
}
const summary = summarize(state.records);
const skills = summarizeSkills(state.records);
const retry = weakSkillTasks(state.grade,state.blockId,skills);
app.innerHTML = `<section class="screen"><div class="panel results-panel">
<p class="task-kicker">Тренировка завершена</p>
<h1>${summary.mastered ? 'Навык освоен ✓' : 'Продолжи тренировку'}</h1>
<div class="score-circle"><strong>${summary.percent}%</strong><span>чистых решений</span></div>
<p class="results-main">Чисто решено: <strong>${summary.clean} из ${summary.total} — ${summary.percent}%.</strong></p>
<p class="task-note">Чистое решение — правильный ответ с первой попытки без открытия правила и подсказки.</p>
${skills.length ? `<div class="skill-results">${skills.map(item => `<div><span>${skillLabel(item.skill)}</span><strong>${item.percent}%</strong><em>${item.percent >= 80 ? 'уверенно' : 'повторить'}</em></div>`).join('')}</div>` : ''}
<div class="results-actions">
<button class="btn" type="button" data-results-routes>К разделам</button>
${retry.length ? `<button class="btn btn-primary" type="button" data-retry-weak>Потренировать слабые места</button>` : ''}
</div>
</div></section>`;
app.querySelector('[data-results-routes]').addEventListener('click', () => setState({screen:'routes',blockId:null,taskIndex:0,records:[],taskQueue:null,taskState:{}}));
app.querySelector('[data-retry-weak]')?.addEventListener('click', () => {
const queue = weakSkillTasks(state.grade,state.blockId,skills);
const first = queue[0] ?? null;
setState({screen:'task',taskIndex:0,records:[],taskQueue:queue,taskState:freshTaskState(first)});
});
}
function render() {
if (state.screen === 'home') return renderHome();
if (state.screen === 'routes') return renderRoutes();
if (state.screen === 'task') return renderTaskShell();
if (state.screen === 'results') return renderResults();
return renderHome();
}
render();