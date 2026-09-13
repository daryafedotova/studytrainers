import { PREFIXES, UNITS, getPrefix, getUnit, unitsForMode } from './data.js';
import { convertValue, normalizeScientific, toScientific, fromScientific } from './logic.js';

const VALUE_POOLS = {
  simple: [0.2,0.4,0.5,0.8,1.2,1.5,2.4,2.5,3.2,3.5,4.5,6.4,7.5,8.2],
  integers: [12,15,20,25,32,40,45,60,75,120,150,240,250,350,450,600,750],
  large: [1200,1500,2400,2500,3200,4500,7500,12000,25000,320000,1500000,3200000],
  small: [0.8,0.25,0.08,0.04,0.007,0.0042,0.00056,0.00042,0.000008],
};

const CORE_DIMENSIONS = new Set(['length','time','mass','force','pressure','energy','power','current','voltage','frequency']);
const SUPERSCRIPTS = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};

function choose(list, rng) {
  if (!list.length) throw new RangeError('no task candidates');
  const raw = Number(rng());
  const normalized = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.999999999999) : 0;
  return list[Math.floor(normalized * list.length)];
}

function shuffle(list, rng) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.min(Math.max(Number(rng()) || 0, 0), 0.999999999999) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function plainNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  if (Object.is(value, -0)) value = 0;
  let text = Number(value.toPrecision(12)).toString();
  if (!/[eE]/.test(text)) return text.replace('.', ',');
  const [coefficient, exponentText] = text.toLowerCase().split('e');
  const exponent = Number(exponentText);
  const negative = coefficient.startsWith('-');
  const digits = coefficient.replace('-', '').replace('.', '');
  const decimalPosition = coefficient.replace('-', '').indexOf('.') >= 0
    ? coefficient.replace('-', '').indexOf('.')
    : coefficient.replace('-', '').length;
  const newPosition = decimalPosition + exponent;
  let output;
  if (newPosition <= 0) output = `0.${'0'.repeat(-newPosition)}${digits}`;
  else if (newPosition >= digits.length) output = `${digits}${'0'.repeat(newPosition - digits.length)}`;
  else output = `${digits.slice(0,newPosition)}.${digits.slice(newPosition)}`;
  output = output.replace(/\.?0+$/, match => match.startsWith('.') ? '' : match);
  if (output === '') output = '0';
  return `${negative ? '-' : ''}${output}`.replace('.', ',');
}

function superscript(exponent) {
  return String(exponent).split('').map(char => SUPERSCRIPTS[char] ?? char).join('');
}

function commonMeta(mode, blockId, unit = null) {
  return {
    usesNegativeExponent:false,
    dimension:unit?.dimension ?? 'number',
    learningOnly:false,
  };
}

function conversionTask({mode, blockId, value, fromId, toId, tag}) {
  const from = getUnit(fromId);
  const to = getUnit(toId);
  const converted = convertValue(value, fromId, toId);
  const signature = `${mode}|${blockId}|${tag}|${value}|${fromId}|${toId}`;
  const step2 = mode === '7'
    ? `${plainNumber(value)} ${from.symbol} = ${plainNumber(converted)} ${to.symbol}`
    : `${plainNumber(value)} ${from.symbol} → ${plainNumber(converted)} ${to.symbol}`;
  return {
    id:signature,
    signature,
    mode,
    blockId,
    substage:null,
    answerType:'number-unit',
    prompt:blockId==='to-si' ? `Переведи ${plainNumber(value)} ${from.symbol} в СИ.` : `Переведи ${plainNumber(value)} ${from.symbol} в ${to.symbol}.`,
    answer:{number:converted,unitId:toId},
    hintKey:'unit-direction',
    ruleKey:blockId,
    solutionSteps:[
      `Сравни единицы ${from.symbol} и ${to.symbol}.`,
      step2,
    ],
    metadata:{...commonMeta(mode,blockId,from),fromUnitId:fromId,toUnitId:toId,unitOptions:[toId,fromId]},
  };
}

