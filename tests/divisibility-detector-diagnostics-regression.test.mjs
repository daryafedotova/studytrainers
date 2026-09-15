import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaskRecord, registerAttempt, markHintUsed,
  summarizeSkills, saveBlockBest, loadBlockBest, hasBlockBest
} from '../math/grade-5-6/divisibility-detector/progress.js';
import { validateTask } from '../math/grade-5-6/divisibility-detector/validation.js';

test('detector reports only the affected rule and contrast skill', () => {
  const task = {type:'detector',number:735,skills:['3','5','5/10']};

  const missedThree = validateTask(task,{divisors:[5]});
  assert.deepEqual(missedThree.skillErrors,['3']);

  const confusedFiveAndTen = validateTask(task,{divisors:[3,5,10]});
  assert.deepEqual(confusedFiveAndTen.skillErrors,['5/10']);
});

test('skill diagnostics do not penalize rules that were applied correctly', () => {
  let record = createTaskRecord('det-735',['3','5','5/10']);
  record = registerAttempt(record,false,['3']);
  record = markHintUsed(record,['3']);
  record = registerAttempt(record,true);

  assert.deepEqual(summarizeSkills([record]),[
    {skill:'3',total:1,clean:0,percent:0},
    {skill:'5',total:1,clean:1,percent:100},
    {skill:'5/10',total:1,clean:1,percent:100},
  ]);
});

test('a stored zero-percent result is distinguishable from no result', () => {
  const map = new Map();
  const storage = {
    getItem:key => map.has(key) ? map.get(key) : null,
    setItem:(key,value) => map.set(key,String(value)),
  };
  const key = 'divisibility-detector:5:detector';
  assert.equal(hasBlockBest(key,storage),false);
  saveBlockBest(key,0,storage);
  assert.equal(loadBlockBest(key,storage),0);
  assert.equal(hasBlockBest(key,storage),true);
});
