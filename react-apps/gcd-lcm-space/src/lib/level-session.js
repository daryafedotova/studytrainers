export function createAttemptStats(total) {
  return { total: Math.max(0, Number(total) || 0), firstTryCorrect: 0, hintsUsed: 0, miniBossErrors: 0, currentCombo: 0, bestCombo: 0, attemptsByTask: {}, hintedTasks: {}, solvedTasks: {} };
}
export function registerHint(state, taskId) {
  if (state.solvedTasks[taskId] || state.hintedTasks[taskId]) return state;
  return {...state,hintsUsed:state.hintsUsed+1,hintedTasks:{...state.hintedTasks,[taskId]:true}};
}
export function registerLevelAnswer(state,{taskId,correct,isMiniBoss}) {
  const attempts=state.attemptsByTask[taskId]??0;
  const nextAttempts=attempts+1;
  const firstTry=attempts===0&&!state.hintedTasks[taskId];
  if(!correct) return {...state,currentCombo:0,miniBossErrors:state.miniBossErrors+(isMiniBoss?1:0),attemptsByTask:{...state.attemptsByTask,[taskId]:nextAttempts}};
  const combo=state.currentCombo+1;
  return {...state,firstTryCorrect:state.firstTryCorrect+(!isMiniBoss&&firstTry?1:0),currentCombo:combo,bestCombo:Math.max(state.bestCombo,combo),attemptsByTask:{...state.attemptsByTask,[taskId]:nextAttempts},solvedTasks:{...state.solvedTasks,[taskId]:true}};
}
