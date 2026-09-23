import test from 'node:test';
import assert from 'node:assert/strict';
import { playTone } from '../react-apps/gcd-lcm-space/src/lib/audio.js';

test('audio helper is a safe no-op outside the browser', () => {
  assert.doesNotThrow(() => playTone('correct', true));
  assert.doesNotThrow(() => playTone('wrong', false));
});
