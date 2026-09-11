import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Star, Volume2, VolumeX } from "lucide-react";
import { GOAL } from "../lib/game";

export interface ScoreDelta {
  id: number;
  value: number;
}

interface ScoreBarProps {
  score: number;
  delta: ScoreDelta | null;
  soundOn: boolean;
  onToggleSound: () => void;
  onHelp: () => void;
}

const MILESTONES = [10, 20, 30, 40, 50];

export default function ScoreBar({ score, delta, soundOn, onToggleSound, onHelp }: ScoreBarProps) {
  const pct = Math.min(100, (score / GOAL) * 100);

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 pt-5 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-8 place-items-end rounded-xl bg-gradient-to-b from-[#ff7a8c] to-[#ff4d67] pb-1 font-display text-xl font-black text-white shadow-lg shadow-rose-500/30">
            ,
          </span>
          <div className="leading-tight">
            <div className="font-display text-[13px] font-extrabold tracking-wide text-white sm:text-sm">
              Запятая в движении
            </div>
            <div className="text-[11px] font-bold text-white/45">деление · 5–6 класс</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? "Выключить звук" : "Включить звук"}
            className="btn-push grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white/70 ring-1 ring-white/15 hover:bg-white/15 hover:text-white"
          >
            {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onHelp}
            aria-label="Показать правило"
            className="btn-push grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white/70 ring-1 ring-white/15 hover:bg-white/15 hover:text-white"
          >
            <BookOpen className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/12 backdrop-blur-md sm:gap-4 sm:p-4">
        <div className="relative shrink-0">
          <div className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-amber-300 to-amber-400 px-3 py-2 shadow-lg shadow-amber-500/25 sm:px-4">
            <Star className="h-5 w-5 fill-amber-700 text-amber-700 sm:h-6 sm:w-6" />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={score}
                initial={{ y: 10, opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="font-display text-xl font-black tabular-nums text-amber-950 sm:text-2xl"
              >
                {score}
              </motion.span>
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {delta && (
              <motion.span
                key={delta.id}
                initial={{ opacity: 0, y: 4, scale: 0.6 }}
                animate={{ opacity: 1, y: -30, scale: 1.15 }}
                exit={{ opacity: 0, y: -44, scale: 0.9 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`font-display pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-lg font-black ${
                  delta.value > 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {delta.value > 0 ? `+${delta.value}` : delta.value}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="truncate text-xs font-extrabold uppercase tracking-wider text-white/55 sm:text-sm">
              До цели осталось: <span className="text-white">{Math.max(0, GOAL - score)}</span>
            </span>
            <span className="shrink-0 text-xs font-extrabold text-white/55 sm:text-sm">
              Цель: <span className="text-amber-300">{GOAL}</span>
            </span>
          </div>
          <div className="relative h-4 overflow-visible rounded-full bg-white/10 ring-1 ring-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-violet-400 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            {MILESTONES.map((m) => (
              <span
                key={m}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(m / GOAL) * 100}%` }}
              >
                <Star
                  className={`h-4 w-4 transition-all duration-300 sm:h-5 sm:w-5 ${
                    score >= m
                      ? "fill-amber-300 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]"
                      : "fill-white/15 text-white/15"
                  }`}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
