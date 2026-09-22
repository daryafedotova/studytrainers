import { useState } from 'react';
import { AppShell } from './components/AppShell.jsx';
import { ProfileGate } from './components/ProfileGate.jsx';
import { CampaignMap } from './components/CampaignMap.jsx';
import { LevelRunner } from './components/LevelRunner.jsx';
import { applyLevelResult, saveProfile } from './lib/progress-store.js';

export default function App() {
  const[profile,setProfile]=useState(null);
  const[screen,setScreen]=useState('profile');
  const[selectedLevel,setSelectedLevel]=useState(null);
  const[levelRunKey,setLevelRunKey]=useState(0);
  const[soundOn,setSoundOn]=useState(true);
  function persist(next){const saved=saveProfile(next);setProfile(saved);return saved;}
  function startProfile(next){persist(next);setScreen('map');}
  function startLevel(id){setSelectedLevel(id);setLevelRunKey(k=>k+1);setScreen('level');}
  function finishLevel(id,evaluation){setProfile(current=>current?persist(applyLevelResult(current,id,evaluation)):current);}
  return <AppShell soundOn={soundOn} onToggleSound={()=>setSoundOn(v=>!v)}>
    {screen==='profile'&&<ProfileGate onStart={startProfile}/>}
    {screen==='map'&&profile&&<CampaignMap profile={profile} onStartLevel={startLevel} onStartBoss={()=>setScreen('boss')}/>}
    {screen==='level'&&profile&&<LevelRunner key={`${selectedLevel}-${levelRunKey}`} levelId={selectedLevel} onComplete={finishLevel} onBack={()=>setScreen('map')} onReplay={()=>startLevel(selectedLevel)}/>}
    {screen==='boss'&&<section className="placeholder-card"><h1>Ядро Сингулярности</h1><p>Боевой модуль подключается после завершения кампании.</p><button className="secondary-button" onClick={()=>setScreen('map')}>На карту</button></section>}
  </AppShell>;
}
