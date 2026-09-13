import { createTask as createCoreTask, pickTaskSet as pickCoreTaskSet, VALUE_POOLS, plainNumber, superscript } from './generator-core.js';
import { getPrefix } from './data.js';

const SUPER = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};

function powerLabel(exponent) {
  return `10${String(exponent).split('').map(char => SUPER[char] ?? char).join('')}`;
}

function numberFromPrompt(prompt) {
  const match = String(prompt ?? '').replace(',', '.').match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)/);
  return match ? Number(match[0]) : NaN;
}

function fixMassPrefixEquivalence(task) {
  if (task?.blockId !== 'prefix-drill' || task?.metadata?.fromUnitId !== 'mg' || task.answerType !== 'number-unit') return task;
  const sourceNumber = numberFromPrompt(task.prompt);
  if (!Number.isFinite(sourceNumber)) return task;
  const converted = sourceNumber * 1e-3;
  return {
    ...task,
    prompt:`Переведи ${plainNumber(sourceNumber)} мг в г.`,
    answer:{number:converted, unitId:'g'},
    solutionSteps:[`милли = 0,001.`, `${plainNumber(sourceNumber)} мг = ${plainNumber(converted)} г.`],
    metadata:{...task.metadata,toUnitId:'g',unitOptions:['g','mg']},
  };
}

function fixExponentPresentation(task) {
  if (task?.mode !== '89' || task?.blockId !== 'prefix-drill' || task.answerType !== 'choice') return task;
  const prefixId = task.metadata?.prefixId;
  if (!prefixId || !/показателю степени 10/.test(task.prompt || '')) return task;
  const prefix = getPrefix(prefixId);
  return {
    ...task,
    choices:(task.choices || []).map(value => powerLabel(Number(value))),
    answer:powerLabel(prefix.exponent),
  };
}

function fixPrefixPowerTerminology(task) {
  if (task?.mode !== '89' || task?.blockId !== 'prefix-power' || task.answerType !== 'multi-part') return task;
  if (!task.answer || !Object.hasOwn(task.answer, 'mantissa') || !Object.hasOwn(task.answer, 'exponent')) return task;
  const { mantissa, exponent, unitId } = task.answer;
  return {
    ...task,
    answer:{prefixMantissa:mantissa,prefixExponent:exponent,unitId},
    solutionSteps:[
      ...(task.solutionSteps || []),
      'Это промежуточная запись после замены приставки степенью десяти; первое число здесь ещё не обязано быть мантиссой стандартного вида.'
    ],
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
    choices:['гига','мега','кило','гекто','деци','санти','милли','микро','нано'],
    answer:prefix.name,
    hintKey:'prefix-name',
    solutionSteps:[`${powerLabel(prefix.exponent)} соответствует приставке «${prefix.name}».`],
  };
}

function shuffleMantissaChoices(task, rng = Math.random) {
  if (task?.blockId !== 'mantissa-warmup' || task.answerType !== 'choice' || !Array.isArray(task.choices)) return task;
  const choices = [...task.choices];
  for (let i = choices.length - 1; i > 0; i -= 1) {
    const raw = Number(rng());
    const normalized = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.999999999999) : 0;
    const j = Math.floor(normalized * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return {...task, choices};
}

function normalizeTask(task) {
  return fixPrefixPowerTerminology(fixExponentPresentation(fixMassPrefixEquivalence(task)));
}

export function createTask(args) {
  return shuffleMantissaChoices(normalizeTask(createCoreTask(args)), args.rng);
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
    const hasNormalization = tasks.some(task => task.answerType === 'multi-part' && /мантисс|· 10/.test((task.solutionSteps || []).join(' ')));
    if (!hasNormalization) {
      const normalized = normalizeTask(createCoreTask({mode:'89',blockId:'mantissa-shift',rng:args.rng}));
      tasks[0] = {
        ...normalized,
        id:`89|mixed|forced-normalization|${normalized.id}`,
        signature:`89|mixed|forced-normalization|${normalized.signature}`,
        blockId:'mixed',
        ruleKey:'mixed',
      };
    }
  }

  return tasks.map(task => shuffleMantissaChoices(task, args.rng));
}

export { VALUE_POOLS, plainNumber, superscript };
