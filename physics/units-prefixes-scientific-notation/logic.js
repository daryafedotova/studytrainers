import { getUnit } from './data.js';

export function parseNumericInput(raw) {
  const normalized = String(raw ?? '').trim().replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return NaN;
  return Number(normalized);
}

export function approxEqual(a, b, relTol = 1e-9, absTol = 1e-12) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  const diff = Math.abs(a - b);
  return diff <= Math.max(absTol, relTol * Math.max(Math.abs(a), Math.abs(b)));
}

export function normalizeScientific(mantissa, exponent) {
  if (!Number.isFinite(mantissa) || !Number.isInteger(exponent)) throw new TypeError('invalid scientific value');
  if (mantissa === 0) throw new RangeError('zero has no normalized scientific form');
  let m = mantissa;
  let e = exponent;
  while (Math.abs(m) >= 10) { m /= 10; e += 1; }
  while (Math.abs(m) < 1) { m *= 10; e -= 1; }
  return {mantissa:Number(m.toPrecision(12)), exponent:e};
}

export function toScientific(value) {
  if (!Number.isFinite(value)) throw new TypeError('value must be finite');
  if (value === 0) throw new RangeError('zero has no normalized scientific form');
  return normalizeScientific(value, 0);
}

export function fromScientific(mantissa, exponent) {
  if (!Number.isFinite(mantissa) || !Number.isInteger(exponent)) throw new TypeError('invalid scientific value');
  return mantissa * (10 ** exponent);
}

export function convertValue(value, fromUnitId, toUnitId) {
  if (!Number.isFinite(value)) throw new TypeError('value must be finite');
  const from = getUnit(fromUnitId);
  const to = getUnit(toUnitId);
  if (from.dimension !== to.dimension) throw new RangeError('incompatible dimensions');
  return value * from.factorToSI / to.factorToSI;
}

function numericPart(raw, expected) {
  const parsed = typeof raw === 'number' ? raw : parseNumericInput(raw);
  return Number.isFinite(parsed) && approxEqual(parsed, expected);
}

function integerPart(raw, expected) {
  const parsed = typeof raw === 'number' ? raw : parseNumericInput(raw);
  return Number.isInteger(parsed) && parsed === expected;
}

export function validateResponse(task, response) {
  const answer = task?.answer;
  const type = task?.answerType;
  if (answer === undefined && type !== 'choice') throw new TypeError('task answer is required');

  if (type === 'number-unit') {
    const details = {
      number: numericPart(response?.number, answer.number),
      unit: response?.unitId === answer.unitId,
    };
    return {ok:details.number && details.unit, details};
  }

  if (type === 'scientific') {
    const details = {
      mantissa: numericPart(response?.mantissa, answer.mantissa),
      exponent: integerPart(response?.exponent, answer.exponent),
    };
    return {ok:details.mantissa && details.exponent, details};
  }

  if (type === 'number') {
    const value = response && typeof response === 'object' ? response.number : response;
    const ok = numericPart(value, typeof answer === 'number' ? answer : answer.number);
    return {ok, details:{number:ok}};
  }

  if (type === 'choice') {
    const expected = typeof answer === 'object' && answer !== null ? answer.choice : answer;
    const actual = response && typeof response === 'object' ? response.choice : response;
    const ok = String(actual ?? '') === String(expected ?? '');
    return {ok, details:{choice:ok}};
  }

  if (type === 'multi-part') {
    const details = {};
    for (const [key, expected] of Object.entries(answer)) {
      const actual = response?.[key];
      if (typeof expected === 'number') {
        details[key] = key.toLowerCase().includes('exponent')
          ? integerPart(actual, expected)
          : numericPart(actual, expected);
      } else if (Array.isArray(expected)) {
        const actualArray = Array.isArray(actual) ? actual : [];
        details[key] = expected.length === actualArray.length && expected.every((value, index) => value === actualArray[index]);
      } else {
        details[key] = actual === expected;
      }
    }
    return {ok:Object.values(details).every(Boolean), details};
  }

  throw new RangeError(`unsupported answer type: ${type}`);
}
