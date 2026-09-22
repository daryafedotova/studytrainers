import { useState } from 'react';
import { Rocket, RotateCcw, UserRound } from 'lucide-react';
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
      <section className="profile-card welcome-card" aria-labelledby="welcome-title">
        <div className="hero-icon"><Rocket /></div>
        <p className="eyebrow">Профиль найден</p>
        <h1 id="welcome-title">С возвращением, {found.displayName}!</h1>
        <p className="hero-copy">Экспедиция пройдена на {Math.round((found.starsTotal / 24) * 100)}%. У тебя {found.starsTotal}/24 ⭐.</p>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => onStart(found)}>Продолжить экспедицию</button>
          <button className="secondary-button" type="button" onClick={startOver}><RotateCcw size={18}/> Начать заново</button>
        </div>
      </section>
    );
  }

  return (
    <section className="start-screen" aria-labelledby="start-title">
      <div className="hero-orbit" aria-hidden="true"><span>2</span><span>3</span><span>5</span><span>7</span><div className="planet-core">∑</div></div>
      <p className="eyebrow">Математика · 6 класс</p>
      <h1 id="start-title">Космическая экспедиция:<br/><span>НОД и НОК</span></h1>
      <p className="hero-copy">Освой простые числа, разложение на множители, НОД и НОК. Собери звёзды и доберись до Ядра Сингулярности.</p>
      <div className="start-features" aria-label="Особенности тренажёра"><span>8 миссий</span><span>24 ⭐</span><span>финальный босс</span><span>прогресс сохраняется</span></div>
      <form className="profile-card" onSubmit={submit}>
        <label htmlFor="player-name"><UserRound size={18}/> Имя участника экспедиции</label>
        <div className="input-row">
          <input id="player-name" value={name} onChange={e => setName(e.target.value)} placeholder="Например, Маша" autoComplete="off" maxLength={30}/>
          <button className="primary-button" type="submit"><Rocket size={19}/> Начать</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
