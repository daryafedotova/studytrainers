// ─── Крошечный синтезатор звуков на WebAudio (без аудиофайлов) ───

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

export function unlockAudio() {
  const c = ac();
  if (c && c.state === "suspended") void c.resume();
}

function tone(
  freq: number,
  freqEnd: number | undefined,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.12,
  delay = 0
) {
  if (!enabled) return;
  const c = ac();
  if (!c) return;
  try {
    if (c.state === "suspended") void c.resume();
    const o = c.createOscillator();
    const g = c.createGain();
    const t0 = c.currentTime + delay;
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 40), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch {
    /* звук необязателен */
  }
}

/** Прыжок запятой на одну позицию */
export const sndHop = () => tone(430, 660, 0.09, "triangle", 0.09);
/** Верный ответ — восходящее трезвучие */
export const sndCorrect = () => {
  tone(523, undefined, 0.13, "sine", 0.13);
  tone(659, undefined, 0.13, "sine", 0.13, 0.09);
  tone(784, undefined, 0.24, "sine", 0.14, 0.18);
};
/** Ошибка — низкий гудок */
export const sndWrong = () => tone(210, 115, 0.28, "sawtooth", 0.07);
/** Победа — арпеджио */
export const sndWin = () => {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, undefined, 0.26, "triangle", 0.11, i * 0.1));
};
