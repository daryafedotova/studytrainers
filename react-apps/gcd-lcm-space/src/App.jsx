import { useState } from 'react';
import { AppShell } from './components/AppShell.jsx';
import { ProfileGate } from './components/ProfileGate.jsx';
import { CampaignMap } from './components/CampaignMap.jsx';
import { saveProfile } from './lib/progress-store.js';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState('profile');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  function startProfile(next) { const saved = saveProfile(next); setProfile(saved); setScreen('map'); }
  return (
    <AppShell soundOn={soundOn} onToggleSound={() => setSoundOn(v => !v)}>
      {screen === 'profile' && <ProfileGate onStart={startProfile}/>}
      {screen === 'map' && profile && <CampaignMap profile={profile} onStartLevel={id => {setSelectedLevel(id);setScreen('level');}} onStartBoss={() => setScreen('boss')}/>}
      {screen === 'level' && <section className="placeholder-card"><h1>Миссия {selectedLevel}</h1><p>Учебный модуль подключается следующим этапом.</p><button className="secondary-button" onClick={() => setScreen('map')}>На карту</button></section>}
      {screen === 'boss' && <section className="placeholder-card"><h1>Ядро Сингулярности</h1><p>Боевой модуль подключается после завершения кампании.</p><button className="secondary-button" onClick={() => setScreen('map')}>На карту</button></section>}
    </AppShell>
  );
}
