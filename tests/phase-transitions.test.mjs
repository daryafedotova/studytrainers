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
  cleanCount
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

test('validates level 1 passport including numeric temperature', () => {
  const task = { answer:{ process:'melting', transition:'solid-liquid', state:'solid-liquid', tempChange:'constant', energy:'increases', temperature:35 } };
  assert.equal(validateLevel1Answer(task,{...task.answer,temperature:'35'}).ok,true);
  assert.equal(validateLevel1Answer(task,{...task.answer,temperature:'34'}).ok,false);
});

test('validates all level 2 answer types', () => {
  assert.equal(validateLevel2Answer({answerType:'segment',answer:2},2).ok,true);
  assert.equal(validateLevel2Answer({answerType:'singleChoice',answer:'condensation'},'condensation').ok,true);
  assert.equal(validateLevel2Answer({answerType:'multiChoice',answer:['condensation','crystallization']},['crystallization','condensation']).ok,true);
  assert.equal(validateLevel2Answer({answerType:'number',answer:82},'82').ok,true);
});

test('clean pass means first attempt without hint', () => {
  assert.equal(isCleanPass({attempts:1,hintUsed:false,correct:true}),true);
  assert.equal(isCleanPass({attempts:2,hintUsed:false,correct:true}),false);
  assert.equal(isCleanPass({attempts:1,hintUsed:true,correct:true}),false);
  assert.equal(cleanCount([{clean:true},{clean:false},{clean:true}]),2);
});

test('graph bounds include padding-friendly min max values', () => {
  assert.deepEqual(graphBounds([{x:0,y:-20},{x:3,y:0},{x:6,y:100}]),{minX:0,maxX:6,minY:-20,maxY:100});
});

test('bonus path validates plateaus and direction reversal', () => {
  const task={ expectedTemps:[-20,20,20,80,80,110,80,80,20,20,-10], enforceX:false };
  const points=task.expectedTemps.map((y,i)=>({x:i,y}));
  assert.equal(validateBonusPath(task,points).ok,true);
  const wrong=points.map(p=>({...p})); wrong[2].y=25;
  assert.equal(validateBonusPath(task,wrong).ok,false);
});

test('task banks have approved sizes and coverage', () => {
  assert.equal(LEVEL1_TASKS.length,10);
  assert.equal(LEVEL2_TASKS.length,10);
  assert.equal(BONUS_TASKS.length,6);
  const processes=new Set(LEVEL1_TASKS.map(t=>t.answer.process));
  assert.deepEqual([...processes].sort(),['boiling','condensation','crystallization','melting']);
  for(const task of [...LEVEL1_TASKS,...LEVEL2_TASKS]){
    assert.ok(task.points.length>=3);
    assert.ok(task.points.every((p,i,a)=>i===0 || p.x>a[i-1].x));
  }
});
