export const DIVISORS = [2, 3, 5, 9, 10];
export const GCD_PRIMES = [2, 3, 5, 7];

function toInteger(value, name = 'value') {
  const number = Number(value);
  if (!Number.isFinite(number) || !Number.isInteger(number)) {
    throw new TypeError(`${name} must be a finite integer`);
  }
  return Math.abs(number);
}

export function digitSum(value) {
  const number = toInteger(value);
  return String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
}

export function divisibilitySet(value) {
  const number = toInteger(value);
  return DIVISORS.filter(divisor => number % divisor === 0);
}

export function commonDivisibilitySet(a, b) {
  const right = new Set(divisibilitySet(b));
  return divisibilitySet(a).filter(divisor => right.has(divisor));
}

export function canReduceBy(numerator, denominator, divisor) {
  const n = toInteger(numerator, 'numerator');
  const d = toInteger(denominator, 'denominator');
  const by = Number(divisor);
  return Number.isInteger(by) && by > 1 && n % by === 0 && d % by === 0;
}

export function reduceFractionBy(numerator, denominator, divisor) {
  if (!canReduceBy(numerator, denominator, divisor)) {
    throw new RangeError('cannot reduce fraction by this divisor');
  }
  return {
    numerator: toInteger(numerator, 'numerator') / divisor,
    denominator: toInteger(denominator, 'denominator') / divisor,
  };
}

export function availableReductionDivisors(numerator, denominator) {
  return DIVISORS.filter(divisor => canReduceBy(numerator, denominator, divisor));
}

export function gcd(a, b) {
  let left = toInteger(a, 'a');
  let right = toInteger(b, 'b');
  while (right !== 0) {
    [left, right] = [right, left % right];
  }
  return left;
}

export function lcmSearchStep(a, b, multiplier) {
  const left = toInteger(a, 'a');
  const right = toInteger(b, 'b');
  const step = Number(multiplier);
  if (left === 0 || right === 0) {
    throw new RangeError('LCM search requires positive integers');
  }
  if (!Number.isInteger(step) || step < 1) {
    throw new RangeError('multiplier must be a positive integer');
  }
  const smaller = Math.min(left, right);
  const larger = Math.max(left, right);
  const candidate = larger * step;
  return {
    smaller,
    larger,
    multiplier:step,
    candidate,
    isCommon:candidate % smaller === 0,
  };
}

export function lcm(a, b) {
  const left = toInteger(a, 'a');
  const right = toInteger(b, 'b');
  if (left === 0 || right === 0) return 0;
  return (left / gcd(left, right)) * right;
}

export function isCommonDivisor(a, b, divisor) {
  const left = toInteger(a, 'a');
  const right = toInteger(b, 'b');
  const by = Number(divisor);
  return Number.isInteger(by) && by > 1 && left % by === 0 && right % by === 0;
}

export function dividePairBy(a, b, divisor) {
  if (!isCommonDivisor(a, b, divisor)) {
    throw new RangeError('divisor must divide both numbers');
  }
  return {
    left: toInteger(a, 'a') / divisor,
    right: toInteger(b, 'b') / divisor,
  };
}

export function validateQuotients(a, b, divisor, left, right) {
  const expected = dividePairBy(a, b, divisor);
  const actualLeft = Number(String(left).trim());
  const actualRight = Number(String(right).trim());
  const result = {
    left: Number.isInteger(actualLeft) && actualLeft === expected.left,
    right: Number.isInteger(actualRight) && actualRight === expected.right,
  };
  result.ok = result.left && result.right;
  return result;
}

export function commonPrimeDivisors(a, b) {
  return GCD_PRIMES.filter(divisor => isCommonDivisor(a, b, divisor));
}
