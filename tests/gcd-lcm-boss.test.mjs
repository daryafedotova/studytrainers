import test from 'node:test';
import assert from 'node:assert/strict';
import {createBossState,applyBossAnswer,bossCanAdvance,advanceBossPhase} from '../react-apps/gcd-lcm-space/src/lib/scoring.js';
test('boss starts with three lives',()=>{assert.equal(createBossState([4,3,4]).lives,3);});
test('each wrong submission removes exactly one life and resets combo',()=>{let s={...createBossState([4,3,4]),combo:2};s=applyBossAnswer(s,{correct:false,skill:'lcm'});assert.equal(s.lives,2);assert.equal(s.combo,0);assert.equal(s.errors.lcm,1);});
test('three wrong answers cause defeat',()=>{let s=createBossState([4,3,4]);for(let i=0;i<3;i+=1)s=applyBossAnswer(s,{correct:false,skill:'gcd'});assert.equal(s.status,'defeat');});
test('critical damage never skips mandatory phase tasks',()=>{let s={...createBossState([4,3,4]),combo:2};s=applyBossAnswer(s,{correct:true,skill:'factorization'});assert.equal(s.critical,true);assert.equal(bossCanAdvance(s),false);assert.equal(s.completedInPhase,1);});
test('advancing phase resets local completion but preserves lives and combo',()=>{let s=createBossState([1,1,1]);s=applyBossAnswer(s,{correct:true,skill:'factorization'});assert.equal(bossCanAdvance(s),true);s=advanceBossPhase(s);assert.equal(s.phase,2);assert.equal(s.completedInPhase,0);assert.equal(s.lives,3);assert.equal(s.combo,1);});
