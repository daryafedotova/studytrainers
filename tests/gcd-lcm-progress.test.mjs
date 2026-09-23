import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, normalizeProfileName, createProfile, loadProfile, saveProfile, resetProfile, applyLevelResult } from '../react-apps/gcd-lcm-space/src/lib/progress-store.js';
function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return { getItem:k=>map.has(k)?map.get(k):null, setItem:(k,v)=>map.set(k,String(v)), removeItem:k=>map.delete(k), dump:()=>Object.fromEntries(map) };
}
test('profile names ignore case and surrounding spaces', () => {
  assert.equal(normalizeProfileName(' Маша '), 'маша');
  assert.equal(normalizeProfileName('МАША'), 'маша');
});
test('save and load resolve case variants to one profile', () => {
  const storage=memoryStorage(); const profile=createProfile('Маша'); saveProfile(profile,storage);
  assert.equal(loadProfile(' маша ',storage).displayName,'Маша');
});
test('corrupt storage returns null instead of throwing', () => {
  const storage=memoryStorage({[STORAGE_KEY]:'{broken'}); assert.doesNotThrow(()=>loadProfile('Маша',storage)); assert.equal(loadProfile('Маша',storage),null);
});
test('unknown storage version is ignored safely', () => {
  const storage=memoryStorage({[STORAGE_KEY]:JSON.stringify({version:99,profiles:{маша:{displayName:'Маша'}}})}); assert.equal(loadProfile('Маша',storage),null);
});
test('reset deletes only the selected profile', () => {
  const storage=memoryStorage(); saveProfile(createProfile('Маша'),storage); saveProfile(createProfile('Петя'),storage); resetProfile('МАША',storage);
  assert.equal(loadProfile('Маша',storage),null); assert.equal(loadProfile('Петя',storage).displayName,'Петя');
});
test('completing a level unlocks the next level and never lowers best stars', () => {
  let profile=createProfile('Маша');
  profile=applyLevelResult(profile,1,{stars:2,firstTryAccuracy:70,points:500,bestCombo:3,miniBossErrors:1});
  assert.equal(profile.levels['2'].unlocked,true);
  profile=applyLevelResult(profile,1,{stars:1,firstTryAccuracy:40,points:100,bestCombo:1,miniBossErrors:2});
  assert.equal(profile.levels['1'].bestStars,2); assert.equal(profile.levels['1'].attempts,2);
});
test('boss unlock is derived at eighteen stars', () => {
  let profile=createProfile('Лена');
  for (let level=1;level<=6;level+=1) profile=applyLevelResult(profile,level,{stars:3,firstTryAccuracy:100,points:100,bestCombo:5,miniBossErrors:0});
  assert.equal(profile.starsTotal,18); assert.equal(profile.bossUnlocked,true);
});
