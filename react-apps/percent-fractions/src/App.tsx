import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Download,
  House,
  Lightbulb,
  Percent,
  Play,
  RotateCcw,
  SkipForward,
  Star,
  Target,
  UserRound,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";

type Level = 1 | 2;
type Status = "idle" | "correct" | "wrong";
type ProblemKind = "decimal" | "common" | "percent";

interface Problem {
  id: string;
  level: Level;
  kind: ProblemKind;
  prompt: string;
  answer: number;
  hint: string;
  memory?: string;
  numerator?: number;
  denominator?: number;
}

const GOAL = 50;
const LEVEL_TWO_AT = 25;
const CONFETTI = ["#22d3ee", "#a78bfa", "#fbbf24", "#34d399", "#fb7185"];

const COMMON = [
  [1, 2, 50], [1, 4, 25], [3, 4, 75],
  [1, 5, 20], [2, 5, 40], [3, 5, 60], [4, 5, 80],
  [1, 8, 12.5], [3, 8, 37.5], [5, 8, 62.5], [7, 8, 87.5],
  [1, 10, 10], [3, 10, 30], [7, 10, 70], [9, 10, 90],
  [1, 20, 5], [3, 20, 15], [7, 20, 35], [9, 20, 45],
  [11, 20, 55], [13, 20, 65], [17, 20, 85], [19, 20, 95],
  [1, 25, 4], [3, 25, 12], [7, 25, 28], [9, 25, 36],
] as const;

const DECIMALS = [
  0.01, 0.03, 0.05, 0.08, 0.1, 0.12, 0.125, 0.15, 0.2, 0.24, 0.25,
  0.3, 0.35, 0.375, 0.4, 0.45, 0.5, 0.6, 0.625, 0.7, 0.72, 0.75,
  0.8, 0.875, 0.9, 0.95, 1.05, 1.2, 1.25, 1.5,
];

function trimNumber(value: number) {
  return Number(value.toFixed(6)).toString();
}

function ru(value: number) {
  return trimNumber(value).replace(".", ",");
}

function commonEquivalent(percent: number) {
  const match = COMMON.find(([, , p]) => Math.abs(p - percent) < 1e-9);
  return match ? `${match[0]}/${match[1]}` : undefined;
}

const LEVEL1_BANK: Problem[] = [
  ...COMMON.map(([n, d, pct]) => ({
    id: `c-${n}-${d}`,
    level: 1 as const,
    kind: "common" as const,
    prompt: `${n}/${d}`,
    answer: pct,
    numerator: n,
    denominator: d,
    hint: `${n}/${d} = ${ru(pct)}/100, поэтому это ${ru(pct)}%.`,
    memory: `${n}/${d} = ${ru(pct)}%`,
  })),
  ...DECIMALS.map((value) => {
    const pct = value * 100;
    return {
      id: `d-${trimNumber(value)}`,
      level: 1 as const,
      kind: "decimal" as const,
      prompt: ru(value),
      answer: pct,
      hint: `${ru(value)} × 100% = ${ru(pct)}%. Перенеси запятую на 2 знака вправо.`,
      memory: commonEquivalent(pct) ? `${ru(pct)}% = ${commonEquivalent(pct)}` : undefined,
    };
  }),
];

const LEVEL2_VALUES = Array.from(new Set([
  0.5, 1, 2.5, 4, 5, 7.5, 10, 12, 12.5, 15, 20, 25, 28, 30, 35, 36,
  37.5, 40, 45, 50, 55, 60, 62.5, 65, 70, 75, 80, 85, 87.5, 90, 95,
  105, 120, 125, 150,
  ...COMMON.map(([, , p]) => p),
]));

const LEVEL2_BANK: Problem[] = LEVEL2_VALUES.map((pct) => ({
  id: `p-${trimNumber(pct)}`,
  level: 2 as const,
  kind: "percent" as const,
  prompt: `${ru(pct)}%`,
  answer: pct / 100,
  hint: `${ru(pct)}% = ${ru(pct)}/100 = ${ru(pct / 100)}. Перенеси запятую на 2 знака влево.`,
  memory: commonEquivalent(pct) ? `${ru(pct)}% = ${commonEquivalent(pct)}` : undefined,
}));

