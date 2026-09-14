import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTaskRecord, markRuleUsed, markHintUsed, registerAttempt,
  isClean, summarize, summarizeSkills, saveBlockBest, loadBlockBest
} from '../math/grade-5-6/divisibility-detector/progress.js';

test('only correct unsupported first attempts are clean', () => {
  let a = createTaskRecord('a',['9']);
  a = registerAttempt(a,true);
  assert.equal(isClean(a), true);

  let b = createTaskRecord('b',['9']);
  b = registerAttempt(b,false);
  b = registerAttempt(b,true);
  assert.equal(isClean(b), false);

  let c = markRuleUsed(createTaskRecord('c',['9']));
  c = registerAttempt(c,true);
  assert.equal(isClean(c), false);

  let d = markHintUsed(createTaskRecord('d',['9']));
  d = registerAttempt(d,true);
  assert.equal(isClean(d), false);
});

test('mastery begins at 80 percent clean', () => {
  const records = Array.from({length:10},(_,i) => ({
    taskId:String(i), skills:['3'], attempts:1, solved:true,
    hintUsed:false, ruleUsed:false, clean:i<8
  }));
  assert.deepEqual(summarize(records), {total:10,solved:10,clean:8,percent:80,mastered:true});
});

test('skill summary calculates clean percentage per tag', () => {
  const records = [
    {taskId:'a',skills:['9'],clean:false,solved:true},
    {taskId:'b',skills:['9'],clean:true,solved:true},
    {taskId:'c',skills:['5'],clean:true,solved:true}
  ];
  assert.deepEqual(summarizeSkills(records), [
    {skill:'5',total:1,clean:1,percent:100},
    {skill:'9',total:2,clean:1,percent:50}
  ]);
});

test('best stored result never decreases', () => {
  const map = new Map();
  const storage = {
    getItem:k => map.has(k) ? map.get(k) : null,
    setItem:(k,v) => map.set(k,String(v))
  };
  saveBlockBest('divisibility-detector:5:detector',80,storage);
  saveBlockBest('divisibility-detector:5:detector',60,storage);
  assert.equal(loadBlockBest('divisibility-detector:5:detector',storage),80);
  saveBlockBest('divisibility-detector:5:detector',90,storage);
  assert.equal(loadBlockBest('divisibility-detector:5:detector',storage),90);
});
