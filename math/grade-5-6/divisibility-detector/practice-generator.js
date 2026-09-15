import { divisibilitySet, commonDivisibilitySet, gcd } from './logic.js';

const SUPPORTED = [2,3,5,9,10];
const GCD_PRIMES = [2,3,5,7];
const DEFAULT_COUNTS = {
  'yes-no':10,
  detector:11,
  pair:4,
  fractions:4,
  gcd:5,
  'gcd-fractions':3,
};

function randomInt(rng,min,max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick(rng,items) {
  return items[Math.min(items.length - 1,Math.floor(rng() * items.length))];
}

function digitSum(number) {
  return String(Math.abs(number)).split('').reduce((sum,digit) => sum + Number(digit),0);
}

function skillsForDivisor(divisor) {
  const skills = [String(divisor)];
  if (divisor === 3 || divisor === 9) skills.push('3/9');
  if (divisor === 5 || divisor === 10) skills.push('5/10');
  return skills;
}

function numberForDivisor(divisor,shouldDivide,rng) {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const number = randomInt(rng,102,996);
    if ((number % divisor === 0) === shouldDivide) return number;
  }
  const base = randomInt(rng,12,98) * divisor;
  return shouldDivide ? base : base + 1;
}

function focusedDivisors(skillFilter = []) {
  const focus = new Set(skillFilter.map(String));
  if (focus.has('3/9')) return [3,9];
  if (focus.has('5/10')) return [5,10];
  const direct = SUPPORTED.filter(divisor => focus.has(String(divisor)));
  return direct.length ? direct : SUPPORTED;
}

function yesNoTask(rng,skillFilter = []) {
  const divisor = pick(rng,focusedDivisors(skillFilter));
  const shouldDivide = rng() < 0.55;
  const number = numberForDivisor(divisor,shouldDivide,rng);
  const sum = digitSum(number);
  const last = number % 10;
  const correctId = shouldDivide ? 'correct-yes' : 'correct-no';
  const correctText = [3,9].includes(divisor)
    ? `${String(number).split('').join(' + ')} = ${sum}, а ${sum} ${shouldDivide ? '' : 'не '}делится на ${divisor}`
    : `Последняя цифра ${last}${divisor === 2 ? (shouldDivide ? ' — чётная' : ' — нечётная') : divisor === 5 ? (shouldDivide ? ' — 0 или 5' : ' — не 0 и не 5') : (shouldDivide ? ' — 0' : ' — не 0')}`;
  const distractors = [3,9].includes(divisor)
    ? [
        {id:'last-digit',text:`Последняя цифра ${last}`},
        {id:'number-has-divisor',text:`В записи числа встречается цифра ${String(divisor).slice(-1)}`},
      ]
    : [
        {id:'digit-sum',text:`Сумма цифр равна ${sum}`},
        {id:'number-even',text:`Число ${number % 2 === 0 ? 'чётное' : 'нечётное'}`},
      ];
  return {
    id:`gen-yn-${number}-${divisor}`,
    type:'yes-no-reason',
    skills:skillsForDivisor(divisor),
    prompt:`Делится ли ${number} на ${divisor}?`,
    number,
    divisor,
    reasons:[{id:correctId,text:correctText},...distractors],
    answer:{yes:shouldDivide,reasonId:correctId},
  };
}

function detectorNumber(rng,skillFilter = []) {
  const focus = new Set(skillFilter.map(String));

  if (focus.has('3/9')) {
    return numberForDivisor(3,true,rng);
  }

  if (focus.has('5/10')) {
    const base = randomInt(rng,11,99) * 10;
    return rng() < 0.5 ? base : base + 5;
  }

  const direct = SUPPORTED.filter(divisor => focus.has(String(divisor)));
  if (direct.length) {
    const divisor = pick(rng,direct);
    return numberForDivisor(divisor,rng() < 0.55,rng);
  }

  return randomInt(rng,102,996);
}

