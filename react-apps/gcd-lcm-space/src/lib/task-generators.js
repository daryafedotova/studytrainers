import {
  gcd, lcm, primeFactorization, factorizationToPowers,
  firstMultiples, isPrime, divisors
} from './math.js';

let sequence = 0;
const uid = prefix => `${prefix}-${++sequence}`;
const choice = (items, rng) => items[Math.floor(rng() * items.length)];
const shuffled = (items, rng) => [...items].sort(() => rng() - 0.5);
const sampleWithoutReplacement = (items, count, rng) => {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};
const product = values => values.reduce((acc, value) => acc * value, 1);

export const PAIR_FAMILIES = {
  coprime: [[8,15],[14,25],[16,27],[21,32]],
  'one-divides-other': [[12,36],[15,45],[18,54],[24,72]],
  'shared-prime-different-exponents': [[24,36],[40,100],[72,108],[48,80]],
  general: [[18,30],[42,70],[60,90],[84,126]]
};

const SUPER_DIGITS = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const toSuperscript = value => String(value).split('').map(char => SUPER_DIGITS[char] ?? char).join('');
function compactText(factors) {
  return factorizationToPowers(factors)
    .map(({prime, exponent}) => exponent === 1 ? String(prime) : `${prime}${toSuperscript(exponent)}`)
    .join(' · ');
}

function pairData(pairKind, rng) {
  const [a,b] = choice(PAIR_FAMILIES[pairKind], rng);
  return {a,b,pairKind};
}

function numericPairTask(operation, pairKind, rng, skill = operation, pairOverride = null) {
  const picked = pairOverride ? {a:pairOverride[0],b:pairOverride[1],pairKind:pairKind ?? 'mixed'} : pairData(pairKind, rng);
  const {a,b} = picked;
  pairKind = picked.pairKind;
  return {
    id: uid(operation), type: 'numeric',
    prompt: operation === 'gcd' ? `Найди НОД(${a}; ${b})` : `Найди НОК(${a}; ${b})`,
    data: {operation,a,b,pairKind,showWork:true},
    answer: operation === 'gcd' ? gcd(a,b) : lcm(a,b),
    skill,
    hint: operation === 'gcd'
      ? 'Разложи оба числа и возьми общие простые множители с наименьшими показателями.'
      : 'Собери минимальный набор простых множителей, которого хватает для обоих чисел.'
  };
}


function algorithmWorkbenchTask(operation, pairKind, rng, skill = operation, pairOverride = null) {
  const picked = pairOverride ? {a:pairOverride[0],b:pairOverride[1],pairKind:pairKind ?? 'mixed'} : pairData(pairKind, rng);
  const {a,b} = picked;
  const baseOperation = operation === 'common' ? 'gcd' : operation;
  const result = baseOperation === 'gcd' ? gcd(a,b) : lcm(a,b);
  const prompt = operation === 'common'
    ? `Разложи ${a} и ${b}, затем найди произведение их общих простых множителей.`
    : baseOperation === 'gcd'
      ? `Найди НОД(${a}; ${b}) по алгоритму.`
      : `Найди НОК(${a}; ${b}) по алгоритму.`;
  return {
    id:uid(`workbench-${operation}`), type:'algorithm-workbench', prompt,
    data:{
      operation,a,b,pairKind:picked.pairKind,
      factorsA:primeFactorization(a),factorsB:primeFactorization(b),
      resultFactors:primeFactorization(result)
    },
    answer:result, skill,
    hint:operation === 'lcm'
      ? 'Разложи оба числа, собери минимальный набор простых множителей для обоих чисел и перемножь его.'
      : 'Разложи оба числа, выбери общие простые множители и перемножь их.'
  };
}

function primeClassificationTask(rng) {
  const n = choice([1,2,3,4,5,7,9,11,15,17,21,23,25,29,31,35,37,49], rng);
  const answer = n === 1 ? 'Ни то ни другое' : isPrime(n) ? 'Простое' : 'Составное';
  return {
    id: uid('prime-class'), type:'choice', prompt:`Число ${n} — это…`,
    data:{number:n, options:['Простое','Составное','Ни то ни другое']}, answer,
    skill:'primes', hint:n === 1 ? 'У числа 1 только один натуральный делитель.' : 'Посчитай натуральные делители числа.'
  };
}

