import { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { ChevronLeft, ChevronRight, MoveLeft, MoveRight, MousePointer2 } from "lucide-react";
import { clampSlot, znakWord } from "../lib/game";
import NumberLine from "./NumberLine";

export type RowStatus = "idle" | "correct" | "wrong";

interface GameRowProps {
  digits: string;
  c0: number;
  slot: number;
  locked: boolean;
  status: RowStatus;
  wrongSignal: number;
  onHop: (hops: number) => void;
}

export default function GameRow({ digits, c0, slot, locked, status, wrongSignal, onHop }: GameRowProps) {
  const controls = useAnimationControls();
  const n = digits.length;
  const canLeft = !locked && slot > -3;
  const canRight = !locked && slot < n + 3;
  const delta = slot - c0;

  useEffect(() => {
    if (wrongSignal > 0) {
      controls.start({ x: [0, -12, 12, -9, 9, -4, 0], transition: { duration: 0.5, ease: "easeInOut" } });
    }
  }, [wrongSignal, controls]);

  const ring =
    status === "correct"
      ? "ring-4 ring-emerald-400/80 bg-emerald-300/10"
      : status === "wrong"
        ? "ring-4 ring-rose-400/70 bg-rose-400/10"
        : "ring-1 ring-white/15 bg-white/[0.06]";

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={controls}
        className={`flex w-full items-center justify-center gap-2 rounded-[2rem] px-3 py-6 transition-colors duration-300 sm:gap-4 sm:px-6 sm:py-8 ${ring}`}
      >
        {/* Стрелка влево */}
        <button
          type="button"
          onClick={() => canLeft && onHop(-1)}
          disabled={!canLeft}
          aria-label="Перенести запятую на 1 знак влево"
          className="btn-push grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-b-4 border-violet-800 bg-violet-600 text-white shadow-lg shadow-violet-900/40 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-25 sm:h-14 sm:w-14"
        >
          <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={3} />
        </button>

        {/* Само число с запятой */}
        <div className="min-w-0 overflow-x-auto px-1 py-2">
          <NumberLine digits={digits} slot={slot} interactive={!locked} onHop={onHop} />
        </div>

        {/* Стрелка вправо */}
        <button
          type="button"
          onClick={() => canRight && onHop(1)}
          disabled={!canRight}
          aria-label="Перенести запятую на 1 знак вправо"
          className="btn-push grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-b-4 border-violet-800 bg-violet-600 text-white shadow-lg shadow-violet-900/40 hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-25 sm:h-14 sm:w-14"
        >
          <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" strokeWidth={3} />
        </button>
      </motion.div>

      {/* Счётчик переноса */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {delta === 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white/70">
            <MousePointer2 className="h-4 w-4" />
            Потяни запятую, жми стрелки или клавиши ← →
          </span>
        ) : (
          <motion.span
            key={delta}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-extrabold ${
              delta > 0 ? "bg-sky-400/15 text-sky-300" : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {delta > 0 ? <MoveRight className="h-4 w-4" /> : <MoveLeft className="h-4 w-4" />}
            Сдвиг: {Math.abs(delta)} {znakWord(Math.abs(delta))} {delta > 0 ? "вправо" : "влево"}
          </motion.span>
        )}
      </div>
    </div>
  );
}

export { clampSlot };
