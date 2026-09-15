import fs from 'node:fs';

const appPath = 'math/grade-5-6/divisibility-detector/app.js';
const cssPath = 'math/grade-5-6/divisibility-detector/styles.css';

function replaceExact(source, before, after, label) {
  if (source.includes(after)) return source;
  if (!source.includes(before)) throw new Error(`Patch anchor not found: ${label}`);
  return source.replace(before, after);
}

let app = fs.readFileSync(appPath,'utf8');

app = replaceExact(app,
`taskQueue:null,\ntaskState:{},`,
`taskQueue:null,\npracticeCount:10,\ntaskState:{},`,
'state practiceCount');

app = replaceExact(app,
`app.querySelectorAll('[data-block]').forEach(button => button.addEventListener('click', () => startBlock(button.dataset.block)));\n}\nfunction startBlock(blockId) {\nconst task = tasksFor(state.grade,blockId)[0] ?? null;\nsetState({screen:'task',blockId,taskIndex:0,records:[],taskQueue:null,taskState:freshTaskState(task)});\n}`,
`app.querySelectorAll('[data-block]').forEach(button => button.addEventListener('click', () => {\nconst blockId = button.dataset.block;\nconst block = blockFor(state.grade,blockId);\nif (block?.learningOnly) {\nstartBlock(blockId);\nreturn;\n}\nsetState({screen:'practice-setup',blockId,practiceCount:10,taskIndex:0,records:[],taskQueue:null,taskState:{}});\n}));\n}\nfunction renderPracticeSetup() {\nconst block = blockFor(state.grade,state.blockId);\nconst options = [5,10,15,20];\napp.innerHTML = \\`\n<section class="screen">\n<div class="panel practice-setup">\n<span class="badge">\\${state.grade} класс</span>\n<p class="task-kicker">\\${block?.title ?? 'Тренировка'}</p>\n<h1>Сколько заданий?</h1>\n<p class="subtitle">Выбери длину тренировки. По умолчанию — 10 заданий.</p>\n<div class="practice-count-grid" role="group" aria-label="Количество заданий">\n\\${options.map(count => \\`<button type="button" class="practice-count-button \\${state.practiceCount === count ? 'is-selected' : ''}" aria-pressed="\\${state.practiceCount === count}" data-practice-count="\\${count}"><strong>\\${count}</strong><span>заданий</span></button>\\`).join('')}\n</div>\n<div class="practice-setup-actions">\n<button class="btn" type="button" data-setup-routes>← К разделам</button>\n<button class="btn btn-primary" type="button" data-start-practice>Начать тренировку</button>\n</div>\n</div>\n</section>\\`;\napp.querySelectorAll('[data-practice-count]').forEach(button => button.addEventListener('click', () => {\nstate.practiceCount = Number(button.dataset.practiceCount);\nrender();\n}));\napp.querySelector('[data-setup-routes]').addEventListener('click', () => setState({screen:'routes',blockId:null,taskQueue:null,taskState:{}}));\napp.querySelector('[data-start-practice]').addEventListener('click', () => startBlock(state.blockId));\n}\nfunction startBlock(blockId) {\nconst block = blockFor(state.grade,blockId);\nconst queue = block?.learningOnly\n? tasksFor(state.grade,blockId)\n: tasksFor(state.grade,blockId,{count:state.practiceCount});\nconst task = queue[0] ?? null;\nsetState({screen:'task',blockId,taskIndex:0,records:[],taskQueue:queue,taskState:freshTaskState(task)});\n}`,
'practice setup flow');

app = replaceExact(app,
`if (state.screen === 'routes') return renderRoutes();\nif (state.screen === 'task') return renderTaskShell();`,
`if (state.screen === 'routes') return renderRoutes();\nif (state.screen === 'practice-setup') return renderPracticeSetup();\nif (state.screen === 'task') return renderTaskShell();`,
'render practice setup');

fs.writeFileSync(appPath,app);

let css = fs.readFileSync(cssPath,'utf8');
css = replaceExact(css,
`body { margin: 0; min-width: 320px; background: var(--bg); color: var(--text); }`,
`body {\n  margin: 0;\n  min-width: 320px;\n  background-color: var(--bg);\n  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='260' viewBox='0 0 360 260'%3E%3Cg fill='%234f46e5' fill-opacity='.045' font-family='Arial,sans-serif' font-size='22' font-weight='700'%3E%3Ctext x='28' y='48'%3E%C3%B7%3C/text%3E%3Ctext x='174' y='70'%3E%C3%97%3C/text%3E%3Ctext x='294' y='44'%3E=%3C/text%3E%3Ctext x='62' y='168'%3E3/5%3C/text%3E%3Ctext x='218' y='188'%3E2 3 5 9 10%3C/text%3E%3C/g%3E%3Cg fill='none' stroke='%234f46e5' stroke-opacity='.035' stroke-width='2'%3E%3Ccircle cx='310' cy='145' r='20'/%3E%3Cpath d='M122 220h52M148 194v52'/%3E%3C/g%3E%3C/svg%3E");\n  background-size: 360px 260px;\n  background-attachment: fixed;\n  color: var(--text);\n}`,
'math background');

css = replaceExact(css,
`.route-status { margin-top: 16px; font-size: .9rem; font-weight: 800; color: var(--accent-strong); }`,
`.route-status { margin-top: 16px; font-size: .9rem; font-weight: 800; color: var(--accent-strong); }\n.practice-setup { max-width: 760px; margin: 0 auto; text-align: center; }\n.practice-setup h1 { margin-top: 12px; }\n.practice-count-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; max-width: 620px; margin: 28px auto; }\n.practice-count-button { min-height: 100px; border: 2px solid var(--line); border-radius: 20px; background: rgba(255,255,255,.92); color: var(--text); cursor: pointer; display: grid; place-content: center; gap: 3px; transition: transform .15s ease,border-color .15s ease,box-shadow .15s ease; }\n.practice-count-button:hover, .practice-count-button:focus-visible { transform: translateY(-2px); border-color: #9aa5ff; outline: none; }\n.practice-count-button.is-selected { border-color: var(--accent); background: var(--surface-soft); box-shadow: inset 0 0 0 1px var(--accent); color: var(--accent-strong); }\n.practice-count-button strong { font-size: 1.8rem; line-height: 1; }\n.practice-count-button span { color: var(--muted); font-size: .84rem; }\n.practice-setup-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }`,
'practice setup styles');

css = replaceExact(css,
`@media (max-width: 520px) { .skill-results > div { grid-template-columns: 1fr auto; } .skill-results em { grid-column: 1 / -1; } }`,
`@media (max-width: 520px) {\n  .skill-results > div { grid-template-columns: 1fr auto; }\n  .skill-results em { grid-column: 1 / -1; }\n  .practice-count-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }\n}`,
'practice setup mobile');

fs.writeFileSync(cssPath,css);
