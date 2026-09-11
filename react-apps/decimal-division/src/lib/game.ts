// ─── Игровая логика: деление десятичных дробей переносом запятой ───

export interface Problem {
  /** Значащие цифры числа без запятой, напр. "347" для 3,47 */
  digits: string;
  /** Исходная позиция запятой: сколько цифр слева от неё (0 для чистой дроби 0,47) */
  c0: number;
  /** Степень десятки: 1, 2 или 3 */
  p: number;
  /** Направление переноса: −1 — деление на 10/100/1000 (влево), +1 — деление на 0,1/0,01/0,001 (вправо) */
  dir: 1 | -1;
}

export const GOAL = 50;

export function targetSlot(pr: Problem): number {
  return pr.c0 + pr.dir * pr.p;
}

/** Подпись делителя: 10 / 100 / 1000 или 0,1 / 0,01 / 0,001 */
export function multiplierLabel(pr: Problem): string {
  if (pr.dir < 0) return String(10 ** pr.p);
  return "0," + "0".repeat(pr.p - 1) + "1";
}

/** Форматирует число, заданное цифрами и позицией запятой, в строку вида "12,34" */
export function formatNumber(digits: string, slot: number): string {
  const n = digits.length;
  if (slot <= 0) return "0," + "0".repeat(-slot) + digits;
  if (slot >= n) return digits + "0".repeat(slot - n);
  return digits.slice(0, slot) + "," + digits.slice(slot);
}

/** Склонение слова «знак»: 1 знак, 2 знака, 3 знака */
export function znakWord(p: number): string {
  return p === 1 ? "знак" : p < 5 ? "знака" : "знаков";
}

// ─── Построение визуальных плиток ───

export interface Cell {
  key: string;
  char: string;
  kind: "digit" | "zero" | "comma";
}

/**
 * Возвращает упорядоченный список плиток (цифры, дописанные нули, запятая)
 * для заданной позиции запятой.
 */
export function cellsForSlot(digits: string, slot: number): Cell[] {
  const n = digits.length;
  const cells: Cell[] = [];
  const pushDigits = (from: number, to: number) => {
    for (let i = from; i < to; i++) cells.push({ key: `d${i}`, char: digits[i], kind: "digit" });
  };

  if (slot <= 0) {
    // 0,00…цифры — целый ноль, затем запятая, затем недостающие нули дробной части
    cells.push({ key: "iz", char: "0", kind: "zero" });
    cells.push({ key: "comma", char: ",", kind: "comma" });
    for (let j = 1; j <= -slot; j++) cells.push({ key: `fz${j}`, char: "0", kind: "zero" });
    pushDigits(0, n);
  } else if (slot >= n) {
    // Целое число: цифры, дописанные нули справа, запятая в самом конце
    pushDigits(0, n);
    for (let j = 1; j <= slot - n; j++) cells.push({ key: `rz${j}`, char: "0", kind: "zero" });
    cells.push({ key: "comma", char: ",", kind: "comma" });
  } else {
    pushDigits(0, slot);
    cells.push({ key: "comma", char: ",", kind: "comma" });
    pushDigits(slot, n);
  }
  return cells;
}

/** Допустимый диапазон позиций запятой */
export function clampSlot(n: number, slot: number): number {
  return Math.max(-3, Math.min(n + 3, slot));
}

// ─── Генерация заданий ───

function weighted(pairs: Array<[number, number]>): number {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}

export function generateProblem(prev?: Problem | null): Problem {
  for (let guard = 0; guard < 100; guard++) {
    const frac = weighted([
      [1, 34],
      [2, 46],
      [3, 20],
    ]);
    const intD = weighted([
      [0, 10],
      [1, 60],
      [2, 30],
    ]);
    const p = weighted([
      [1, 38],
      [2, 42],
      [3, 20],
    ]) as 1 | 2 | 3;
    const dir = (Math.random() < 0.5 ? 1 : -1) as 1 | -1;

    const n = intD + frac;
    let d = "";
    for (let k = 0; k < n; k++) d += String(Math.floor(Math.random() * 10));
    // первая и последняя цифры — ненулевые, чтобы не было тривиальных форм записи
    const nz = () => String(1 + Math.floor(Math.random() * 9));
    if (d[0] === "0") d = nz() + d.slice(1);
    if (d[n - 1] === "0") d = d.slice(0, n - 1) + nz();

    const cand: Problem = { digits: d, c0: intD, p, dir };
    // не повторяем два одинаковых задания подряд
    if (
      !prev ||
      formatNumber(cand.digits, cand.c0) !== formatNumber(prev.digits, prev.c0) ||
      multiplierLabel(cand) !== multiplierLabel(prev)
    ) {
      return cand;
    }
  }
  return { digits: "347", c0: 1, p: 2, dir: -1 };
}
