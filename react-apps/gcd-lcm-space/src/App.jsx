import { useEffect, useRef, useState } from 'react';
import { AppShell } from './components/AppShell.jsx';
import { ProfileGate } from './components/ProfileGate.jsx';
import { CampaignMap } from './components/CampaignMap.jsx';
import { LevelRunner } from './components/LevelRunner.jsx';
import { BossBattle } from './components/BossBattle.jsx';
import { applyLevelResult, completeBoss, saveProfile } from './lib/progress-store.js';
import { createAmbientSoundscape } from './lib/ambient.js';

export default function App() {
  const[profile,setProfile]=useState(null);
  const[screen,setScreen]=useState('profile');
  const[selectedLevel,setSelectedLevel]=useState(null);
  const[levelRunKey,setLevelRunKey]=useState(0);
  const[soundOn,setSoundOn]=useState(true);
  const[musicOn,setMusicOn]=useState(false);
  const ambientStopRef=useRef(null);
  useEffect(()=>{
    ambientStopRef.current?.();
    ambientStopRef.current=null;
    if(musicOn) ambientStopRef.current=createAmbientSoundscape();
    return ()=>{ambientStopRef.current?.();ambientStopRef.current=null;};
  },[musicOn]);
  function persist(next){const saved=saveProfile(next);setProfile(saved);return saved;}
  function startProfile(next){persist(next);setScreen('map');}
  function startLevel(id){setSelectedLevel(id);setLevelRunKey(k=>k+1);setScreen('level');}
  function finishLevel(id,evaluation){if(!profile)return;persist(applyLevelResult(profile,id,evaluation));}
  return <AppShell soundOn={soundOn} onToggleSound={()=>setSoundOn(v=>!v)} musicOn={musicOn} onToggleMusic={()=>setMusicOn(v=>!v)}>
    {screen==='profile'&&<ProfileGate onStart={startProfile}/>}
    {screen==='map'&&profile&&<CampaignMap profile={profile} onStartLevel={startLevel} onStartBoss={()=>setScreen('boss')}/>}
    {screen==='level'&&profile&&<LevelRunner key={`${selectedLevel}-${levelRunKey}`} soundOn={soundOn} levelId={selectedLevel} onComplete={finishLevel} onBack={()=>setScreen('map')} onReplay={()=>startLevel(selectedLevel)}/>}
    {screen==='boss'&&profile&&<BossBattle profile={profile} soundOn={soundOn} onBack={()=>setScreen('map')} onVictory={result=>persist(completeBoss(profile,result))}/>}
  </AppShell>;
}
