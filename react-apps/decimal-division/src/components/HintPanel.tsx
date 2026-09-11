import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Lightbulb, MoveLeft, MoveRight, SkipForward, Coins } from "lucide-react";
import { multiplierLabel, znakWord, type Problem } from "../lib/game";
import RuleDemo from "./RuleDemo";

interface HintPanelProps {
  problem: Problem;
  onSkip: () => void;
}

/** Подсказка с правилом быстрого умножения — появляется после ошибки */
export default function HintPanel({ problem, onSkip }: HintPanelProps) {
  const { dir, p } = problem;
  const rootRef = useRef<HTMLDivElement>(null);

  // плавно подскролливаем, чтобы подсказка точно попала в поле зрения
  useEffect(() => {
    const t = setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-300 via-amber-200 to-orange-200 p-[3px] shadow-2xl shadow-amber-500/20"
    >
      <div className="rounded-[calc(2rem-3px)] bg-[#241c12]/95 p-5 sm:p-6">
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-stretch md:gap-8">
          {/* Текст правила */}
          <div className="flex-1">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/30">
                <Lightbulb className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <h3 className="font-display text-lg font-extrabold text-amber-300 sm:text-xl">Подсказка</h3>
            </div>

            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-amber-100/90 sm:text-base">
              Чтобы умножить на <b className="text-amber-300">{multiplierLabel(problem)}</b>, запятую переносим{" "}
              <span className="inline-flex translate-y-0.5 items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 font-extrabold text-amber-300">
                {dir > 0 ? <MoveRight className="h-4 w-4" /> : <MoveLeft className="h-4 w-4" />}
                {dir > 0 ? "ВПРАВО" : "ВЛЕВО"}
              </span>{" "}
              на <b className="text-amber-300">{p} {znakWord(p)}</b> —{" "}
              {dir > 0 ? "столько, сколько нулей в множителе." : "столько, сколько цифр после запятой в множителе."}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/15 px-3 py-1.5 text-xs font-extrabold text-rose-300">
                <Coins className="h-3.5 w-3.5" />
                Подсказка открыта: очки за это задание не начисляются
              </span>
              <button
                type="button"
                onClick={onSkip}
                className="btn-push inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white/70 hover:bg-white/15 hover:text-white"
              >
                <SkipForward className="h-3.5 w-3.5" />
                Другое задание
              </button>
            </div>
          </div>

          {/* Живая демонстрация именно этого примера */}
          <div className="shrink-0 rounded-3xl bg-white/[0.05] p-4 ring-1 ring-white/10">
            <RuleDemo digits={problem.digits} c0={problem.c0} p={problem.p} dir={problem.dir} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
