import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "./components/Background";
import GameBoard from "./components/GameBoard";
import Intro from "./components/Intro";
import { unlockAudio } from "./lib/sound";

export default function App() {
  const [screen, setScreen] = useState<"intro" | "game">("intro");
  const [helpOpen, setHelpOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");

  const startGame = () => {
    if (!playerName.trim()) return;
    unlockAudio();
    setScreen("game");
  };

  const finishGame = () => {
    window.location.href = "../../../";
  };

  return (
    <div className="division-theme relative min-h-screen">
      <Background />
      <div className="noise-overlay" />

      {screen === "intro" ? (
        <Intro
          mode="start"
          playerName={playerName}
          onPlayerNameChange={setPlayerName}
          onStart={startGame}
        />
      ) : (
        <GameBoard
          paused={helpOpen}
          playerName={playerName.trim()}
          onHelp={() => setHelpOpen(true)}
          onFinish={finishGame}
        />
      )}

      <AnimatePresence>
        {helpOpen && screen === "game" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-sky-50/90 backdrop-blur-md"
          >
            <Intro mode="help" onStart={() => setHelpOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
