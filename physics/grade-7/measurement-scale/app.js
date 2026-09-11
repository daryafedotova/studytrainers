(() => {
  const STAGES = [
    {key:'learn', title:'Учимся', total:2},
    {key:'train', title:'Тренируемся', total:5},
    {key:'check', title:'Проверяю себя', total:10}
  ];
  const BANK = [
    ['ruler','Линейка','см','l',0,12,2,10,4.7],
    ['cylinder','Мензурка','мл','V',0,60,10,5,46],
    ['thermometer','Термометр','°C','t',-20,40,10,10,23],
    ['dynamometer','Динамометр','Н','F',0,5,1,5,3.4],
    ['speedometer','Спидометр','км/ч','v',0,120,20,4,70],
    ['barometer','Барометр','Па','p',98000,104000,2000,4,101500],
    ['ruler','Линейка','см','l',0,15,5,10,11.5],
    ['thermometer','Термометр','°C','t',0,50,10,5,28],
    ['dynamometer','Динамометр','Н','F',0,10,2,4,6.5],
    ['speedometer','Спидометр','км/ч','v',0,160,20,2,90],
    ['barometer','Барометр','Па','p',100000,104000,1000,5,102200],
    ['cylinder','Мензурка','мл','V',0,100,20,10,74],
    ['ruler','Линейка','см','l',0,10,2,4,6.5],
    ['thermometer','Термометр','°C','t',-10,30,10,4,17.5],
    ['dynamometer','Динамометр','Н','F',0,6,1,2,4.5],
    ['speedometer','Спидометр','км/ч','v',0,180,30,3,110],
    ['barometer','Барометр','Па','p',99000,103000,1000,2,101500]
  ].map((x,i) => ({id:i,type:x[0],name:x[1],unit:x[2],symbol:x[3],min:x[4],max:x[5],labelStep:x[6],parts:x[7],reading:x[8],stage:i<2?'learn':i<7?'train':'check'}));

  const $ = id => document.getElementById(id);
  const el = {
    intro:$('intro-screen'),game:$('game-screen'),result:$('result-screen'),start:$('start-btn'),restart:$('restart-btn'),rule:$('rule-btn'),ruleCard:$('rule-card'),stagePill:$('stage-pill'),progressPill:$('progress-pill'),stageProgress:$('stage-progress'),taskNumber:$('task-number'),instrumentPill:$('instrument-pill'),taskPrompt:$('task-prompt'),instrument:$('instrument-card'),selection:$('selection-message'),formula:$('formula-box'),intervals:$('intervals'),difference:$('difference'),division:$('division'),error:$('error'),reading:$('reading'),resultInput:$('result'),resultHint:$('result-hint'),feedback:$('feedback'),hint:$('hint-btn'),check:$('check-btn'),next:$('next-btn'),finalTitle:$('final-title'),finalText:$('final-text'),skillGrid:$('skill-grid')
  };
  const state = {index:0,marks:[],intervals:0,hintUsed:false,attempts:0,firstCheck:null,records:[]};

  const fmt = n => String(Math.round(n*1000)/1000).replace('.',',');
  const num = s => Number(String(s).trim().replace(/\s/g,'').replace(',','.'));
  const close = (a,b) => Number.isFinite(a) && Math.abs(a-b)<1e-8;
  const task = () => BANK[state.index];
  const minor = t => t.labelStep/t.parts;
  const labels = t => Array.from({length:Math.round((t.max-t.min)/t.labelStep)+1},(_,i)=>t.min+i*t.labelStep);
  const selectedPair = () => [...state.marks].sort((a,b)=>a-b);
  const pairValid = t => {
    const p=selectedPair(), ls=labels(t);
    return p.length===2 && Math.abs(ls.indexOf(p[0])-ls.indexOf(p[1]))===1;
  };
  const diff = () => {const p=selectedPair(); return p.length===2 ? p[1]-p[0] : NaN;};
  const price = t => t.labelStep/t.parts;
  const uncertainty = t => price(t)/2;

  function screen(target){[el.intro,el.game,el.result].forEach(x=>x.classList.remove('active'));target.classList.add('active')}
  function stageInfo(key){return STAGES.find(s=>s.key===key)}
  function updateProgress(){
    const t=task() || BANK[BANK.length-1], stage=stageInfo(t.stage);
    el.stagePill.textContent=stage.title;
    el.progressPill.textContent=`${state.records.length} / ${BANK.length}`;
    el.stageProgress.innerHTML=STAGES.map(s=>{const done=state.records.filter(r=>r.stage===s.key).length;const clean=state.records.filter(r=>r.stage===s.key&&r.clean).length;return `<div class="stage-stat"><b>${s.title}</b><span>${done}/${s.total}${s.key==='check' ? ` · самостоятельно ${clean}`:''}</span></div>`}).join('');
  }
  function buildIntervals(){
    const t=task(); el.intervals.innerHTML='';
    for(let i=1;i<=t.parts;i++){const b=document.createElement('button');b.type='button';b.className='interval';b.textContent=i;b.addEventListener('click',()=>{state.intervals=i;[...el.intervals.children].forEach((x,j)=>x.classList.toggle('on',j<i))});el.intervals.appendChild(b)}
  }
  function resetInputs(){state.marks=[];state.intervals=0;state.hintUsed=false;state.attempts=0;state.firstCheck=null;[el.difference,el.division,el.error,el.reading,el.resultInput].forEach(x=>x.value='');el.next.disabled=true;el.feedback.className='message info';el.feedback.textContent='Заполняй шаги по порядку. При необходимости используй подсказку.';el.formula.textContent='Здесь появится ход решения.';el.selection.className='message info';el.selection.textContent='Выбери две соседние подписанные отметки.';buildIntervals()}
  function renderTask(){
    const t=task(); if(!t){finish();return} resetInputs();updateProgress();
    el.taskNumber.textContent=`# задание ${state.index+1}`;el.instrumentPill.textContent=t.name;
    el.taskPrompt.textContent=t.stage==='learn'?'Разберём алгоритм по шагам':t.stage==='train'?'Реши самостоятельно; подсказка доступна':'Проверка навыка: постарайся без подсказки';
    el.resultHint.textContent=`Форма: ${t.symbol} = (значение ± погрешность) ${t.unit}`;
    renderInstrument(t);
  }
  function chooseMark(value){
    if(state.marks.includes(value)) state.marks=state.marks.filter(v=>v!==value);
    else if(state.marks.length<2) state.marks.push(value);
    else state.marks=[state.marks[1],value];
    const t=task();renderInstrument(t);
    if(state.marks.length<2){el.selection.className='message info';el.selection.textContent='Выбери ещё одну соседнюю подписанную отметку.';return}
    if(!pairValid(t)){el.selection.className='message bad';el.selection.textContent='Эти отметки не соседние. Выбери две соседние подписанные отметки.';return}
    const p=selectedPair();el.selection.className='message ok';el.selection.textContent=`Выбраны ${fmt(p[0])} и ${fmt(p[1])} ${t.unit}.`;el.formula.innerHTML=`Разность: <b>${fmt(p[1])} − ${fmt(p[0])}</b>. Теперь посчитай промежутки между ними.`;
  }
  function bindMarks(){el.instrument.querySelectorAll('[data-mark]').forEach(x=>x.addEventListener('click',()=>chooseMark(Number(x.dataset.mark))))}
  function renderInstrument(t){
    el.instrument.innerHTML=t.type==='ruler'?ruler(t):t.type==='cylinder'?cylinder(t):t.type==='thermometer'?thermometer(t):t.type==='dynamometer'?dynamometer(t):dial(t);
    bindMarks();
  }
  function tickClass(v,major){return major&&state.marks.includes(v)?'selected-line':major?'major':'minor'}
  function labelClass(v){return state.marks.includes(v)?'selected-text':''}
  function ruler(t){
    const left=55,right=650,y=125,total=Math.round((t.max-t.min)/minor(t)),px=(right-left)/total,rx=left+(t.reading-t.min)/minor(t)*px;let s=`<rect x="25" y="42" width="650" height="120" rx="18" fill="#fff9e9" stroke="#27344a" stroke-width="4"/><text class="unit-label" x="638" y="68" text-anchor="end">${t.unit}</text>`;
    for(let i=0;i<=total;i++){const v=t.min+i*minor(t),x=left+i*px,maj=i%t.parts===0;s+=`<line class="${tickClass(v,maj)}" x1="${x}" y1="${y}" x2="${x}" y2="${y-(maj?43:21)}"/>`;if(maj)s+=`<text class="${labelClass(v)}" data-mark="${v}" x="${x}" y="${y-54}" text-anchor="middle" font-size="20" font-weight="900" style="cursor:pointer">${fmt(v)}</text>`}s+=`<line class="needle" x1="${rx}" y1="62" x2="${rx}" y2="154" stroke-dasharray="6 5"/><text x="${rx}" y="190" text-anchor="middle" font-size="17" font-weight="800">край предмета</text>`;return `<svg viewBox="0 0 700 210" aria-label="Линейка, единицы ${t.unit}">${s}</svg>`
  }
  function cylinder(t){
    const top=45,bottom=330,total=Math.round((t.max-t.min)/minor(t)),px=(bottom-top)/total,lh=(t.reading-t.min)/minor(t)*px;let s=`<rect class="glass" x="220" y="28" width="145" height="312" rx="20"/><rect class="liquid" x="232" y="${bottom-lh}" width="121" height="${lh}" rx="12"/><text class="unit-label" x="470" y="45">${t.unit}</text>`;for(let i=0;i<=total;i++){const v=t.min+i*minor(t),yy=bottom-i*px,maj=i%t.parts===0;s+=`<line class="${tickClass(v,maj)}" x1="415" y1="${yy}" x2="${415-(maj?34:18)}" y2="${yy}"/>`;if(maj)s+=`<text class="${labelClass(v)}" data-mark="${v}" x="430" y="${yy+6}" font-size="19" font-weight="900" style="cursor:pointer">${fmt(v)}</text>`}return `<svg viewBox="0 0 700 370" aria-label="Мензурка, единицы ${t.unit}">${s}</svg>`
  }
  function thermometer(t){
    const top=45,bottom=315,total=Math.round((t.max-t.min)/minor(t)),px=(bottom-top)/total,lh=(t.reading-t.min)/minor(t)*px;let s=`<rect class="glass" x="265" y="25" width="64" height="286" rx="32"/><circle class="glass" cx="297" cy="324" r="34"/><rect x="284" y="${bottom-lh}" width="26" height="${lh}" rx="12" fill="#e96767"/><circle cx="297" cy="324" r="23" fill="#e96767"/><text class="unit-label" x="422" y="43">${t.unit}</text>`;for(let i=0;i<=total;i++){const v=t.min+i*minor(t),yy=bottom-i*px,maj=i%t.parts===0;s+=`<line class="${tickClass(v,maj)}" x1="360" y1="${yy}" x2="${360+(maj?33:17)}" y2="${yy}"/>`;if(maj)s+=`<text class="${labelClass(v)}" data-mark="${v}" x="344" y="${yy+6}" text-anchor="end" font-size="19" font-weight="900" style="cursor:pointer">${fmt(v)}</text>`}return `<svg viewBox="0 0 700 375" aria-label="Термометр, единицы ${t.unit}">${s}</svg>`
  }
  function dynamometer(t){
    const top=55,bottom=310,total=Math.round((t.max-t.min)/minor(t)),px=(bottom-top)/total,ry=bottom-(t.reading-t.min)/minor(t)*px;let s=`<rect x="240" y="25" width="175" height="310" rx="22" fill="#fff" stroke="#27344a" stroke-width="4"/><text class="unit-label" x="445" y="48">${t.unit}</text>`;for(let i=0;i<=total;i++){const v=t.min+i*minor(t),yy=bottom-i*px,maj=i%t.parts===0;s+=`<line class="${tickClass(v,maj)}" x1="365" y1="${yy}" x2="${365-(maj?35:18)}" y2="${yy}"/>`;if(maj)s+=`<text class="${labelClass(v)}" data-mark="${v}" x="385" y="${yy+6}" font-size="19" font-weight="900" style="cursor:pointer">${fmt(v)}</text>`}s+=`<line class="needle" x1="300" y1="${ry}" x2="345" y2="${ry}"/>`;return `<svg viewBox="0 0 700 365" aria-label="Динамометр, единицы ${t.unit}">${s}</svg>`
  }
  function polar(cx,cy,r,a){const rad=(a-90)*Math.PI/180;return{x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)}}
  function dial(t){
    const cx=350,cy=220,r=150,a0=-120,a1=120,total=Math.round((t.max-t.min)/minor(t)),ri=(t.reading-t.min)/minor(t),ra=a0+(a1-a0)*ri/total;let s=`<circle cx="${cx}" cy="${cy}" r="174" fill="#fff" stroke="#27344a" stroke-width="4"/><text class="unit-label" x="${cx}" y="${cy+112}" text-anchor="middle">${t.unit}</text>`;for(let i=0;i<=total;i++){const v=t.min+i*minor(t),a=a0+(a1-a0)*i/total,p1=polar(cx,cy,r,a),maj=i%t.parts===0,p2=polar(cx,cy,maj?r-28:r-15,a);s+=`<line class="${tickClass(v,maj)}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"/>`;if(maj){const p=polar(cx,cy,r-49,a);s+=`<text class="${labelClass(v)}" data-mark="${v}" x="${p.x}" y="${p.y+6}" text-anchor="middle" font-size="${t.unit==='Па'?16:19}" font-weight="900" style="cursor:pointer">${fmt(v)}</text>`}}const n=polar(cx,cy,112,ra);s+=`<line class="needle" x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}"/><circle cx="${cx}" cy="${cy}" r="9" fill="#27344a"/>`;return `<svg viewBox="0 0 700 420" aria-label="${t.name}, единицы ${t.unit}">${s}</svg>`
  }

  function resultOk(t){const raw=el.resultInput.value.replace(/\s/g,'').replace(/,/g,'.');return raw.includes(String(t.reading).replace(',','.'))&&raw.includes(String(uncertainty(t)).replace(',','.'))}
  function currentChecks(t){return {marks:pairValid(t),difference:close(num(el.difference.value),diff()),intervals:state.intervals===t.parts,division:close(num(el.division.value),price(t)),error:close(num(el.error.value),uncertainty(t)),reading:close(num(el.reading.value),t.reading),result:resultOk(t)}}
  function check(){
    const t=task(), c=currentChecks(t);state.attempts++;if(state.attempts===1)state.firstCheck={...c};
    const wrong=[];
    if(!c.marks) wrong.push('Выбери две соседние подписанные отметки.');
    if(!c.difference) wrong.push('Проверь разность выбранных значений.');
    if(!c.intervals) wrong.push('Посчитай именно промежутки между рисками.');
    if(!c.division) wrong.push('Цена деления = разность ÷ число промежутков.');
    if(!c.error) wrong.push('Погрешность равна половине цены деления.');
    if(!c.reading) wrong.push('Проверь показание по малым рискам шкалы.');
    if(!c.result) wrong.push('В итоговой записи должны быть значение и погрешность через ±.');
    if(wrong.length){el.feedback.className='message bad';el.feedback.innerHTML='<b>Проверь:</b><br>• '+wrong.join('<br>• ');return}
    const clean=state.attempts===1&&!state.hintUsed;
    const first=state.firstCheck||c;state.records.push({stage:t.stage,clean,division:first.division,error:first.error,reading:first.reading});
    el.feedback.className='message ok';el.feedback.innerHTML=`<b>Верно.</b> ${clean?'Решено самостоятельно с первой попытки.':'Алгоритм выполнен правильно.'}`;
    el.formula.innerHTML=`${fmt(diff())} ${t.unit} ÷ ${t.parts} = <b>${fmt(price(t))} ${t.unit}</b><br>Δ = ${fmt(price(t))} ÷ 2 = <b>${fmt(uncertainty(t))} ${t.unit}</b><br>${t.symbol} = <b>(${fmt(t.reading)} ± ${fmt(uncertainty(t))}) ${t.unit}</b>`;
    el.next.disabled=false;updateProgress();
  }
  function hint(){
    const t=task();state.hintUsed=true;const c=currentChecks(t);let msg='';
    if(!c.marks) msg='Начни с двух соседних подписанных отметок.';
    else if(!c.difference) msg=`Вычти меньшее выбранное значение из большего.`;
    else if(!c.intervals) msg='Считай промежутки, а не риски. Между 4 внутренними рисками будет 5 промежутков.';
    else if(!c.division) msg=`Раздели разность ${fmt(diff())} на ${t.parts}.`;
    else if(!c.error) msg='Раздели цену деления на 2.';
    else if(!c.reading) msg='От выбранной подписанной отметки отсчитай малые деления до указателя.';
    else msg=`Запиши ${t.symbol} = (значение ± погрешность) ${t.unit}.`;
    if(t.stage==='learn') msg+=` Цена деления здесь ${fmt(price(t))} ${t.unit}, погрешность ${fmt(uncertainty(t))} ${t.unit}.`;
    el.feedback.className='message info';el.feedback.innerHTML='<b>Подсказка:</b> '+msg;
  }
  function next(){state.index++;renderTask()}
  function finish(){
    screen(el.result);const check=state.records.filter(r=>r.stage==='check'),clean=check.filter(r=>r.clean).length,mastered=clean>=8;
    el.finalTitle.textContent=mastered?'Навык освоен':'Навык почти освоен';
    el.finalText.textContent=`Самостоятельно с первой попытки: ${clean} из 10. ${mastered?'Ты уверенно работаешь со шкалами разных приборов.':'Повтори задания и постарайся не использовать подсказки на этапе проверки.'}`;
    const stats=[['Цена деления','division'],['Погрешность','error'],['Показание','reading']];
    el.skillGrid.innerHTML=stats.map(([name,key])=>{const ok=check.filter(r=>r[key]).length;return `<div class="skill"><b>${name}</b><span>${ok}/10</span></div>`}).join('');
    el.stagePill.textContent='Итог';el.progressPill.textContent=`${state.records.length} / ${BANK.length}`;
  }
  function start(){state.index=0;state.records=[];screen(el.game);renderTask()}

  el.start.addEventListener('click',start);el.restart.addEventListener('click',start);el.rule.addEventListener('click',()=>el.ruleCard.scrollIntoView({behavior:'smooth',block:'center'}));el.hint.addEventListener('click',hint);el.check.addEventListener('click',check);el.next.addEventListener('click',next);
  updateProgress();
})();
