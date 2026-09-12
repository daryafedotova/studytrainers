import { validateLevel1Answer, validateLevel2Answer, validateBonusPath, cleanCount, pickLevel1Set } from './logic.js';
import { ANSWER_OPTIONS, LEVEL1_TASKS, LEVEL2_TASKS, BONUS_TASKS } from './data.js';

const $=id=>document.getElementById(id);
const el={
  intro:$('intro-screen'),level1:$('level1-screen'),level2:$('level2-screen'),bonus:$('bonus-screen'),gate:$('gate-screen'),result:$('result-screen'),
  start:$('start-btn'),restart:$('restart-btn'),stage:$('stage-pill'),progress:$('progress-pill'),rule:$('rule-btn'),ruleModal:$('rule-modal'),ruleClose:$('rule-close'),
  l1Number:$('l1-number'),l1Context:$('l1-context'),l1Graph:$('l1-graph'),l1Passport:$('l1-passport'),l1Feedback:$('l1-feedback'),l1HintBox:$('l1-hint-box'),l1Hint:$('l1-hint'),l1Check:$('l1-check'),l1Next:$('l1-next'),l1Side:$('level1-side-progress'),
  l2Number:$('l2-number'),l2Question:$('l2-question'),l2Graph:$('l2-graph'),l2Answer:$('l2-answer'),l2Feedback:$('l2-feedback'),l2HintBox:$('l2-hint-box'),l2Hint:$('l2-hint'),l2Check:$('l2-check'),l2Next:$('l2-next'),
  bonusNumber:$('bonus-number'),bonusTitle:$('bonus-title'),bonusText:$('bonus-text'),bonusGraph:$('bonus-graph'),bonusFeedback:$('bonus-feedback'),bonusHintBox:$('bonus-hint-box'),bonusHint:$('bonus-hint'),bonusCheck:$('bonus-check'),bonusNext:$('bonus-next'),bonusUndo:$('bonus-undo'),bonusClear:$('bonus-clear'),
  gateTitle:$('gate-title'),gateText:$('gate-text'),gateScore:$('gate-score'),gateRetry:$('gate-retry'),gateContinue:$('gate-continue'),finalText:$('final-text'),skillGrid:$('skill-grid')
};

const state={
  l1:{tasks:pickLevel1Set(LEVEL1_TASKS),index:0,records:[],attempts:0,hintUsed:false,selections:{},firstDetails:null,solved:false},
  l2:{tasks:[...LEVEL2_TASKS],index:0,records:[],attempts:0,hintUsed:false,answer:null,firstOk:false,solved:false},
  bonus:{index:0,records:[],points:[],hintIndex:0,solved:false},
  gateMode:null
};

