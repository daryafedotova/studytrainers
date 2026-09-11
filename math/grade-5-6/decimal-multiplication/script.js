const STORAGE_KEY = "decimalMultiplicationUsedV2";
const GOAL = 50;

const els = {
  startScreen: document.getElementById("startScreen"),
  gameScreen: document.getElementById("gameScreen"),
  victoryScreen: document.getElementById("victoryScreen"),
  playerName: document.getElementById("playerName"),
  startBtn: document.getElementById("startBtn"),
  playerLabel: document.getElementById("playerLabel"),
  scoreValue: document.getElementById("scoreValue"),
  progressBar: document.getElementById("progressBar"),
  taskCard: document.getElementById("taskCard"),
  taskText: document.getElementById("taskText"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  hintBox: document.getElementById("hintBox"),
  soundBtn: document.getElementById("soundBtn"),
  resultText: document.getElementById("resultText"),
  copyBtn: document.getElementById("copyBtn"),
  restartBtn: document.getElementById("restartBtn"),
  confettiLayer: document.getElementById("confettiLayer")
};

let score = 0;
let player = "Ученик";
let current = null;
let locked = false;
let soundEnabled = true;
let used = new Set(loadUsed());

const multipliers = [
  { value: 10, exponent: 1, label: "10" },
  { value: 100, exponent: 2, label: "100" },
  { value: 1000, exponent: 3, label: "1000" },
  { value: 0.1, exponent: -1, label: "0,1" },
  { value: 0.01, exponent: -2, label: "0,01" },
  { value: 0.001, exponent: -3, label: "0,001" }
];

function loadUsed() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveUsed() {
  const list = Array.from(used).slice(-700);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function roundValue(value) {
  return Number(value.toFixed(8));
}

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU", {
    useGrouping: false,
    maximumFractionDigits: 8
  }).format(roundValue(value));
}

function makeBaseNumber() {
  const places = 1 + Math.floor(Math.random() * 3);
  const scale = 10 ** places;
  const integerPart = Math.floor(Math.random() * 90);
  let fractional = Math.floor(Math.random() * scale);
  if (fractional === 0) fractional = 1;
  return roundValue(integerPart + fractional / scale);
}

function generateQuestion() {
  let attempts = 0;
  while (attempts < 2500) {
    const a = makeBaseNumber();
    const mult = multipliers[Math.floor(Math.random() * multipliers.length)];
    const signature = `${a}|${mult.value}`;
    attempts += 1;

    if (used.has(signature)) continue;

    used.add(signature);
    saveUsed();

    return {
      a,
      multiplier: mult.value,
      exponent: mult.exponent,
      multiplierLabel: mult.label,
      answer: roundValue(a * 10 ** mult.exponent)
    };
  }

  used.clear();
  saveUsed();
  return generateQuestion();
}

function plausibleDistractors(q) {
  const exponents = [
    -q.exponent,
    q.exponent > 0 ? q.exponent - 1 : q.exponent + 1,
    q.exponent > 0 ? q.exponent + 1 : q.exponent - 1,
    0
  ];

  const values = [];
  for (const exp of exponents) {
    const value = roundValue(q.a * 10 ** exp);
    if (value !== q.answer && !values.includes(value)) values.push(value);
  }

  let extraShift = q.exponent > 0 ? 2 : -2;
  while (values.length < 3) {
    const value = roundValue(q.answer * 10 ** extraShift);
    if (value !== q.answer && !values.includes(value)) values.push(value);
    extraShift += q.exponent > 0 ? 1 : -1;
  }

  return values.slice(0, 3);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderQuestion() {
  locked = false;
  current = generateQuestion();
  els.feedback.className = "feedback hidden";
  els.feedback.textContent = "";
  els.hintBox.classList.add("hidden");
  els.hintBox.textContent = "";

  els.taskText.textContent = `${formatNumber(current.a)} × ${current.multiplierLabel} = ?`;

  const options = shuffle([current.answer, ...plausibleDistractors(current)]);
  els.answers.innerHTML = "";

  options.forEach((value) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.type = "button";
    btn.textContent = formatNumber(value);
    btn.addEventListener("click", () => checkAnswer(value));
    els.answers.appendChild(btn);
  });
}

