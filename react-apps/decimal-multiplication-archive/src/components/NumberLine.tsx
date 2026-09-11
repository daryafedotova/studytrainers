import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { cellsForSlot } from "../lib/game";

export interface NumberLineProps {
  digits: string;
  slot: number;
  interactive?: boolean;
  onHop?: (hops: number) => void;
  size?: "lg" | "md";
}

const spring = { type: "spring" as const, stiffness: 550, damping: 34 };

/**
 * Анимированный ряд плиток-цифр с интерактивной запятой.
 * Запятую можно тянуть мышью/пальцем, кликать по стрелкам (снаружи)
 * или клавишами — каждое движение превращается в целое число «прыжков».
 */
export default function NumberLine({ digits, slot, interactive = false, onHop, size = "lg" }: NumberLineProps) {
  const cells = cellsForSlot(digits, slot);
  const tile =
    size === "lg"
      ? "h-12 w-8 text-[1.45rem] sm:h-16 sm:w-11 sm:text-4xl md:h-[4.4rem] md:w-[3.1rem] md:text-[2.5rem]"
      : "h-9 w-6 text-lg sm:h-10 sm:w-7 sm:text-xl";
  const commaSize =
    size === "lg" ? "h-12 w-7 text-2xl sm:h-16 sm:w-9 sm:text-4xl md:h-[4.4rem] md:w-10 md:text-[2.4rem]" : "h-9 w-5 text-lg sm:h-10 sm:w-6 sm:text-xl";

  return (
    <LayoutGroup>
      <div className="flex select-none items-end justify-center gap-1 sm:gap-1.5" role="group" aria-label="Интерактивное число">
        <AnimatePresence mode="popLayout" initial={false}>
          {cells.map((cell) =>
            cell.kind === "comma" ? (
              <motion.div
                key="comma"
                layout
                transition={spring}
                drag={interactive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.55}
                onDragEnd={(_, info) => {
                  const hops = Math.round(info.offset.x / 36);
                  if (hops !== 0 && onHop) onHop(hops);
                }}
                whileDrag={interactive ? { scale: 1.18, zIndex: 30 } : undefined}
                whileHover={interactive ? { scale: 1.08, y: -3 } : undefined}
                className={`${commaSize} comma-glow z-10 flex items-end justify-center rounded-xl bg-gradient-to-b from-[#ff7a8c] to-[#ff4d67] pb-1 font-display font-black text-white shadow-lg sm:pb-2 ${
                  interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""
                }`}
                title={interactive ? "Потяни запятую влево или вправо" : undefined}
              >
                <span className="leading-none">,</span>
              </motion.div>
            ) : (
              <motion.div
                key={cell.key}
                layout
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 10 }}
                transition={spring}
                className={`${tile} ${
                  cell.kind === "zero" ? "tile-zero text-amber-700" : "tile-digit text-[#17132b]"
                } flex items-center justify-center rounded-xl font-display font-bold`}
              >
                {cell.char}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