function primeMultiTask(rng) {
  const pool = shuffled([1,2,4,5,9,11,15,17,21,23], rng).slice(0,6).sort((a,b)=>a-b);
  return {
    id:uid('prime-multi'), type:'multi', prompt:'Отметь все простые числа.',
    data:{options:pool}, answer:pool.filter(n => n > 1 && isPrime(n)),
    skill:'primes', hint:'Простое число имеет ровно два натуральных делителя.'
  };
}

function compositeProofTask(rng) {
  const n = choice([12,15,21,25,27,35,49], rng);
  const valid = divisors(n).filter(d => d !== 1 && d !== n);
  const correct = choice(valid, rng);
  const distractors = [2,3,5,7,11,13,17]
    .filter(value => value < n && value !== correct && n % value !== 0)
    .slice(0,3);
  const candidates = shuffled([correct, ...distractors], rng);
  return {
    id:uid('proof'), type:'choice', prompt:`Какой делитель доказывает, что ${n} — составное?`,
    data:{number:n,options:candidates}, answer:correct,
    skill:'primes', hint:`Нужен делитель, отличный от 1 и ${n}.`
  };
}

function factorTreeTask(rng) {
  const number = choice([36,42,48,54,60,72,84,90], rng);
  const factors = primeFactorization(number);
  return {
    id:uid('tree'), type:'factor-tree', prompt:`Разложи ${number} на простые множители деревом.`,
    data:{number,factors}, answer:factors,
    skill:'factorization', hint:'Раскладывай только составные ветви; на концах должны остаться простые числа.'
  };
}

function factorBuilderTask(rng, skill='factorization') {
  const number = choice([24,30,36,40,45,50,54,60,72,75,84,90], rng);
  const factors = primeFactorization(number);
  return {
    id:uid('factor-build'), type:'factor-builder', prompt:`Собери разложение числа ${number}.`,
    data:{number,factors,mode:'factors',available:shuffled([...factors,2,3,5,7],rng)}, answer:factors,
    skill, hint:'Произведение выбранных простых множителей должно дать исходное число.'
  };
}

function nextPrimeDivisorTask(rng) {
  const number = choice([42,54,66,70,75,84,90,105], rng);
  const correct = primeFactorization(number)[0];
  return {
    id:uid('next-divisor'), type:'choice', prompt:`С какого простого делителя удобно начать разложение ${number}?`,
    data:{number,options:[2,3,5,7].filter(n => n <= number)}, answer:correct,
    skill:'factorization', hint:'Начинай с наименьшего простого числа, на которое делится исходное число.'
  };
}

function factorizationChoiceTask(rng) {
  const number = choice([36,48,60,72,90], rng);
  const factors = primeFactorization(number);
  const correct = compactText(factors);
  const wrong1 = compactText([...factors.slice(0,-1), choice([2,3,5,7],rng)]);
  const wrong2 = compactText(factors.slice(0,-1));
  const wrong3 = compactText([...factors, factors[0]]);
  return {
    id:uid('factor-choice'), type:'choice', prompt:`Выбери верное разложение числа ${number}.`,
    data:{number,factors,options:shuffled([...new Set([correct,wrong1,wrong2,wrong3])],rng)}, answer:correct,
    skill:'factorization', hint:'Проверь: все множители должны быть простыми, а их произведение — исходным числом.'
  };
}

function powerCompressionTask(rng) {
  const number = choice([24,36,40,54,72,90],rng);
  const factors = primeFactorization(number);
  const correct = compactText(factors);
  const powers = factorizationToPowers(factors);
  const options = [correct];
  if (powers[0]) options.push(powers.map((p,i)=>{const exponent=Math.max(1,p.exponent + (i===0?1:0));return exponent===1?String(p.prime):`${p.prime}${toSuperscript(exponent)}`;}).join(' · '));
  options.push(factors.join(' · '));
  options.push(compactText([...factors,factors[0]]));
  return {
    id:uid('power-compress'), type:'choice', prompt:`Запиши разложение ${factors.join(' · ')} короче.`,
    data:{number,factors,powers,options:shuffled([...new Set(options)],rng)}, answer:correct,
    skill:'powers', hint:'Показатель степени показывает, сколько раз повторяется одинаковый множитель.'
  };
}

