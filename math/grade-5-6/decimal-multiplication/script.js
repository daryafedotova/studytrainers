const STORAGE_KEY = "decimalMultiplicationUsedV3";
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
  { exponent: 1, label: "10" },
  { exponent: 2, label: "100" },
  { exponent: 3, label: "1000" },
  { exponent: -1, label: "0,1" },
  { exponent: -2, label: "0,01" },
  { exponent: -3, label: "0,001" }
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(used).slice(-700)));
}

function normalizeDecimalString(value) {
  let text = String(value).replace(".", ",");

  if (!text.includes(",")) {
    return text.replace(/^0+(?=\d)/, "") || "0";
  }

  let [integerPart, fractionalPart] = text.split(",");
  integerPart = integerPart.replace(/^0+(?=\d)/, "") || "0";
  fractionalPart = fractionalPart.replace(/0+$/, "");

  return fractionalPart ? `${integerPart},${fractionalPart}` : integerPart;
}

function moveDecimal(source, shift) {
  let [integerPart, fractionalPart = ""] = String(source).replace(".", ",").split(",");
  integerPart = integerPart.replace(/^0+(?=\d)/, "") || "0";

  const digits = integerPart + fractionalPart;
  const oldIndex = integerPart.length;
  const newIndex = oldIndex + shift;
  let result;

  if (newIndex <= 0) {
    result = `0,${"0".repeat(-newIndex)}${digits}`;
  } else if (newIndex >= digits.length) {
    result = `${digits}${"0".repeat(newIndex - digits.length)}`;
  } else {
    result = `${digits.slice(0, newIndex)},${digits.slice(newIndex)}`;
  }

  return normalizeDecimalString(result);
}

function makeBaseString() {
  const fractionalLength = 1 + Math.floor(Math.random() * 3);
  const integerPart = Math.random() < 0.22 ? 0 : 1 + Math.floor(Math.random() * 90);

  let fractionalPart = "";
  for (let i = 0; i < fractionalLength; i++) {
    fractionalPart += Math.floor(Math.random() * 10);
  }

  if (/^0+$/.test(fractionalPart)) {
    fractionalPart = fractionalPart.slice(0, -1) + String(1 + Math.floor(Math.random() * 9));
  }

  if (fractionalPart.endsWith("0")) {
    fractionalPart = fractionalPart.slice(0, -1) + String(1 + Math.floor(Math.random() * 9));
  }

  return `${integerPart},${fractionalPart}`;
}

function generateQuestion() {
  let attempts = 0;

  while (attempts < 2500) {
    const source = makeBaseString();
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const signature = `${source}|${multiplier.label}`;
    attempts += 1;

    if (used.has(signature)) continue;

    used.add(signature);
    saveUsed();

    return {
      source,
      exponent: multiplier.exponent,
      multiplierLabel: multiplier.label,
      answer: moveDecimal(source, multiplier.exponent)
    };
  }

  used.clear();
  saveUsed();
  return generateQuestion();
}

function makeDistractors(question) {
  const distractors = [];
  const sign = Math.sign(question.exponent);
  const magnitude = Math.abs(question.exponent);

  const candidateShifts = [
    sign * (magnitude === 1 ? 2 : magnitude - 1),
    sign * (magnitude + 1),
    -question.exponent,
    0,
    sign * (magnitude + 2),
    -sign * Math.max(1, magnitude - 1),
    -sign * (magnitude + 1)
  ];

  for (const shift of candidateShifts) {
    if (shift === question.exponent) continue;

    const value = moveDecimal(question.source, shift);
    if (value !== question.answer && !distractors.includes(value) && !value.startsWith("-")) {
      distractors.push(value);
    }

    if (distractors.length === 3) return distractors;
  }

  for (let shift = -5; shift <= 5 && distractors.length < 3; shift++) {
    if (shift === question.exponent) continue;

    const value = moveDecimal(question.source, shift);
    if (value !== question.answer && !distractors.includes(value) && !value.startsWith("-")) {
      distractors.push(value);
    }
  }

  return distractors.slice(0, 3);
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

  els.taskText.textContent = `${current.source} × ${current.multiplierLabel} = ?`;

  const options = shuffle([current.answer, ...makeDistractors(current)]);
  els.answers.innerHTML = "";

  options.forEach((value) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.textContent = value;
    button.addEventListener("click", () => checkAnswer(value));
    els.answers.appendChild(button);
  });
}

function disableAnswers() {
  els.answers.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
}

function buildShiftPath(source, exponent) {
  const values = [source];
  let value = source;
  const step = exponent > 0 ? 1 : -1;

  for (let i = 0; i < Math.abs(exponent); i++) {
    value = moveDecimal(value, step);
    values.push(value);
  }

  return values.join(" → ");
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
  const stepsWord = steps === 1 ? "знак" : "знака";
  const reason = current.exponent > 0
    ? `потому что в ${current.multiplierLabel} ${steps} ${steps === 1 ? "ноль" : "нуля"}`
    : `потому что в ${current.multiplierLabel} после запятой ${steps} ${steps === 1 ? "цифра" : "цифры"}`;

  els.hintBox.innerHTML = `💡 <strong>Подсказка:</strong> перенеси запятую <strong>${direction}</strong> на ${steps} ${stepsWord}, ${reason}.<br><strong>${buildShiftPath(current.source, current.exponent)}</strong>`;
  els.hintBox.classList.remove("hidden");
  playTone(250, 0.06);

  setTimeout(finishOrNext, 3000);
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
    setTimeout(() => {
      els.copyBtn.textContent = "Скопировать результат";
    }, 1400);
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

  setTimeout(() => {
    els.confettiLayer.innerHTML = "";
  }, 6000);
}

function playTone(frequency, duration) {
  if (!soundEnabled || (!window.AudioContext && !window.webkitAudioContext)) return;

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
