import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTask, feedbackFor } from '../math/grade-5-6/divisibility-detector/validation.js';

const yesNo = {
  type:'yes-no-reason', divisor:3, number:738,
  answer:{yes:true,reasonId:'sum-18-div3'}
};

test('yes/no requires both conclusion and reason', () => {
  assert.equal(validateTask(yesNo,{yes:true,reasonId:'sum-18-div3'}).ok,true);
  const result = validateTask(yesNo,{yes:true,reasonId:'last-digit'});
  assert.equal(result.ok,false);
  assert.equal(result.details.conclusion,true);
  assert.equal(result.details.reason,false);
});

test('detector requires exact complete set', () => {
  const task = {type:'detector',number:735};
  assert.equal(validateTask(task,{divisors:[3,5]}).ok,true);
  assert.equal(validateTask(task,{divisors:[5]}).ok,false);
  assert.equal(validateTask(task,{divisors:[3,5,10]}).ok,false);
});

test('detector-error requires correcting supplied wrong set', () => {
  const task = {type:'detector-error',number:435,shownDivisors:[3,5,10]};
  assert.equal(validateTask(task,{divisors:[3,5]}).ok,true);
  assert.equal(validateTask(task,{divisors:[3,5,10]}).ok,false);
});

test('pair response must be correct for both numbers before intersection is accepted', () => {
  const task = {type:'pair',left:126,right:180};
  assert.equal(validateTask(task,{left:[2,3,9],right:[2,3,5,9,10]}).ok,true);
  assert.equal(validateTask(task,{left:[2,3],right:[2,3,5,9,10]}).ok,false);
});

test('grade-5 fraction accepts any valid current divisor', () => {
  const task = {type:'fraction-step',numerator:126,denominator:180};
  assert.equal(validateTask(task,{divisor:9}).ok,true);
  assert.equal(validateTask(task,{divisor:3}).ok,true);
  assert.equal(validateTask(task,{divisor:2}).ok,true);
  assert.equal(validateTask(task,{divisor:5}).ok,false);
});

test('fraction-error recognizes invalid shown divisor', () => {
  const task = {type:'fraction-error',numerator:150,denominator:216,shownDivisor:10};
  assert.equal(validateTask(task,{diagnosis:'invalid-divisor'}).ok,true);
  assert.equal(validateTask(task,{diagnosis:'all-correct'}).ok,false);
});

test('gcd quotient fields are validated independently', () => {
  const task = {type:'gcd',left:84,right:126,phase:'quotients',divisor:2};
  const result = validateTask(task,{left:'41',right:'63'});
  assert.equal(result.ok,false);
  assert.deepEqual(result.details,{left:false,right:true});
});

test('early no-more-common is rejected while a supported common prime exists', () => {
  const task = {type:'gcd',left:14,right:21,phase:'choose-divisor'};
  assert.equal(validateTask(task,{noMore:true}).ok,false);
  assert.equal(validateTask({...task,left:14,right:25},{noMore:true}).ok,true);
});

test('gcd error distinguishes partial reduction from true gcd', () => {
  const task = {type:'gcd-error',left:48,right:72,claimedGcd:12,reduced:{numerator:4,denominator:6}};
  assert.equal(validateTask(task,{diagnosis:'valid-reduction-wrong-gcd'}).ok,true);
  assert.equal(validateTask(task,{diagnosis:'all-correct'}).ok,false);
});

test('first and second feedback differ', () => {
  const task = {type:'detector',number:735};
  const result = validateTask(task,{divisors:[5]});
  assert.match(feedbackFor(task,result,1).text,/сумм/i);
  assert.match(feedbackFor(task,result,2).text,/7\s*\+\s*3\s*\+\s*5/);
});

test('after reducing 126/180 by 9, only supported common divisor 2 remains', async () => {
  const { reduceFractionBy, availableReductionDivisors } = await import('../math/grade-5-6/divisibility-detector/logic.js');
  const next = reduceFractionBy(126,180,9);
  assert.deepEqual(next,{numerator:14,denominator:20});
  assert.deepEqual(availableReductionDivisors(next.numerator,next.denominator),[2]);
});
