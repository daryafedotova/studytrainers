import { motion } from "framer-motion";

const GLYPHS = [
  { t: "÷10", x: "6%", y: "14%", s: 64, d: 11, o: 0.13, r: -12 },
  { t: "0,01", x: "86%", y: "10%", s: 52, d: 14, o: 0.11, r: 9 },
  { t: "÷100", x: "90%", y: "62%", s: 60, d: 12, o: 0.11, r: 12 },
  { t: "0,1", x: "2%", y: "66%", s: 58, d: 13, o: 0.12, r: -8 },
  { t: "5", x: "16%", y: "42%", s: 90, d: 16, o: 0.07, r: 16 },
  { t: "7,2", x: "76%", y: "36%", s: 46, d: 10, o: 0.1, r: -14 },
  { t: ",", x: "33%", y: "8%", s: 110, d: 15, o: 0.09, r: 0 },
  { t: "÷1000", x: "44%", y: "88%", s: 54, d: 12, o: 0.1, r: 6 },
  { t: "3", x: "68%", y: "84%", s: 84, d: 17, o: 0.07, r: -10 },
  { t: "÷", x: "26%", y: "78%", s: 62, d: 13.5, o: 0.1, r: 10 },
];

export default function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_0%,#12314a_0%,#0b2238_38%,#071827_70%,#06131f_100%)]" />

      <motion.div
        className="absolute -left-40 top-[-15%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/20 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-12%] top-[28%] h-[30rem] w-[30rem] rounded-full bg-violet-500/18 blur-[120px]"
        animate={{ x: [0, -70, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-18%] left-[22%] h-[28rem] w-[28rem] rounded-full bg-sky-500/14 blur-[130px]"
        animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="dot-grid absolute inset-0" />

      {GLYPHS.map((g, i) => (
        <motion.span
          key={i}
          className="font-display absolute select-none font-extrabold text-sky-200"
          style={{ left: g.x, top: g.y, fontSize: g.s, opacity: g.o, rotate: g.r }}
          animate={{ y: [0, -26, 0], rotate: [g.r, g.r + 6, g.r] }}
          transition={{ duration: g.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        >
          {g.t}
        </motion.span>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#06131f]/75 to-transparent" />
    </div>
  );
}
