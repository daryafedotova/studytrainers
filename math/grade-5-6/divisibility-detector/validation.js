import {
  divisibilitySet, commonDivisibilitySet, canReduceBy,
  commonPrimeDivisors, validateQuotients, gcd, digitSum
} from './logic.js';

function sameSet(a = [], b = []) {
  const left = [...new Set(a.map(Number))].sort((x,y) => x-y);
  const right = [...new Set(b.map(Number))].sort((x,y) => x-y);
  return left.length === right.length && left.every((value,index) => value === right[index]);
}

function baseResult(ok, details = {}, skillErrors = []) {
  return { ok, details, skillErrors };
}

function diagnosticSkillErrors(taskSkills = [], wrongDivisors = []) {
  const targets = new Set((taskSkills ?? []).map(String));
  const wrong = new Set(wrongDivisors.map(Number));
  const errors = new Set();
  const contrast39 = targets.has('3/9') && (wrong.has(3) || wrong.has(9));
  const contrast510 = targets.has('5/10') && (wrong.has(5) || wrong.has(10));

  for (const value of wrong) {
    if (contrast39 && (value === 3 || value === 9)) continue;
    if (contrast510 && (value === 5 || value === 10)) continue;
    if (targets.has(String(value))) errors.add(String(value));
  }
  if (contrast39) errors.add('3/9');
  if (contrast510) errors.add('5/10');

  return [...errors].sort((a,b) => a.localeCompare(b,'ru',{numeric:true}));
}