function powerExpandTask(rng) {
  const number = choice([24,36,40,54,72,90],rng);
  const factors = primeFactorization(number);
  const compact = compactText(factors);
  return {
    id:uid('power-expand'), type:'factor-builder', prompt:`Раскрой запись ${compact}.`,
    data:{number,factors,mode:'expand',compact,available:shuffled([...factors,2,3,5,7],rng)}, answer:factors,
    skill:'powers', hint:'Например, 2³ означает три множителя 2.'
  };
}

function reconstructNumberTask(rng) {
  const number = choice([24,36,40,45,54,72,75,90],rng);
  const factors = primeFactorization(number);
  return {
    id:uid('reconstruct'), type:'numeric', prompt:`Какое число имеет разложение ${compactText(factors)}?`,
    data:{number,factors,operation:'product'}, answer:number,
    skill:'powers', hint:'Перемножь все простые множители с учётом степеней.'
  };
}

function commonFactorSortTask(rng) {
  const {a,b,pairKind} = pairData(choice(['general','shared-prime-different-exponents','coprime'],rng),rng);
  const left = primeFactorization(a);
  const right = primeFactorization(b);
  const common = primeFactorization(gcd(a,b));
  const restLeft=[...left], restRight=[...right];
  for (const p of common) {
    restLeft.splice(restLeft.indexOf(p),1);
    restRight.splice(restRight.indexOf(p),1);
  }
  return {
    id:uid('common-sort'), type:'sort', prompt:`Разбери простые множители ${a} и ${b}: что у них общее?`,
    data:{a,b,pairKind,left,right,zones:['Общие','Только первое','Только второе']},
    answer:{common,left:restLeft,right:restRight}, skill:'common-factors',
    hint:'Один и тот же простой множитель можно взять в общую часть только столько раз, сколько он встречается в обоих разложениях.'
  };
}

function commonProductTask(rng) {
  return algorithmWorkbenchTask('common', choice(['general','shared-prime-different-exponents','coprime'],rng), rng, 'common-factors');
}

function gcdFactorChoiceTask(rng) {
  const {a,b,pairKind}=pairData(choice(['general','shared-prime-different-exponents','coprime'],rng),rng);
  const common=primeFactorization(gcd(a,b));
  if (common.length === 0) {
    return {
      id:uid('gcd-factors'),type:'choice',prompt:`Какие общие простые множители есть у ${a} и ${b}?`,
      data:{a,b,pairKind,operation:'gcd',options:shuffled(['Общих простых множителей нет','2','3','5'],rng)},
      answer:'Общих простых множителей нет',
      skill:'gcd',hint:'Если у двух чисел нет ни одного общего простого множителя, их НОД равен 1.'
    };
  }
  const distractors=[2,3,5,7].filter(prime => !common.includes(prime)).slice(0,3);
  return {
    id:uid('gcd-factors'),type:'multi',prompt:`Выбери множители, из которых получится НОД(${a}; ${b}).`,
    data:{a,b,pairKind,operation:'gcd',options:shuffled([...common,...distractors],rng)},answer:common,
    skill:'gcd',hint:'Для НОД бери только общие множители и не больше раз, чем они встречаются в каждом числе.'
  };
}

function gcdErrorFinderTask(rng, pairOverride = null) {
  const {a,b}=pairOverride ? {a:pairOverride[0],b:pairOverride[1]} : pairData('shared-prime-different-exponents',rng);
  const ga=gcd(a,b);
  const correctFactors=compactText(primeFactorization(ga));
  return {
    id:uid('gcd-error'), type:'error-finder', prompt:`Бортовой компьютер решал НОД(${a}; ${b}). Найди неверный шаг.`,
    data:{a,b,operation:'gcd',steps:[
      `${a} = ${compactText(primeFactorization(a))}`,
      `${b} = ${compactText(primeFactorization(b))}`,
      'Берём все простые множители из обоих разложений',
      `Правильная общая часть: ${correctFactors}`
    ]}, answer:2, skill:'gcd',
    hint:'НОД строят не из всех множителей, а только из общей части.'
  };
}

function multiplesChoiceTask(rng) {
  const n=choice([4,5,6,7,8,9,10,12],rng);
  const correct=n*choice([2,3,4,5],rng);
  const options=shuffled([correct,correct+1,correct+2,correct+3],rng);
  return {id:uid('multiple'),type:'choice',prompt:`Какое число кратно ${n}?`,data:{number:n,options},answer:correct,skill:'multiples',hint:`Кратное ${n} должно делиться на ${n} без остатка.`};
}

