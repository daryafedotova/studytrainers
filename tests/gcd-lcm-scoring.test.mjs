import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLevelAttempt, rankFor } from '../react-apps/gcd-lcm-space/src/lib/scoring.js';
const attempt = (correct, total, miniBossErrors, hints = 0, bestCombo = correct) => ({firstTryCorrect:correct,total,miniBossErrors,hintsUsed:hints,bestCombo});
test('65 percent boundary earns two stars with at most one miniboss error', () => { assert.equal(evaluateLevelAttempt(attempt(13,20,1)).stars, 2); });
test('85 percent boundary needs a perfect miniboss for three stars', () => {
  assert.equal(evaluateLevelAttempt(attempt(17,20,0,0)).stars, 3);
  assert.equal(evaluateLevelAttempt(attempt(17,20,1,0)).stars, 2);
  assert.equal(evaluateLevelAttempt(attempt(17,20,0,1)).stars, 3);
});
test('completed weak attempt still earns one star', () => { assert.equal(evaluateLevelAttempt(attempt(3,10,3,4)).stars, 1); });
test('rank rises with stars and boss victory overrides the ladder', () => {
  assert.equal(rankFor({starsTotal:0,bossDefeated:false}), 'Курсант');
  assert.equal(rankFor({starsTotal:10,bossDefeated:false}), 'Навигатор');
  assert.equal(rankFor({starsTotal:23,bossDefeated:false}), 'Командир экспедиции');
  assert.equal(rankFor({starsTotal:8,bossDefeated:true}), 'Мастер числовой галактики');
});
