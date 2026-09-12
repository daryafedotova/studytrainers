import test from 'node:test';
import assert from 'node:assert/strict';
import {
  segmentDirection,
  segmentKind,
  phaseProcess,
  validateLevel1Answer,
  validateLevel2Answer,
  validateBonusPath,
  isCleanPass,
  graphBounds,
  cleanCount,
  pickLevel1Set
} from '../physics/grade-8/phase-transitions/logic.js';
import { LEVEL1_TASKS, LEVEL2_TASKS, BONUS_TASKS } from '../physics/grade-8/phase-transitions/data.js';

test('classifies rising, falling and horizontal segments', () => {
  assert.equal(segmentDirection({x:0,y:0},{x:1,y:10}), 'up');
  assert.equal(segmentDirection({x:0,y:10},{x:1,y:0}), 'down');
  assert.equal(segmentDirection({x:0,y:5},{x:1,y:5}), 'flat');
  assert.equal(segmentKind({x:0,y:5},{x:1,y:5}), 'phase');
});

test('maps aggregate-state changes to four phase processes', () => {
  assert.equal(phaseProcess('solid','liquid'), 'melting');
  assert.equal(phaseProcess('liquid','solid'), 'crystallization');
  assert.equal(phaseProcess('liquid','gas'), 'boiling');
  assert.equal(phaseProcess('gas','liquid'), 'condensation');
});

test('validates phase level-1 answer including numeric temperature', () => {
  const task = {kind:'phase', answer:{process:'melting',transition:'solid-liquid',state:'solid-liquid',tempChange:'constant',energy:'increases',temperature:35}};
  assert.equal(validateLevel1Answer(task,{...task.answer,temperature:'35'}).ok,true);
  assert.equal(validateLevel1Answer(task,{...task.answer,temperature:'34'}).ok,false);
});

test('validates slope level-1 answer without transition-only fields', () => {
  const task = {kind:'slope', answer:{action:'heating',phaseState:'solid',tempChange:'increases',energy:'increases'}};
  const good = validateLevel1Answer(task,{action:'heating',phaseState:'solid',tempChange:'increases',energy:'increases'});
  const bad = validateLevel1Answer(task,{action:'cooling',phaseState:'solid',tempChange:'increases',energy:'increases'});
  assert.equal(good.ok,true);
  assert.equal(bad.ok,false);
  assert.deepEqual(Object.keys(good.details).sort(),['action','energy','phaseState','tempChange'].sort());
});

test('picks exactly one level-1 task from each category', () => {
  const chosen = pickLevel1Set(LEVEL1_TASKS, () => 0.25);
  assert.equal(chosen.length,10);
  assert.equal(new Set(chosen.map(task=>task.category)).size,10);
});

test('validates all level-2 answer types', () => {
  assert.equal(validateLevel2Answer({answerType:'segment',answer:2},2).ok,true);
  assert.equal(validateLevel2Answer({answerType:'singleChoice',answer:'cooling'},'cooling').ok,true);
  assert.equal(validateLevel2Answer({answerType:'multiChoice',answer:['condensation','crystallization']},['crystallization','condensation']).ok,true);
  assert.equal(validateLevel2Answer({answerType:'number',answer:82},'82').ok,true);
});

test('clean pass means first attempt without hint', () => {
  assert.equal(isCleanPass({attempts:1,hintUsed:false,correct:true}),true);
  assert.equal(isCleanPass({attempts:2,hintUsed:false,correct:true}),false);
  assert.equal(isCleanPass({attempts:1,hintUsed:true,correct:true}),false);
  assert.equal(cleanCount([{clean:true},{clean:false},{clean:true}]),2);
});

test('graph bounds report min and max coordinates', () => {
  assert.deepEqual(graphBounds([{x:0,y:-20},{x:3,y:0},{x:6,y:100}]),{minX:0,maxX:6,minY:-20,maxY:100});
});

test('bonus path validates plateaus and direction reversal', () => {
  const task={expectedTemps:[-20,20,20,80,80,110,80,80,20,20,-10],enforceX:false};
  const points=task.expectedTemps.map((y,i)=>({x:i,y}));
  assert.equal(validateBonusPath(task,points).ok,true);
  const wrong=points.map(p=>({...p}));
  wrong[2].y=25;
  assert.equal(validateBonusPath(task,wrong).ok,false);
});

test('level-1 bank covers ten categories with at least two variants each', () => {
  assert.ok(LEVEL1_TASKS.length>=20);
  const counts=new Map();
  for(const task of LEVEL1_TASKS){
    counts.set(task.category,(counts.get(task.category)||0)+1);
    assert.ok(['slope','phase'].includes(task.kind));
    assert.ok(task.points.length>=4);
    assert.ok(Number.isInteger(task.highlightSegment));
  }
  assert.equal(counts.size,10);
  for(const count of counts.values()) assert.ok(count>=2);
});

test('level-2 bank includes heating, cooling and phase-transition interpretation', () => {
  assert.equal(LEVEL2_TASKS.length,10);
  const focuses=new Set(LEVEL2_TASKS.map(task=>task.focus));
  assert.ok([...focuses].some(x=>x.startsWith('heating-')));
  assert.ok([...focuses].some(x=>x.startsWith('cooling-')));
  assert.ok([...focuses].some(x=>x.startsWith('phase-')));
});

test('bonus bank has six tasks and task 5 states the initial temperature', () => {
  assert.equal(BONUS_TASKS.length,6);
  assert.match(BONUS_TASKS[4].text,/−10\s*°C|-10\s*°C/);
});