function disableAnswers() {
  els.answers.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
}

function checkAnswer(value) {
  if (locked) return;
  locked = true;
  disableAnswers();

  if (value === current.answer) {
    score += 2;
    updateScore();
    els.feedback.className = "feedback correct";
    els.feedback.textContent = "+2 балла · Верно!";
    els.taskCard.classList.remove("correct-pulse");
    void els.taskCard.offsetWidth;
    els.taskCard.classList.add("correct-pulse");
    playTone(660, 0.08);
    setTimeout(finishOrNext, 650);
    return;
  }

  score += 1;
  updateScore();
  const direction = current.exponent > 0 ? "вправо" : "влево";
  const steps = Math.abs(current.exponent);
  const word = steps === 1 ? "цифру" : "цифры";

  els.hintBox.innerHTML = `💡 <strong>Подсказка:</strong> при умножении на ${current.multiplierLabel} перенеси запятую <strong>${direction}</strong> на ${steps} ${word}.`;
  els.hintBox.classList.remove("hidden");
  playTone(250, 0.06);

  setTimeout(finishOrNext, 2300);
}

function finishOrNext() {
  if (score >= GOAL) {
    showVictory();
  } else {
    renderQuestion();
  }
}

function updateScore() {
  els.scoreValue.textContent = score;
  els.progressBar.style.width = `${Math.min(score, GOAL) / GOAL * 100}%`;
}

function startGame() {
  player = els.playerName.value.trim() || "Ученик";
  score = 0;
  updateScore();
  els.playerLabel.textContent = player;
  els.startScreen.classList.add("hidden");
  els.victoryScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  renderQuestion();
}

function showVictory() {
  els.gameScreen.classList.add("hidden");
  els.victoryScreen.classList.remove("hidden");
  els.resultText.textContent = `${player}, результат — ${score} баллов. Отличная работа!`;
  playVictorySound();
  launchConfetti();
}

function resetGame() {
  score = 0;
  updateScore();
  els.confettiLayer.innerHTML = "";
  els.victoryScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  renderQuestion();
}

async function copyResult() {
  const text = `${player} прошёл(а) тренажёр «Мастер умножения дробей» и набрал(а) ${score} баллов.`;
  try {
    await navigator.clipboard.writeText(text);
    els.copyBtn.textContent = "Скопировано!";
    setTimeout(() => els.copyBtn.textContent = "Скопировать результат", 1400);
  } catch {
    alert(text);
  }
}

function launchConfetti() {
  els.confettiLayer.innerHTML = "";
  const colors = ["#6858e8", "#1bb39e", "#f2b84b", "#ef7391", "#5eb8f2"];

  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--fall", `${2.4 + Math.random() * 2.2}s`);
    piece.style.setProperty("--rot", `${Math.random() * 180}deg`);
    piece.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    piece.style.animationDelay = `${Math.random() * 1.2}s`;
    els.confettiLayer.appendChild(piece);
  }

  setTimeout(() => els.confettiLayer.innerHTML = "", 6000);
}

function playTone(frequency, duration) {
  if (!soundEnabled || !window.AudioContext && !window.webkitAudioContext) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playVictorySound() {
  if (!soundEnabled) return;
  [523, 659, 784].forEach((frequency, index) => {
    setTimeout(() => playTone(frequency, 0.18), index * 120);
  });
}

els.startBtn.addEventListener("click", startGame);
els.playerName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") startGame();
});
els.restartBtn.addEventListener("click", resetGame);
els.copyBtn.addEventListener("click", copyResult);
els.soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  els.soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  els.soundBtn.setAttribute("aria-label", soundEnabled ? "Выключить звук" : "Включить звук");
});
