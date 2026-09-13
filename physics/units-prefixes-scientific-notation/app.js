import { MODE_BLOCKS, getUnit, unitsForMode } from './data.js';
import { pickTaskSet } from './generator.js';
import { validateResponse } from './logic.js';
import {
  createTaskRecord, markHintUsed, markRuleUsed, registerAttempt,
  summarize, saveBestResult, loadBestResult
} from './progress.js';

const BLOCK_INFO = {
  'prefix-drill': {title:'Тренировка приставок',description:'Свяжи обозначение единицы, название приставки и её множитель.',rule:'prefix'},
  'to-si': {title:'Переведи в СИ',description:'Переводи физические величины в соответствующие единицы СИ.',rule:'to-si'},
  'use-prefix': {title:'Используй приставку',description:'Записывай величины с заданной кратной или дольной приставкой.',rule:'use-prefix'},
  'mixed': {title:'Смешанная тренировка',description:'Определи нужное направление преобразования самостоятельно.',rule:'mixed'},
  'area-volume': {title:'Площадь и объём',description:'Отдельная тренировка квадратных и кубических единиц, литров и миллилитров.',rule:'area-volume'},
  'mantissa-warmup': {title:'Правильная мантисса',description:'5 коротких вопросов перед основной работой со стандартным видом.',rule:'scientific',learningOnly:true,fixedCount:5},
  'to-scientific': {title:'В стандартный вид',description:'Преобразуй обычную запись числа в a · 10ⁿ.',rule:'scientific'},
  'from-scientific': {title:'Из стандартного вида',description:'Верни число из записи a · 10ⁿ в обычную десятичную форму.',rule:'from-scientific'},
  'prefix-power': {title:'Приставка и степень 10',description:'Замени приставку степенью десяти: запиши коэффициент, показатель степени и единицу без приставки.',rule:'prefix-power'},
  'mantissa-shift': {title:'Изменение мантиссы',description:'Свяжи приставку, её степень и нормализацию мантиссы.',rule:'mantissa-shift',learningOnly:true,fixedCount:6},
  'unit-conversion': {title:'Перевод единиц',description:'Переводи величины между единицами с разными приставками.',rule:'unit-conversion'},
};

const SUBSTAGES = {
  area:{title:'Площадь',description:'Квадратные единицы: м², см², мм².'},
  volume:{title:'Объём',description:'Кубические единицы: м³, дм³, см³.'},
  liters:{title:'Литры и кубические единицы',description:'Связи мл ↔ см³, л ↔ дм³, м³ ↔ л.'},
  mixed:{title:'Смешанная тренировка',description:'Площади, объёмы и литры вперемешку.'},
};

const state = {
  mode:null, blockId:null, substage:null, length:15,
  tasks:[], index:0, records:[], currentRecord:null, feedback:null,
  choiceValue:null,
};

const screens=[...document.querySelectorAll('.screen')];
const blockGrid=document.getElementById('block-grid');
const stagePill=document.getElementById('stage-pill');
const progressPill=document.getElementById('progress-pill');
const homeBtn=document.getElementById('home-btn');
const ruleBtn=document.getElementById('rule-btn');
const ruleDialog=document.getElementById('rule-dialog');
const ruleTitle=document.getElementById('rule-title');
const ruleContent=document.getElementById('rule-content');
const substageArea=document.getElementById('substage-area');
const substageGrid=document.getElementById('substage-grid');
const lengthArea=document.getElementById('length-area');
const fixedStartBtn=document.getElementById('fixed-start-btn');
const answerZone=document.getElementById('answer-zone');
const feedback=document.getElementById('feedback');
const hintBox=document.getElementById('hint-box');
const solutionBox=document.getElementById('solution-box');
const formulaPreview=document.getElementById('formula-preview');
const theoryCard=document.getElementById('theory-card');
const checkBtn=document.getElementById('check-btn');
const nextBtn=document.getElementById('next-btn');
const hintBtn=document.getElementById('hint-btn');