function getBank(level: Level) {
  return level === 1 ? LEVEL1_BANK : LEVEL2_BANK;
}

function nextProblem(level: Level, previous?: string): Problem {
  const bank = getBank(level);
  const key = `percent-fractions-used-l${level}`;
  let used: string[] = [];
  try {
    used = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    used = [];
  }
  let available = bank.filter((p) => !used.includes(p.id) && p.id !== previous);
  if (available.length === 0) {
    used = [];
    available = bank.filter((p) => p.id !== previous);
  }
  const picked = available[Math.floor(Math.random() * available.length)] ?? bank[0];
  used.push(picked.id);
  try {
    localStorage.setItem(key, JSON.stringify(used.slice(-bank.length)));
  } catch {
    // localStorage может быть недоступен в приватном режиме — игре это не мешает.
  }
  return picked;
}

function parseAnswer(raw: string) {
  const clean = raw.trim().replace(/\s+/g, "").replace(/%/g, "").replace(",", ".");
  if (!clean || clean.includes("/")) return NaN;
  return Number(clean);
}

let audioContext: AudioContext | null = null;
let soundEnabled = true;

function unlockAudio() {
  try {
    audioContext ??= new AudioContext();
    void audioContext.resume();
  } catch {
    // Звук необязателен.
  }
}

