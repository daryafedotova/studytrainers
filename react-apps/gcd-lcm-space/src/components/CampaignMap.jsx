import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, Play, RotateCcw, Swords, Sparkles } from 'lucide-react';
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
      <div className="map-cosmos" aria-hidden="true">
        <div className="map-planet map-planet-left"/>
        <div className="map-planet map-planet-right"><span/></div>
        <div className="map-comet"/>
        <div className="map-orbit map-orbit-a"/>
        <div className="map-orbit map-orbit-b"/>
      </div>

      <div className="campaign-topbar">
        <div><span className="mini-label">Экипаж</span><strong>{profile.displayName}</strong></div>
        <div><span className="mini-label">Звание</span><strong>{profile.rank}</strong></div>
        <div><span className="mini-label">Звёзды</span><strong>{state.starsTotal}/24 ⭐</strong></div>
        <div><span className="mini-label">Очки</span><strong>{profile.expeditionPoints ?? 0}</strong></div>
      </div>

      <div className="map-heading">
        <div>
          <p className="eyebrow">Маршрут экспедиции</p>
          <h1>Числовая галактика</h1>
        </div>
        <p>Пройди восемь миссий, собери звёзды и открой путь к Ядру Сингулярности.</p>
      </div>

      <div className="mission-grid" role="list" aria-label="Карта миссий">
        {state.levels.map((level,index) => (
          <motion.button
            key={level.id}
            type="button"
            role="listitem"
            className={`mission-node mission-card-${level.id} ${level.unlocked ? 'unlocked' : 'locked'} ${level.completed ? 'completed' : ''}`}
            disabled={!level.unlocked}
            aria-disabled={!level.unlocked}
            onClick={() => level.unlocked && setSelected(level)}
            initial={{opacity:0,y:18,scale:.98}}
            animate={{opacity:1,y:0,scale:1}}
            transition={{delay:index*.045,duration:.28}}
            whileHover={level.unlocked ? {y:-6,scale:1.015} : {}}
            whileTap={level.unlocked ? {y:3,scale:.99} : {}}
          >
            <div className="mission-card-top">
              <span className="node-number">Миссия {level.id}</span>
              <span className="node-icon" aria-hidden="true">{level.unlocked ? level.icon : <LockKeyhole size={32}/>}</span>
            </div>
            <div className="mission-card-body">
              <span className="node-title">{level.title}</span>
              <p>{level.goal}</p>
            </div>
            <div className="mission-card-footer">
              <Stars count={level.bestStars}/>
              <span>{level.unlocked ? (level.completed ? 'Пройдена' : 'Доступна') : 'Закрыта'}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        type="button"
        className={`boss-node ${state.bossUnlocked ? 'unlocked' : 'locked'}`}
        disabled={!state.bossUnlocked}
        aria-disabled={!state.bossUnlocked}
        onClick={() => state.bossUnlocked && onStartBoss()}
        whileHover={state.bossUnlocked ? {y:-6,scale:1.01} : {}}
        whileTap={state.bossUnlocked ? {y:3,scale:.99} : {}}
      >
        <span className="boss-core" aria-hidden="true"><span>∞</span></span>
        <div className="boss-card-copy">
          <span className="boss-label"><Sparkles size={16}/> Финальное испытание</span>
          <strong>Ядро Сингулярности</strong>
          <small>{state.bossUnlocked ? 'Вступить в финальную битву' : `Собери ещё ${need} ⭐, чтобы открыть бой`}</small>
        </div>
        <Swords size={34} className="boss-card-swords"/>
      </motion.button>

      {selected && (
        <div className="mission-overlay" role="dialog" aria-modal="true" aria-labelledby="mission-title" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
          <motion.div className="mission-dialog" initial={{opacity:0,y:18,scale:.96}} animate={{opacity:1,y:0,scale:1}}>
            <button className="dialog-close" type="button" onClick={() => setSelected(null)} aria-label="Закрыть">×</button>
            <div className="mission-dialog-icon" aria-hidden="true">{selected.icon}</div>
            <p className="eyebrow">Миссия {selected.id}</p>
            <h2 id="mission-title">{selected.title}</h2>
            <p>{selected.goal}</p>
            <div className="mission-meta"><Stars count={selected.bestStars}/><span>⏱ {selected.duration}</span></div>
            <button className="primary-button wide-button" type="button" onClick={() => onStartLevel(selected.id)}>
              {selected.completed ? <RotateCcw size={20}/> : <Play size={20}/>} {selected.completed ? 'Пройти ещё раз' : 'Начать миссию'}
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