function showScreen(id){
  for(const screen of screens) screen.classList.toggle('active',screen.id===id);
  const inTask=id==='task-screen';
  progressPill.hidden=!inTask;
  ruleBtn.hidden=!inTask;
  homeBtn.hidden=id==='mode-screen';
  window.scrollTo({top:0,behavior:'smooth'});
}

function modeLabel(mode){return mode==='7'?'7 класс':'8–9 класс';}

function renderBlocks(){
  document.getElementById('mode-eyebrow').textContent=`Режим · ${modeLabel(state.mode)}`;
  document.getElementById('blocks-title').textContent=state.mode==='7'?'Единицы и приставки':'Стандартный вид и единицы';
  document.getElementById('route-note').textContent=state.mode==='7'
    ? 'Рекомендуемый маршрут: Переведи в СИ → Используй приставку → Смешанная тренировка. Тренировка приставок и «Площадь и объём» доступны отдельно.'
    : 'Рекомендуемый маршрут: Мантисса → В стандартный вид → Из стандартного вида → Приставки → Степени → Изменение мантиссы → Переводы → Смешанная тренировка.';
  blockGrid.innerHTML='';
  MODE_BLOCKS[state.mode].forEach((blockId,index)=>{
    const info=BLOCK_INFO[blockId];
    const card=document.createElement('button');
    card.type='button';card.className='block-card';card.dataset.blockId=blockId;
    const best=info.learningOnly?null:loadBestResult(state.mode,blockId);
    const routeMark=state.mode==='7' ? ({'to-si':'1','use-prefix':'2','mixed':'3','prefix-drill':'Т','area-volume':'★'}[blockId] ?? index+1) : index+1;
    card.innerHTML=`<span class="block-index">${routeMark}</span><h3>${info.title}</h3><p>${info.description}</p>${best===null?'':`<span class="best-badge">Лучший результат: ${best}%</span>`}`;
    card.addEventListener('click',()=>selectBlock(blockId));
    blockGrid.append(card);
  });
  stagePill.textContent=modeLabel(state.mode);
  showScreen('blocks-screen');
}

function selectMode(mode){
  state.mode=mode;state.blockId=null;state.substage=null;
  renderBlocks();
}

function selectBlock(blockId){
  state.blockId=blockId;state.substage=null;
  const info=BLOCK_INFO[blockId];
  document.getElementById('setup-title').textContent=info.title;
  document.getElementById('setup-description').textContent=info.description;
  substageArea.hidden=blockId!=='area-volume';
  fixedStartBtn.hidden=!info.fixedCount;
  lengthArea.hidden=Boolean(info.fixedCount);
  substageGrid.innerHTML='';
  if(blockId==='area-volume'){
    Object.entries(SUBSTAGES).forEach(([id,item])=>{
      const btn=document.createElement('button');btn.type='button';btn.className='substage-card';btn.dataset.substage=id;
      btn.innerHTML=`<strong>${item.title}</strong><span>${item.description}</span>`;
      btn.addEventListener('click',()=>{
        state.substage=id;
        [...substageGrid.children].forEach(node=>node.classList.toggle('is-selected',node===btn));
      });
      substageGrid.append(btn);
    });
    state.substage='area';
    substageGrid.firstElementChild?.classList.add('is-selected');
  }
  stagePill.textContent=info.title;
  showScreen('length-screen');
}

function startRun(count){
  state.length=count;
  state.tasks=pickTaskSet({mode:state.mode,blockId:state.blockId,substage:state.substage,count,rng:Math.random});
  state.index=0;state.records=[];state.choiceValue=null;
  state.currentRecord=createTaskRecord(state.tasks[0].id);
  renderTask();
  showScreen('task-screen');
}