function grade7ToSICandidates() {
  const sources = unitsForMode('7').filter(unit => CORE_DIMENSIONS.has(unit.dimension) && unit.id !== unit.systemUnitId);
  const values = [...VALUE_POOLS.simple, ...VALUE_POOLS.integers];
  return sources.flatMap((unit, unitIndex) => values.map((value, valueIndex) =>
    conversionTask({mode:'7',blockId:'to-si',value,fromId:unit.id,toId:unit.systemUnitId,tag:`si-${unitIndex}-${valueIndex}`})
  ));
}

function preferredTargets(mode) {
  return unitsForMode(mode).filter(unit => CORE_DIMENSIONS.has(unit.dimension) && unit.id !== unit.systemUnitId && !unit.rare);
}

function usePrefixCandidates(mode, blockId = 'use-prefix') {
  const values = [...VALUE_POOLS.large, ...VALUE_POOLS.small, ...VALUE_POOLS.integers];
  return preferredTargets(mode).flatMap((target, targetIndex) => {
    const system = getUnit(target.systemUnitId);
    return values.map((value, valueIndex) => conversionTask({
      mode, blockId, value, fromId:system.id, toId:target.id, tag:`pref-${targetIndex}-${valueIndex}`
    }));
  });
}

function prefixDrillCandidates(mode) {
  const eligibleUnits = unitsForMode(mode).filter(unit => unit.prefixId && unit.power === 1 && CORE_DIMENSIONS.has(unit.dimension));
  const modePrefixes = PREFIXES.filter(prefix => prefix.modes.includes(mode));
  const prefixNames = modePrefixes.map(prefix => prefix.name);
  return eligibleUnits.flatMap((unit, index) => {
    const prefix = getPrefix(unit.prefixId);
    const system = getUnit(unit.systemUnitId);
    const rarePrefix = Boolean(prefix.rare || unit.rare);
    const nameTask = {
      id:`${mode}|prefix-drill|name|${unit.id}`,
      signature:`${mode}|prefix-drill|name|${unit.id}`,
      mode,blockId:'prefix-drill',substage:null,answerType:'choice',
      prompt:`Какая приставка используется в записи «${unit.symbol}»?`,
      choices:prefixNames,
      answer:prefix.name,
      hintKey:'prefix-name',ruleKey:'prefix-drill',
      solutionSteps:[`${unit.symbol}: приставка «${prefix.name}».`],
      metadata:{...commonMeta(mode,'prefix-drill',unit),fromUnitId:unit.id,toUnitId:system.id,rarePrefix,prefixId:unit.prefixId}
    };
    const value = mode === '7' ? plainNumber(prefix.factor) : String(prefix.exponent);
    const choices = mode === '7'
      ? modePrefixes.map(item => plainNumber(item.factor))
      : modePrefixes.map(item => String(item.exponent));
    const factorTask = {
      id:`${mode}|prefix-drill|factor|${unit.id}`,
      signature:`${mode}|prefix-drill|factor|${unit.id}`,
      mode,blockId:'prefix-drill',substage:null,answerType:'choice',
      prompt:mode === '7'
        ? `Во сколько раз изменяет единицу приставка в «${unit.symbol}»?`
        : `Какому показателю степени 10 соответствует приставка в «${unit.symbol}»?`,
      choices,
      answer:value,
      hintKey:'prefix-factor',ruleKey:'prefix-drill',
      solutionSteps:mode === '7'
        ? [`${prefix.name} = ${plainNumber(prefix.factor)}.`]
        : [`${prefix.name} = 10${superscript(prefix.exponent)}.`],
      metadata:{...commonMeta(mode,'prefix-drill',unit),usesNegativeExponent:mode==='89'&&prefix.exponent<0,fromUnitId:unit.id,toUnitId:system.id,rarePrefix,prefixId:unit.prefixId}
    };
    const equivalenceValue = mode === '7' ? [1,2,5,10][index % 4] : [1,2.5,4,7.5][index % 4];
    const converted = convertValue(equivalenceValue, unit.id, system.id);
    const equivalenceTask = {
      ...conversionTask({mode,blockId:'prefix-drill',value:equivalenceValue,fromId:unit.id,toId:system.id,tag:'equiv'}),
      metadata:{...commonMeta(mode,'prefix-drill',unit),fromUnitId:unit.id,toUnitId:system.id,unitOptions:[system.id,unit.id],rarePrefix,prefixId:unit.prefixId}
    };
    equivalenceTask.solutionSteps = mode === '7'
      ? [`${prefix.name} = ${plainNumber(prefix.factor)}.`, `${plainNumber(equivalenceValue)} ${unit.symbol} = ${plainNumber(converted)} ${system.symbol}.`]
      : [`${prefix.name} = 10${superscript(prefix.exponent)}.`, `${plainNumber(equivalenceValue)} ${unit.symbol} = ${plainNumber(converted)} ${system.symbol}.`];
    return [nameTask,factorTask,equivalenceTask];
  });
}