const COMMON_MULTIPLE_PAIRS = [[4,6],[6,8],[5,10],[8,12],[9,12],[6,9],[8,14],[10,15],[12,18],[14,21],[15,20],[16,24]];

function commonMultipleTask(rng, pair = null) {
  const [a,b]=pair ?? choice(COMMON_MULTIPLE_PAIRS,rng);
  const target=lcm(a,b);
  const distractors=[target*2,target+a,target+b,target+a+b,target*3,target+Math.max(a,b)]
    .filter((value,index,all)=>value!==target&&all.indexOf(value)===index)
    .slice(0,3);
  const options=shuffled([target,...distractors],rng);
  return {id:uid('common-multiple'),type:'choice',prompt:`Какое наименьшее число кратно и ${a}, и ${b}?`,data:{a,b,operation:'lcm',options},answer:target,skill:'multiples',hint:'Выпиши несколько кратных каждого числа и найди первое совпадение.'};
}

function multipleSequenceTask(rng) {
  const n=choice([4,5,6,7,8,9],rng);
  const seq=firstMultiples(n,5);
  return {id:uid('multiple-seq'),type:'numeric',prompt:`Продолжи ряд: ${seq.slice(0,4).join(', ')}, …`,data:{number:n,sequence:seq.slice(0,4)},answer:seq[4],skill:'multiples',hint:`Каждый следующий член больше предыдущего на ${n}.`};
}

function lcmMissingFactorTask(rng) {
  const {a,b,pairKind}=pairData(choice(['general','shared-prime-different-exponents','one-divides-other'],rng),rng);
  const target=primeFactorization(lcm(a,b));
  return {id:uid('lcm-missing'),type:'factor-builder',prompt:`Собери минимальный набор множителей для НОК(${a}; ${b}).`,data:{a,b,pairKind,operation:'lcm',baseFactors:primeFactorization(a),factors:target,mode:'lcm-missing',available:shuffled([...target,2,3,5,7],rng)},answer:target,skill:'lcm',hint:'Начни с множителей первого числа и добавь только те, которых не хватает второму.'};
}

function lcmPowerChoiceTask(rng) {
  const {a,b,pairKind}=pairData('shared-prime-different-exponents',rng);
  const answer=compactText(primeFactorization(lcm(a,b)));
  const options=shuffled([...new Set([answer,compactText(primeFactorization(gcd(a,b))),compactText(primeFactorization(a)),compactText(primeFactorization(b))])],rng);
  return {id:uid('lcm-powers'),type:'choice',prompt:`Какой набор степеней даёт НОК(${a}; ${b})?`,data:{a,b,pairKind,operation:'lcm',options},answer,skill:'lcm',hint:'Для каждого простого множителя бери наибольший показатель из двух разложений.'};
}

function lcmErrorFinderTask(rng, pairOverride = null) {
  const {a,b}=pairOverride ? {a:pairOverride[0],b:pairOverride[1]} : pairData('general',rng);
  return {id:uid('lcm-error'),type:'error-finder',prompt:`Найди ошибку в решении НОК(${a}; ${b}).`,data:{a,b,operation:'lcm',steps:[`${a} = ${compactText(primeFactorization(a))}`,`${b} = ${compactText(primeFactorization(b))}`,'Берём только общие простые множители','Для НОК нужно взять максимальное количество каждого простого множителя']},answer:2,skill:'lcm',hint:'Правило «только общие» относится к НОД, а не к НОК.'};
}

const MIXED_LEVEL_PAIRS = [
  [18,24],[20,30],[12,36],[14,25],[16,24],[21,28],[24,36],
  [25,40],[27,45],[32,48],[35,50],[42,70],[45,60],[48,72],[54,81]
];

function mixedOperationChoiceTask(rng, pairOverride = null, operationOverride = null) {
  const operation=operationOverride ?? choice(['gcd','lcm'],rng);
  const [a,b]=pairOverride ?? choice(MIXED_LEVEL_PAIRS,rng);
  const wording=operation==='gcd' ? `Нужно найти наибольший общий делитель чисел ${a} и ${b}. Что выбираем?` : `Нужно найти наименьшее число, кратное ${a} и ${b}. Что выбираем?`;
  return {id:uid('mixed-op'),type:'choice',prompt:wording,data:{a,b,operation,options:['НОД','НОК']},answer:operation==='gcd'?'НОД':'НОК',skill:'mixed',hint:'Общий делитель → НОД. Общее кратное → НОК.'};
}