function shuffle(a){
  const copy=[...a];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
function screen(target){[el.intro,el.level1,el.level2,el.bonus,el.gate,el.result].forEach(x=>x.classList.remove('active'));target.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
function setStatus(stage,done,total){el.stage.textContent=stage;el.progress.textContent=`${done} / ${total}`;}
function fmt(n){return String(n).replace('.',',');}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

function paddedRange(points){
  let min=Math.min(...points.map(p=>p.y)),max=Math.max(...points.map(p=>p.y));
  const rawRange=Math.max(1,max-min);
  const needsFive=points.some(p=>Math.abs(p.y/10-Math.round(p.y/10))>1e-9);
  let step=needsFive?5:10;
  if(rawRange>220) step=20;
  min=Math.floor(min/step)*step;
  max=Math.ceil(max/step)*step;
  if(min===max){min-=step;max+=step;}
  return {min,max,step,labelStep:step*2};
}

function graphSvg(points,{highlightSegment=null,selectedSegment=null,clickable=false}={}){
  const W=760,H=430,m={l:86,r:34,t:50,b:66};
  const xs=points.map(p=>p.x),minX=Math.min(...xs),maxX=Math.max(...xs),yr=paddedRange(points);
  const sx=x=>m.l+(x-minX)/(maxX-minX||1)*(W-m.l-m.r);
  const sy=y=>H-m.b-(y-yr.min)/(yr.max-yr.min)*(H-m.t-m.b);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="График зависимости температуры от времени">`;
  for(let y=yr.min;y<=yr.max+1e-9;y+=yr.step){
    const yy=sy(y),major=Math.abs(y/yr.labelStep-Math.round(y/yr.labelStep))<1e-9;
    s+=`<line class="graph-grid" x1="${m.l}" y1="${yy}" x2="${W-m.r}" y2="${yy}"/>`;
    if(major||Math.abs(y-yr.min)<1e-9||Math.abs(y-yr.max)<1e-9) s+=`<text class="graph-tick" x="${m.l-12}" y="${yy+5}" text-anchor="end">${fmt(y)}</text>`;
  }
  for(const x of [...new Set(points.map(p=>p.x))]){
    const xx=sx(x);
    s+=`<line class="graph-grid" x1="${xx}" y1="${m.t}" x2="${xx}" y2="${H-m.b}"/>`;
  }
  s+=`<line class="graph-axis" x1="${m.l}" y1="${m.t}" x2="${m.l}" y2="${H-m.b+8}"/>`;
  s+=`<line class="graph-axis" x1="${m.l-8}" y1="${H-m.b}" x2="${W-m.r}" y2="${H-m.b}"/>`;
  s+=`<text class="graph-axis-label" x="18" y="32">T, °C</text>`;
  s+=`<text class="graph-axis-label" x="${W-32}" y="${H-18}" text-anchor="end">t, время</text>`;
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1],cls=['graph-segment'];
    if(i===highlightSegment) cls.push('highlight');
    if(i===selectedSegment) cls.push('selected');
    const label=a.label&&b.label?`Участок ${a.label}${b.label}`:`Участок ${i+1}`;
    s+=`<line class="${cls.join(' ')}" x1="${sx(a.x)}" y1="${sy(a.y)}" x2="${sx(b.x)}" y2="${sy(b.y)}"/>`;
    if(clickable) s+=`<line class="graph-hit" data-segment="${i}" tabindex="0" role="button" aria-label="${label}" x1="${sx(a.x)}" y1="${sy(a.y)}" x2="${sx(b.x)}" y2="${sy(b.y)}"/>`;
  }
  for(const pt of points){
    const x=sx(pt.x),y=sy(pt.y);
    s+=`<circle class="graph-point" cx="${x}" cy="${y}" r="5"/>`;
    if(pt.label) s+=`<text class="graph-label" x="${x+9}" y="${y-10}">${esc(pt.label)}</text>`;
  }
  return s+'</svg>';
}

function bindSegmentClicks(container,onSelect){
  container.querySelectorAll('[data-segment]').forEach(line=>{
    const choose=()=>onSelect(Number(line.dataset.segment));
    line.addEventListener('click',choose);
    line.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
  });
}

function choiceButtons(options,value,key,multi=false){
  return `<div class="choice-grid">${options.map(([v,label])=>{
    const selected=multi?Array.isArray(value)&&value.includes(v):value===v;
    return `<button type="button" class="choice-btn${selected?' selected':''}" data-choice-key="${key}" data-choice-value="${v}" aria-pressed="${selected}">${selected?'✓ ':''}${esc(label)}</button>`;
  }).join('')}</div>`;
}

function selectField(label,options,key){
  return `<div class="passport-group"><strong>${esc(label)}</strong><select class="answer-select" data-select-key="${key}" aria-label="${esc(label)}"><option value="">Выберите ответ</option>${options.map(([value,text])=>`<option value="${value}">${esc(text)}</option>`).join('')}</select></div>`;
}

function renderL1(){
  const s=state.l1,t=s.tasks[s.index];
  s.attempts=0;s.hintUsed=false;s.selections={};s.firstDetails=null;s.solved=false;
  screen(el.level1);setStatus('Уровень 1',s.index,10);
  el.l1Number.textContent=`Задание ${s.index+1} из 10`;
  el.l1Context.textContent=t.context;
  el.l1Graph.innerHTML=graphSvg(t.points,{highlightSegment:t.highlightSegment});
  el.l1Feedback.className='message info';
  el.l1Feedback.textContent='Опиши выделенный участок, отвечая на вопросы справа.';
  el.l1HintBox.hidden=true;el.l1HintBox.textContent='';el.l1Next.disabled=true;

  if(t.kind==='slope'){
    el.l1Passport.innerHTML=[
      selectField('Что происходит?',ANSWER_OPTIONS.action,'action'),
      selectField('Агрегатное состояние вещества',ANSWER_OPTIONS.phaseState,'phaseState'),
      selectField('Как изменяется температура?',ANSWER_OPTIONS.tempChange.filter(([v])=>v!=='constant'),'tempChange'),
      selectField('Как изменяется внутренняя энергия?',ANSWER_OPTIONS.energy,'energy')
    ].join('');
  }else{
    el.l1Passport.innerHTML=[
      selectField('Какой процесс происходит?',ANSWER_OPTIONS.process,'process'),
      selectField('Какой переход происходит?',ANSWER_OPTIONS.transition,'transition'),
      selectField('Какие фазы существуют одновременно?',ANSWER_OPTIONS.state,'state'),
      `<div class="passport-group"><strong>Температура фазового перехода</strong><div class="number-row"><input id="l1-temperature" inputmode="decimal" aria-label="Температура фазового перехода" placeholder="Введите число"><span>°C</span></div></div>`,
      selectField('Как изменяется температура?',ANSWER_OPTIONS.tempChange,'tempChange'),
      selectField('Как изменяется внутренняя энергия?',ANSWER_OPTIONS.energy,'energy')
    ].join('');
  }
  el.l1Passport.querySelectorAll('[data-select-key]').forEach(select=>select.addEventListener('change',()=>{s.selections[select.dataset.selectKey]=select.value;}));
  updateL1Side();
}

function updateL1Side(){
  const s=state.l1;
  el.l1Side.innerHTML=`<div class="side-stat"><b>Выполнено</b><span>${s.records.length}/10</span></div><div class="side-stat"><b>Самостоятельно</b><span>${cleanCount(s.records)}/10</span></div><div class="side-stat"><b>Порог</b><span>8/10</span></div>`;
}

function checkL1(){
  const s=state.l1;if(s.solved)return;
  const t=s.tasks[s.index];s.attempts++;
  const answer={...s.selections};
  if(t.kind==='phase') answer.temperature=$('l1-temperature')?.value ?? '';
  const result=validateLevel1Answer(t,answer);
  if(s.attempts===1) s.firstDetails={...result.details};
  if(!result.ok){
    const names={action:'что происходит',phaseState:'агрегатное состояние',process:'процесс',transition:'направление перехода',state:'две фазы',temperature:'температуру перехода',tempChange:'изменение температуры',energy:'изменение внутренней энергии'};
    const wrong=Object.entries(result.details).filter(([,ok])=>!ok).map(([k])=>names[k]);
    el.l1Feedback.className='message bad';
    el.l1Feedback.textContent=`Проверь: ${wrong.join(', ')}.`;
    return;
  }
  s.solved=true;
  const clean=s.attempts===1&&!s.hintUsed;
  s.records.push({clean,details:s.firstDetails??result.details,kind:t.kind,category:t.category});
  el.l1Feedback.className='message ok';
  el.l1Feedback.textContent=clean?'Верно. Решено самостоятельно с первой попытки.':'Верно. Выделенный участок описан правильно.';
  el.l1Next.disabled=false;updateL1Side();setStatus('Уровень 1',s.records.length,10);
}
function nextL1(){const s=state.l1;if(!s.solved)return;if(s.index<9){s.index++;renderL1();}else showGate('l1');}
function hintL1(){const s=state.l1;s.hintUsed=true;el.l1HintBox.hidden=false;el.l1HintBox.innerHTML=`<b>Подсказка:</b> ${esc(s.tasks[s.index].hint)}`;}

function renderL2(){
  const s=state.l2,t=s.tasks[s.index];
  s.attempts=0;s.hintUsed=false;s.answer=t.answerType==='multiChoice'?[]:null;s.firstOk=false;s.solved=false;
  screen(el.level2);setStatus('Уровень 2',s.index,10);
  el.l2Number.textContent=`Задание ${s.index+1} из 10`;el.l2Question.textContent=t.question;
  el.l2Feedback.className='message info';el.l2Feedback.textContent='Изучи график и выбери ответ.';el.l2HintBox.hidden=true;el.l2Next.disabled=true;
  renderL2Graph();renderL2Answer();
}
function renderL2Graph(){
  const s=state.l2,t=s.tasks[s.index];
  el.l2Graph.innerHTML=graphSvg(t.points,{selectedSegment:t.answerType==='segment'?s.answer:null,clickable:t.answerType==='segment'});
  if(t.answerType==='segment') bindSegmentClicks(el.l2Graph,i=>{s.answer=i;renderL2Graph();});
}
function renderL2Answer(){
  const s=state.l2,t=s.tasks[s.index];
  if(t.answerType==='segment'){
    el.l2Answer.innerHTML='<div class="passport-group"><strong>Ответ</strong><p>Нажми прямо на нужный участок графика. Выбранный участок станет фиолетовым.</p></div>';
    return;
  }
  if(t.answerType==='number'){
    el.l2Answer.innerHTML='<div class="passport-group"><strong>Температура</strong><div class="number-row"><input id="l2-number-input" inputmode="decimal" aria-label="Числовой ответ" placeholder="Введите число"><span>°C</span></div></div>';
    return;
  }
  const multi=t.answerType==='multiChoice';
  el.l2Answer.innerHTML=`<div class="passport-group"><strong>${multi?'Можно выбрать несколько вариантов':'Выбери один вариант'}</strong>${choiceButtons(t.options,s.answer,'l2',multi)}</div>`;
  el.l2Answer.querySelectorAll('[data-choice-value]').forEach(btn=>btn.addEventListener('click',()=>{
    const v=btn.dataset.choiceValue;
    if(multi) s.answer=s.answer.includes(v)?s.answer.filter(x=>x!==v):[...s.answer,v];
    else s.answer=v;
    renderL2Answer();
  }));
}
function currentL2Answer(){const t=state.l2.tasks[state.l2.index];return t.answerType==='number'?$('l2-number-input').value:state.l2.answer;}
function checkL2(){
  const s=state.l2;if(s.solved)return;
  const t=s.tasks[s.index];s.attempts++;
  const result=validateLevel2Answer(t,currentL2Answer());if(s.attempts===1)s.firstOk=result.ok;
  if(!result.ok){el.l2Feedback.className='message bad';el.l2Feedback.textContent=t.answerType==='segment'?'Этот участок не подходит. Сопоставь его форму и положение с процессом.':'Ответ пока неверный. Используй физический смысл участка графика.';return;}
  s.solved=true;const clean=s.attempts===1&&!s.hintUsed;
  s.records.push({clean,type:t.answerType,id:t.id,focus:t.focus,firstOk:s.firstOk});
  el.l2Feedback.className='message ok';el.l2Feedback.textContent=clean?'Верно. С первой попытки и без подсказки.':'Верно.';el.l2Next.disabled=false;setStatus('Уровень 2',s.records.length,10);
}
function nextL2(){const s=state.l2;if(!s.solved)return;if(s.index<9){s.index++;renderL2();}else showGate('l2');}
function hintL2(){const s=state.l2;s.hintUsed=true;el.l2HintBox.hidden=false;el.l2HintBox.innerHTML=`<b>Подсказка:</b> ${esc(s.tasks[s.index].hint)}`;}

function showGate(mode){
  state.gateMode=mode;screen(el.gate);
  const records=mode==='l1'?state.l1.records:state.l2.records,score=cleanCount(records),pass=score>=8;
  el.gateScore.textContent=`${score}/10`;
  el.gateTitle.textContent=pass?'Уровень пройден':'Нужно ещё немного практики';
  el.gateText.textContent=pass
    ?(mode==='l1'?'Ты уверенно читаешь разные участки графика. Переходим к задачам по полным графикам.':'Ты уверенно работаешь с полными графиками. Открыт бонусный конструктор.')
    :'Для перехода дальше нужно 8 самостоятельных решений с первой попытки. Повтори уровень — задания изменятся.';
  el.gateContinue.disabled=!pass;el.gateContinue.hidden=!pass;el.gateRetry.hidden=pass;setStatus('Результат',10,10);
}
function retryGate(){
  if(state.gateMode==='l1'){
    state.l1.tasks=pickLevel1Set(LEVEL1_TASKS);state.l1.index=0;state.l1.records=[];renderL1();
  }else{
    state.l2.tasks=shuffle(LEVEL2_TASKS);state.l2.index=0;state.l2.records=[];renderL2();
  }
}
function continueGate(){
  if(state.gateMode==='l1'){
    state.l2.tasks=shuffle(LEVEL2_TASKS);state.l2.index=0;state.l2.records=[];renderL2();
  }else{
    state.bonus.index=0;state.bonus.records=[];renderBonus();
  }
}

function bonusTicks(task){
  const vals=[];
  for(let v=task.minTemp;v<=task.maxTemp+1e-9;v+=task.step) vals.push(v);
  for(const v of task.expectedTemps) if(!vals.some(x=>Math.abs(x-v)<1e-9)) vals.push(v);
  return vals.sort((a,b)=>a-b);
}
function renderBonus(){
  const s=state.bonus,t=BONUS_TASKS[s.index];s.points=[];s.hintIndex=0;s.solved=false;
  screen(el.bonus);setStatus('★ Бонус',s.index,6);el.bonusNumber.textContent=`Бонус ${s.index+1} из 6`;el.bonusTitle.textContent=t.title;el.bonusText.textContent=t.text;
  el.bonusFeedback.className='message info';el.bonusFeedback.textContent='Выбирай по одному узлу в каждом следующем столбце.';el.bonusHintBox.hidden=true;el.bonusNext.disabled=true;renderBonusGraph();
}
function renderBonusGraph(){
  const s=state.bonus,t=BONUS_TASKS[s.index],W=820,H=530,m={l:88,r:34,t:48,b:66},cols=t.expectedTemps.length,ticks=bonusTicks(t),min=t.minTemp,max=t.maxTemp;
  const sx=i=>m.l+i/(cols-1)*(W-m.l-m.r),sy=y=>H-m.b-(y-min)/(max-min)*(H-m.t-m.b);
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Сетка для построения графика">`;
  const labelEvery=Math.max(1,Math.ceil(ticks.length/9));
  ticks.forEach((v,idx)=>{const y=sy(v);svg+=`<line class="graph-grid" x1="${m.l}" y1="${y}" x2="${W-m.r}" y2="${y}"/>`;if(idx%labelEvery===0||idx===ticks.length-1)svg+=`<text class="graph-tick" x="${m.l-10}" y="${y+5}" text-anchor="end">${fmt(v)}</text>`;});
  for(let i=0;i<cols;i++){const x=sx(i);svg+=`<line class="graph-grid" x1="${x}" y1="${m.t}" x2="${x}" y2="${H-m.b}"/>`;}
  svg+=`<line class="graph-axis" x1="${m.l}" y1="${m.t}" x2="${m.l}" y2="${H-m.b+8}"/><line class="graph-axis" x1="${m.l-8}" y1="${H-m.b}" x2="${W-m.r}" y2="${H-m.b}"/><text class="graph-axis-label" x="18" y="32">T, °C</text><text class="graph-axis-label" x="${W-32}" y="${H-18}" text-anchor="end">t, время</text>`;
  for(let i=0;i<s.points.length-1;i++) svg+=`<line class="builder-line" x1="${sx(i)}" y1="${sy(s.points[i].y)}" x2="${sx(i+1)}" y2="${sy(s.points[i+1].y)}"/>`;
  for(let i=0;i<cols;i++){
    for(const temp of ticks){
      const selected=s.points[i]&&Math.abs(s.points[i].y-temp)<1e-9,active=i===s.points.length,r=selected?7:active?6:4;
      svg+=`<circle class="builder-node${selected?' selected':''}" data-builder-col="${i}" data-builder-temp="${temp}" cx="${sx(i)}" cy="${sy(temp)}" r="${r}" ${active?'tabindex="0" role="button"':''} aria-label="Столбец ${i+1}, температура ${temp} градусов" style="${active?'':'opacity:.42'}"/>`;
    }
  }
  svg+='</svg>';el.bonusGraph.innerHTML=svg;
  el.bonusGraph.querySelectorAll(`[data-builder-col="${s.points.length}"]`).forEach(node=>{
    const choose=()=>{if(s.solved)return;const col=Number(node.dataset.builderCol),y=Number(node.dataset.builderTemp);s.points.push({x:col,y});renderBonusGraph();};
    node.addEventListener('click',choose);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
  });
}
function diagnoseBonus(task,points){
  if(points.length<task.expectedTemps.length) return 'График ещё не завершён: выбери точку в каждом столбце.';
  for(let i=0;i<points.length;i++){
    if(Math.abs(points[i].y-task.expectedTemps[i])>1e-9){
      if(i>0&&task.expectedTemps[i]===task.expectedTemps[i-1]) return 'На этом этапе должен быть горизонтальный участок. Проверь уровень температуры фазового перехода.';
      if(i>0){const exp=Math.sign(task.expectedTemps[i]-task.expectedTemps[i-1]),act=Math.sign(points[i].y-points[i-1].y);if(exp!==act)return 'Проверь направление графика: на этом этапе вещество нагревают или охлаждают?';}
      return 'Проверь температуру выбранной точки по условию.';
    }
  }
  return 'Проверь форму графика.';
}
function checkBonus(){const s=state.bonus;if(s.solved)return;const t=BONUS_TASKS[s.index],res=validateBonusPath(t,s.points);if(!res.ok){el.bonusFeedback.className='message bad';el.bonusFeedback.textContent=diagnoseBonus(t,s.points);return;}s.solved=true;s.records.push({correct:true,id:t.id});el.bonusFeedback.className='message ok';el.bonusFeedback.textContent='График построен правильно.';el.bonusNext.disabled=false;setStatus('★ Бонус',s.records.length,6);}
function nextBonus(){const s=state.bonus;if(!s.solved)return;if(s.index<BONUS_TASKS.length-1){s.index++;renderBonus();}else finish();}
function hintBonus(){const s=state.bonus,t=BONUS_TASKS[s.index],msg=t.hints[Math.min(s.hintIndex,t.hints.length-1)];s.hintIndex++;el.bonusHintBox.hidden=false;el.bonusHintBox.innerHTML=`<b>Подсказка:</b> ${esc(msg)}`;}
function undoBonus(){const s=state.bonus;if(s.solved)return;s.points.pop();renderBonusGraph();}
function clearBonus(){const s=state.bonus;if(s.solved)return;s.points=[];renderBonusGraph();}

function pct(n,d){return d?Math.round(n/d*100):0;}
function finish(){
  screen(el.result);setStatus('Итог',6,6);
  const l1=state.l1.records,l2=state.l2.records,b=state.bonus.records;
  const recognition=cleanCount(l1);
  const states=l1.filter(r=>r.details?.phaseState||r.details?.state).length;
  const phaseTasks=l1.filter(r=>r.kind==='phase');
  const tempL1=phaseTasks.filter(r=>r.details?.temperature).length;
  const numberL2=l2.filter(r=>r.type==='number');
  const tempL2=numberL2.filter(r=>r.firstOk).length;
  const interpretation=cleanCount(l2);
  const bonus=b.filter(r=>r.correct).length;
  const skills=[
    ['Распознавание участков',`${recognition}/10`,pct(recognition,10)],
    ['Агрегатные состояния',`${states}/10`,pct(states,10)],
    ['Чтение температуры',`${tempL1+tempL2}/${phaseTasks.length+numberL2.length}`,pct(tempL1+tempL2,phaseTasks.length+numberL2.length)],
    ['Задачи по графику',`${interpretation}/10`,pct(interpretation,10)],
    ['Построение графика',`${bonus}/6`,pct(bonus,6)]
  ];
  el.skillGrid.innerHTML=skills.map(([name,score,percent])=>`<div class="skill"><b>${name}</b><span>${score} · ${percent}%</span></div>`).join('');
  el.finalText.textContent=`Уровень 1: ${recognition}/10 самостоятельно. Уровень 2: ${interpretation}/10 самостоятельно. Бонус: ${bonus}/6 графиков построено правильно.`;
}

function restart(){
  state.l1={tasks:pickLevel1Set(LEVEL1_TASKS),index:0,records:[],attempts:0,hintUsed:false,selections:{},firstDetails:null,solved:false};
  state.l2={tasks:shuffle(LEVEL2_TASKS),index:0,records:[],attempts:0,hintUsed:false,answer:null,firstOk:false,solved:false};
  state.bonus={index:0,records:[],points:[],hintIndex:0,solved:false};
  renderL1();
}

function openRule(){el.ruleModal.hidden=false;document.body.classList.add('rule-open');el.ruleClose.focus();}
function closeRule(){el.ruleModal.hidden=true;document.body.classList.remove('rule-open');el.rule.focus();}

el.start.addEventListener('click',restart);el.restart.addEventListener('click',restart);
el.l1Hint.addEventListener('click',hintL1);el.l1Check.addEventListener('click',checkL1);el.l1Next.addEventListener('click',nextL1);
el.l2Hint.addEventListener('click',hintL2);el.l2Check.addEventListener('click',checkL2);el.l2Next.addEventListener('click',nextL2);
el.gateRetry.addEventListener('click',retryGate);el.gateContinue.addEventListener('click',continueGate);
el.bonusHint.addEventListener('click',hintBonus);el.bonusCheck.addEventListener('click',checkBonus);el.bonusNext.addEventListener('click',nextBonus);el.bonusUndo.addEventListener('click',undoBonus);el.bonusClear.addEventListener('click',clearBonus);
el.rule.addEventListener('click',openRule);el.ruleClose.addEventListener('click',closeRule);el.ruleModal.querySelectorAll('[data-rule-close]').forEach(x=>x.addEventListener('click',closeRule));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el.ruleModal.hidden)closeRule();});
setStatus('Старт',0,10);document.body.dataset.appReady='true';
