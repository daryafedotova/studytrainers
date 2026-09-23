import { useEffect, useState } from 'react';
import { formatPrimePowers } from '../../lib/math.js';
export function NumericTask({task,disabled,onSubmit}) {
  const[value,setValue]=useState('');
  const[workOpen,setWorkOpen]=useState(false);
  useEffect(()=>{setValue('');setWorkOpen(false);},[task.id]);
  const valid=value.trim()!==''&&Number.isInteger(Number(value));
  const pair=Number.isInteger(task.data?.a)&&Number.isInteger(task.data?.b);
  return <div className="numeric-task-wrap">
    {pair&&task.data.showWork&&<div className="work-reveal"><button className="secondary-button" type="button" onClick={()=>setWorkOpen(v=>!v)}>{workOpen?'Скрыть разложения':'Показать разложения'}</button>{workOpen&&<div className="factorization-work"><div>{task.data.a} = <strong>{formatPrimePowers(task.data.a)}</strong></div><div>{task.data.b} = <strong>{formatPrimePowers(task.data.b)}</strong></div>{task.data.operation==='gcd'&&<p>Для НОД ищи общие множители с наименьшими показателями.</p>}{task.data.operation==='lcm'&&<p>Для НОК бери наибольшие показатели каждого простого множителя.</p>}</div>}</div>}
    <form className="numeric-form" onSubmit={ev=>{ev.preventDefault();if(valid&&!disabled)onSubmit(Number(value));}}><input inputMode="numeric" pattern="[0-9]*" value={value} onChange={ev=>setValue(ev.target.value)} disabled={disabled} aria-label="Ответ" placeholder="Введи ответ"/><button className="primary-button" type="submit" disabled={disabled||!valid}>Проверить</button></form>
  </div>;
}