function areaVolumePairs(substage) {
  if (substage === 'area') return [['m2','cm2'],['m2','mm2'],['cm2','m2'],['mm2','m2'],['cm2','mm2'],['mm2','cm2']];
  if (substage === 'volume') return [['m3','dm3'],['m3','cm3'],['dm3','m3'],['cm3','m3'],['dm3','cm3'],['cm3','dm3']];
  if (substage === 'liters') return [['L','dm3'],['L','cm3'],['mL','cm3'],['mL','m3'],['dm3','L'],['cm3','mL'],['m3','L'],['cm3','L']];
  return [...areaVolumePairs('area'),...areaVolumePairs('volume'),...areaVolumePairs('liters')];
}

function areaVolumeCandidates(mode, substage = 'mixed') {
  const values = [...VALUE_POOLS.simple,...VALUE_POOLS.integers,...VALUE_POOLS.large.slice(0,6)];
  return areaVolumePairs(substage).flatMap(([fromId,toId], pairIndex) => values.map((value,valueIndex) => {
    const base = conversionTask({mode,blockId:'area-volume',value,fromId,toId,tag:`${substage}-${pairIndex}-${valueIndex}`});
    const from = getUnit(fromId);
    const to = getUnit(toId);
    base.substage = substage;
    base.metadata.substage = substage;
    base.ruleKey = `area-volume-${substage}`;
    if (mode === '7') {
      if (substage === 'area' || from.dimension === 'area') {
        base.solutionSteps = ['При переводе площади коэффициент линейной единицы возводится в квадрат.', `${plainNumber(value)} ${from.symbol} = ${plainNumber(base.answer.number)} ${to.symbol}.`];
      } else if (substage === 'liters') {
        base.solutionSteps = ['Используй связи: 1 мл = 1 см³, 1 л = 1 дм³, 1 м³ = 1000 л.', `${plainNumber(value)} ${from.symbol} = ${plainNumber(base.answer.number)} ${to.symbol}.`];
      } else {
        base.solutionSteps = ['При переводе объёма коэффициент линейной единицы возводится в куб.', `${plainNumber(value)} ${from.symbol} = ${plainNumber(base.answer.number)} ${to.symbol}.`];
      }
    } else {
      base.solutionSteps = [`Учитывай степень единицы: множитель приставки возводится в степень ${from.power}.`, `${plainNumber(value)} ${from.symbol} = ${plainNumber(base.answer.number)} ${to.symbol}.`];
    }
    return base;
  }));
}

function scientificSourceValues() {
  return [...VALUE_POOLS.large, ...VALUE_POOLS.small.filter(value => value !== 0.8 && value !== 0.25), 42, 560, 0.032, 0.0000035];
}

function toScientificCandidates() {
  const positives = scientificSourceValues().map((value,index) => ({value,index,negative:false}));
  const negatives = [0.0042,320000,0.00056,25000].map((value,index) => ({value:-value,index:index+positives.length,negative:true}));
  return [...positives,...negatives].map(({value,index,negative}) => {
    const sci = toScientific(value);
    const signature = `89|to-scientific|${index}|${value}`;
    return {
      id:signature,signature,mode:'89',blockId:'to-scientific',substage:null,answerType:'scientific',
      prompt:`Запиши число ${plainNumber(value)} в стандартном виде.`,
      answer:sci,hintKey:'mantissa-range',ruleKey:'to-scientific',
      solutionSteps:[`Перенеси запятую так, чтобы 1 ≤ |a| < 10.`, `${plainNumber(value)} = ${plainNumber(sci.mantissa)} · 10${superscript(sci.exponent)}.`],
      metadata:{...commonMeta('89','to-scientific'),usesNegativeExponent:sci.exponent<0,negativeNumber:negative}
    };
  });
}

