import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

const GOAL = 50;
const STORAGE_KEY = "decimalMultiplicationReactUsedV1";
const CAT_URL = "../decimal-multiplication/kotik.png";
const MULTIPLIERS = [
  { label: "10", steps: 1, dir: 1 },
  { label: "100", steps: 2, dir: 1 },
  { label: "1000", steps: 3, dir: 1 },
  { label: "0,1", steps: 1, dir: -1 },
  { label: "0,01", steps: 2, dir: -1 },
  { label: "0,001", steps: 3, dir: -1 },
];

function canonical(raw) {
  let value = String(raw).replace(".", ",");
  let [whole = "0", frac = ""] = value.split(",");
  whole = whole.replace(/^0+(?=\d)/, "") || "0";
  frac = frac.replace(/0+$/, "");
  return frac ? `${whole},${frac}` : whole;
}

function shiftDecimal(raw, shift) {
  const value = canonical(raw);
  const [whole, frac = ""] = value.split(",");
  let digits = whole + frac;
  let point = whole.length + shift;

  if (point <= 0) {
    digits = "0".repeat(1 - point) + digits;
    point = 1;
  }
  if (point >= digits.length) {
    digits = digits + "0".repeat(point - digits.length);
    return canonical(digits);
  }

  return canonical(`${digits.slice(0, point)},${digits.slice(point)}`);
}

function decimalSteps(raw, dir, steps) {
  const chain = [canonical(raw)];
  let current = canonical(raw);
  for (let i = 0; i < steps; i += 1) {
    current = shiftDecimal(current, dir);
    chain.push(current);
  }
  return chain;
}

function randomBase() {
  const places = 1 + Math.floor(Math.random() * 3);
  const integerPart = Math.floor(Math.random() * 80);
  const max = 10 ** places;
  let fraction = Math.floor(Math.random() * max);
  if (fraction === 0) fraction = 1 + Math.floor(Math.random() * (max - 1));
  return canonical(`${integerPart},${String(fraction).padStart(places, "0")}`);
}

function loadUsed() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

const usedQuestions = loadUsed();