function fullMixedTask(rng, pairOverride = null, operationOverride = null) {
  const operation=operationOverride ?? choice(['gcd','lcm'],rng);
  const kind=pairOverride ? 'mixed-unique' : choice(['general','coprime','one-divides-other','shared-prime-different-exponents'],rng);
  return {...algorithmWorkbenchTask(operation,kind,rng,'mixed',pairOverride),id:uid('mixed-full')};
}

function generatePrimeTasks(rng) {
  return [primeClassificationTask(rng),primeMultiTask(rng),compositeProofTask(rng),primeClassificationTask(rng),primeMultiTask(rng),compositeProofTask(rng)];
}
function generateFactorizationTasks(rng) {
  return [factorTreeTask(rng),factorBuilderTask(rng),nextPrimeDivisorTask(rng),factorizationChoiceTask(rng),factorTreeTask(rng),factorBuilderTask(rng)];
}
function generatePowerTasks(rng) {
  return [powerCompressionTask(rng),powerExpandTask(rng),reconstructNumberTask(rng),powerCompressionTask(rng),powerExpandTask(rng),reconstructNumberTask(rng)];
}
function generateCommonFactorTasks(rng) {
  return [commonFactorSortTask(rng),commonProductTask(rng),commonFactorSortTask(rng),commonProductTask(rng),factorBuilderTask(rng,'common-factors'),commonFactorSortTask(rng)];
}
function generateGcdTasks(rng) {
  return [
    algorithmWorkbenchTask('gcd','general',rng),
    algorithmWorkbenchTask('gcd','shared-prime-different-exponents',rng),
    gcdFactorChoiceTask(rng),
    algorithmWorkbenchTask('gcd','coprime',rng),
    gcdErrorFinderTask(rng),
    algorithmWorkbenchTask('gcd','one-divides-other',rng),
    gcdFactorChoiceTask(rng)
  ];
}
function generateMultipleTasks(rng, commonPairs = null) {
  const pairs = commonPairs ?? sampleWithoutReplacement(COMMON_MULTIPLE_PAIRS, 2, rng);
  return [multipleSequenceTask(rng),multiplesChoiceTask(rng),commonMultipleTask(rng,pairs[0]),multipleSequenceTask(rng),commonMultipleTask(rng,pairs[1]),multiplesChoiceTask(rng)];
}
function generateLcmTasks(rng) {
  return [
    algorithmWorkbenchTask('lcm','general',rng),
    algorithmWorkbenchTask('lcm','coprime',rng),
    algorithmWorkbenchTask('lcm','one-divides-other',rng),
    algorithmWorkbenchTask('lcm','shared-prime-different-exponents',rng),
    lcmMissingFactorTask(rng),lcmPowerChoiceTask(rng),lcmErrorFinderTask(rng)
  ];
}
function generateMixedTasks(rng) {
  const pairs=sampleWithoutReplacement(MIXED_LEVEL_PAIRS,6,rng);
  return [
    mixedOperationChoiceTask(rng,pairs[0],'gcd'),
    fullMixedTask(rng,pairs[1],'gcd'),
    fullMixedTask(rng,pairs[2],'lcm'),
    factorizationChoiceTask(rng),
    gcdErrorFinderTask(rng,pairs[3]),
    lcmErrorFinderTask(rng,pairs[4]),
    mixedOperationChoiceTask(rng,pairs[5],'lcm')
  ];
}

const LEVEL_GENERATORS={1:generatePrimeTasks,2:generateFactorizationTasks,3:generatePowerTasks,4:generateCommonFactorTasks,5:generateGcdTasks,6:generateMultipleTasks,7:generateLcmTasks,8:generateMixedTasks};

export function generateLevelTasks(levelId, rng=Math.random) {
  const fn=LEVEL_GENERATORS[levelId];
  if (!fn) throw new RangeError('unknown level');
  return fn(rng);
}

