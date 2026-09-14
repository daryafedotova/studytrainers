export function createTaskRecord(taskId, skills = []) {
  return { taskId, skills:[...skills], attempts:0, solved:false, hintUsed:false, ruleUsed:false, clean:false };
}

export function markRuleUsed(record) {
  return { ...record, ruleUsed:true, clean:false };
}

export function markHintUsed(record) {
  return { ...record, hintUsed:true, clean:false };
}

export function registerAttempt(record, ok) {
  const attempts = record.attempts + 1;
  const solved = record.solved || Boolean(ok);
  const clean = Boolean(ok) && attempts === 1 && !record.hintUsed && !record.ruleUsed;
  return { ...record, attempts, solved, clean:record.clean || clean };
}

export function isClean(record) {
  return Boolean(record?.clean);
}

export function summarize(records) {
  const total = records.length;
  const solved = records.filter(record => record.solved).length;
  const clean = records.filter(record => record.clean).length;
  const percent = total ? Math.round(clean * 100 / total) : 0;
  return { total, solved, clean, percent, mastered:percent >= 80 };
}

export function summarizeSkills(records) {
  const buckets = new Map();
  for (const record of records) {
    for (const skill of record.skills ?? []) {
      if (!buckets.has(skill)) buckets.set(skill,{skill,total:0,clean:0});
      const item = buckets.get(skill);
      item.total += 1;
      if (record.clean) item.clean += 1;
    }
  }
  return [...buckets.values()]
    .map(item => ({...item, percent:item.total ? Math.round(item.clean * 100 / item.total) : 0}))
    .sort((a,b) => a.skill.localeCompare(b.skill,'ru',{numeric:true}));
}

export function saveBlockBest(key, percent, storage = globalThis.localStorage) {
  if (!storage) return percent;
  const current = loadBlockBest(key, storage);
  const next = Math.max(current, Number(percent) || 0);
  storage.setItem(key,String(next));
  return next;
}

export function loadBlockBest(key, storage = globalThis.localStorage) {
  if (!storage) return 0;
  const value = Number(storage.getItem(key));
  return Number.isFinite(value) ? value : 0;
}
