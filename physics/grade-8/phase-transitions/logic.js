export function segmentDirection(a,b){
  if (Math.abs(b.y-a.y) < 1e-9) return 'flat';
  return b.y>a.y ? 'up' : 'down';
}

export function segmentKind(a,b){
  return segmentDirection(a,b)==='flat' ? 'phase' : 'temperature-change';
}

export function phaseProcess(beforeState,afterState){
  const key=`${beforeState}-${afterState}`;
  return ({'solid-liquid':'melting','liquid-solid':'crystallization','liquid-gas':'boiling','gas-liquid':'condensation'})[key] ?? null;
}

const num=v=>Number(String(v).trim().replace(',','.'));
const sameNumber=(a,b)=>Number.isFinite(num(a)) && Math.abs(num(a)-num(b))<1e-9;

export function validateLevel1Answer(task,answer){
  const expected=task.answer;
  const fields=['process','transition','state','tempChange','energy'];
  const details=Object.fromEntries(fields.map(k=>[k,answer?.[k]===expected[k]]));
  details.temperature=sameNumber(answer?.temperature,expected.temperature);
  return {ok:Object.values(details).every(Boolean),details};
}

export function validateLevel2Answer(task,answer){
  let ok=false;
  if(task.answerType==='number') ok=sameNumber(answer,task.answer);
  else if(task.answerType==='multiChoice'){
    const a=[...(answer??[])].sort();
    const b=[...task.answer].sort();
    ok=a.length===b.length && a.every((v,i)=>v===b[i]);
  } else if(task.answerType==='segment') ok=Number(answer)===Number(task.answer);
  else ok=answer===task.answer;
  return {ok};
}

export function isCleanPass(record){
  return Boolean(record?.correct && record.attempts===1 && !record.hintUsed);
}

export function cleanCount(records){
  return records.filter(r=>r.clean===true || isCleanPass(r)).length;
}

export function graphBounds(points){
  return {
    minX:Math.min(...points.map(p=>p.x)),
    maxX:Math.max(...points.map(p=>p.x)),
    minY:Math.min(...points.map(p=>p.y)),
    maxY:Math.max(...points.map(p=>p.y))
  };
}

export function validateBonusPath(task,points){
  if(!Array.isArray(points) || points.length!==task.expectedTemps.length){
    return {ok:false,reason:'point-count'};
  }
  for(let i=0;i<points.length;i++){
    if(!sameNumber(points[i].y,task.expectedTemps[i])) return {ok:false,reason:'temperature',index:i};
  }
  if(task.enforceX && Array.isArray(task.expectedTimes)){
    for(let i=0;i<points.length;i++){
      if(!sameNumber(points[i].x,task.expectedTimes[i])) return {ok:false,reason:'time',index:i};
    }
  }
  return {ok:true};
}
