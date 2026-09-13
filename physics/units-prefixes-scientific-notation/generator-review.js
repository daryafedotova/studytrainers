import { createTask as createCoreTask, pickTaskSet as pickCoreTaskSet, VALUE_POOLS, plainNumber, superscript } from './generator.js';
import { getPrefix } from './data.js';

const SUPER = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};

function powerLabel(exponent) {
  return `10${String(exponent).split('').map(char => SUPER[char] ?? char).join('')}`;
}

function fixMassPrefixEquivalence(task) {
  if (task?.blockId !== 'prefix-drill' || task?.metadata?.fromUnitId !== 'mg' || task.answerType !== 'number-unit') return task;
  const sourceNumber = Number(String(task.prompt).replace(',', '.').match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)/)?.[0] ?? NaN);
  if (!Number.isFinite(sourceNumber)) return task;
  return {
    ...task,
    prompt:`Переведи ${plainNumber(sourceNumber)} мг в г.`,
    answer:{number:sourceNumber * 1e-3, unitId:'g'},
    solutionSteps:[`милли = 0,001.`, `${plainNumber(sourceNumber)} мг = ${plainNumber(sourceNumber * 1e-3)} г.`],
    metadata:{...task.metadata,toUnitId:'g',unitOptions:['g','mg']},
  };
}

function fixExponentPresentation(task) {
  if (task?.mode !== '89' || task?.blockId !== 'prefix-drill' || task.answerType !== 'choice') return task;
  const prefixId = task.metadata?.prefixId;
  if (!prefixId) return task;
  const prefix = getPrefix(prefixId);
  const asksExponent = /показателю степени 10/.test(task.prompt || '');
  if (!asksExponent) return task;
  return {
    ...task,
    choices:(task.choices || []).map(value => powerLabel(Number(value))),
    answer:powerLabel(prefix.exponent),
  };
}

function reversePrefixTask(task, index) {
  if (task?.mode !== '89' || task?.blockId !== 'prefix-drill' || !task.metadata?.prefixId) return task;
  const prefix = getPrefix(task.metadata.prefixId);
  return {
    ...task,
    id:`${task.signature}|reverse-${index}`,
    signature:`${task.signature}|reverse-${index}`,
    answerType:'choice',
    prompt:`Как называется приставка, соответствующая ${powerLabel(prefix.exponent)}?`,
    choices:['гига','мега','кило','гекто','дека','деци','санти','милли','микро','нано'],
    answer:prefix.name,
    hintKey:'prefix-name',
    solutionSteps:[`${powerLabel(prefix.exponent)} соответствует приставке «${prefix.name}».`],
  };
}

function normalizeTask(task) {
  return fixExponentPresentation(fixMassPrefixEquivalence(task));
}

export function createTask(args) {
  return normalizeTask(createCoreTask(args));
}

export function pickTaskSet(args) {
  let tasks = pickCoreTaskSet(args).map(normalizeTask);
  if (args.mode === '89' && args.blockId === 'prefix-drill' && tasks.length >= 5) {
    const eligible = tasks.map((task,index)=>({task,index})).filter(item => item.task.metadata?.prefixId && !item.task.metadata?.rarePrefix);
    for (let i = 0; i < Math.min(2, eligible.length); i += 1) {
      const {index} = eligible[i];
      tasks[index] = reversePrefixTask(tasks[index], i);
    }
  }
  if (args.mode === '89' && args.blockId === 'mixed' && tasks.length) {
    const hasNormalization = tasks.some(task => /нормализ|мантисс|· 10/.test((task.solutionSteps || []).join(' ')) && task.answerType === 'multi-part');
    if (!hasNormalization) {
      const normalized = normalizeTask(createCoreTask({mode:'89',blockId:'mantissa-shift',rng:args.rng}));
      tasks[0] = {...normalized, id:`89|mixed|forced-normalization|${normalized.id}`, signature:`89|mixed|forced-normalization|${normalized.signature}`, blockId:'mixed', ruleKey:'mixed'};
    }
  }
  return tasks;
}

export { VALUE_POOLS, plainNumber, superscript };