function ruleHTML(){
  const mode=state.mode;const block=state.blockId;const sub=state.substage;
  if(mode==='7'){
    if(block==='prefix-drill') return '<ul class="rule-list"><li>мега = 1 000 000</li><li>кило = 1000</li><li>санти = 0,01</li><li>милли = 0,001</li></ul>';
    if(block==='to-si') return '<p>Определи единицу СИ для величины, затем сравни размеры исходной и новой единицы. Для массы единица СИ — килограмм.</p>';
    if(block==='use-prefix') return '<p>Сначала вспомни, во сколько раз приставка изменяет единицу. Затем измени числовое значение в обратную сторону.</p>';
    if(block==='area-volume'){
      if(sub==='area') return '<p><b>Площадь:</b> 1 м = 100 см, поэтому 1 м² = 100² см² = 10 000 см².</p>';
      if(sub==='volume') return '<p><b>Объём:</b> 1 м³ = 100³ см³ = 1 000 000 см³.</p>';
      if(sub==='liters') return '<ul class="rule-list"><li>1 мл = 1 см³</li><li>1 л = 1 дм³</li><li>1 м³ = 1000 л</li></ul>';
      return '<p>Для площади коэффициент линейной единицы применяется два раза, для объёма — три раза. Для литров используй связи 1 мл = 1 см³ и 1 л = 1 дм³.</p>';
    }
    return '<p>Сначала определи направление перевода и только затем меняй числовое значение.</p>';
  }
  if(block==='mantissa-warmup'||block==='to-scientific') return '<p>Стандартный вид: <span class="formula">a · 10<sup>n</sup></span>, где <span class="formula">1 ≤ |a| &lt; 10</span>, а n — целое число.</p>';
  if(block==='from-scientific') return '<p>Положительный показатель переносит запятую вправо, отрицательный — влево. Число переносов задаётся модулем показателя.</p>';
  if(block==='prefix-drill') return '<p>Приставка задаёт степень десяти: кило = <span class="formula">10<sup>3</sup></span>, мега = <span class="formula">10<sup>6</sup></span>, милли = <span class="formula">10<sup>−3</sup></span>, микро = <span class="formula">10<sup>−6</sup></span>, нано = <span class="formula">10<sup>−9</sup></span>.</p>';
  if(block==='prefix-power') return '<p><b>В этом блоке не нужно приводить число к стандартному виду.</b> Замени приставку степенью десяти, сохрани исходный коэффициент и запиши единицу без приставки. Например: <span class="formula">250 гПа = 250 · 10<sup>2</sup> Па</span>.</p>';
  if(block==='mantissa-shift') return '<p>Если мантиссу увеличили в 10 раз, показатель степени уменьшается на 1. Если мантиссу уменьшили в 10 раз — показатель увеличивается на 1.</p>';
  if(block==='area-volume') return '<p>Для квадратной единицы показатель приставки умножается на 2, для кубической — на 3. Например: <span class="formula">1 см² = (10<sup>−2</sup>)² м² = 10<sup>−4</sup> м²</span>.</p>';
  return '<p>Сопоставь приставку со степенью десяти и следи, чтобы итоговая мантисса была от 1 включительно до 10 не включительно по модулю.</p>';
}

function theoryHTML(task){
  if(state.blockId==='mantissa-warmup') return '<strong>Стандартный вид числа</strong><p>Число записано в стандартном виде, если оно имеет вид <span class="formula">a · 10<sup>n</sup></span>, где <span class="formula">1 ≤ |a| &lt; 10</span>, а <span class="formula">n</span> — целое число.</p>';
  if(state.blockId==='area-volume') return ruleHTML();
  if(state.blockId==='mantissa-shift' && task.metadata?.scaffold) return '<strong>Подсказка к алгоритму</strong><p>Сначала замени приставку степенью десяти, затем приведи мантиссу к диапазону от 1 до 10.</p>';
  return '';
}

function renderTask(){
  const task=state.tasks[state.index];
  state.currentRecord=state.records[state.index] ?? createTaskRecord(task.id);
  state.choiceValue=null;
  document.getElementById('task-block-name').textContent=BLOCK_INFO[state.blockId].title;
  document.getElementById('task-number').textContent=`Задание ${state.index+1} из ${state.tasks.length}`;
  stagePill.textContent=BLOCK_INFO[state.blockId].title;
  progressPill.textContent=`${state.index+1} / ${state.tasks.length}`;
  const prompt=document.getElementById('task-prompt');
  if(task.promptHtml) prompt.innerHTML=task.promptHtml; else prompt.textContent=task.prompt;
  const theory=theoryHTML(task);theoryCard.hidden=!theory;theoryCard.innerHTML=theory;
  hintBox.hidden=true;hintBox.textContent='';solutionBox.hidden=true;solutionBox.innerHTML='';
  feedback.className='feedback info';feedback.textContent='Введи ответ и нажми «Проверить».';
  nextBtn.disabled=true;checkBtn.disabled=false;hintBtn.disabled=false;formulaPreview.hidden=true;formulaPreview.innerHTML='';
  renderAnswer(task);
}

