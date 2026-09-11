import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, CheckCircle2, Coins, XCircle } from "lucide-react";
import {
  GOAL,
  clampSlot,
  formatNumber,
  generateProblem,
  multiplierLabel,
  targetSlot,
  type Problem,
} from "../lib/game";
import { setSoundEnabled, sndCorrect, sndHop, sndWrong } from "../lib/sound";
import GameRow, { type RowStatus } from "./GameRow";
import HintPanel from "./HintPanel";
import ScoreBar, { type ScoreDelta } from "./ScoreBar";
import WinModal from "./WinModal";

interface GameBoardProps {
  paused: boolean;
  onHelp: () => void;
}

type FeedbackKind = "correct" | "wrong" | "noPoints";
interface Feedback {
  id: number;
  kind: FeedbackKind;
}

const CONFETTI_COLORS = ["#ffc53d", "#ff5d73", "#34d399", "#38bdf8", "#a78bfa"];

export default function GameBoard({ paused, onHelp }: GameBoardProps) {
  const [problem, setProblem] = useState<Problem>(() => generateProblem());
  const [slot, setSlot] = useState(problem.c0);
  const [score, setScore] = useState(0);
  const [delta, setDelta] = useState<ScoreDelta | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [status, setStatus] = useState<RowStatus>("idle");
  const [wrongSignal, setWrongSignal] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [solved, setSolved] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [winOpen, setWinOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const goalShownRef = useRef(false);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // всплывающее «+2 / −1» исчезает само
  useEffect(() => {
    if (!delta) return;
    const t = setTimeout(() => setDelta(null), 850);
    return () => clearTimeout(t);
  }, [delta]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const nextProblem = useCallback(
    (current?: Problem) => {
      const base = current ?? problem;
      const p = generateProblem(base);
      setProblem(p);
      setSlot(p.c0);
      setHintShown(false);
      setStatus("idle");
      setLocked(false);
      setFeedback(null);
    },
    [problem]
  );

  const handleHop = useCallback(
    (hops: number) => {
      if (locked || paused) return;
      const ns = clampSlot(problem.digits.length, slot + hops);
      if (ns === slot) return;
      setSlot(ns);
      sndHop();
      if (status === "wrong") setStatus("idle");
      if (feedback?.kind === "wrong") setFeedback(null);
    },
    [feedback, locked, paused, problem.digits.length, slot, status]
  );

  const handleCheck = useCallback(() => {
    if (locked || paused || slot === problem.c0) return;
    const target = targetSlot(problem);

    if (slot === target) {
      // ── Верный перенос ──
      setLocked(true);
      setStatus("correct");
      setSolved((v) => v + 1);
      sndCorrect();
      confetti({
        particleCount: 55,
        spread: 75,
        startVelocity: 32,
        origin: { y: 0.68 },
        colors: CONFETTI_COLORS,
      });

      if (!hintShown) {
        const ns = score + 2;
        setScore(ns);
        setDelta({ id: Date.now(), value: 2 });
        setFeedback({ id: Date.now(), kind: "correct" });
        if (ns >= GOAL && !goalShownRef.current) {
          goalShownRef.current = true;
          later(() => setWinOpen(true), 1300);
        }
      } else {
        // подсказка была открыта — очки за это задание не начисляются
        setFeedback({ id: Date.now(), kind: "noPoints" });
      }
      later(() => nextProblem(), 1900);
    } else {
      // ── Неверный перенос ──
      setWrong((v) => v + 1);
      setScore((s) => Math.max(0, s - 1));
      setDelta({ id: Date.now(), value: -1 });
      setStatus("wrong");
      setWrongSignal((v) => v + 1);
      setFeedback({ id: Date.now(), kind: "wrong" });
      setHintShown(true);
      sndWrong();
    }
  }, [hintShown, locked, nextProblem, paused, problem, score, slot]);

  // Клавиатура: ← → двигают запятую, Enter — проверка
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paused) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleHop(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleHop(1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleCheck();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleCheck, handleHop, paused]);

  const handleRestart = () => {
    setScore(0);
    setSolved(0);
    setWrong(0);
    setWinOpen(false);
    goalShownRef.current = false;
    nextProblem();
  };

  const liveMoved = slot !== problem.c0;
  const liveResult = liveMoved ? formatNumber(problem.digits, slot) : "?";

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <ScoreBar
        score={score}
        delta={delta}
        soundOn={soundOn}
        onToggleSound={() => {
          setSoundOn((v) => {
            setSoundEnabled(!v);
            return !v;
          });
        }}
        onHelp={onHelp}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-6">
        {/* Задание с живым результатом */}
        <motion.section
          key={`${problem.digits}-${problem.c0}-${problem.p}-${problem.dir}`}
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="rounded-[2rem] bg-white/[0.06] p-5 ring-1 ring-white/12 backdrop-blur-md sm:p-7"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/55 sm:text-xs">
              Вычисли, перенеся запятую
            </span>
            {hintShown && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-amber-300 sm:text-xs"
              >
                <Coins className="h-3.5 w-3.5" />
                без очков
              </motion.span>
            )}
          </div>

          <div className="font-display mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center">
            <span className="text-3xl font-black text-white sm:text-5xl">
              {formatNumber(problem.digits, problem.c0)}
            </span>
            <span className="text-2xl font-bold text-white/40 sm:text-4xl">×</span>
            <span
              className={`text-3xl font-black sm:text-5xl ${problem.dir > 0 ? "text-sky-300" : "text-amber-300"}`}
            >
              {multiplierLabel(problem)}
            </span>
            <span className="text-2xl font-bold text-white/40 sm:text-4xl">=</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={liveResult}
                initial={{ y: 14, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -14, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className={`text-3xl font-black tabular-nums sm:text-5xl ${
                  !liveMoved ? "text-white/25" : status === "correct" ? "text-emerald-300" : status === "wrong" ? "text-rose-300" : "text-gradient"
                }`}
              >
                {liveResult}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Интерактивный ряд цифр */}
          <div className="mt-5">
            <GameRow
              digits={problem.digits}
              c0={problem.c0}
              slot={slot}
              locked={locked || paused}
              status={status}
              wrongSignal={wrongSignal}
              onHop={handleHop}
            />
          </div>

          {/* Проверка + сообщения */}
          <div className="mt-5 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleCheck}
              disabled={locked || paused || slot === problem.c0}
              className="btn-push inline-flex min-w-48 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-500 px-7 py-3.5 font-display text-base font-extrabold text-white shadow-xl shadow-emerald-600/30 hover:brightness-105 disabled:cursor-not-allowed disabled:border-white/10 disabled:from-white/10 disabled:to-white/10 disabled:text-white/35 disabled:shadow-none sm:text-lg"
            >
              <Check className="h-6 w-6" strokeWidth={3.2} />
              Проверить
            </button>

            <div className="min-h-8">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div
                    key={feedback.id}
                    initial={{ scale: 0.7, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-extrabold sm:text-base ${
                      feedback.kind === "correct"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : feedback.kind === "noPoints"
                          ? "bg-amber-400/15 text-amber-300"
                          : "bg-rose-400/15 text-rose-300"
                    }`}
                  >
                    {feedback.kind === "correct" ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" /> Верно! +2 очка
                      </>
                    ) : feedback.kind === "noPoints" ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" /> Правильно! Но после подсказки очки не начисляются —
                        заработаешь на следующем задании
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" /> Неверно: −1 очко. Загляни в подсказку!
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* Подсказка после ошибки */}
        <AnimatePresence>
          {hintShown && !winOpen && (
            <HintPanel problem={problem} onSkip={() => nextProblem()} />
          )}
        </AnimatePresence>
      </main>

      <WinModal
        open={winOpen}
        solved={solved}
        wrong={wrong}
        onRestart={handleRestart}
        onContinue={() => setWinOpen(false)}
      />
    </div>
  );
}
