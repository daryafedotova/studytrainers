import { Volume2, VolumeX } from 'lucide-react';

export function AppShell({ soundOn, onToggleSound, children }) {
  return (
    <div className="app-shell">
      <div className="space-background" aria-hidden="true">
        <div className="nebula nebula-a" />
        <div className="nebula nebula-b" />
        <div className="star-layer star-layer-a" />
        <div className="star-layer star-layer-b" />
      </div>
      <header className="global-controls">
        <a className="library-link" href="../../../">← В библиотеку</a>
        <button className="icon-button" type="button" onClick={onToggleSound} aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}>
          {soundOn ? <Volume2 size={21} /> : <VolumeX size={21} />}
        </button>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}
