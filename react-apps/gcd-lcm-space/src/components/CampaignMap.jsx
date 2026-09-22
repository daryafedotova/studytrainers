import { useMemo, useState } from 'react';
import { LockKeyhole, Play, RotateCcw, Swords } from 'lucide-react';
import { getCampaignState } from '../lib/campaign.js';

function Stars({ count=0 }) {
  return <span className="stars" aria-label={`${count} из 3 звёзд`}>{[1,2,3].map(n => <span key={n} className={n <= count ? 'earned' : ''}>★</span>)}</span>;
}

export function CampaignMap({ profile, onStartLevel, onStartBoss }) {
  const state = useMemo(() => getCampaignState(profile), [profile]);
  const [selected, setSelected] = useState(null);
  const need = Math.max(0, 18 - state.starsTotal);

  return (
    <section className="campaign-screen">
      <div className="campaign-topbar">
        <div><span className="mini-label">Экипаж</span><strong>{profile.displayName}</strong></div>
        <div><span className="mini-label">Звание</span><strong>{profile.rank}</strong></div>
        <div><span className="mini-label">Звёзды</span><strong>{state.starsTotal}/24 ⭐</strong></div>
        <div><span className="mini-label">Очки</span><strong>{profile.expeditionPoints ?? 0}</strong></div>
      </div>
      <div className="map-heading">
        <div><p className="eyebrow">Маршрут экспедиции</p><h1>Числовая галактика</h1></div>
        <p>Проходи миссии по порядку. Для доступа к Ядру Сингулярности нужно собрать 18 ⭐.</p>
      </div>
      <div className="space-route" role="list" aria-label="Карта миссий">
        <div className="route-line" aria-hidden="true"/>
        {state.levels.map((level, index) => (
          <button key={level.id} type="button" role="listitem"
            className={`mission-node node-${index+1} ${level.unlocked ? 'unlocked' : 'locked'} ${level.completed ? 'completed' : ''}`}
            disabled={!level.unlocked} aria-disabled={!level.unlocked}
            onClick={() => level.unlocked && setSelected(level)}>
            <span className="node-number">{level.id}</span>
            <span className="node-icon" aria-hidden="true">{level.unlocked ? level.icon : <LockKeyhole size={24}/>}</span>
            <span className="node-title">{level.title}</span>
            <Stars count={level.bestStars}/>
          </button>
        ))}
        <button type="button" className={`boss-node ${state.bossUnlocked ? 'unlocked' : 'locked'}`}
          disabled={!state.bossUnlocked} aria-disabled={!state.bossUnlocked}
          onClick={() => state.bossUnlocked && onStartBoss()}>
          <span className="boss-core" aria-hidden="true"><span>∞</span></span>
          <strong>Ядро Сингулярности</strong>
          <small>{state.bossUnlocked ? 'Вступить в бой' : `Нужно ещё ${need} ⭐`}</small>
        </button>
      </div>
      {selected && (
        <div className="mission-overlay" role="dialog" aria-modal="true" aria-labelledby="mission-title" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="mission-dialog">
            <button className="dialog-close" type="button" onClick={() => setSelected(null)} aria-label="Закрыть">×</button>
            <div className="mission-dialog-icon" aria-hidden="true">{selected.icon}</div>
            <p className="eyebrow">Миссия {selected.id}</p>
            <h2 id="mission-title">{selected.title}</h2>
            <p>{selected.goal}</p>
            <div className="mission-meta"><Stars count={selected.bestStars}/><span>⏱ {selected.duration}</span></div>
            <button className="primary-button wide-button" type="button" onClick={() => onStartLevel(selected.id)}>
              {selected.completed ? <RotateCcw size={18}/> : <Play size={18}/>} {selected.completed ? 'Пройти ещё раз' : 'Начать миссию'}
            </button>
          </div>
        </div>
      )}
      {state.bossUnlocked && <button className="boss-quick-action" type="button" onClick={onStartBoss}><Swords size={18}/> Финальная битва доступна</button>}
    </section>
  );
}
