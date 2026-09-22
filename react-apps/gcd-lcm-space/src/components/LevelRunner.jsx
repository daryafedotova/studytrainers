import { useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, BookOpen, Lightbulb, Sparkles, Star } from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../lib/campaign.js';
import { generateLevelTasks, generateMiniBossTasks, answerMatches } from '../lib/task-generators.js';
import { createAttemptStats, registerHint, registerLevelAnswer } from '../lib/level-session.js';
import { evaluateLevelAttempt } from '../lib/scoring.js';
import { playTone } from '../lib/audio.js';
import { BriefingRenderer } from './BriefingRenderer.jsx';
import { TaskRenderer } from './TaskRenderer.jsx';

export function LevelRunner({levelId,onComplete,onBack,onReplay,soundOn=true}) {
  const level=CAMPAIGN_LEVELS.find(x=>x.id===levelId);
  const mission=useMemo(()=>generateLevelTasks(levelId),[levelId]);
  const mini=useMemo(()=>generateMiniBossTasks(levelId),[levelId]);
  const[phase,setPhase]=useState('briefing');
  const[index,setIndex]=useState(0);
  const[stats,setStats]=useState(()=>createAttemptStats(mission.length));
  const[feedback,setFeedback]=useState(null);
  const[hintOpen,setHintOpen]=useState(false);
  const[result,setResult]=useState(null);
  const completedRef=useRef(false);
  const tasks=phase==='miniboss'?mini:mission;
  const task=tasks[index];
  function openHint(){if(!task||phase==='miniboss')return;setStats(s=>registerHint(s,task.id));setHintOpen(true);}
  function advance(nextStats){setFeedback(null);setHintOpen(false);if(index<tasks.length-1){setIndex(i=>i+1);return;}if(phase==='mission'){setPhase('miniboss');setIndex(0);return;}const evaluation=evaluateLevelAttempt(nextStats);setResult(evaluation);setPhase('result');if(!completedRef.current){completedRef.current=true;onComplete(levelId,evaluation);}}
  function submit(answer){if(!task||feedback?.correct)return;const correct=answerMatches(task,answer);const next=registerLevelAnswer(stats,{taskId:task.id,correct,isMiniBoss:phase==='miniboss'});setStats(next);setFeedback({correct});if(correct)window.setTimeout(()=>advance(next),520);}
  const progress=phase==='mission'?(index/mission.length)*100:phase==='miniboss'?100:0;
  if(phase==='briefing')return <section className="level-screen"><div className="level-header"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18}/> На карту</button><div><span className="mini-label">Миссия {levelId}</span><strong>{level.title}</strong></div></div><BriefingRenderer levelId={levelId} onDone={()=>setPhase('mission')}/></section>;
  if(phase==='result')return <section className="level-screen result-screen"><div className="result-emblem"><Sparkles/></div><p className="eyebrow">Миссия завершена</p><h1>{level.title}</h1><div className="result-stars" aria-label={`${result.stars} звезды`}>{[1,2,3].map(n=><Star key={n} className={n<=result.stars?'filled-star':''} fill={n<=result.stars?'currentColor':'none'}/>)}</div><div className="result-stats"><div><span>С первой попытки</span><strong>{result.firstTryAccuracy}%</strong></div><div><span>Лучшее комбо</span><strong>×{result.bestCombo}</strong></div><div><span>Очки</span><strong>+{result.points}</strong></div></div><div className="button-row"><button className="primary-button" onClick={onBack}>На карту</button><button className="secondary-button" onClick={onReplay}>Пройти ещё раз</button></div></section>;
  return <section className="level-screen"><div className="level-header"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18}/> На карту</button><div className="level-name"><span className="mini-label">{phase==='miniboss'?'Мини-босс':`Миссия ${levelId}`}</span><strong>{level.title}</strong></div><div className="combo-pill"><span>Комбо</span><strong>×{stats.currentCombo}</strong></div></div><div className="level-progress"><div style={{width:`${phase==='miniboss'?100:Math.max(5,progress)}%`}}/></div><article className={`task-card ${phase==='miniboss'?'miniboss-card':''}`}><div className="task-kicker">{phase==='miniboss'?`Контроль ${index+1}/${mini.length}`:`Задание ${index+1}/${mission.length}`}</div><h2>{task.prompt}</h2><TaskRenderer task={task} disabled={feedback?.correct} onSubmit={submit}/>{feedback&&<div className={`feedback ${feedback.correct?'correct':'wrong'}`} role="status"><strong>{feedback.correct?'✓ Верно!':'✕ Пока нет'}</strong>{!feedback.correct&&phase!=='miniboss'&&<button className="hint-button" type="button" onClick={openHint}><Lightbulb size={17}/> Подсказка</button>}{!feedback.correct&&phase==='miniboss'&&<span>Попробуй ещё раз без подсказки.</span>}</div>}{hintOpen&&<div className="hint-panel"><BookOpen size={20}/><p>{task.hint}</p></div>}</article></section>;
}
