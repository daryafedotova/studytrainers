import { ROUTES, blockFor, tasksFor } from './bank.js';
import { loadBlockBest } from './progress.js';

const app = document.querySelector('#app');

const state = {
  screen:'home',
  grade:null,
  blockId:null,
  taskIndex:0,
  records:[],
  taskState:{},
};

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function storageKey(grade, blockId) {
  return `divisibility-detector:${grade}:${blockId}`;
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
    button.addEventListener('click', () => setState({screen:'routes',grade:button.dataset.grade,blockId:null,taskIndex:0,records:[],taskState:{}}));
  });
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
            const best = block.learningOnly ? null : loadBlockBest(storageKey(state.grade,block.id));
            return `<button class="route-card" type="button" data-block="${block.id}">
              <h3>${block.title}</h3>
              <p>${routeDescription(state.grade,block.id)}</p>
              <div class="route-status">${block.learningOnly ? 'Обучающий блок' : best ? `Лучший результат: ${best}%` : 'Можно начать сразу'}</div>
            </button>`;
          }).join('')}
        </div>
      </div>
    </section>`;
  app.querySelector('[data-home]').addEventListener('click', () => setState({screen:'home',grade:null,blockId:null}));
  app.querySelectorAll('[data-block]').forEach(button => button.addEventListener('click', () => startBlock(button.dataset.block)));
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

function startBlock(blockId) {
  setState({screen:'task',blockId,taskIndex:0,records:[],taskState:{}});
}

function renderTaskShell() {
  const block = blockFor(state.grade,state.blockId);
  const tasks = tasksFor(state.grade,state.blockId);
  const task = tasks[state.taskIndex];
  app.innerHTML = `
    <section class="screen">
      <div class="topbar">
        <button type="button" data-routes>← Разделы</button>
        <div class="topbar-title">
          <strong>${block?.title ?? 'Тренировка'}</strong>
          <small>${tasks.length ? `${state.taskIndex + 1} / ${tasks.length}` : ''}</small>
        </div>
        <button type="button" class="rule-btn" data-rule>? Правило</button>
      </div>
      <div class="panel">
        <div class="task-placeholder">
          <div>
            <h2>${task?.prompt ?? 'Задания появятся здесь'}</h2>
            <p>Экран задания подключается на следующем этапе.</p>
          </div>
        </div>
      </div>
    </section>`;
  app.querySelector('[data-routes]').addEventListener('click', () => setState({screen:'routes',blockId:null,taskIndex:0,records:[],taskState:{}}));
}

function render() {
  if (state.screen === 'home') return renderHome();
  if (state.screen === 'routes') return renderRoutes();
  if (state.screen === 'task') return renderTaskShell();
  return renderHome();
}

render();