function fromScientificCandidates() {
  const mantissas = [1.2,2.5,3.2,4.2,5.6,6.3,7.5,8.4,9.1];
  const exponents = [-9,-6,-5,-4,-3,-2,2,3,4,5,6,9];
  const tasks=[];
  let i=0;
  for (const mantissa of mantissas) {
    for (const exponent of exponents) {
      const value = fromScientific(mantissa,exponent);
      const signature=`89|from-scientific|${i++}`;
      tasks.push({
        id:signature,signature,mode:'89',blockId:'from-scientific',substage:null,answerType:'number',
        promptHtml:`Запиши обычной десятичной дробью: <span class="formula">${plainNumber(mantissa)} · 10<sup>${exponent}</sup></span>.`,
        prompt:`Запиши обычной десятичной дробью: ${plainNumber(mantissa)} · 10^${exponent}.`,
        answer:value,hintKey:'decimal-shift',ruleKey:'from-scientific',
        solutionSteps:[`Показатель ${exponent} задаёт направление и число переносов запятой.`, `Ответ: ${plainNumber(value)}.`],
        metadata:{...commonMeta('89','from-scientific'),usesNegativeExponent:exponent<0,negativeNumber:false}
      });
    }
  }
  return tasks;
}

function mantissaWarmupCandidates() {
  const items = [
    {prompt:'Какая мантисса записана правильно?',choices:['32,7','3,27','0,327'],answer:'3,27'},
    {prompt:'Для числа 0,00056 выбери правильную мантиссу.',choices:['0,56','5,6','56'],answer:'5,6'},
    {prompt:'Какая мантисса подходит для стандартного вида числа 420000?',choices:['42','4,2','0,42'],answer:'4,2'},
    {prompt:'Какая из мантисс удовлетворяет условию 1 ≤ |a| < 10?',choices:['0,9','9','90'],answer:'9'},
    {prompt:'Выбери допустимую мантиссу для отрицательного числа.',choices:['−0,48','−4,8','−48'],answer:'−4,8'},
  ];
  return items.map((item,index)=>({
    id:`89|mantissa-warmup|${index}`,signature:`89|mantissa-warmup|${index}`,mode:'89',blockId:'mantissa-warmup',substage:null,
    answerType:'choice',prompt:item.prompt,choices:item.choices,answer:item.answer,hintKey:'mantissa-range',ruleKey:'mantissa-warmup',
    solutionSteps:[`Мантисса должна удовлетворять условию 1 ≤ |a| < 10.`,`Правильный ответ: ${item.answer}.`],
    metadata:{...commonMeta('89','mantissa-warmup'),learningOnly:true}
  }));
}

function prefixPowerUnits() {
  return unitsForMode('89').filter(unit => unit.prefixId && unit.power===1 && CORE_DIMENSIONS.has(unit.dimension) && !['mg'].includes(unit.id));
}

function prefixPowerCandidates() {
  const values=[0.7,1.2,2.5,4.2,6.5,25,45,250];
  return prefixPowerUnits().flatMap((unit,unitIndex)=>{
    const prefix=getPrefix(unit.prefixId);
    const system=getUnit(unit.systemUnitId);
    return values.map((value,valueIndex)=>{
      const signature=`89|prefix-power|${unit.id}|${valueIndex}`;
      return {
        id:signature,signature,mode:'89',blockId:'prefix-power',substage:null,answerType:'multi-part',
        prompt:`Замени приставку степенью десяти: ${plainNumber(value)} ${unit.symbol}.`,
        answer:{mantissa:value,exponent:prefix.exponent,unitId:system.id},
        hintKey:'prefix-power',ruleKey:'prefix-power',
        solutionSteps:[`${prefix.name} = 10${superscript(prefix.exponent)}.`,`${plainNumber(value)} ${unit.symbol} = ${plainNumber(value)} · 10${superscript(prefix.exponent)} ${system.symbol}.`],
        metadata:{...commonMeta('89','prefix-power',unit),usesNegativeExponent:prefix.exponent<0,rarePrefix:Boolean(prefix.rare||unit.rare),fromUnitId:unit.id,toUnitId:system.id}
      };
    });
  });
}

