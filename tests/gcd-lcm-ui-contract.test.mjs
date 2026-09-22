import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('final result card exposes PNG save and campaign summary', () => {
  const source = read('../react-apps/gcd-lcm-space/src/components/ResultCard.jsx');
  assert.match(source, /Сохранить PNG/);
  assert.match(source, /24/);
  assert.match(source, /Ядро Сингулярности побеждено/);
  assert.match(source, /canvas\.toBlob/);
});

test('level and boss flows use the shared sound helper and celebratory confetti', () => {
  const level = read('../react-apps/gcd-lcm-space/src/components/LevelRunner.jsx');
  const boss = read('../react-apps/gcd-lcm-space/src/components/BossBattle.jsx');
  assert.match(level, /LevelRunner\(\{[^}]*soundOn/);
  assert.match(level, /playTone\(correct\?'correct':'wrong',soundOn\)/);
  assert.match(level, /confetti\(\{particleCount:/);
  assert.match(boss, /BossBattle\(\{[^}]*soundOn/);
  assert.match(boss, /playTone\(correct\?\(next\.critical\?'critical':'correct'\):'life',soundOn\)/);
  assert.match(boss, /confetti\(\{particleCount:/);
});
