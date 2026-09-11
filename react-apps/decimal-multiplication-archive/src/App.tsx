import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "./components/Background";
import GameBoard from "./components/GameBoard";
import Intro from "./components/Intro";
import { unlockAudio } from "./lib/sound";

export default function App() {
  const [screen, setScreen] = useState<"intro" | "game">("intro");
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="noise-overlay" />

      {screen === "intro" ? (
        <Intro
          mode="start"
          onStart={() => {
            unlockAudio();
            setScreen("game");
          }}
        />
      ) : (
        <GameBoard paused={helpOpen} onHelp={() => setHelpOpen(true)} />
      )}

      {/* Правила поверх игры */}
      <AnimatePresence>
        {helpOpen && screen === "game" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-[#0c0a18]/85 backdrop-blur-md"
          >
            <Intro mode="help" onStart={() => setHelpOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