function mantissaShiftCandidates() {
  const seeds=[
    {value:0.7,unitId:'mm'},
    {value:25,unitId:'uA'},
    {value:0.03,unitId:'kW'},
    {value:450,unitId:'nm'},
    {value:42,unitId:'mA'},
    {value:0.6,unitId:'MPa'},
    {value:75,unitId:'us'},
    {value:0.08,unitId:'kJ'},
    {value:320,unitId:'mV'},
    {value:0.004,unitId:'MHz'},
    {value:8.2,unitId:'um'},
    {value:240,unitId:'kPa'},
  ];
  return seeds.map((seed,index)=>{
    const unit=getUnit(seed.unitId);
    const prefix=getPrefix(unit.prefixId);
    const system=getUnit(unit.systemUnitId);
    const normalized=normalizeScientific(seed.value,prefix.exponent);
    const signature=`89|mantissa-shift|${index}`;
    return {
      id:signature,signature,mode:'89',blockId:'mantissa-shift',substage:null,answerType:'multi-part',
      prompt:`Дополни цепочку для ${plainNumber(seed.value)} ${unit.symbol}.`,
      answer:{prefixMantissa:seed.value,prefixExponent:prefix.exponent,mantissa:normalized.mantissa,exponent:normalized.exponent,unitId:system.id},
      hintKey:'mantissa-shift',ruleKey:'mantissa-shift',
      solutionSteps:[`${unit.symbol}: приставка ${prefix.name} = 10${superscript(prefix.exponent)}.`,`${plainNumber(seed.value)} ${unit.symbol} = ${plainNumber(seed.value)} · 10${superscript(prefix.exponent)} ${system.symbol}.`,`Нормализуем: ${plainNumber(normalized.mantissa)} · 10${superscript(normalized.exponent)} ${system.symbol}.`],
      metadata:{...commonMeta('89','mantissa-shift',unit),usesNegativeExponent:prefix.exponent<0||normalized.exponent<0,fromUnitId:unit.id,toUnitId:system.id,learningOnly:true,scaffold:index<2}
    };
  });
}

function unitConversionCandidates89() {
  const units=unitsForMode('89').filter(unit=>CORE_DIMENSIONS.has(unit.dimension) && !unit.rare);
  const pairs=[];
  for (const from of units) {
    for (const to of units) {
      if (from.id!==to.id && from.dimension===to.dimension && (from.prefixId || to.prefixId)) pairs.push([from.id,to.id]);
    }
  }
  const values=[...VALUE_POOLS.simple,...VALUE_POOLS.integers,...VALUE_POOLS.large.slice(0,5)];
  return pairs.flatMap(([fromId,toId],pairIndex)=>values.slice(0,8).map((value,valueIndex)=>
    conversionTask({mode:'89',blockId:'unit-conversion',value,fromId,toId,tag:`${pairIndex}-${valueIndex}`})
  ));
}

function mixedCandidates(mode) {
  if (mode==='7') return [
    ...grade7ToSICandidates().map(task=>({...task,blockId:'mixed',signature:task.signature.replace('|to-si|','|mixed|to-si|'),id:task.id.replace('|to-si|','|mixed|to-si|')})),
    ...usePrefixCandidates('7').map(task=>({...task,blockId:'mixed',signature:task.signature.replace('|use-prefix|','|mixed|use-prefix|'),id:task.id.replace('|use-prefix|','|mixed|use-prefix|')})),
  ];
  const groups=[...toScientificCandidates(),...fromScientificCandidates(),...prefixPowerCandidates(),...unitConversionCandidates89()];
  return groups.map((task,index)=>({...task,blockId:'mixed',signature:`89|mixed|${index}|${task.signature}`,id:`89|mixed|${index}|${task.id}`}));
}

