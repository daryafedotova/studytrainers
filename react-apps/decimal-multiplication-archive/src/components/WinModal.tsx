import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, RotateCcw, Target, Trophy, XCircle, CheckCircle2 } from "lucide-react";
import { sndWin } from "../lib/sound";

interface WinModalProps {
  open: boolean;
  solved: number;
  wrong: number;
  onRestart: () => void;
  onContinue: () => void;
}

const COLORS = ["#ffc53d", "#ff5d73", "#34d399", "#38bdf8", "#a78bfa", "#ffffff"];

export default function WinModal({ open, solved, wrong, onRestart, onContinue }: WinModalProps) {
  useEffect(() => {
    if (!open) return;
    sndWin();
    confetti({
      particleCount: 160,
      spread: 90,
      startVelocity: 42,
      origin: { y: 0.6 },
      colors: COLORS,
    });
    const timer = setInterval(() => {
      confetti({ particleCount: 45, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS });
      confetti({ particleCount: 45, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS });
    }, 450);
    const stop = setTimeout(() => clearInterval(timer), 2200);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [open]);

  const total = solved + wrong;
  const accuracy = total > 0 ? Math.round((solved / total) * 100) : 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#0c0a18]/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-full max-w-md overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 p-[3px] shadow-[0_40px_120px_-20px_rgba(251,191,36,0.5)]"
          >
            <div className="rounded-[calc(2.2rem-3px)] bg-[#1c1636] px-6 py-8 text-center sm:px-10">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
                className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 shadow-xl shadow-amber-500/40"
              >
                <Trophy className="h-10 w-10 text-amber-950" strokeWidth={2.2} />
              </motion.div>

              <h2 className="font-display mt-5 text-2xl font-black leading-tight text-white sm:text-3xl">
                Отлично! <span className="text-gradient">Цель достигнута!</span>
              </h2>
              <p className="mt-2 text-sm font-bold text-white/60 sm:text-base">
                Ты набрал 50 очков — перенос запятой покорён!
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-300" />
                  <div className="font-display mt-1 text-xl font-black text-white">{solved}</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/45">верных</div>
                </div>
                <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <XCircle className="mx-auto h-5 w-5 text-rose-300" />
                  <div className="font-display mt-1 text-xl font-black text-white">{wrong}</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/45">ошибок</div>
                </div>
                <div className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <Target className="mx-auto h-5 w-5 text-sky-300" />
                  <div className="font-display mt-1 text-xl font-black text-white">{accuracy}%</div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wide text-white/45">точность</div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={onRestart}
                  className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 font-display text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-400 sm:text-base"
                >
                  <RotateCcw className="h-5 w-5" strokeWidth={2.5} />
                  Сыграть ещё раз
                </button>
                <button
                  type="button"
                  onClick={onContinue}
                  className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-extrabold text-white/75 ring-1 ring-white/15 hover:bg-white/15 hover:text-white"
                >
                  Продолжить тренировку
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