export function validateTask(task, response = {}) {
  switch (task?.type) {
    case 'learn':
      return baseResult(true,{});
    case 'yes-no-reason': {
      const conclusion = Boolean(response.yes) === Boolean(task.answer?.yes);
      const reason = response.reasonId === task.answer?.reasonId;
      return baseResult(conclusion && reason,{conclusion,reason}, conclusion && reason ? [] : (task.skills ?? []));
    }
    case 'detector':
    case 'detector-error': {
      const expected = divisibilitySet(task.number);
      const actual = response.divisors ?? [];
      const ok = sameSet(actual, expected);
      const missing = expected.filter(value => !actual.map(Number).includes(value));
      const extra = actual.map(Number).filter(value => !expected.includes(value));
      const wrongDivisors = [...new Set([...missing,...extra])];
      return baseResult(ok,{expected,missing,extra}, ok ? [] : diagnosticSkillErrors(task.skills,wrongDivisors));
    }
    case 'pair': {
      const intersection = commonDivisibilitySet(task.left,task.right);
      const actual = (response.divisors ?? []).map(Number);
      const expectedNoneCommon = intersection.length === 0;
      const selection = sameSet(actual,intersection);
      const noneCommon = Boolean(response.noneCommon) === expectedNoneCommon;
      const mutuallyExclusive = !(Boolean(response.noneCommon) && actual.length > 0);
      const missing = intersection.filter(value => !actual.includes(value));
      const extra = actual.filter(value => !intersection.includes(value));
      const wrongDivisors = [...new Set([...missing,...extra])];
      const ok = selection && noneCommon && mutuallyExclusive;
      return baseResult(
        ok,
        {selection,noneCommon,expectedNoneCommon,mutuallyExclusive,intersection,missing,extra},
        ok ? [] : diagnosticSkillErrors(task.skills,wrongDivisors)
      );
    }
    case 'fraction-step': {
      const ok = canReduceBy(task.numerator,task.denominator,Number(response.divisor));
      return baseResult(ok,{divisor:ok},ok ? [] : (task.skills ?? ['fraction']));
    }
    case 'fraction-error': {
      const shownIsValid = canReduceBy(task.numerator,task.denominator,task.shownDivisor);
      const expected = shownIsValid ? 'all-correct' : 'invalid-divisor';
      const ok = response.diagnosis === expected;
      return baseResult(ok,{diagnosis:ok,expected},ok ? [] : (task.skills ?? ['fraction']));
    }
    case 'gcd': {
      const phase = task.phase ?? 'choose-divisor';
      if (phase === 'quotients') {
        const details = validateQuotients(task.left,task.right,task.divisor,response.left,response.right);
        const {ok,...fields} = details;
        return baseResult(ok,fields,ok ? [] : ['gcd-arithmetic']);
      }
      if (phase === 'final-gcd') {
        const expected = gcd(task.originalLeft ?? task.left,task.originalRight ?? task.right);
        const actual = Number(response.gcd);
        const ok = Number.isInteger(actual) && actual === expected;
        return baseResult(ok,{gcd:ok,expected},ok ? [] : ['gcd-finish']);
      }
      if (response.noMore) {
        const ok = commonPrimeDivisors(task.left,task.right).length === 0;
        return baseResult(ok,{noMore:ok},ok ? [] : ['gcd-finish']);
      }
      const divisor = Number(response.divisor);
      const ok = commonPrimeDivisors(task.left,task.right).includes(divisor);
      return baseResult(ok,{divisor:ok},ok ? [] : ['gcd-divisor']);
    }
    case 'gcd-error': {
      const trueGcd = gcd(task.left,task.right);
      const claimedDivides = task.left % task.claimedGcd === 0 && task.right % task.claimedGcd === 0;
      const shownMatches = claimedDivides && task.left / task.claimedGcd === task.reduced?.numerator && task.right / task.claimedGcd === task.reduced?.denominator;
      const expected = shownMatches && task.claimedGcd !== trueGcd
        ? 'valid-reduction-wrong-gcd'
        : shownMatches ? 'all-correct' : 'invalid-reduction';
      const ok = response.diagnosis === expected;
      return baseResult(ok,{diagnosis:ok,expected,trueGcd},ok ? [] : ['gcd-finish']);
    }
    case 'fraction-gcd': {
      if (task.phase === 'quotients') {
        const details = validateQuotients(task.numerator,task.denominator,task.divisor,response.left,response.right);
        const {ok,...fields} = details;
        return baseResult(ok,fields,ok ? [] : ['gcd-arithmetic']);
      }
      if (task.phase === 'final-gcd') {
        const expected = gcd(task.numerator,task.denominator);
        const actual = Number(response.gcd);
        const ok = Number.isInteger(actual) && actual === expected;
        return baseResult(ok,{gcd:ok,expected},ok ? [] : ['gcd-finish']);
      }
      if (task.phase === 'reduced-fraction') {
        const g = gcd(task.numerator,task.denominator);
        const left = Number(response.numerator) === task.numerator / g;
        const right = Number(response.denominator) === task.denominator / g;
        return baseResult(left && right,{left,right},left && right ? [] : ['fraction']);
      }
      return validateTask({type:'gcd',left:task.left ?? task.numerator,right:task.right ?? task.denominator,phase:'choose-divisor',skills:task.skills},response);
    }
    default:
      throw new RangeError(`unsupported task type: ${task?.type}`);
  }
}

function digitExpression(number) {
  return String(Math.abs(Number(number))).split('').join(' + ');
}

function fullDivisibilityExplanation(number) {
  const last = Math.abs(Number(number)) % 10;
  const sum = digitSum(number);
  const set = divisibilitySet(number);
  const lastRules = set.filter(value => [2,5,10].includes(value));
  const sumRules = set.filter(value => [3,9].includes(value));
  const lines = [`Последняя цифра ${last}${lastRules.length ? ` → делится на ${lastRules.join(', ')}` : ' → не даёт признаков 2, 5, 10'}.`];
  lines.push(`${digitExpression(number)} = ${sum}${sumRules.length ? ` → делится на ${sumRules.join(' и ')}` : ' → не делится на 3 и 9'}.`);
  return lines.join(' ');
}

