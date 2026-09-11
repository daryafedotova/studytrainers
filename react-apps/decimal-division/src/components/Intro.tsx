import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Eye,
  Flag,
  Hand,
  MinusCircle,
  MoveLeft,
  MoveRight,
  Play,
  PlusCircle,
  UserRound,
} from "lucide-react";
import RuleDemo from "./RuleDemo";

interface IntroProps {
  mode: "start" | "help";
  onStart: () => void;
  playerName?: string;
  onPlayerNameChange?: (value: string) => void;
}

const fade = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
};

export default function Intro({ mode, onStart, playerName = "", onPlayerNameChange }: IntroProps) {
  const canStart = mode === "help" || playerName.trim().length > 0;

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-10 sm:px-6">
      {/* Значок-запятая */}
      <motion.div
        initial={{ scale: 0, rotate: -18 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="grid h-20 w-16 place-items-end rounded-3xl bg-gradient-to-b from-[#ff7a8c] to-[#ff4d67] pb-2 shadow-2xl shadow-rose-500/40"
      >
        <span className="font-display text-5xl font-black leading-none text-white">,</span>
      </motion.div>

      <motion.div {...fade} transition={{ delay: 0.1, duration: 0.55 }} className="mt-6 text-center">
        <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/60 ring-1 ring-white/15 sm:text-xs">
          Игра-тренажёр · математика · 5–6 класс
        </span>
        <h1 className="font-display mt-4 text-3xl font-black leading-[1.08] text-white sm:text-5xl md:text-6xl">
          Запятая <span className="text-gradient">в движении</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-white/65 sm:text-lg">
          Мгновенно делим десятичные дроби на <b className="text-sky-300">10, 100, 1000</b> и на{" "}
          <b className="text-amber-300">0,1; 0,01; 0,001</b> — просто перенося запятую в нужную сторону!
        </p>
      </motion.div>

      {/* Два правила с живыми демонстрациями */}
      <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
        <motion.div
          {...fade}
          transition={{ delay: 0.22, duration: 0.55 }}
          className="rounded-[2rem] bg-sky-400/[0.08] p-6 ring-1 ring-sky-300/20 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-sky-950 shadow-lg shadow-sky-500/30">
              <MoveLeft className="h-5 w-5" strokeWidth={3} />
            </span>
            <h2 className="font-display text-lg font-extrabold text-sky-300 sm:text-xl">÷ 10, 100, 1000</h2>
          </div>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-white/70 sm:text-[15px]">
            Считаем <b className="text-sky-300">НУЛИ</b> в делителе — на столько знаков запятая бежит{" "}
            <b className="text-sky-300">ВЛЕВО</b>. Число уменьшается!
          </p>
          <div className="mt-4">
            <RuleDemo digits="635" c0={1} p={2} dir={-1} />
          </div>
        </motion.div>

        <motion.div
          {...fade}
          transition={{ delay: 0.32, duration: 0.55 }}
          className="rounded-[2rem] bg-amber-400/[0.08] p-6 ring-1 ring-amber-300/20 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/30">
              <MoveRight className="h-5 w-5" strokeWidth={3} />
            </span>
            <h2 className="font-display text-lg font-extrabold text-amber-300 sm:text-xl">÷ 0,1; 0,01; 0,001</h2>
          </div>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-white/70 sm:text-[15px]">
            Считаем <b className="text-amber-300">ЦИФРЫ после запятой</b> в делителе — на столько знаков запятая
            бежит <b className="text-amber-300">ВПРАВО</b>. Число увеличивается!
          </p>
          <div className="mt-4">
            <RuleDemo digits="635" c0={1} p={1} dir={1} />
          </div>
        </motion.div>
      </div>

      {/* Как играть */}
      <motion.div
        {...fade}
        transition={{ delay: 0.42, duration: 0.55 }}
        className="mt-4 grid w-full gap-3 sm:grid-cols-3"
      >
        {[
          { icon: Eye, t: "Смотри на пример", d: "Например: 6,35 ÷ 100" },
          { icon: Hand, t: "Переноси запятую", d: "Тяни её или жми стрелки" },
          { icon: CheckCircle2, t: "Жми «Проверить»", d: "И получай очки!" },
        ].map((s) => (
          <div key={s.t} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white/80">
              <s.icon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-white">{s.t}</div>
              <div className="text-xs font-bold text-white/50">{s.d}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Очки и цель */}
      <motion.div
        {...fade}
        transition={{ delay: 0.5, duration: 0.55 }}
        className="mt-4 flex flex-wrap items-center justify-center gap-2.5"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-extrabold text-emerald-300 ring-1 ring-emerald-300/25">
          <PlusCircle className="h-4 w-4" /> +2 за верный перенос
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/15 px-4 py-2 text-sm font-extrabold text-rose-300 ring-1 ring-rose-300/25">
          <MinusCircle className="h-4 w-4" /> −1 за ошибку
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-4 py-2 text-sm font-extrabold text-amber-300 ring-1 ring-amber-300/25">
          <Coins className="h-4 w-4" /> после подсказки очки не дают
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/15 px-4 py-2 text-sm font-extrabold text-violet-300 ring-1 ring-violet-300/25">
          <Flag className="h-4 w-4" /> Цель — 50 очков
        </span>
      </motion.div>

      {mode === "start" && (
        <motion.div
          {...fade}
          transition={{ delay: 0.56, duration: 0.55 }}
          className="mt-7 w-full max-w-md"
        >
          <label htmlFor="player-name" className="mb-2 block text-center text-sm font-extrabold text-slate-700">
            Как тебя зовут?
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="player-name"
              type="text"
              value={playerName}
              onChange={(e) => onPlayerNameChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && playerName.trim()) onStart();
              }}
              maxLength={40}
              autoComplete="off"
              placeholder="Введи имя"
              className="w-full rounded-2xl border border-sky-200 bg-white/85 py-3.5 pl-12 pr-4 text-base font-extrabold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-200/60"
            />
          </div>
        </motion.div>
      )}

      {/* Старт */}
      <motion.button
        {...fade}
        transition={{ delay: 0.62, duration: 0.55 }}
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="btn-push group mt-8 inline-flex items-center gap-3 rounded-3xl border-b-[6px] border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-500 px-10 py-4 font-display text-lg font-black text-white shadow-2xl shadow-emerald-600/40 hover:brightness-105 disabled:cursor-not-allowed disabled:border-slate-200 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none sm:text-xl"
      >
        <Play className="h-6 w-6 fill-white transition-transform group-hover:scale-110" />
        {mode === "start" ? "Начать игру" : "Продолжить игру"}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
      </motion.button>
    </div>
  );
}
