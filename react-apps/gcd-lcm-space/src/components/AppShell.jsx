import { Music, Volume2, VolumeX } from 'lucide-react';

export function AppShell({ soundOn, onToggleSound, musicOn, onToggleMusic, children }) {
  return (
    <div className="app-shell">
      <div className="space-background" aria-hidden="true">
        <div className="nebula nebula-a" />
        <div className="nebula nebula-b" />
        <div className="star-layer star-layer-a" />
        <div className="star-layer star-layer-b" />
        <div className="planet-outline planet-outline-a"><span /></div>
        <div className="planet-outline planet-outline-b"><span /></div>
        <div className="deep-orbit deep-orbit-a" />
        <div className="deep-orbit deep-orbit-b" />
      </div>
      <div className="cosmic-noise" aria-hidden="true" />
      <header className="global-controls">
        <a className="library-link" href="../../../">← В библиотеку</a>
        <div className="global-control-group">
          <button className={`music-control ${musicOn ? 'active' : ''}`} type="button" onClick={onToggleMusic} aria-label={musicOn ? 'Выключить музыку' : 'Включить музыку'}>
            <Music size={20}/><span>Музыка</span>
          </button>
          <button className="icon-button" type="button" onClick={onToggleSound} aria-label={soundOn ? 'Выключить звуки' : 'Включить звуки'}>
            {soundOn ? <Volume2 size={21} /> : <VolumeX size={21} />}
          </button>
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}
