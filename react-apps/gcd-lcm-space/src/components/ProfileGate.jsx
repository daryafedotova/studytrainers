import { useState } from 'react';
import { motion } from 'framer-motion';
import { Orbit, Rocket, RotateCcw, ScanSearch, Sparkles, Swords, UserRound } from 'lucide-react';
import { createProfile, loadProfile, resetProfile } from '../lib/progress-store.js';

export function ProfileGate({ onStart }) {
  const [name, setName] = useState('');
  const [found, setFound] = useState(null);
  const [error, setError] = useState('');

  function submit(event) {
    event?.preventDefault();
    const clean = name.trim();
    if (!clean) { setError('Введи имя, чтобы сохранить прогресс.'); return; }
    setError('');
    const existing = loadProfile(clean);
    if (existing) { setFound(existing); return; }
    onStart(createProfile(clean));
  }

  function startOver() {
    if (!found) return;
    if (!window.confirm(`Начать экспедицию «${found.displayName}» заново? Текущий прогресс будет удалён.`)) return;
    resetProfile(found.displayName);
    const fresh = createProfile(found.displayName);
    setFound(null);
    onStart(fresh);
  }

  if (found) {
    return (
      <section className="start-screen start-game-layout welcome-layout" aria-labelledby="welcome-title">
        <StartSpaceScene />
        <motion.div className="profile-card welcome-card" initial={{opacity:0,y:22,scale:.98}} animate={{opacity:1,y:0,scale:1}}>
          <div className="hero-icon"><Rocket /></div>
          <p className="eyebrow">Профиль найден</p>
          <h1 id="welcome-title">С возвращением, {found.displayName}!</h1>
          <p className="hero-copy">Экспедиция пройдена на {Math.round((found.starsTotal / 24) * 100)}%. У тебя {found.starsTotal}/24 ⭐.</p>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={() => onStart(found)}>Продолжить экспедицию</button>
            <button className="secondary-button" type="button" onClick={startOver}><RotateCcw size={18}/> Начать заново</button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="start-screen start-game-layout" aria-labelledby="start-title">
      <StartSpaceScene />

      <motion.div
        className="start-hero"
        initial={{opacity:0,y:18}}
        animate={{opacity:1,y:0}}
        transition={{duration:.45,ease:'easeOut'}}
      >
        <div className="game-badge"><Sparkles size={16}/> Игра-тренажёр · математика · 6 класс</div>
        <div className="hero-orbit" aria-hidden="true">
          <span>2</span><span>3</span><span>5</span><span>7</span>
          <div className="planet-core">∑</div>
          <i className="hero-orbit-ring ring-one"/>
          <i className="hero-orbit-ring ring-two"/>
        </div>
        <h1 id="start-title">Космическая экспедиция:<br/><span>НОД и НОК</span></h1>
        <p className="hero-copy">Освой простые числа, разложение на множители, НОД и НОК. Проходи миссии, собирай звёзды и доберись до Ядра Сингулярности.</p>
        <div className="start-features" aria-label="Особенности тренажёра">
          <span>🚀 8 миссий</span>
          <span>⭐ 24 звезды</span>
          <span>⚔ финальный босс</span>
          <span>💾 прогресс сохраняется</span>
        </div>
      </motion.div>

      <div className="mission-preview-grid">
        <motion.article
          className="mission-preview-card scan-card"
          initial={{opacity:0,x:-24}}
          animate={{opacity:1,x:0}}
          transition={{delay:.12,duration:.38}}
          whileHover={{y:-5,scale:1.008}}
        >
          <div className="preview-icon cyan"><ScanSearch size={28}/></div>
          <div>
            <p className="preview-kicker">Миссия анализа</p>
            <h2>Сканируй множители</h2>
            <p>Разбирай числа на простые детали и собирай разложение прямо в приложении.</p>
          </div>
          <div className="preview-equation"><span>84</span><b>→</b><strong>2² · 3 · 7</strong></div>
          <div className="preview-glow"/>
        </motion.article>

        <motion.article
          className="mission-preview-card route-card"
          initial={{opacity:0,x:24}}
          animate={{opacity:1,x:0}}
          transition={{delay:.18,duration:.38}}
          whileHover={{y:-5,scale:1.008}}
        >
          <div className="preview-icon amber"><Orbit size={28}/></div>
          <div>
            <p className="preview-kicker">Навигация</p>
            <h2>Собирай НОД и НОК</h2>
            <p>Выбирай нужные множители, прокладывай маршрут и решай всё по шагам.</p>
          </div>
          <div className="preview-route">
            <span><b>НОД</b><small>общая часть</small></span>
            <i>✦</i>
            <span><b>НОК</b><small>всё необходимое</small></span>
          </div>
          <div className="preview-glow"/>
        </motion.article>
      </div>

      <div className="start-howto" aria-label="Как проходит экспедиция">
        <div><span>1</span><strong>Разложи</strong><small>числа на простые множители</small></div>
        <div><span>2</span><strong>Выбери</strong><small>общие или недостающие части</small></div>
        <div><span>3</span><strong>Победи</strong><small>мини-боссов и Ядро</small></div>
      </div>

      <motion.form
        className="profile-card launch-panel"
        onSubmit={submit}
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{delay:.24,duration:.4}}
      >
        <div className="launch-panel-heading">
          <div className="launch-icon"><Rocket size={24}/></div>
          <div>
            <span>Панель запуска</span>
            <strong>Кого записать в экипаж?</strong>
          </div>
        </div>
        <div className="input-row">
          <div className="player-input-wrap">
            <UserRound size={20}/>
            <input id="player-name" value={name} onChange={e => setName(e.target.value)} placeholder="Например, Маша" autoComplete="off" maxLength={30} aria-label="Имя участника экспедиции"/>
          </div>
          <button className="primary-button launch-button" type="submit"><Rocket size={20}/> Начать игру</button>
        </div>
        <div className="launch-meta">
          <span>Прогресс сохраняется на этом устройстве</span>
          <span>Музыку можно включить сверху</span>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </motion.form>
    </section>
  );
}

function StartSpaceScene() {
  return <div className="start-space-scene" aria-hidden="true">
    <div className="start-nebula nebula-violet"/>
    <div className="start-nebula nebula-cyan"/>
    <div className="hero-planet hero-planet-left"><i/><i/></div>
    <div className="hero-planet hero-planet-right"><span/></div>
    <div className="hero-moon"/>
    <div className="hero-comet"><i/></div>
    <div className="hero-asteroid asteroid-a"/>
    <div className="hero-asteroid asteroid-b"/>
    <div className="hero-spacecraft"><span/><span/><i/></div>
    <div className="hero-math-glyph glyph-a">2³</div>
    <div className="hero-math-glyph glyph-b">НОД</div>
    <div className="hero-math-glyph glyph-c">5 · 7</div>
    <div className="hero-math-glyph glyph-d">НОК</div>
    <div className="hero-flight-path path-a"/>
    <div className="hero-flight-path path-b"/>
  </div>;
}
