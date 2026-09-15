function mergeSkills(...groups) {
  return [...new Set(groups.flat().filter(value => value !== undefined && value !== null).map(String))];
}

export function createTaskRecord(taskId, skills = []) {
  return {
    taskId,
    skills:mergeSkills(skills),
    attempts:0,
    solved:false,
    hintUsed:false,
    ruleUsed:false,
    clean:false,
    skillErrors:[],
    assistedSkills:[],
  };
}

export function markRuleUsed(record, skills = record?.skills ?? []) {
  if (record?.solved) return record;
  return {
    ...record,
    ruleUsed:true,
    clean:false,
    assistedSkills:mergeSkills(record?.assistedSkills ?? [], skills),
  };
}

export function markHintUsed(record, skills = record?.skills ?? []) {
  return {
    ...record,
    hintUsed:true,
    clean:false,
    assistedSkills:mergeSkills(record?.assistedSkills ?? [], skills),
  };
}

export function registerAttempt(record, ok, skillErrors = []) {
  const attempts = record.attempts + 1;
  const solved = record.solved || Boolean(ok);
  const normalizedErrors = mergeSkills(skillErrors);
  const errors = mergeSkills(record.skillErrors ?? [], normalizedErrors);
  const skills = mergeSkills(record.skills ?? [], normalizedErrors);
  const clean = Boolean(ok) && attempts === 1 && !record.hintUsed && !record.ruleUsed;
  return { ...record, skills, attempts, solved, clean:record.clean || clean, skillErrors:errors };
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

function skillCleanForRecord(record, skill) {
  const hasPreciseDiagnostics = Array.isArray(record.skillErrors) || Array.isArray(record.assistedSkills);
  if (!hasPreciseDiagnostics) return Boolean(record.clean);
  const errors = new Set((record.skillErrors ?? []).map(String));
  const assisted = new Set((record.assistedSkills ?? []).map(String));
  return !errors.has(String(skill)) && !assisted.has(String(skill));
}

export function summarizeSkills(records) {
  const buckets = new Map();
  for (const record of records) {
    for (const skill of record.skills ?? []) {
      const key = String(skill);
      if (!buckets.has(key)) buckets.set(key,{skill:key,total:0,clean:0});
      const item = buckets.get(key);
      item.total += 1;
      if (skillCleanForRecord(record,key)) item.clean += 1;
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

export function hasBlockBest(key, storage = globalThis.localStorage) {
  return Boolean(storage && storage.getItem(key) !== null);
}
