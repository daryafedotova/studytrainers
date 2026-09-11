import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NumberLine from "./NumberLine";
import { formatNumber } from "../lib/game";

interface RuleDemoProps {
  digits: string;
  c0: number;
  p: number;
  dir: 1 | -1;
  size?: "lg" | "md";
  resetKey?: number;
}

/**
 * Зацикленная анимация: запятая шаг за шагом перебегает на нужное число
 * знаков, затем показывается готовый ответ и всё начинается заново.
 */
export default function RuleDemo({ digits, c0, p, dir, size = "md", resetKey = 0 }: RuleDemoProps) {
  const target = useMemo(() => c0 + dir * p, [c0, dir, p]);
  const result = useMemo(() => formatNumber(digits, target), [digits, target]);
  const mult = useMemo(() => (dir > 0 ? String(10 ** p) : "0," + "0".repeat(p - 1) + "1"), [dir, p]);

  const [slot, setSlot] = useState(c0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    let s = c0;
    setSlot(c0);
    setDone(false);
    const step = () => {
      s += dir;
      setSlot(s);
      if (s !== target) {
        t = setTimeout(step, 650);
      } else {
        setDone(true);
        t = setTimeout(() => {
          s = c0;
          setSlot(c0);
          setDone(false);
          t = setTimeout(step, 900);
        }, 2100);
      }
    };
    t = setTimeout(step, 1000);
    return () => clearTimeout(t);
  }, [digits, c0, dir, target, resetKey]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="font-display flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
        <span className="text-white/90">{formatNumber(digits, c0)}</span>
        <span className="text-white/40">×</span>
        <span className={dir > 0 ? "text-sky-300" : "text-amber-300"}>{mult}</span>
        <span className="text-white/40">=</span>
        <span className="inline-flex min-w-10 justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={done ? "res" : "q"}
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className={done ? "text-gradient" : "text-white/25"}
            >
              {done ? result : "?"}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <div className="rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10">
        <NumberLine digits={digits} slot={slot} size={size} />
      </div>

      {/* Бегущие стрелки-подсказки направления */}
      <div className={`flex items-center ${dir > 0 ? "" : "flex-row-reverse"}`}>
        {Array.from({ length: p }).map((_, i) => (
          <motion.span
            key={i}
            className={dir > 0 ? "text-sky-300" : "text-amber-300"}
            animate={{ opacity: [0.2, 1, 0.2], x: dir > 0 ? [0, 4, 0] : [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
          >
            <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
              {dir > 0 ? (
                <path d="M2 10h20m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M24 10H4m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </motion.span>
        ))}
      </div>
    </div>
  );
}