function tone(frequency: number, duration: number, type: OscillatorType = "sine", gain = 0.06) {
  if (!soundEnabled) return;
  try {
    unlockAudio();
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const amp = audioContext.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    amp.gain.setValueAtTime(gain, audioContext.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    osc.connect(amp);
    amp.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch {
    // Звук необязателен.
  }
}

function correctSound() {
  tone(620, 0.15, "sine", 0.07);
  window.setTimeout(() => tone(840, 0.22, "sine", 0.06), 100);
}

function wrongSound() {
  tone(220, 0.22, "triangle", 0.06);
}

function winSound() {
  [523, 659, 784, 1047].forEach((f, i) => window.setTimeout(() => tone(f, 0.35, "sine", 0.055), i * 120));
}

function Fraction({ numerator, denominator }: { numerator: number; denominator: number }) {
  return (
    <span className="fraction" aria-label={`${numerator}/${denominator}`}>
      <span>{numerator}</span><span>{denominator}</span>
    </span>
  );
}

function Rules({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "rules compact" : "rules"}>
      <div className="rule-card cyan">
        <div className="rule-no">1</div>
        <div>
          <h3>Дробь → проценты</h3>
          <p>Десятичную дробь умножь на 100: запятая идёт на 2 знака вправо.</p>
          <div className="rule-example"><b>0,36</b><span>→</span><strong>36%</strong></div>
          <p className="rule-small">Обыкновенную дробь удобно привести к сотым или вспомнить знакомую пару.</p>
          <div className="rule-example"><Fraction numerator={1} denominator={4} /><span>→</span><strong>25%</strong></div>
        </div>
      </div>
      <div className="rule-card violet">
        <div className="rule-no">2</div>
        <div>
          <h3>Проценты → десятичная дробь</h3>
          <p>Раздели число процентов на 100: запятая идёт на 2 знака влево.</p>
          <div className="rule-example"><b>62%</b><span>→</span><strong>0,62</strong></div>
          <div className="rule-example"><b>12,5%</b><span>→</span><strong>0,125</strong></div>
        </div>
      </div>
    </div>
  );
}

function MemoryStrip() {
  const items = [[1, 2, 50], [1, 4, 25], [3, 4, 75], [1, 5, 20], [1, 8, 12.5], [3, 8, 37.5]] as const;
  return (
    <div className="memory-box">
      <div className="memory-title"><Star size={17} /> Полезно запомнить</div>
      <div className="memory-grid">
        {items.map(([n, d, p]) => (
          <div className="memory-chip" key={`${n}-${d}`}>
            <Fraction numerator={n} denominator={d} /><span>=</span><b>{ru(p)}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function Intro({ name, setName, onStart }: { name: string; setName: (v: string) => void; onStart: () => void }) {
  return (
    <main className="intro-screen page">
      <motion.div initial={{ scale: 0.7, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} className="logo-percent">%</motion.div>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="intro-copy">
        <span className="pill">Математика · 6 класс · 2 уровня</span>
        <h1>Проценты <span>и дроби</span></h1>
        <p>Тренируй перевод дробей в проценты и процентов в десятичные дроби. Знакомые обыкновенные дроби будут повторяться, чтобы запомниться автоматически.</p>
      </motion.div>
      <Rules />
      <MemoryStrip />
      <div className="score-rules">
        <span className="good">+1 за правильный ответ</span>
        <span className="bad">−1 за ошибку</span>
        <span>Можно решить заново или пропустить</span>
        <span className="goal">Цель — 50 очков</span>
      </div>
      <div className="name-box">
        <label htmlFor="student-name">Как тебя зовут?</label>
        <div className="input-shell name-input">
          <UserRound size={20} />
          <input id="student-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Введи имя" autoComplete="off" onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onStart(); }} />
        </div>
      </div>
      <button className="primary start-btn" disabled={!name.trim()} onClick={onStart}><Play size={22} fill="currentColor" /> Начать игру <ArrowRight size={20} /></button>
    </main>
  );
}

function Progress({ score, level, soundOn, onSound, onHelp }: { score: number; level: Level; soundOn: boolean; onSound: () => void; onHelp: () => void }) {
  const pct = Math.max(0, Math.min(100, score / GOAL * 100));
  return (
    <header className="topbar page-width">
      <div className="brand"><span className="brand-icon">%</span><div><b>Проценты и дроби</b><small>математика · 6 класс</small></div></div>
      <div className="top-actions">
        <span className={`level-badge l${level}`}>Уровень {level} из 2</span>
        <button className="icon-btn" onClick={onSound} aria-label={soundOn ? "Выключить звук" : "Включить звук"}>{soundOn ? <Volume2 /> : <VolumeX />}</button>
        <button className="icon-btn" onClick={onHelp} aria-label="Правило"><BookOpen /></button>
      </div>
      <div className="progress-card">
        <div className="score-box"><Star size={20} fill="currentColor" /><b>{score}</b></div>
        <div className="progress-main">
          <div className="progress-labels"><span>{level === 1 ? "Дробь → проценты" : "Проценты → дробь"}</span><span>Цель: <b>50</b></span></div>
          <div className="track"><motion.div animate={{ width: `${pct}%` }} className="fill" /><span className="midmark" title="Уровень 2">25</span></div>
        </div>
      </div>
    </header>
  );
}

function Prompt({ problem }: { problem: Problem }) {
  if (problem.kind === "common" && problem.numerator && problem.denominator) {
    return <Fraction numerator={problem.numerator} denominator={problem.denominator} />;
  }
  return <>{problem.prompt}</>;
}

function ResultModal({ open, name, score, correct, wrong, onRestart, onContinue, onFinish }: { open: boolean; name: string; score: number; correct: number; wrong: number; onRestart: () => void; onContinue: () => void; onFinish: () => void }) {
  const [saved, setSaved] = useState(false);
  const total = correct + wrong;
  const accuracy = total ? Math.round(correct / total * 100) : 100;

  useEffect(() => {
    if (!open) return;
    winSound();
    confetti({ particleCount: 180, spread: 95, startVelocity: 42, origin: { y: 0.62 }, colors: CONFETTI });
  }, [open]);

  const save = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400; canvas.height = 900;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 1400, 900);
    grad.addColorStop(0, "#0b1325"); grad.addColorStop(.55, "#172554"); grad.addColorStop(1, "#24164b");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1400, 900);
    ctx.textAlign = "center";
    ctx.fillStyle = "#67e8f9"; ctx.font = "800 30px Arial"; ctx.fillText("МАТЕМАТИКА · 6 КЛАСС", 700, 150);
    ctx.fillStyle = "white"; ctx.font = "900 66px Arial"; ctx.fillText("Проценты и дроби", 700, 245);
    ctx.fillStyle = "#fbbf24"; ctx.font = "900 46px Arial"; ctx.fillText("Цель достигнута!", 700, 320);
    ctx.fillStyle = "white"; ctx.font = "800 48px Arial"; ctx.fillText(name, 700, 405);
    const cards = [
      ["ОЧКИ", `${score} / 50`, "#fbbf24"], ["ВЕРНЫХ", String(correct), "#34d399"], ["ТОЧНОСТЬ", `${accuracy}%`, "#67e8f9"],
    ] as const;
    cards.forEach(([label, value, color], i) => {
      const x = 175 + i * 350;
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fillRect(x, 490, 300, 160);
      ctx.fillStyle = color; ctx.font = "900 46px Arial"; ctx.fillText(value, x + 150, 560);
      ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = "800 21px Arial"; ctx.fillText(label, x + 150, 610);
    });
    ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.font = "700 24px Arial"; ctx.fillText(`Ошибок: ${wrong}`, 700, 720);
    ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.font = "600 20px Arial"; ctx.fillText(new Date().toLocaleDateString("ru-RU"), 700, 770);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      const safe = name.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_-]+/g, "-") || "ученик";
      a.href = url; a.download = `результат-${safe}-проценты-и-дроби.png`; a.click(); URL.revokeObjectURL(url);
      setSaved(true); setTimeout(() => setSaved(false), 2200);
    }, "image/png");
  };

  return (
    <AnimatePresence>{open && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="win-card" initial={{ scale: .75, y: 50 }} animate={{ scale: 1, y: 0 }}>
        <div className="trophy"><Star size={38} fill="currentColor" /></div>
        <h2>{name}, цель достигнута!</h2>
        <p>Теперь ты уверенно переводишь дроби в проценты и проценты в десятичные дроби.</p>
        <div className="stats"><div><CheckCircle2 /><b>{correct}</b><small>верных</small></div><div><XCircle /><b>{wrong}</b><small>ошибок</small></div><div><Target /><b>{accuracy}%</b><small>точность</small></div></div>
        <div className="modal-buttons">
          <button className="primary blue" onClick={save}><Download /> {saved ? "Результат сохранён!" : "Сохранить результат"}</button>
          <button className="primary green" onClick={onRestart}><RotateCcw /> Сыграть ещё раз</button>
          <button className="secondary" onClick={onContinue}>Продолжить тренировку <ArrowRight /></button>
          <button className="secondary violet" onClick={onFinish}><House /> Завершить игру и выйти на главную</button>
        </div>
      </motion.div>
    </motion.div>}</AnimatePresence>
  );
}

