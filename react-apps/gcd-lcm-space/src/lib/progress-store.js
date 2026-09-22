import { deriveAchievements, rankFor } from './scoring.js';

export const STORAGE_KEY = 'studytrainers.gcd-lcm-space.v1';
const VERSION = 1;
export const normalizeProfileName = name => String(name ?? '').trim().toLocaleLowerCase('ru-RU');

function makeLevel(id) {
  return { unlocked: id === 1, completed: false, bestStars: 0, bestFirstTryAccuracy: 0, bestMiniBossErrors: null, bestCombo: 0, attempts: 0 };
}
export function createProfile(displayName) {
  const clean = String(displayName ?? '').trim();
  if (!clean) throw new RangeError('displayName is required');
  const now = new Date().toISOString();
  const levels = Object.fromEntries(Array.from({length:8}, (_,i) => [String(i + 1), makeLevel(i + 1)]));
  return deriveProfile({ displayName: clean, createdAt: now, updatedAt: now, levels, expeditionPoints: 0, achievements: [], bossDefeated: false, bestBossResult: null });
}
function blankRoot() { return { version: VERSION, profiles: {} }; }
function readRoot(storage) {
  try {
    const raw = storage?.getItem?.(STORAGE_KEY);
    if (!raw) return blankRoot();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== VERSION || !parsed.profiles || typeof parsed.profiles !== 'object') return blankRoot();
    return parsed;
  } catch { return blankRoot(); }
}
function writeRoot(root, storage) { storage?.setItem?.(STORAGE_KEY, JSON.stringify(root)); }
export function deriveProfile(profile) {
  const levels = profile.levels ?? {};
  const starsTotal = Object.values(levels).reduce((sum, level) => sum + (Number(level.bestStars) || 0), 0);
  const bossUnlocked = starsTotal >= 18;
  const rank = rankFor({ starsTotal, bossDefeated: Boolean(profile.bossDefeated) });
  const achievements = deriveAchievements({ levels });
  return { ...profile, starsTotal, bossUnlocked, rank, achievements };
}
export function loadProfile(name, storage = globalThis.localStorage) {
  const key = normalizeProfileName(name);
  if (!key) return null;
  const root = readRoot(storage);
  const found = root.profiles[key];
  return found ? deriveProfile(structuredCloneSafe(found)) : null;
}
export function saveProfile(profile, storage = globalThis.localStorage) {
  const normalized = normalizeProfileName(profile?.displayName);
  if (!normalized) throw new RangeError('profile displayName is required');
  const root = readRoot(storage);
  const previous = root.profiles[normalized];
  const next = deriveProfile({ ...structuredCloneSafe(profile), displayName: previous?.displayName ?? String(profile.displayName).trim(), createdAt: previous?.createdAt ?? profile.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() });
  root.profiles[normalized] = next;
  writeRoot(root, storage);
  return structuredCloneSafe(next);
}
export function resetProfile(name, storage = globalThis.localStorage) {
  const key = normalizeProfileName(name);
  if (!key) return;
  const root = readRoot(storage);
  delete root.profiles[key];
  writeRoot(root, storage);
}
export function applyLevelResult(profile, levelId, evaluation) {
  const id = Number(levelId);
  if (!Number.isInteger(id) || id < 1 || id > 8) throw new RangeError('unknown level');
  const next = structuredCloneSafe(profile);
  const key = String(id);
  const current = next.levels[key] ?? makeLevel(id);
  const miniErrors = Number(evaluation.miniBossErrors ?? 0);
  next.levels[key] = { ...current, unlocked: true, completed: true, bestStars: Math.max(current.bestStars || 0, Number(evaluation.stars) || 1), bestFirstTryAccuracy: Math.max(current.bestFirstTryAccuracy || 0, Number(evaluation.firstTryAccuracy) || 0), bestMiniBossErrors: current.bestMiniBossErrors == null ? miniErrors : Math.min(current.bestMiniBossErrors, miniErrors), bestCombo: Math.max(current.bestCombo || 0, Number(evaluation.bestCombo) || 0), attempts: (current.attempts || 0) + 1 };
  if (id < 8) next.levels[String(id + 1)] = { ...(next.levels[String(id + 1)] ?? makeLevel(id + 1)), unlocked: true };
  next.expeditionPoints = (Number(next.expeditionPoints) || 0) + (Number(evaluation.points) || 0);
  next.updatedAt = new Date().toISOString();
  return deriveProfile(next);
}
export function completeBoss(profile, result) {
  const next = structuredCloneSafe(profile);
  const old = next.bestBossResult;
  const better = !old || result.livesRemaining > old.livesRemaining || (result.livesRemaining === old.livesRemaining && result.bestCombo > old.bestCombo);
  next.bossDefeated = true;
  if (better) next.bestBossResult = structuredCloneSafe(result);
  next.expeditionPoints = (Number(next.expeditionPoints) || 0) + 1000 + Math.max(0, Number(result.livesRemaining) || 0) * 250;
  next.updatedAt = new Date().toISOString();
  return deriveProfile(next);
}
function structuredCloneSafe(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
