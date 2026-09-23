import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { formatPrimePowers } from '../../lib/math.js';

const PRIMES=[2,3,5,7];
const sorted = values => [...values].sort((a,b)=>a-b);
const sameMultiset = (a,b) => {
  const left=sorted(a), right=sorted(b);
  return left.length===right.length && left.every((value,index)=>value===right[index]);
};
function historyFor(number,factors){
  let current=number;
  return factors.map(prime=>{
    const before=current;
    current/=prime;
    return {before,prime,after:current};
  });
}

export function AlgorithmWorkbenchTask({task,disabled,onSubmit}) {
  const {a,b,operation,resultFactors=[]}=task.data;
  const [factorA,setFactorA]=useState({remaining:a,factors:[]});
  const [factorB,setFactorB]=useState({remaining:b,factors:[]});
  const [selected,setSelected]=useState([]);
  const [stage,setStage]=useState('factor');
  const [localError,setLocalError]=useState('');
  const [accumulator,setAccumulator]=useState(null);
  const [calcIndex,setCalcIndex]=useState(1);
  const [calcInput,setCalcInput]=useState('');
  const [calcHistory,setCalcHistory]=useState([]);

  useEffect(()=>{
    setFactorA({remaining:a,factors:[]});
    setFactorB({remaining:b,factors:[]});
    setSelected([]);
    setStage('factor');
    setLocalError('');
    setAccumulator(null);
    setCalcIndex(1);
    setCalcInput('');
    setCalcHistory([]);
  },[task.id,a,b]);

  const bothReady=factorA.remaining===1&&factorB.remaining===1;
  const availablePrimes=useMemo(()=>[...new Set([...factorA.factors,...factorB.factors])].sort((x,y)=>x-y),[factorA.factors,factorB.factors]);

  function choosePrime(side,prime){
    if(disabled||stage!=='factor')return;
    const state=side==='a'?factorA:factorB;
    if(state.remaining===1)return;
    if(state.remaining%prime!==0){
      setLocalError(`${state.remaining} не делится на ${prime} без остатка. Выбери другой простой делитель.`);
      return;
    }
    const next={remaining:state.remaining/prime,factors:[...state.factors,prime]};
    if(side==='a')setFactorA(next);else setFactorB(next);
    setLocalError('');
  }

  function goToSelection(){
    if(!bothReady)return;
    setStage('select');
    setLocalError('');
  }

  function addResultPrime(prime){
    setSelected(values=>[...values,prime]);
    setLocalError('');
  }
  function removeResultPrime(index){
    setSelected(values=>values.filter((_,i)=>i!==index));
    setLocalError('');
  }

  function confirmSelection(){
    if(!sameMultiset(selected,resultFactors)){
      setLocalError(operation==='lcm'
        ? 'Проверь набор: для НОК каждого простого множителя должно хватить для обоих чисел.'
        : resultFactors.length===0
          ? 'У этих чисел нет общих простых множителей. Результат равен 1.'
          : 'Проверь общую часть: бери только множители, которые есть в обоих разложениях.');
      return;
    }
    setLocalError('');
    setStage('calculate');
    if(selected.length>=2){
      setAccumulator(selected[0]);
      setCalcIndex(1);
    } else {
      setAccumulator(selected[0]??1);
      setCalcIndex(selected.length);
    }
  }

  function confirmNoCommon(){
    if(resultFactors.length!==0){
      setLocalError('Общие множители есть. Посмотри ещё раз на оба разложения.');
      return;
    }
    setSelected([]);
    setAccumulator(1);
    setStage('calculate');
    setLocalError('');
  }

  function checkCalculation(event){
    event.preventDefault();
    const entered=Number(calcInput);
    const nextFactor=selected[calcIndex];
    const expected=accumulator*nextFactor;
    if(!Number.isInteger(entered)||entered!==expected){
      setLocalError(`Проверь вычисление: ${accumulator} · ${nextFactor}.`);
      return;
    }
    setCalcHistory(rows=>[...rows,{left:accumulator,right:nextFactor,result:expected}]);
    setAccumulator(expected);
    setCalcInput('');
    setLocalError('');
    setCalcIndex(index=>index+1);
  }

  const calcDone=stage==='calculate'&&(selected.length<=1||calcIndex>=selected.length);
  const operationLabel=operation==='lcm'?'НОК':operation==='common'?'общей части':'НОД';
  const selectionInstruction=operation==='lcm'
    ? 'Собери набор простых множителей для НОК: каждого множителя должно хватить для обоих чисел.'
    : 'Выбери общие простые множители. Каждый множитель бери столько раз, сколько он встречается в обоих разложениях.';

  return <div className="algorithm-workbench">
    <div className="workbench-steps" aria-label="Этапы решения">
      <span className={stage==='factor'?'active':'done'}>1. Разложение</span>
      <span className={stage==='select'?'active':stage==='calculate'?'done':''}>2. Множители</span>
      <span className={stage==='calculate'?'active':''}>3. Вычисление</span>
    </div>

    <div className="factorization-lab">
      {[['a',a,factorA],['b',b,factorB]].map(([side,number,state])=><section className={`factorization-console ${state.remaining===1?'complete':''}`} key={side}>
        <div className="console-heading"><span>Число</span><strong>{number}</strong>{state.remaining===1&&<CheckCircle2 size={20}/>}</div>
        <div className="division-readout">
          <strong>{state.remaining===1?'Готово':state.remaining}</strong>
          <small>{state.remaining===1?`${number} = ${formatPrimePowers(number)}`:'Выбери простой делитель'}</small>
        </div>
        {state.remaining!==1&&<div className="prime-keypad">
          {PRIMES.map(prime=><button type="button" key={prime} disabled={disabled} onClick={()=>choosePrime(side,prime)}>{prime}</button>)}
        </div>}
        <div className="division-history">
          {historyFor(number,state.factors).map((row,index)=><div key={index}><span>{row.before}</span><b>÷ {row.prime}</b><span>= {row.after}</span></div>)}
        </div>
      </section>)}
    </div>

    {stage==='factor'&&bothReady&&<button className="primary-button workbench-next" type="button" onClick={goToSelection}>Разложения готовы →</button>}

    {stage==='select'&&<section className="result-factor-stage">
      <h3>{selectionInstruction}</h3>
      <div className="decomposition-summary">
        <span>{a} = <strong>{formatPrimePowers(a)}</strong></span>
        <span>{b} = <strong>{formatPrimePowers(b)}</strong></span>
      </div>
      {availablePrimes.length>0&&<div className="factor-bank">
        {availablePrimes.map(prime=><button className="factor-chip prime" type="button" disabled={disabled} key={prime} onClick={()=>addResultPrime(prime)}>{prime}</button>)}
      </div>}
      <div className="selected-result-factors">
        {selected.length===0?<span>Здесь появится выбранный набор</span>:selected.map((prime,index)=><button type="button" key={`${prime}-${index}`} onClick={()=>removeResultPrime(index)}>{prime} ×</button>)}
      </div>
      <div className="button-row">
        <button className="primary-button" type="button" disabled={disabled||selected.length===0} onClick={confirmSelection}>Проверить набор</button>
        {operation!=='lcm'&&<button className="secondary-button" type="button" disabled={disabled} onClick={confirmNoCommon}>Общих множителей нет</button>}
      </div>
    </section>}

    {stage==='calculate'&&<section className="calculation-console">
      <h3>Вычисли {operationLabel} прямо здесь</h3>
      <div className="calculation-expression">{selected.length?selected.join(' · '):'1'}</div>
      {calcHistory.map((row,index)=><div className="calculation-row solved" key={index}><span>{row.left} · {row.right}</span><b>=</b><strong>{row.result}</strong></div>)}
      {!calcDone&&<form className="calculation-row" onSubmit={checkCalculation}>
        <span>{accumulator} · {selected[calcIndex]}</span><b>=</b>
        <input inputMode="numeric" value={calcInput} onChange={event=>setCalcInput(event.target.value)} aria-label="Промежуточный результат"/>
        <button className="secondary-button" type="submit">Проверить</button>
      </form>}
      {calcDone&&<div className="calculation-finish">
        <span>Получилось</span><strong>{accumulator}</strong>
        <button className="primary-button" type="button" disabled={disabled} onClick={()=>onSubmit(accumulator)}>Завершить решение</button>
      </div>}
      {stage==='calculate'&&<button className="workbench-reset" type="button" onClick={()=>{setStage('select');setSelected([]);setCalcHistory([]);setCalcInput('');setLocalError('');}}><RotateCcw size={16}/> Собрать множители заново</button>}
    </section>}

    {localError&&<p className="workbench-error" role="status">{localError}</p>}
  </div>;
}