export function feedbackFor(task, result, attemptNumber = 1) {
  const full = attemptNumber >= 2;
  if (task.type === 'yes-no-reason') {
    if (!full) {
      if (result.details?.conclusion && !result.details?.reason) return {kind:'hint',text:'Ответ выбран верно. Теперь объясни его с помощью нужного признака.',focus:'reason'};
      return {kind:'hint',text:[3,9].includes(task.divisor) ? 'Проверь сумму цифр.' : 'Проверь последнюю цифру.',focus:[3,9].includes(task.divisor)?'digit-sum':'last-digit'};
    }
    return {kind:'solution',text:fullDivisibilityExplanation(task.number),focus:'solution'};
  }

  if (task.type === 'detector' || task.type === 'detector-error') {
    if (!full) {
      const missing = result.details?.missing ?? [];
      const extra = result.details?.extra ?? [];
      if (missing.some(value => [3,9].includes(value))) return {kind:'hint',text:'Ты проверил не всё. Проверь ещё сумму цифр.',focus:'digit-sum'};
      if (missing.some(value => [2,5,10].includes(value))) return {kind:'hint',text:'Проверь ещё последнюю цифру.',focus:'last-digit'};
      if (extra.some(value => [2,5,10].includes(value))) return {kind:'hint',text:'Один из выбранных признаков лишний. Снова проверь последнюю цифру.',focus:'last-digit'};
      return {kind:'hint',text:'Проверь оба способа: последнюю цифру и сумму цифр.',focus:'both'};
    }
    return {kind:'solution',text:fullDivisibilityExplanation(task.number),focus:'solution'};
  }

  if (task.type === 'pair') {
    if (!full) {
      if (result.details?.selection && result.details?.noneCommon === false) {
        return result.details?.expectedNoneCommon
          ? {kind:'hint',text:'Общих изученных признаков нет. Выбери «Ни один признак не подходит обоим».',focus:'pair-conclusion'}
          : {kind:'hint',text:'Общий признак есть. Проверь оба числа и выбери только то, что подходит обоим.',focus:'pair-conclusion'};
      }
      if ((result.details?.missing ?? []).length) {
        return {kind:'hint',text:'Ты отметил не все общие признаки. Проверь оба числа ещё раз.',focus:'pair'};
      }
      if ((result.details?.extra ?? []).length) {
        return {kind:'hint',text:'Один из выбранных признаков подходит не обоим числам.',focus:'pair'};
      }
      return {kind:'hint',text:'Выбери только признаки, которые подходят сразу обоим числам.',focus:'pair'};
    }
    const common = commonDivisibilitySet(task.left,task.right);
    return {kind:'solution',text:`Правильный ответ для ${task.left} и ${task.right}: ${common.length ? common.join(', ') : 'общих изученных признаков нет'}.`,focus:'pair'};
  }

  if (task.type === 'fraction-step' || task.type === 'fraction-error') {
    if (!full) return {kind:'hint',text:'Чтобы сократить дробь, и числитель, и знаменатель должны делиться на выбранное число.',focus:'fraction'};
    const divisor = task.shownDivisor ?? 'выбранное число';
    return {kind:'solution',text:`Проверь делимость обоих чисел. В этом шаге деление на ${divisor} ${task.shownDivisor && !canReduceBy(task.numerator,task.denominator,task.shownDivisor) ? 'невозможно' : 'нужно выполнить для обоих чисел'}.`,focus:'fraction'};
  }

  if (task.type === 'gcd' || task.type === 'fraction-gcd') {
    if (!full) {
      if (task.phase === 'quotients') return {kind:'hint',text:'Общий делитель выбран верно. Проверь только неверное частное.',focus:'arithmetic'};
      return {kind:'hint',text:'Проверь, есть ли число, на которое делятся оба текущих числа.',focus:'gcd-divisor'};
    }
    const left = task.left ?? task.numerator;
    const right = task.right ?? task.denominator;
    const common = commonPrimeDivisors(left,right);
    return {kind:'solution',text:common.length ? `Сейчас оба числа делятся на ${common.join(' или ')}.` : 'Общих простых делителей 2, 3, 5 или 7 больше нет.',focus:'gcd'};
  }

  if (task.type === 'gcd-error') {
    if (!full) return {kind:'hint',text:'Проверь отдельно: корректно ли деление и действительно ли указан наибольший общий делитель.',focus:'gcd-finish'};
    return {kind:'solution',text:`НОД(${task.left}, ${task.right}) = ${gcd(task.left,task.right)}. Сокращение на ${task.claimedGcd} может быть верным шагом, но это не обязательно НОД.`,focus:'gcd-finish'};
  }

  return {kind:full?'solution':'hint',text:full?'Посмотри полный разбор задания.':'Проверь правило ещё раз.',focus:null};
}