export function createTaskRecord(taskId) {
  return {taskId, attempts:0, hintUsed:false, ruleUsed:false, solved:false, clean:false};
}

export function markHintUsed(record) {
  return {...record, hintUsed:true, clean:false};
}

export function markRuleUsed(record) {
  return {...record, ruleUsed:true, clean:false};
}

export function registerAttempt(record, correct) {
  const attempts = record.attempts + 1;
  const clean = Boolean(correct && attempts === 1 && !record.hintUsed && !record.ruleUsed);
  return {...record, attempts, solved:record.solved || Boolean(correct), clean:record.clean || clean};
}

export function isClean(record) {
  return record.clean === true;
}

export function summarize(records) {
  const total = records.length;
  const solved = records.filter(record => record.solved).length;
  const clean = records.filter(record => record.clean).length;
  const percent = total ? Math.round(clean / total * 100) : 0;
  return {total, solved, clean, percent, mastered:percent >= 80};
}

function storageKey(mode, blockId) {
  return `studytrainers:units-prefixes:${mode}:${blockId}`;
}

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

export function loadBestResult(mode, blockId, storage) {
  const target = resolveStorage(storage);
  if (!target) return null;
  const raw = target.getItem(storageKey(mode, blockId));
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 100 ? value : null;
}

export function saveBestResult(mode, blockId, percent, storage) {
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) throw new RangeError('percent must be an integer from 0 to 100');
  const target = resolveStorage(storage);
  if (!target) return percent;
  const current = loadBestResult(mode, blockId, target);
  if (current === null || percent > current) target.setItem(storageKey(mode, blockId), String(percent));
  return current === null ? percent : Math.max(current, percent);
}
