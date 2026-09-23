function toPositiveInteger(value, name = 'value') {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(name + ' must be a positive integer');
  }
  return n;
}

export function isPrime(value) {
  const n = toPositiveInteger(value);
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

export function primeFactorization(value) {
  let n = toPositiveInteger(value);
  const factors = [];
  for (let d = 2; d * d <= n; d += d === 2 ? 1 : 2) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
  }
  if (n > 1) factors.push(n);
  return factors;
}

export function factorizationToPowers(factors) {
  const counts = new Map();
  for (const prime of factors) counts.set(prime, (counts.get(prime) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([prime, exponent]) => ({ prime, exponent }));
}

export function gcd(a, b) {
  let x = toPositiveInteger(a, 'a');
  let y = toPositiveInteger(b, 'b');
  while (y) [x, y] = [y, x % y];
  return x;
}

export function lcm(a, b) {
  const x = toPositiveInteger(a, 'a');
  const y = toPositiveInteger(b, 'b');
  return (x / gcd(x, y)) * y;
}

export function divisors(value) {
  const n = toPositiveInteger(value);
  const out = [];
  for (let d = 1; d <= n; d += 1) {
    if (n % d === 0) out.push(d);
  }
  return out;
}

export function firstMultiples(value, count) {
  const n = toPositiveInteger(value);
  const c = toPositiveInteger(count, 'count');
  return Array.from({ length: c }, (_, i) => n * (i + 1));
}

const SUPER = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
function superscript(value) { return String(value).split('').map(ch => SUPER[ch] ?? ch).join(''); }
export function formatPrimePowers(value) {
  return factorizationToPowers(primeFactorization(value))
    .map(({prime, exponent}) => exponent === 1 ? String(prime) : `${prime}${superscript(exponent)}`)
    .join(' · ');
}
