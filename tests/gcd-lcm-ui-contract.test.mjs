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

test('App persistence handlers do not write storage from inside React state updater callbacks', () => {
  const app = read('../react-apps/gcd-lcm-space/src/App.jsx');
  assert.doesNotMatch(app, /setProfile\(current\s*=>[\s\S]{0,180}persist\(/);
  assert.match(app, /persist\(applyLevelResult\(profile,id,evaluation\)\)/);
  assert.match(app, /persist\(completeBoss\(profile,result\)\)/);
});

test('reduced-motion preference disables intense looping motion and confetti', () => {
  const css = read('../react-apps/gcd-lcm-space/src/styles.css');
  const level = read('../react-apps/gcd-lcm-space/src/components/LevelRunner.jsx');
  const boss = read('../react-apps/gcd-lcm-space/src/components/BossBattle.jsx');
  assert.match(css, /prefers-reduced-motion[\s\S]*animation-iteration-count:\s*1\s*!important/);
  assert.match(level, /disableForReducedMotion:\s*true/);
  assert.match(boss, /disableForReducedMotion:\s*true/);
});

test('level six briefing explicitly explains multiples and their number sequence', () => {
  const briefing = read('../react-apps/gcd-lcm-space/src/components/BriefingRenderer.jsx');
  assert.match(briefing, /делится[^.]*без остатка/i);
  assert.match(briefing, /9 · 1 = 9/);
  assert.match(briefing, /каждый раз прибавлять/i);
  assert.match(briefing, /общие кратные/i);
});

test('levels render distinct animated space environments and boss renders singularity arena', () => {
  const level = read('../react-apps/gcd-lcm-space/src/components/LevelRunner.jsx');
  const environment = read('../react-apps/gcd-lcm-space/src/components/LevelEnvironment.jsx');
  const boss = read('../react-apps/gcd-lcm-space/src/components/BossBattle.jsx');
  assert.match(level, /LevelEnvironment/);
  for (let id = 1; id <= 8; id += 1) assert.match(environment, new RegExp(`environment-${id}`));
  assert.match(boss, /singularity-arena/);
  assert.match(boss, /singularity-shard/);
});

test('campaign map uses responsive grid cards instead of absolute positioned mission nodes', () => {
  const map = read('../react-apps/gcd-lcm-space/src/components/CampaignMap.jsx');
  const css = read('../react-apps/gcd-lcm-space/src/styles.css');
  assert.match(map, /mission-grid/);
  assert.match(map, /motion\.button/);
  assert.match(css, /\.mission-grid\{[^}]*grid-template-columns:/);
  assert.match(css, /\.mission-grid \.mission-node\{[^}]*position:relative/);
});

test('campaign and level UI use larger game-style cards and typography', () => {
  const css = read('../react-apps/gcd-lcm-space/src/styles.css');
  assert.match(css, /\.mission-grid \.mission-node\{[^}]*min-height:210px/);
  assert.match(css, /\.task-card h2\{[^}]*font-size:clamp\(2\.15rem/);
  assert.match(css, /\.answer-button\{[^}]*min-height:96px/);
  assert.match(css, /box-shadow:0 18px 42px/);
});

test('app exposes independent procedural ambient music control', () => {
  const app = read('../react-apps/gcd-lcm-space/src/App.jsx');
  const shell = read('../react-apps/gcd-lcm-space/src/components/AppShell.jsx');
  const ambient = read('../react-apps/gcd-lcm-space/src/lib/ambient.js');
  assert.match(app, /musicOn/);
  assert.match(app, /createAmbientSoundscape/);
  assert.match(shell, /Музыка/);
  assert.match(ambient, /AudioContext/);
  assert.match(ambient, /return \(\) =>/);
});

test('start screen has richer game-style cosmic hero content', () => {
  const profile = read('../react-apps/gcd-lcm-space/src/components/ProfileGate.jsx');
  const css = read('../react-apps/gcd-lcm-space/src/styles.css');
  assert.match(profile, /start-space-scene/);
  assert.match(profile, /mission-preview-grid/);
  assert.match(profile, /launch-panel/);
  assert.match(profile, /Сканируй множители/);
  assert.match(profile, /Собирай НОД и НОК/);
  assert.match(css, /\.start-space-scene/);
  assert.match(css, /\.mission-preview-card/);
  assert.match(css, /box-shadow:0 20px 48px/);
});

test('ambient soundtrack uses brighter upper-register major-pentatonic material', () => {
  const ambient = read('../react-apps/gcd-lcm-space/src/lib/ambient.js');
  assert.doesNotMatch(ambient, /frequency:\s*110\b/);
  assert.match(ambient, /PAD_NOTES/);
  assert.match(ambient, /ARPEGGIO/);
  assert.match(ambient, /392/);
  assert.match(ambient, /493\.88/);
  assert.match(ambient, /783\.99/);
  assert.match(ambient, /master\.gain\.value\s*=\s*0\.0(?:1[0-8]|0[5-9])/);
});
