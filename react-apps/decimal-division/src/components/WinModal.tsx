import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowRight, CheckCircle2, Download, House, RotateCcw, Target, Trophy, XCircle } from "lucide-react";
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

const COLORS = ["#f59e0b", "#fb7185", "#34d399", "#38bdf8", "#8b5cf6", "#ffffff"];

function roundedRect(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, r:number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.arcTo(x+w,y,x+w,y+h,radius); ctx.arcTo(x+w,y+h,x,y+h,radius); ctx.arcTo(x,y+h,x,y,radius); ctx.arcTo(x,y,x+w,y,radius); ctx.closePath();
}

export default function WinModal({ open, playerName, score, solved, wrong, onRestart, onContinue, onFinish }: WinModalProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) { setSaved(false); return; }
    sndWin();
    confetti({ particleCount: 160, spread: 90, startVelocity: 42, origin: { y: 0.6 }, colors: COLORS });
    const timer = setInterval(() => {
      confetti({ particleCount: 45, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS });
      confetti({ particleCount: 45, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS });
    }, 450);
    const stop = setTimeout(() => clearInterval(timer), 2200);
    return () => { clearInterval(timer); clearTimeout(stop); };
  }, [open]);

  const total = solved + wrong;
  const accuracy = total > 0 ? Math.round((solved / total) * 100) : 100;

  const saveResult = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400; canvas.height = 900;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const bg = ctx.createLinearGradient(0, 0, 1400, 900);
    bg.addColorStop(0, "#f8fcff"); bg.addColorStop(0.55, "#eef6ff"); bg.addColorStop(1, "#f4efff");
    ctx.fillStyle = bg; ctx.fillRect(0,0,1400,900);
    ctx.fillStyle = "rgba(255,255,255,0.88)"; roundedRect(ctx, 90, 75, 1220, 750, 54); ctx.fill();
    ctx.strokeStyle = "rgba(96,165,250,0.32)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#0284c7"; ctx.font = "800 30px Arial, sans-serif"; ctx.fillText("МАТЕМАТИКА · 5–6 КЛАСС",700,155);
    ctx.fillStyle = "#0f172a"; ctx.font = "900 64px Arial, sans-serif"; ctx.fillText("Запятая в движении",700,245);
    ctx.fillStyle = "#7c3aed"; ctx.font = "900 44px Arial, sans-serif"; ctx.fillText("Деление десятичных дробей",700,315);
    ctx.fillStyle = "#0f172a"; ctx.font = "800 46px Arial, sans-serif"; ctx.fillText(playerName,700,405);
    const cards=[
      {x:180,label:"ОЧКИ",value:`${score} / 50`,color:"#d97706"},
      {x:520,label:"ВЕРНЫХ",value:String(solved),color:"#059669"},
      {x:860,label:"ТОЧНОСТЬ",value:`${accuracy}%`,color:"#0284c7"},
    ];
    for (const card of cards) {
      ctx.fillStyle="#ffffff"; roundedRect(ctx,card.x,485,280,170,32); ctx.fill();
      ctx.strokeStyle="rgba(148,163,184,.32)"; ctx.stroke();
      ctx.fillStyle=card.color; ctx.font="900 46px Arial, sans-serif"; ctx.fillText(card.value,card.x+140,560);
      ctx.fillStyle="#64748b"; ctx.font="800 22px Arial, sans-serif"; ctx.fillText(card.label,card.x+140,610);
    }
    ctx.fillStyle="#64748b"; ctx.font="700 25px Arial, sans-serif"; ctx.fillText(`Ошибок: ${wrong}`,700,715);
    const date=new Date().toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit",year:"numeric"});
    ctx.fillStyle="#94a3b8"; ctx.font="600 21px Arial, sans-serif"; ctx.fillText(`Результат сохранён ${date}`,700,765);
    canvas.toBlob((blob)=>{
      if(!blob) return; const url=URL.createObjectURL(blob); const link=document.createElement("a");
      const safeName=playerName.trim().replace(/[^a-zA-Zа-яА-ЯёЁ0-9_-]+/g,"-").replace(/^-+|-+$/g,"")||"ученик";
      link.href=url; link.download=`результат-${safeName}-деление-дробей.png`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); setSaved(true); window.setTimeout(()=>setSaved(false),2500);
    },"image/png");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-sky-100/75 p-4 backdrop-blur-md">
          <motion.div initial={{scale:.7,y:60,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:.8,y:40,opacity:0}} transition={{type:"spring",stiffness:260,damping:22}} className="my-4 w-full max-w-md overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-sky-300 via-cyan-200 to-violet-300 p-[3px] shadow-[0_40px_120px_-20px_rgba(56,189,248,.35)]">
            <div className="rounded-[calc(2.2rem-3px)] bg-white/95 px-6 py-8 text-center sm:px-10">
              <motion.div initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}} transition={{delay:.15,type:"spring",stiffness:300,damping:15}} className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-b from-amber-300 to-amber-500 shadow-xl shadow-amber-300/50">
                <Trophy className="h-10 w-10 text-amber-950" strokeWidth={2.2}/>
              </motion.div>
              <h2 className="font-display mt-5 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{playerName}, <span className="text-gradient">цель достигнута!</span></h2>
              <p className="mt-2 text-sm font-bold text-slate-600 sm:text-base">Теперь ты мастер по делению десятичных дробей. Результат: {score} очков!</p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500"/><div className="font-display mt-1 text-xl font-black text-slate-900">{solved}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">верных</div></div>
                <div className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-100"><XCircle className="mx-auto h-5 w-5 text-rose-500"/><div className="font-display mt-1 text-xl font-black text-slate-900">{wrong}</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">ошибок</div></div>
                <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100"><Target className="mx-auto h-5 w-5 text-sky-500"/><div className="font-display mt-1 text-xl font-black text-slate-900">{accuracy}%</div><div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">точность</div></div>
              </div>
              <div className="mt-7 flex flex-col gap-2.5">
                <button type="button" onClick={saveResult} className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-6 py-3.5 font-display text-sm font-extrabold text-white shadow-lg shadow-sky-300/50 hover:bg-sky-400 sm:text-base"><Download className="h-5 w-5" strokeWidth={2.5}/>{saved?"Результат сохранён!":"Сохранить результат"}</button>
                <button type="button" onClick={onRestart} className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 font-display text-sm font-extrabold text-white shadow-lg shadow-emerald-300/50 hover:bg-emerald-400 sm:text-base"><RotateCcw className="h-5 w-5" strokeWidth={2.5}/>Сыграть ещё раз</button>
                <button type="button" onClick={onContinue} className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-50 px-6 py-3 text-sm font-extrabold text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100">Продолжить тренировку<ArrowRight className="h-4 w-4" strokeWidth={2.5}/></button>
                <button type="button" onClick={onFinish} className="btn-push inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-6 py-3 text-sm font-extrabold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"><House className="h-5 w-5" strokeWidth={2.5}/>Завершить игру и выйти на главную</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