export function generateMiniBossTasks(levelId, rng=Math.random) {
  let tasks;
  switch (levelId) {
    case 1: tasks=[primeClassificationTask(rng),primeMultiTask(rng),compositeProofTask(rng)]; break;
    case 2: tasks=[factorTreeTask(rng),factorBuilderTask(rng)]; break;
    case 3: tasks=[powerCompressionTask(rng),reconstructNumberTask(rng)]; break;
    case 4: tasks=[commonFactorSortTask(rng),commonProductTask(rng)]; break;
    case 5: tasks=[algorithmWorkbenchTask('gcd','general',rng),algorithmWorkbenchTask('gcd','coprime',rng)]; break;
    case 6: {
      const pairs=sampleWithoutReplacement(COMMON_MULTIPLE_PAIRS,2,rng);
      tasks=[commonMultipleTask(rng,pairs[0]),commonMultipleTask(rng,pairs[1])];
      break;
    }
    case 7: tasks=[algorithmWorkbenchTask('lcm','general',rng),algorithmWorkbenchTask('lcm','shared-prime-different-exponents',rng)]; break;
    case 8: tasks=[fullMixedTask(rng),mixedOperationChoiceTask(rng),fullMixedTask(rng)]; break;
    default: throw new RangeError('unknown level');
  }
  return tasks.map(task=>({...task,id:`mini-${task.id}`,miniboss:true}));
}


export function generateLevelRun(levelId, rng=Math.random) {
  if (levelId === 6) {
    const pairs = sampleWithoutReplacement(COMMON_MULTIPLE_PAIRS, 4, rng);
    return {
      mission: generateMultipleTasks(rng, pairs.slice(0,2)),
      miniboss: pairs.slice(2,4).map(pair => ({
        ...commonMultipleTask(rng, pair),
        id: `mini-${uid('common-multiple')}`,
        miniboss: true
      }))
    };
  }
  if (levelId === 8) {
    const pairs = sampleWithoutReplacement(MIXED_LEVEL_PAIRS, 9, rng);
    const mission = [
      mixedOperationChoiceTask(rng,pairs[0],'gcd'),
      fullMixedTask(rng,pairs[1],'gcd'),
      fullMixedTask(rng,pairs[2],'lcm'),
      factorizationChoiceTask(rng),
      gcdErrorFinderTask(rng,pairs[3]),
      lcmErrorFinderTask(rng,pairs[4]),
      mixedOperationChoiceTask(rng,pairs[5],'lcm')
    ];
    const miniboss = [
      fullMixedTask(rng,pairs[6],'gcd'),
      mixedOperationChoiceTask(rng,pairs[7],'lcm'),
      fullMixedTask(rng,pairs[8],'lcm')
    ].map(task=>({...task,id:`mini-${task.id}`,miniboss:true}));
    return {mission,miniboss};
  }
  return {
    mission: generateLevelTasks(levelId, rng),
    miniboss: generateMiniBossTasks(levelId, rng)
  };
}

export function generateBossPhaseTasks(phase, rng=Math.random) {
  if (phase===1) return [primeClassificationTask(rng),factorTreeTask(rng),powerCompressionTask(rng),factorizationChoiceTask(rng)].map(t=>({...t,bossPhase:1}));
  if (phase===2) return [commonFactorSortTask(rng),algorithmWorkbenchTask('gcd','shared-prime-different-exponents',rng),algorithmWorkbenchTask('gcd','coprime',rng)].map(t=>({...t,bossPhase:2}));
  if (phase===3) return [algorithmWorkbenchTask('lcm','one-divides-other',rng),algorithmWorkbenchTask('lcm','coprime',rng),mixedOperationChoiceTask(rng),fullMixedTask(rng)].map(t=>({...t,bossPhase:3}));
  throw new RangeError('unknown boss phase');
}

export function answerMatches(task, submitted) {
  if (Array.isArray(task.answer)) {
    const actual=[...(Array.isArray(submitted)?submitted:[])].map(Number).sort((a,b)=>a-b);
    const expected=[...task.answer].map(Number).sort((a,b)=>a-b);
    return actual.length===expected.length && actual.every((v,i)=>v===expected[i]);
  }
  if (task.type==='sort') return JSON.stringify(submitted)===JSON.stringify(task.answer);
  if (typeof task.answer==='number') return Number(submitted)===task.answer;
  return String(submitted).trim()===String(task.answer);
}

export function factorsProduct(factors) { return product(factors); }