function Game({ name, onFinish }: { name: string; onFinish: () => void }) {
  const [level, setLevel] = useState<Level>(1);
  const [problem, setProblem] = useState<Problem>(() => nextProblem(1));
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [hint, setHint] = useState(false);
  const [locked, setLocked] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [help, setHelp] = useState(false);
  const [level2Intro, setLevel2Intro] = useState(false);
  const [win, setWin] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const loadNext = (targetLevel = level) => {
    setProblem((prev) => nextProblem(targetLevel, prev.id));
    setAnswer(""); setStatus("idle"); setHint(false); setLocked(false);
  };

  const submit = () => {
    if (locked || !answer.trim()) return;
    const numeric = parseAnswer(answer);
    if (Number.isFinite(numeric) && Math.abs(numeric - problem.answer) < 1e-9) {
      setLocked(true); setStatus("correct"); setCorrect((v) => v + 1); correctSound();
      confetti({ particleCount: 45, spread: 70, origin: { y: .67 }, colors: CONFETTI });
      const nextScore = score + 1; setScore(nextScore);
      if (level === 1 && nextScore >= LEVEL_TWO_AT) {
        later(() => setLevel2Intro(true), 850);
      } else if (level === 2 && nextScore >= GOAL) {
        later(() => setWin(true), 900);
      } else {
        later(() => loadNext(), 900);
      }
    } else {
      setLocked(true); setStatus("wrong"); setHint(true); setWrong((v) => v + 1); setScore((v) => Math.max(0, v - 1)); wrongSound();
    }
  };

  const retry = () => { setAnswer(""); setStatus("idle"); setHint(false); setLocked(false); };
  const skip = () => loadNext();
  const startLevel2 = () => { setLevel(2); setLevel2Intro(false); setProblem(nextProblem(2)); setAnswer(""); setStatus("idle"); setHint(false); setLocked(false); };
  const restart = () => { setLevel(1); setScore(0); setCorrect(0); setWrong(0); setWin(false); setLevel2Intro(false); setProblem(nextProblem(1)); setAnswer(""); setStatus("idle"); setHint(false); setLocked(false); };

  const suffix = level === 1 ? "%" : "";
  const placeholder = level === 1 ? "Например, 25" : "Например, 0,25";

  return (
    <div className="game-screen">
      <Progress score={score} level={level} soundOn={soundOn} onSound={() => { setSoundOn((v) => { soundEnabled = !v; return !v; }); }} onHelp={() => setHelp(true)} />
      <main className="game-main page-width">
        <div className="player-chip"><UserRound size={16} /> {name}</div>
        <motion.section className={`game-card ${status}`} key={problem.id} initial={{ opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
          <div className="task-kicker">{level === 1 ? "Переведи дробь в проценты" : "Переведи проценты в десятичную дробь"}</div>
          <div className="big-prompt"><Prompt problem={problem} /></div>
          <div className="answer-label">Твой ответ</div>
          <div className={`answer-shell ${status}`}>
            <input autoFocus inputMode="decimal" disabled={locked} value={answer} onChange={(e) => { setAnswer(e.target.value); if (status !== "idle") setStatus("idle"); }} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder={placeholder} />
            {suffix && <span>{suffix}</span>}
            {status === "correct" && <CheckCircle2 className="state-icon ok" />}
            {status === "wrong" && <XCircle className="state-icon no" />}
          </div>
          <div className="game-actions">
            <button className="primary check-btn" disabled={locked || !answer.trim()} onClick={submit}><Check /> Проверить</button>
            {!hint && <button className="skip-btn" onClick={skip}><SkipForward /> Пропустить</button>}
          </div>
          <AnimatePresence>
            {status === "correct" && <motion.div className="feedback correct-feedback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><CheckCircle2 /> Верно! +1 очко {problem.memory && <span>· {problem.memory}</span>}</motion.div>}
            {hint && <motion.div className="hint-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="hint-title"><Lightbulb /> Подсказка</div>
              <p>{problem.hint}</p>
              {problem.memory && <div className="memory-hint">Запомни: <b>{problem.memory}</b></div>}
              <div className="hint-actions"><button className="primary retry-btn" onClick={retry}><RotateCcw /> Решить заново</button><button className="skip-btn" onClick={skip}><SkipForward /> Пропустить</button></div>
            </motion.div>}
          </AnimatePresence>
        </motion.section>
      </main>

      <AnimatePresence>{help && <motion.div className="modal-backdrop help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="help-card"><h2>Правило</h2><Rules compact /><MemoryStrip /><button className="primary" onClick={() => setHelp(false)}>Продолжить игру</button></div></motion.div>}</AnimatePresence>

      <AnimatePresence>{level2Intro && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><motion.div className="level-card" initial={{ scale: .8, y: 40 }} animate={{ scale: 1, y: 0 }}><span className="level-number">2</span><h2>Первый уровень пройден!</h2><p>Теперь наоборот: переводи проценты в десятичные дроби. Делим число процентов на 100 и переносим запятую на два знака влево.</p><div className="level-example">37,5% <span>→</span> <b>0,375</b></div><button className="primary" onClick={startLevel2}>Начать уровень 2 <ArrowRight /></button></motion.div></motion.div>}</AnimatePresence>

      <ResultModal open={win} name={name} score={score} correct={correct} wrong={wrong} onRestart={restart} onContinue={() => { setWin(false); loadNext(2); }} onFinish={onFinish} />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<"intro" | "game">("intro");
  const [name, setName] = useState("");
  const start = () => { if (!name.trim()) return; unlockAudio(); setScreen("game"); };
  const finish = () => { window.location.href = "../../../"; };

  return (
    <div className="app-shell">
      <div className="background"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /><div className="grid-bg" /><span className="bg-glyph g1">%</span><span className="bg-glyph g2">1/4</span><span className="bg-glyph g3">0,5</span><span className="bg-glyph g4">75%</span></div>
      {screen === "intro" ? <Intro name={name} setName={setName} onStart={start} /> : <Game name={name.trim()} onFinish={finish} />}
    </div>
  );
}