function detectorTask(rng,skillFilter = [],errorMode = false) {
  const number = detectorNumber(rng,skillFilter);
  const skills = ['2','3','5','9','10','3/9','5/10'];
  if (!errorMode) {
    return {id:`gen-det-${number}`,type:'detector',skills,prompt:'Выбери все подходящие признаки',number};
  }
  const expected = divisibilitySet(number);
  const toggle = pick(rng,SUPPORTED);
  const shownDivisors = expected.includes(toggle)
    ? expected.filter(value => value !== toggle)
    : [...expected,toggle].sort((a,b) => a-b);
  return {id:`gen-det-error-${number}-${toggle}`,type:'detector-error',skills,prompt:'Ученик отметил признаки. Найди ошибку.',number,shownDivisors};
}

function pairTask(rng,skillFilter = [],wantCommon = true) {
  const focus = focusedDivisors(skillFilter);
  for (let attempt = 0; attempt < 300; attempt += 1) {
    const left = randomInt(rng,24,198);
    const right = randomInt(rng,24,198);
    if (left === right) continue;
    if (skillFilter.length && !focus.some(divisor => left % divisor === 0 || right % divisor === 0)) continue;
    const common = commonDivisibilitySet(left,right);
    if (wantCommon && !common.length) continue;
    if (!wantCommon && common.length) continue;
    return {id:`gen-pair-${left}-${right}`,type:'pair',skills:['2','3','5','9','10','3/9','5/10'],prompt:common.length ? 'Что подходит обоим?' : 'Есть ли изученный признак, подходящий обоим?',left,right};
  }
  return wantCommon
    ? {id:'gen-pair-84-126',type:'pair',skills:['2','3','9'],prompt:'Что подходит обоим?',left:84,right:126}
    : {id:'gen-pair-14-25',type:'pair',skills:['2','5'],prompt:'Есть ли изученный признак, подходящий обоим?',left:14,right:25};
}

function fractionPair(rng) {
  const factor = pick(rng,[2,3,5,6,9,10]);
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const left = randomInt(rng,3,18);
    const right = randomInt(rng,4,20);
    if (left !== right && gcd(left,right) === 1) {
      return {numerator:left * factor,denominator:right * factor};
    }
  }
  return {numerator:5 * factor,denominator:7 * factor};
}

function fractionTask(rng,errorMode = false) {
  if (!errorMode) {
    const {numerator,denominator} = fractionPair(rng);
    const common = SUPPORTED.filter(divisor => numerator % divisor === 0 && denominator % divisor === 0);
    return {id:`gen-frac-${numerator}-${denominator}`,type:'fraction-step',skills:['fraction',...common.map(String)],prompt:'Сократи дробь по шагам',numerator,denominator};
  }
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const {numerator,denominator} = fractionPair(rng);
    const invalid = SUPPORTED.filter(divisor => numerator % divisor !== 0 || denominator % divisor !== 0);
    if (!invalid.length) continue;
    const shownDivisor = pick(rng,invalid);
    return {id:`gen-frac-error-${numerator}-${denominator}-${shownDivisor}`,type:'fraction-error',skills:['fraction',String(shownDivisor)],prompt:'Найди ошибочный шаг',numerator,denominator,shownDivisor};
  }
  return {id:'gen-frac-error-150-216-10',type:'fraction-error',skills:['fraction','10'],prompt:'Найди ошибочный шаг',numerator:150,denominator:216,shownDivisor:10};
}

function coprimePair(rng) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const left = randomInt(rng,2,12);
    const right = randomInt(rng,2,12);
    if (left !== right && gcd(left,right) === 1) return [left,right];
  }
  return [5,7];
}

function gcdPair(rng,allowOne = true) {
  const factors = allowOne
    ? [1,2,3,4,5,6,7,8,9,10,12,14,15,18,20,21,25,27,28,30,35,42]
    : [4,6,8,9,10,12,14,15,18,20,21,25,27,28,30,35,42];
  const common = pick(rng,factors);
  const [a,b] = coprimePair(rng);
  return {left:common * a,right:common * b,common};
}

