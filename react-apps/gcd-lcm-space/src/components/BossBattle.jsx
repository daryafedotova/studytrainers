import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Heart, RotateCcw, ShieldAlert, Sparkles, Swords } from 'lucide-react';
import { generateBossPhaseTasks, answerMatches } from '../lib/task-generators.js';
import { createBossState, applyBossAnswer, bossCanAdvance, advanceBossPhase } from '../lib/scoring.js';
import { TaskRenderer } from './TaskRenderer.jsx';
import { ResultCard } from './ResultCard.jsx';
import { playTone } from '../lib/audio.js';

const COUNTS=[4,3,4];
const PHASES={1:{title:'Разрушить броню',subtitle:'Простые числа и разложение'},2:{title:'Перегрузить реактор',subtitle:'Наибольший общий делитель'},3:{title:'Закрыть пространственный разлом',subtitle:'НОК и смешанные задания'}};
function categoryFor(task,phase){if(phase===1)return 'factorization';if(phase===2)return 'gcd';return task.skill==='mixed'?'mixed':'lcm';}
function labelFor(key){return {factorization:'Разложение',gcd:'НОД',lcm:'НОК',mixed:'НОД или НОК'}[key]??key;}

export function BossBattle({profile,onBack,onVictory,soundOn=true}) {
  const[battle,setBattle]=useState(()=>createBossState(COUNTS));
  const[tasks,setTasks]=useState(()=>generateBossPhaseTasks(1));
  const[index,setIndex]=useState(0);
  const[feedback,setFeedback]=useState(null);
  const[transition,setTransition]=useState(null);
  const[victory,setVictory]=useState(null);
  const total=useMemo(()=>COUNTS.reduce((a,b)=>a+b,0),[]);
  const task=tasks[index];
  const health=Math.max(0,100-(battle.completedTotal/total)*100);
  function freshTask(phase){const pool=generateBossPhaseTasks(phase);return pool[Math.floor(Math.random()*pool.length)];}
  function resetBattle(){setBattle(createBossState(COUNTS));setTasks(generateBossPhaseTasks(1));setIndex(0);setFeedback(null);setTransition(null);setVictory(null);}
  function submit(answer){
    if(!task||feedback||battle.status!=='fighting')return;
    const correct=answerMatches(task,answer);
    const category=categoryFor(task,battle.phase);
    const next=applyBossAnswer(battle,{correct,skill:category});
    playTone(correct?(next.critical?'critical':'correct'):'life',soundOn);
    setBattle(next);setFeedback({correct,critical:next.critical});
    if(!correct){if(next.status==='defeat')return;window.setTimeout(()=>{setTasks(list=>list.map((item,i)=>i===index?freshTask(battle.phase):item));setFeedback(null);},650);return;}
    window.setTimeout(()=>{
      if(bossCanAdvance(next)){
        if(next.phase<3){const upcoming=next.phase+1;setTransition(upcoming);window.setTimeout(()=>{setBattle(advanceBossPhase(next));setTasks(generateBossPhaseTasks(upcoming));setIndex(0);setFeedback(null);setTransition(null);},900);}
        else{const result={livesRemaining:next.lives,bestCombo:next.bestCombo,errors:next.errors,completedAt:new Date().toISOString()};setVictory(result);setFeedback(null);playTone('victory',soundOn);confetti({particleCount:180,spread:95,origin:{y:.55},disableForReducedMotion:true});onVictory(result);}
      } else {setIndex(i=>i+1);setFeedback(null);}
    },650);
  }
  if(victory)return <section className="boss-end victory-boss"><div className="boss-end-icon"><Sparkles/></div><p className="eyebrow">Ядро нейтрализовано</p><h1>Экспедиция завершена!</h1><p>{profile.displayName}, числовая галактика снова стабильна.</p><ResultCard profile={profile} bossResult={victory}/><div className="button-row"><button className="primary-button" onClick={onBack}>Вернуться на карту</button><button className="secondary-button" onClick={resetBattle}><RotateCcw size={18}/> Сразиться снова</button><a className="secondary-button" href="../../../">В библиотеку</a></div></section>;
  if(battle.status==='defeat')return <section className="boss-end defeat-boss"><div className="boss-end-icon danger"><ShieldAlert/></div><p className="eyebrow">Сигнал потерян</p><h1>Экспедиция прервана</h1><p>Босс сохранил ядро. Прогресс кампании и звёзды не потеряны.</p><div className="diagnostics">{Object.entries(battle.errors).filter(([,count])=>count>0).map(([key,count])=><div key={key}><span>{labelFor(key)}</span><strong>{count} ош.</strong></div>)}</div><div className="button-row"><button className="primary-button" onClick={resetBattle}><RotateCcw size={18}/> Повторить бой</button><button className="secondary-button" onClick={onBack}>Вернуться на карту</button></div></section>;
  if(transition)return <section className="phase-transition"><div className="transition-ring">{transition}</div><p className="eyebrow">Защита разрушена</p><h1>Фаза {transition}</h1><p>{PHASES[transition].title}</p></section>;
  return <section className="boss-battle"><div className="boss-topbar"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18}/> На карту</button><div className="boss-lives" aria-label={`${battle.lives} из 3 жизней`}>{[1,2,3].map(n=><Heart key={n} fill={n<=battle.lives?'currentColor':'none'} className={n<=battle.lives?'alive':'lost'}/>)}</div><div className="combo-pill"><span>Комбо</span><strong>×{battle.combo}</strong></div></div><div className={`singularity-arena phase-${battle.phase} ${battle.critical?'critical':''}`} aria-hidden="true">
  <div className="singularity-nebula nebula-left"/>
  <div className="singularity-nebula nebula-right"/>
  <div className="gravity-well"/>
  <div className="singularity-ring ring-outer"/>
  <div className="singularity-ring ring-middle"/>
  <div className="singularity-ring ring-inner"/>
  <div className="singularity-shards">
    {Array.from({length:10},(_,shard)=><i className={`singularity-shard shard-${shard+1}`} key={shard}/>)}
  </div>
  <div className="singularity-lightning lightning-a"/>
  <div className="singularity-lightning lightning-b"/>
  <div className="singularity-core-shell">
    <div className="core-corona"/>
    <div className="singularity-core"><span>∞</span></div>
    <div className="core-flare flare-a"/>
    <div className="core-flare flare-b"/>
  </div>
  <div className="boss-particles">{Array.from({length:14},(_,particle)=><i key={particle}/>)}</div>
</div><div className="boss-heading"><p className="eyebrow">Фаза {battle.phase} · {battle.completedInPhase+1}/{COUNTS[battle.phase-1]}</p><h1>{PHASES[battle.phase].title}</h1><p>{PHASES[battle.phase].subtitle}</p></div><div className="boss-health"><span>Ядро</span><div><i style={{width:`${health}%`}}/></div><strong>{Math.ceil(health)}%</strong></div><article className="task-card boss-task-card"><div className="task-kicker"><Swords size={14}/> Боевое задание</div><h2>{task.prompt}</h2><TaskRenderer task={task} disabled={Boolean(feedback)} onSubmit={submit}/>{feedback&&<div className={`feedback ${feedback.correct?'correct':'wrong'}`}><strong>{feedback.correct?(feedback.critical?'⚡ Критический удар!':'✓ Попадание!'):'♥ Потеряна жизнь'}</strong>{!feedback.correct&&<span>Следующая задача той же фазы…</span>}</div>}</article></section>;
}