function buildCandidates(mode, blockId, substage) {
  if (mode==='7') {
    if (blockId==='prefix-drill') return prefixDrillCandidates('7');
    if (blockId==='to-si') return grade7ToSICandidates();
    if (blockId==='use-prefix') return usePrefixCandidates('7');
    if (blockId==='mixed') return mixedCandidates('7');
    if (blockId==='area-volume') return areaVolumeCandidates('7',substage || 'mixed');
  }
  if (mode==='89') {
    if (blockId==='mantissa-warmup') return mantissaWarmupCandidates();
    if (blockId==='to-scientific') return toScientificCandidates();
    if (blockId==='from-scientific') return fromScientificCandidates();
    if (blockId==='prefix-drill') return prefixDrillCandidates('89');
    if (blockId==='prefix-power') return prefixPowerCandidates();
    if (blockId==='mantissa-shift') return mantissaShiftCandidates();
    if (blockId==='unit-conversion') return unitConversionCandidates89();
    if (blockId==='mixed') return mixedCandidates('89');
    if (blockId==='area-volume') return areaVolumeCandidates('89',substage || 'mixed');
  }
  throw new RangeError(`unsupported mode/block: ${mode}/${blockId}`);
}

export function createTask({mode,blockId,substage=null,rng=Math.random}) {
  return choose(buildCandidates(mode,blockId,substage),rng);
}

export function pickTaskSet({mode,blockId,substage=null,count,rng=Math.random}) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('count must be a positive integer');
  const candidates=shuffle(buildCandidates(mode,blockId,substage),rng);
  const selected=[];
  const signatures=new Set();
  let rareCount=0;
  let negativeCount=0;

  const add=(task)=>{
    if (selected.length>=count || signatures.has(task.signature)) return false;
    if (task.metadata?.rarePrefix && rareCount>=2) return false;
    if (task.metadata?.negativeNumber && negativeCount>=2) return false;
    selected.push(task);
    signatures.add(task.signature);
    if (task.metadata?.rarePrefix) rareCount += 1;
    if (task.metadata?.negativeNumber) negativeCount += 1;
    return true;
  };

  if (mode==='89' && blockId==='prefix-drill' && count >= 10) {
    const rareCandidates=candidates.filter(task=>task.metadata?.rarePrefix);
    const first=rareCandidates[0];
    const second=rareCandidates.find(task=>task.metadata?.prefixId && task.metadata.prefixId!==first?.metadata?.prefixId);
    if (first) add(first);
    if (count >= 20 && second) add(second);
  }

  if (mode==='89' && blockId==='to-scientific' && count >= 10) {
    const negative=candidates.find(task=>task.metadata?.negativeNumber);
    if (negative) add(negative);
  }

  if (mode==='89' && blockId==='mantissa-shift') {
    const canonical=mantissaShiftCandidates();
    add(canonical[0]);
    if (count > 1) add(canonical[1]);
  }

  if (mode==='7' && blockId==='mixed') {
    const byDimension=new Map();
    for (const task of candidates) {
      if (!byDimension.has(task.metadata.dimension)) byDimension.set(task.metadata.dimension,task);
    }
    for (const task of [...byDimension.values()].slice(0,Math.min(3,count))) add(task);
  }

  if (blockId==='area-volume' && substage==='liters') {
    const forward=candidates.find(task=>['L','mL'].includes(task.metadata?.fromUnitId) && ['cm3','dm3','m3'].includes(task.metadata?.toUnitId));
    const reverse=candidates.find(task=>['cm3','dm3','m3'].includes(task.metadata?.fromUnitId) && ['L','mL'].includes(task.metadata?.toUnitId));
    if (forward) add(forward);
    if (reverse) add(reverse);
  }

  for (const task of candidates) add(task);
  if (selected.length < count) throw new RangeError(`cannot create ${count} unique tasks for ${mode}/${blockId}/${substage ?? 'default'}`);
  return selected.slice(0,count);
}

export { VALUE_POOLS, plainNumber, superscript };
