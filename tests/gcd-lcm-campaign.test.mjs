import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN_LEVELS, getCampaignState } from '../react-apps/gcd-lcm-space/src/lib/campaign.js';
import { createProfile } from '../react-apps/gcd-lcm-space/src/lib/progress-store.js';
test('campaign contains eight ordered learning levels', () => { assert.equal(CAMPAIGN_LEVELS.length,8); assert.deepEqual(CAMPAIGN_LEVELS.map(x=>x.id),[1,2,3,4,5,6,7,8]); });
test('only first level is initially available', () => { const state=getCampaignState(createProfile('Ира')); assert.equal(state.levels[0].unlocked,true); assert.equal(state.levels[1].unlocked,false); assert.equal(state.bossUnlocked,false); });
test('boss stays locked at 17 stars and unlocks at 18', () => { const p=createProfile('Ира'); p.levels['1'].bestStars=3;p.levels['2'].bestStars=3;p.levels['3'].bestStars=3;p.levels['4'].bestStars=3;p.levels['5'].bestStars=3;p.levels['6'].bestStars=2;assert.equal(getCampaignState(p).bossUnlocked,false);p.levels['6'].bestStars=3;assert.equal(getCampaignState(p).bossUnlocked,true); });
