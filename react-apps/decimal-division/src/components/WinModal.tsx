import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  House,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { sndWin } from "../lib/sound";

interface WinModalProps {
  open: boolean;
  playerName: string;
  score: number;
  solved: number;
  wrong: number;
  onRestart: () => void;
  onContinue: () => void;
  onFinish: () => void;
}

const COLORS = ["#ffc53d", "#ff5d73", "#34d399", "#38bdf8", "#a78bfa", "#ffffff"];

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export default function WinModal({
  open,
  playerName,
  score,
  solved,
  wrong,
  onRestart,
  onContinue,
  onFinish,
}: WinModalProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) {
      setSaved(false);
      return;
    }
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

  const saveResult = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 1400, 900);
    bg.addColorStop(0, "#17122d");
    bg.addColorStop(0.55, "#221745");
    bg.addColorStop(1, "#10192f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glow = ctx.createRadialGradient(1120, 130, 0, 1120, 130, 470);
    glow.addColorStop(0, "rgba(167,139,250,0.28)");
    glow.addColorStop(1, "rgba(167,139,250,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.07)";
    roundedRect(ctx, 90, 75, 1220, 750, 54);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#a78bfa";
    ctx.font = "800 30px Arial, sans-serif";
    ctx.fillText("МАТЕМАТИКА · 5–6 КЛАСС", 700, 155);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 64px Arial, sans-serif";
    ctx.fillText("Запятая в движении", 700, 245);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 48px Arial, sans-serif";
    ctx.fillText("Цель достигнута!", 700, 320);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 46px Arial, sans-serif";
    ctx.fillText(playerName, 700, 410);

    const cards = [
      { x: 180, label: "ОЧКИ", value: `${score} / 50`, color: "#fbbf24" },
      { x: 520, label: "ВЕРНЫХ", value: String(solved), color: "#34d399" },
      { x: 860, label: "ТОЧНОСТЬ", value: `${accuracy}%`, color: "#38bdf8" },
    ];

    for (const card of cards) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundedRect(ctx, card.x, 485, 280, 170, 32);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.stroke();
      ctx.fillStyle = card.color;
      ctx.font = "900 46px Arial, sans-serif";
      ctx.fillText(card.value, card.x + 140, 560);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "800 22px Arial, sans-serif";
      ctx.fillText(card.label, card.x + 140, 610);
    }

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "700 25px Arial, sans-serif";
    ctx.fillText(`Ошибок: ${wrong}`, 700, 715);

    const date = new Date().toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "600 21px Arial, sans-serif";
    ctx.fillText(`Результат сохранён ${date}`, 700, 765);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = playerName.trim().replace(/[^a-zA-Zа-яА-ЯёЁ0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "ученик";
      link.href = url;
      link.download = `результат-${safeName}-запятая-в-движении.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    }, "image/png");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0c0a18]/70 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.7, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="my-4 w-full max-w-md overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 p-[3px] shadow-[0_40px_120px_-20px_rgba(251,191,36,0.5)]"
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
                {playerName}, <span className="text-gradient">цель достигнута!</span>
              </h2>
              <p className="mt-2 text-sm font-bold text-white/60 sm:text-base">
                Теперь ты мастер по умножению десятичных дробей. Результат: {score} очков!
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
                  onClick={saveResult}
                  className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-6 py-3.5 font-display text-sm font-extrabold text-white shadow-lg shadow-sky-600/30 hover:bg-sky-400 sm:text-base"
                >
                  <Download className="h-5 w-5" strokeWidth={2.5} />
                  {saved ? "Результат сохранён!" : "Сохранить результат"}
                </button>

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

                <button
                  type="button"
                  onClick={onFinish}
                  className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-400/15 px-6 py-3 text-sm font-extrabold text-violet-200 ring-1 ring-violet-300/25 hover:bg-violet-400/25 hover:text-white"
                >
                  <House className="h-5 w-5" strokeWidth={2.5} />
                  Завершить игру и выйти на главную
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
