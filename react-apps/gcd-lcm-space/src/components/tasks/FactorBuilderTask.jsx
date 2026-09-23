import { useEffect, useMemo, useState } from 'react';
export function FactorBuilderTask({task,disabled,onSubmit}) {
  const[chosen,setChosen]=useState([]);
  useEffect(()=>setChosen([]),[task.id]);
  const source=useMemo(()=>task.data.available??[2,3,5,7],[task.id,task.data.available]);
  const isLcm=task.data.mode==='lcm-missing';
  function add(value){setChosen(values=>[...values,value]);}
  function remove(index){setChosen(values=>values.filter((_,i)=>i!==index));}
  const combined=isLcm?[...(task.data.baseFactors??[]),...chosen]:chosen;
  return <div className="factor-workspace">{isLcm&&<div className="base-factors"><span>Множители первого числа уже в наборе:</span><strong>{task.data.baseFactors.join(' · ')}</strong></div>}<div className="factor-expression">{isLcm?(chosen.length?`Добавили: ${chosen.join(' · ')}`:'Добавь недостающие множители'):(chosen.length?chosen.join(' · '):'Выбери множители')}</div><div className="factor-bank">{[...new Set(source)].sort((a,b)=>a-b).map(value=><button className="factor-chip prime" type="button" disabled={disabled} key={value} onClick={()=>add(value)}>{value}</button>)}</div>{chosen.length>0&&<div className="chosen-factors">{chosen.map((value,index)=><button type="button" key={`${value}-${index}`} disabled={disabled} onClick={()=>remove(index)} title="Убрать множитель">{value} ×</button>)}</div>}<button className="primary-button submit-answer" type="button" disabled={disabled||combined.length===0} onClick={()=>onSubmit(combined)}>Проверить</button></div>;
}