function unitOptions(task){
  const dimension=task.metadata?.dimension;
  const list=unitsForMode(state.mode).filter(unit=>unit.dimension===dimension);
  const ids=new Set([...(task.metadata?.unitOptions||[]),...list.map(unit=>unit.id)]);
  return [...ids].map(id=>getUnit(id));
}

function escapeHTML(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}

function powerChoiceHTML(choice){
  const value=String(choice);
  const match=value.match(/^10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/);
  if(!match)return escapeHTML(value);
  const normal={'⁻':'−','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  const exponent=[...match[1]].map(char=>normal[char]??char).join('');
  return `<span class="formula">10<sup>${escapeHTML(exponent)}</sup></span>`;
}

function renderAnswer(task){
  answerZone.innerHTML='';
  if(task.answerType==='number-unit'){
    const row=document.createElement('div');row.className='answer-row';row.dataset.answerType='number-unit';
    row.innerHTML='<input inputmode="decimal" class="number-input" aria-label="Числовое значение"><select class="unit-select" aria-label="Единица измерения"><option value="">Выбери единицу</option></select>';
    const select=row.querySelector('select');
    unitOptions(task).forEach(unit=>{const option=document.createElement('option');option.value=unit.id;option.textContent=unit.symbol;select.append(option);});
    answerZone.append(row);return;
  }
  if(task.answerType==='scientific'){
    const row=document.createElement('div');row.className='scientific-answer';row.dataset.answerType='scientific';
    row.innerHTML='<input class="mantissa-input" inputmode="decimal" aria-label="Мантисса"><span>· 10</span><input class="exponent-input exponent-box" inputmode="numeric" aria-label="Показатель степени">';
    const update=()=>{const m=row.querySelector('.mantissa-input').value||'a';const e=row.querySelector('.exponent-input').value||'n';formulaPreview.hidden=false;formulaPreview.innerHTML=`Предпросмотр: <span class="formula">${escapeHTML(m)} · 10<sup>${escapeHTML(e)}</sup></span>`;};
    row.querySelectorAll('input').forEach(input=>input.addEventListener('input',update));
    answerZone.append(row);return;
  }
  if(task.answerType==='number'){
    const row=document.createElement('div');row.className='answer-row';row.innerHTML='<input inputmode="decimal" class="number-input" aria-label="Ответ">';answerZone.append(row);return;
  }
  if(task.answerType==='choice'){
    const grid=document.createElement('div');grid.className='choice-grid';
    for(const choice of task.choices||[]){const btn=document.createElement('button');btn.type='button';btn.className='choice-btn';btn.innerHTML=powerChoiceHTML(choice);btn.dataset.value=choice;btn.addEventListener('click',()=>{state.choiceValue=choice;[...grid.children].forEach(node=>node.classList.toggle('is-selected',node===btn));});grid.append(btn);}answerZone.append(grid);return;
  }
  if(task.answerType==='multi-part'){
    const wrap=document.createElement('div');wrap.className='multi-answer';wrap.dataset.answerType='multi-part';
    const labels={prefixMantissa:'Коэффициент',prefixExponent:'Степень приставки',mantissa:'Мантисса',exponent:'Итоговая степень',unitId:'Единица'};
    for(const key of Object.keys(task.answer)){
      const group=document.createElement('div');group.className='multi-group';group.dataset.key=key;
      const label=document.createElement('label');label.textContent=labels[key]||key;group.append(label);
      if(key==='unitId'){
        const select=document.createElement('select');select.className='unit-select';select.dataset.answerKey=key;select.innerHTML='<option value="">Единица</option>';
        unitOptions(task).forEach(unit=>{const option=document.createElement('option');option.value=unit.id;option.textContent=unit.symbol;select.append(option);});group.append(select);
      }else{
        const input=document.createElement('input');input.className=key.toLowerCase().includes('exponent')?'exponent-box':'number-input';input.inputMode=key.toLowerCase().includes('exponent')?'numeric':'decimal';input.dataset.answerKey=key;group.append(input);
      }
      wrap.append(group);
    }
    answerZone.append(wrap);return;
  }
}

function collectResponse(task){
  if(task.answerType==='number-unit') return {number:answerZone.querySelector('.number-input')?.value,unitId:answerZone.querySelector('.unit-select')?.value};
  if(task.answerType==='scientific') return {mantissa:answerZone.querySelector('.mantissa-input')?.value,exponent:answerZone.querySelector('.exponent-input')?.value};
  if(task.answerType==='number') return answerZone.querySelector('.number-input')?.value;
  if(task.answerType==='choice') return state.choiceValue;
  if(task.answerType==='multi-part'){
    const response={};answerZone.querySelectorAll('[data-answer-key]').forEach(control=>{response[control.dataset.answerKey]=control.value;});return response;
  }
  return null;
}

function diagnosticHint(task,details={}){
  if(details.unit===false||details.unitId===false) return 'Проверь единицу: сравни размер исходной и целевой единицы.';
  if(details.prefixMantissa===false) return 'Проверь коэффициент: в этом блоке число перед степенью десяти нужно сохранить без нормализации.';
  if(details.mantissa===false) return 'Мантисса должна быть не меньше 1 и меньше 10 по модулю.';
  if(details.exponent===false||details.prefixExponent===false) return state.blockId==='prefix-power'?'Проверь показатель степени, соответствующий приставке.':'Проверь степень: при изменении мантиссы показатель должен компенсировать это изменение.';
  if(state.blockId==='area-volume') return 'Не забудь: для площади коэффициент действует два раза, для объёма — три.';
  if(state.blockId==='prefix-drill'||state.blockId==='prefix-power') return 'Вспомни, какой множитель или степень соответствует этой приставке.';
  return 'Сравни размеры единиц и подумай: числовое значение должно увеличиться или уменьшиться?';
}

function markValidation(details){
  answerZone.querySelectorAll('.is-wrong,.is-right').forEach(node=>node.classList.remove('is-wrong','is-right'));
  if(!details)return;
  if('number' in details){const node=answerZone.querySelector('.number-input');if(node)node.classList.add(details.number?'is-right':'is-wrong');}
  if('unit' in details){const node=answerZone.querySelector('.unit-select');if(node)node.classList.add(details.unit?'is-right':'is-wrong');}
  if('mantissa' in details){const node=answerZone.querySelector('.mantissa-input')||answerZone.querySelector('[data-answer-key="mantissa"]');if(node)node.classList.add(details.mantissa?'is-right':'is-wrong');}
  if('exponent' in details){const node=answerZone.querySelector('.exponent-input')||answerZone.querySelector('[data-answer-key="exponent"]');if(node)node.classList.add(details.exponent?'is-right':'is-wrong');}
  if('choice' in details){answerZone.querySelector('.is-selected')?.classList.add(details.choice?'is-right':'is-wrong');}
  for(const [key,ok] of Object.entries(details)){const group=[...answerZone.querySelectorAll('[data-key]')].find(node=>node.dataset.key===key);if(group)group.classList.add(ok?'is-right':'is-wrong');}
}

function disableAnswer(){answerZone.querySelectorAll('input,select,button').forEach(control=>control.disabled=true);}

function saveRecord(){state.records[state.index]=state.currentRecord;}

function handleCheck(){
  const task=state.tasks[state.index];const response=collectResponse(task);const validation=validateResponse(task,response);
  state.currentRecord=registerAttempt(state.currentRecord,validation.ok);saveRecord();markValidation(validation.details);
  if(validation.ok){
    feedback.className='feedback success';feedback.textContent=state.currentRecord.attempts===1&&!state.currentRecord.hintUsed&&!state.currentRecord.ruleUsed?'✓ Верно с первой попытки.':'✓ Верно. Задание выполнено.';
    disableAnswer();checkBtn.disabled=true;hintBtn.disabled=true;nextBtn.disabled=false;return;
  }
  if(state.currentRecord.attempts===1){
    feedback.className='feedback error';feedback.textContent='Пока неверно. Исправь отмеченные части и попробуй ещё раз.';
    hintBox.hidden=false;hintBox.textContent=diagnosticHint(task,validation.details);return;
  }
  feedback.className='feedback error';feedback.textContent='После двух попыток показываю решение.';
  hintBox.hidden=true;solutionBox.hidden=false;solutionBox.innerHTML=`<strong>Решение по шагам</strong><ol>${task.solutionSteps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol>`;
  disableAnswer();checkBtn.disabled=true;hintBtn.disabled=true;nextBtn.disabled=false;
}

function handleHint(){
  const task=state.tasks[state.index];state.currentRecord=markHintUsed(state.currentRecord);saveRecord();hintBox.hidden=false;hintBox.textContent=diagnosticHint(task,{});
}

function nextTask(){
  if(state.index>=state.tasks.length-1){finishRun();return;}
  state.index+=1;renderTask();
}

function finishRun(){
  const summary=summarize(state.records);
  const info=BLOCK_INFO[state.blockId];
  document.getElementById('solved-result').textContent=`${summary.solved}/${summary.total}`;
  document.getElementById('clean-result').textContent=`${summary.clean}/${summary.total} — ${summary.percent}%`;
  document.getElementById('clean-row').hidden=Boolean(info.learningOnly);
  const mastery=document.getElementById('mastery-result');
  if(info.learningOnly){mastery.textContent='Обучающий блок завершён';document.getElementById('best-result-note').textContent='Этот блок не участвует в итоговом проценте освоения.';}
  else{
    document.getElementById('clean-row').hidden=false;
    mastery.textContent=summary.mastered?'Навык освоен ✓':'Попробуй ещё раз: для освоения нужно 80% чистых решений.';
    const best=saveBestResult(state.mode,state.blockId,summary.percent);
    document.getElementById('best-result-note').textContent=`Лучший результат: ${best}%`;
  }
  document.getElementById('result-title').textContent=BLOCK_INFO[state.blockId].title;
  stagePill.textContent='Результат';progressPill.hidden=true;ruleBtn.hidden=true;showScreen('result-screen');
}

function openRule(){
  if(document.getElementById('task-screen').classList.contains('active')&&state.currentRecord){state.currentRecord=markRuleUsed(state.currentRecord);saveRecord();}
  ruleTitle.textContent=BLOCK_INFO[state.blockId]?.title||'Правило';ruleContent.innerHTML=ruleHTML();ruleDialog.showModal();
}

function goBlocks(){renderBlocks();}

document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>selectMode(btn.dataset.mode)));
document.getElementById('change-mode-btn').addEventListener('click',()=>{state.mode=null;stagePill.textContent='Старт';showScreen('mode-screen');});
document.getElementById('back-blocks-btn').addEventListener('click',goBlocks);
document.querySelectorAll('[data-count]').forEach(btn=>btn.addEventListener('click',()=>{if(state.blockId==='area-volume'&&!state.substage)return;startRun(Number(btn.dataset.count));}));
fixedStartBtn.addEventListener('click',()=>startRun(BLOCK_INFO[state.blockId].fixedCount));
checkBtn.addEventListener('click',handleCheck);nextBtn.addEventListener('click',nextTask);hintBtn.addEventListener('click',handleHint);ruleBtn.addEventListener('click',openRule);homeBtn.addEventListener('click',()=>{if(state.mode)renderBlocks();else showScreen('mode-screen');});
document.getElementById('result-blocks-btn').addEventListener('click',goBlocks);document.getElementById('retry-btn').addEventListener('click',()=>startRun(state.length));