function saveUsed() {
  const values = Array.from(usedQuestions).slice(-900);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

function buildQuestion() {
  for (let attempt = 0; attempt < 3000; attempt += 1) {
    const base = randomBase();
    const mult = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
    const key = `${base}|${mult.label}`;
    if (usedQuestions.has(key)) continue;
    usedQuestions.add(key);
    saveUsed();
    const answer = shiftDecimal(base, mult.dir * mult.steps);
    return { ...mult, base, key, answer };
  }
  usedQuestions.clear();
  saveUsed();
  return buildQuestion();
}

function buildOptions(q) {
  const set = new Set([q.answer]);
  const shifts = [
    q.dir * Math.max(0, q.steps - 1),
    q.dir * (q.steps + 1),
    -q.dir * q.steps,
    0,
    q.dir * (q.steps + 2),
    -q.dir * Math.max(1, q.steps - 1),
  ];
  for (const shift of shifts) {
    const candidate = shiftDecimal(q.base, shift);
    if (candidate !== q.answer) set.add(candidate);
    if (set.size >= 4) break;
  }
  let extra = 4;
  while (set.size < 4) {
    set.add(shiftDecimal(q.base, q.dir * extra));
    extra += 1;
  }
  return shuffle(Array.from(set).slice(0, 4));
}

function shuffle(input) {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function playTone(enabled, frequency, duration = 0.12, type = "sine") {
  if (!enabled) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playCorrect(enabled) {
  [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(enabled, f, 0.16), i * 75));
}

function playWrong(enabled) {
  playTone(enabled, 175, 0.24, "triangle");
}

function Background() {
  const glyphs = [
    ["×10", "7%", "15%", "-10deg"], ["0,01", "84%", "12%", "8deg"],
    ["×100", "86%", "66%", "12deg"], ["0,1", "4%", "70%", "-8deg"],
    [",", "31%", "7%", "0deg"], ["×1000", "43%", "89%", "5deg"],
  ];
  return (
    <div className="background" aria-hidden="true">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <div className="dot-grid" />
      {glyphs.map(([text, left, top, rotate], index) => (
        <motion.span
          key={`${text}-${index}`}
          className="floating-glyph"
          style={{ left, top, rotate }}
          animate={{ y: [0, -22, 0], rotate: [rotate, "0deg", rotate] }}
          transition={{ duration: 10 + index * 1.7, repeat: Infinity, ease: "easeInOut" }}
        >{text}</motion.span>
      ))}
    </div>
  );
}

function RuleCard({ direction, title, text, demo, warm = false }) {
  const Icon = direction === "right" ? ArrowRight : ArrowLeft;
  return (
    <motion.article
      className={`rule-card ${warm ? "warm" : "cool"}`}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="rule-heading">
        <span className="rule-icon"><Icon size={24} strokeWidth={3} /></span>
        <h2>{title}</h2>
      </div>
      <p>{text}</p>
      <div className="demo-box">{demo}</div>
    </motion.article>
  );
}

function StartScreen({ onStart }) {
  const [name, setName] = useState("");
  return (
    <motion.main className="start-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="comma-logo" initial={{ scale: 0, rotate: -18 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>,</motion.div>
      <div className="tag">Игра-тренажёр · математика · 5–6 класс</div>
      <h1 className="hero-title">Запятая <span>в движении</span></h1>
      <p className="hero-copy">Умножаем десятичные дроби на <b className="sky">10, 100, 1000</b> и на <b className="amber">0,1; 0,01; 0,001</b>.</p>

      <div className="rules-grid">
        <RuleCard
          direction="right"
          title="× 10, 100, 1000"
          text="Считай нули в множителе: на столько знаков перенеси запятую вправо. Если цифр не хватает — допиши нули."
          demo="3,45 × 100 → 34,5 → 345"
        />
        <RuleCard
          direction="left"
          title="× 0,1; 0,01; 0,001"
          text="Считай цифры после запятой в множителе: на столько знаков перенеси запятую влево. Если цифр не хватает — допиши нули."
          demo="56,2 × 0,01 → 5,62 → 0,562"
          warm
        />
      </div>

      <div className="start-card">
        <label htmlFor="playerName">Как тебя зовут?</label>
        <div className="start-row">
          <input id="playerName" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onStart(name.trim() || "Ученик")} maxLength={24} placeholder="Введите имя" />
          <button className="push-button start-button" onClick={() => onStart(name.trim() || "Ученик")}>
            <Play size={22} fill="currentColor" /> Начать игру
          </button>
        </div>
        <div className="score-rules"><span>+2 за верный ответ</span><span>+1 за ошибку и подсказку</span><span>Цель — 50 баллов</span></div>
      </div>
    </motion.main>
  );
}

function GameScreen({ player, onWin }) {
  const [question, setQuestion] = useState(() => buildQuestion());
  const [options, setOptions] = useState(() => []);
  const [score, setScore] = useState(0);
  const [choice, setChoice] = useState(null);
  const [locked, setLocked] = useState(false);
  const [hint, setHint] = useState(null);
  const [sound, setSound] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    setOptions(buildOptions(question));
  }, [question]);

  function goNext(nextScore) {
    if (nextScore >= GOAL) {
      onWin(nextScore, sound);
      return;
    }
    const next = buildQuestion();
    setChoice(null);
    setHint(null);
    setLocked(false);
    setQuestion(next);
    setOptions(buildOptions(next));
  }

  function answer(value) {
    if (locked) return;
    setLocked(true);
    setChoice(value);
    const correct = value === question.answer;
    const nextScore = score + (correct ? 2 : 1);
    setScore(nextScore);

    if (correct) {
      playCorrect(sound);
      confetti({ particleCount: 36, spread: 60, startVelocity: 28, origin: { y: 0.72 }, colors: ["#34d399", "#38bdf8", "#ffc53d"] });
      timerRef.current = setTimeout(() => goNext(nextScore), 950);
    } else {
      playWrong(sound);
      const chain = decimalSteps(question.base, question.dir, question.steps);
      setHint({ chain, text: `В ${question.label} ${question.dir > 0 ? `${question.steps} ${question.steps === 1 ? "ноль" : "нуля"}` : `${question.steps} ${question.steps === 1 ? "цифра" : "цифры"} после запятой`}. Перенеси запятую ${question.dir > 0 ? "вправо" : "влево"} на ${question.steps} ${question.steps === 1 ? "знак" : "знака"}.` });
      timerRef.current = setTimeout(() => goNext(nextScore), 3000);
    }
  }

  return (
    <main className="game-layout">
      <header className="topbar">
        <div className="player-pill"><span>Игрок</span><b>{player}</b></div>
        <div className="topbar-actions">
          <button className="sound-button" onClick={() => setSound((v) => !v)} aria-label="Звук">{sound ? <Volume2 /> : <VolumeX />}</button>
          <div className="score-pill"><span>Баллы</span><b>{score} / {GOAL}</b></div>
        </div>
      </header>

      <div className="progress"><motion.div animate={{ width: `${Math.min(score / GOAL * 100, 100)}%` }} /></div>

      <motion.section className="question-card" key={question.key} initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
        <div className="question-tag">Выбери правильный ответ</div>
        <div className="expression"><span>{question.base}</span><em>×</em><strong className={question.dir > 0 ? "sky" : "amber"}>{question.label}</strong><em>=</em><span>?</span></div>
      </motion.section>

      <div className="answers-grid">
        {options.map((value) => {
          let state = "";
          if (locked && value === question.answer) state = "correct";
          if (locked && value === choice && value !== question.answer) state = "wrong";
          return (
            <motion.button key={value} className={`answer-button ${state}`} disabled={locked} onClick={() => answer(value)} whileHover={!locked ? { y: -4, scale: 1.015 } : {}} whileTap={!locked ? { y: 3 } : {}}>
              {state === "correct" && <Check size={24} strokeWidth={3} />}
              {value}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {hint && (
          <motion.div className="hint-panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="hint-title"><Sparkles size={20} /> Подсказка</div>
            <p>{hint.text}</p>
            <div className="hint-chain">{hint.chain.map((item, i) => <React.Fragment key={`${item}-${i}`}><span>{item}</span>{i < hint.chain.length - 1 && <b>→</b>}</React.Fragment>)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function saveResultCard(player, score) {
  const canvas = document.createElement("canvas");
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 1400, 900);
  gradient.addColorStop(0, "#171231");
  gradient.addColorStop(1, "#2a1f58");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 62px Arial";
  ctx.fillText("Мастер умножения дробей", 70, 110);
  ctx.fillStyle = "#ffc53d";
  ctx.font = "900 88px Arial";
  ctx.fillText(player, 70, 230);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 48px Arial";
  ctx.fillText(`Результат: ${score} баллов`, 70, 320);
  ctx.fillStyle = "#a9a4c7";
  ctx.font = "600 30px Arial";
  ctx.fillText(`Цель 50 баллов выполнена · ${new Date().toLocaleDateString("ru-RU")}`, 70, 375);

  try {
    const img = await loadImage(CAT_URL);
    const boxX = 720, boxY = 90, boxW = 610, boxH = 720;
    const scale = Math.min(boxW / img.width, boxH / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, boxX + (boxW - w) / 2, boxY + (boxH - h) / 2, w, h);
  } catch {}

  ctx.fillStyle = "#34d399";
  ctx.font = "800 34px Arial";
  ctx.fillText("Теперь ты мастер по умножению дробей!", 70, 790);

  const link = document.createElement("a");
  link.download = `результат-${player.replace(/[^a-zа-яё0-9_-]+/gi, "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function VictoryScreen({ player, score, onRestart }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => confetti({ particleCount: 150, spread: 105, startVelocity: 45, origin: { y: .55 }, colors: ["#ffc53d", "#ff5d73", "#34d399", "#38bdf8", "#a78bfa"] }), 250);
    return () => clearTimeout(timer);
  }, []);

  async function copyResult() {
    const text = `${player} прошёл(а) тренажёр «Мастер умножения дробей» и набрал(а) ${score} баллов.`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { alert(text); }
  }

  return (
    <main className="victory-layout">
      <motion.div className="victory-card" initial={{ opacity: 0, scale: .84, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 20 }}>
        <div className="trophy">🏆</div>
        <div className="tag">Тренировка завершена</div>
        <h1>Теперь ты мастер по умножению дробей!</h1>
        <p><b>{player}</b>, результат — <strong>{score} баллов</strong>.</p>
        <img src={CAT_URL} className="cat-image" alt="Котик поздравляет" />
        <div className="victory-actions">
          <button className="push-button save-button" onClick={() => saveResultCard(player, score)}><Download size={21}/>Сохранить результат</button>
          <button className="secondary-button" onClick={copyResult}><Clipboard size={20}/>{copied ? "Скопировано!" : "Скопировать"}</button>
          <button className="secondary-button" onClick={onRestart}><RotateCcw size={20}/>Ещё раз</button>
        </div>
      </motion.div>
    </main>
  );
}

export default function App() {
  const [screen, setScreen] = useState("start");
  const [player, setPlayer] = useState("Ученик");
  const [finalScore, setFinalScore] = useState(0);

  function start(name) {
    setPlayer(name);
    setScreen("game");
  }

  function win(score, sound) {
    setFinalScore(score);
    if (sound) [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(true, f, .18, "triangle"), i * 90));
    setScreen("win");
  }

  return (
    <div className="app">
      <Background />
      <div className="noise" />
      <AnimatePresence mode="wait">
        {screen === "start" && <StartScreen key="start" onStart={start} />}
        {screen === "game" && <GameScreen key="game" player={player} onWin={win} />}
        {screen === "win" && <VictoryScreen key="win" player={player} score={finalScore} onRestart={() => setScreen("game")} />}
      </AnimatePresence>
    </div>
  );
}