function gcdTask(rng,errorMode = false) {
  if (!errorMode) {
    const {left,right} = gcdPair(rng,true);
    return {id:`gen-gcd-${left}-${right}`,type:'gcd',skills:['gcd-divisor','gcd-arithmetic','gcd-finish'],prompt:'Найди НОД',left,right};
  }
  const {left,right,common} = gcdPair(rng,false);
  const divisors = GCD_PRIMES.filter(value => common % value === 0 && value < common);
  const claimedGcd = divisors.length ? pick(rng,divisors) : 2;
  return {
    id:`gen-gcd-error-${left}-${right}-${claimedGcd}`,
    type:'gcd-error',skills:['gcd-finish'],prompt:'Оцени готовое решение',left,right,claimedGcd,
    reduced:{numerator:left / claimedGcd,denominator:right / claimedGcd},
  };
}

function gcdFractionTask(rng) {
  const {left:numerator,right:denominator} = gcdPair(rng,true);
  return {id:`gen-gcd-frac-${numerator}-${denominator}`,type:'fraction-gcd',skills:['gcd-divisor','gcd-arithmetic','gcd-finish','fraction'],prompt:gcd(numerator,denominator) === 1 ? 'Можно ли сократить через НОД?' : 'Сократи дробь через НОД',numerator,denominator};
}

function candidateFor(blockId,rng,skillFilter,index,count) {
  if (blockId === 'yes-no') return yesNoTask(rng,skillFilter);
  if (blockId === 'detector') return detectorTask(rng,skillFilter,index === count - 1);
  if (blockId === 'pair') return pairTask(rng,skillFilter,(index + 1) % 5 !== 0);
  if (blockId === 'fractions') return fractionTask(rng,index === count - 1);
  if (blockId === 'gcd') return gcdTask(rng,index === count - 1);
  if (blockId === 'gcd-fractions') return gcdFractionTask(rng);
  return null;
}

export function taskSignature(task) {
  if (!task) return '';
  if (task.type === 'yes-no-reason') return `yn:${task.number}:${task.divisor}`;
  if (task.type === 'detector' || task.type === 'detector-error') return `${task.type}:${task.number}:${(task.shownDivisors ?? []).join(',')}`;
  if (task.type === 'pair' || task.type === 'gcd' || task.type === 'gcd-error') return `${task.type}:${task.left}:${task.right}:${task.claimedGcd ?? ''}`;
  if (task.type === 'fraction-step' || task.type === 'fraction-error' || task.type === 'fraction-gcd') return `${task.type}:${task.numerator}:${task.denominator}:${task.shownDivisor ?? ''}`;
  return `${task.type}:${task.id}`;
}

export function generatePracticeTasks(grade,blockId,{rng = Math.random,recentSignatures = [],skillFilter = [],count} = {}) {
  void grade;
  if (blockId === 'learn') return null;
  const target = count ?? DEFAULT_COUNTS[blockId] ?? 0;
  if (!target) return [];
  const recent = new Set(recentSignatures);
  const used = new Set();
  const tasks = [];
  let attempts = 0;
  const maxAttempts = Math.max(500,target * 120);

  while (tasks.length < target && attempts < maxAttempts) {
    attempts += 1;
    const task = candidateFor(blockId,rng,skillFilter,tasks.length,target);
    if (!task) break;
    const signature = taskSignature(task);
    if (!signature || used.has(signature) || recent.has(signature)) continue;
    used.add(signature);
    tasks.push(task);
  }

  if (tasks.length < target) {
    while (tasks.length < target && attempts < maxAttempts * 2) {
      attempts += 1;
      const task = candidateFor(blockId,rng,skillFilter,tasks.length,target);
      if (!task) break;
      const signature = taskSignature(task);
      if (!signature || used.has(signature)) continue;
      used.add(signature);
      tasks.push(task);
    }
  }
  return tasks;
}

export function mergeRecentSignatures(previous = [],tasks = [],limit = 30) {
  const combined = [...previous,...tasks.map(taskSignature)].filter(Boolean);
  const unique = [];
  for (const signature of combined) {
    const oldIndex = unique.indexOf(signature);
    if (oldIndex >= 0) unique.splice(oldIndex,1);
    unique.push(signature);
  }
  return unique.slice(-limit);
}
