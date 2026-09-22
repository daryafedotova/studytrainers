export function evaluateLevelAttempt(attempt) {
  const total = Math.max(1, Number(attempt.total) || 0);
  const firstTryCorrect = Math.max(0, Number(attempt.firstTryCorrect) || 0);
  const percent = Math.round((firstTryCorrect / total) * 100);
  const miniBossErrors = Math.max(0, Number(attempt.miniBossErrors) || 0);
  const bestCombo = Math.max(0, Number(attempt.bestCombo) || 0);
  let stars = 1;
  if (percent >= 65 && miniBossErrors <= 1) stars = 2;
  if (percent >= 85 && miniBossErrors === 0) stars = 3;
  return { stars, firstTryAccuracy: percent, points: firstTryCorrect * 100 + bestCombo * 25 + (stars - 1) * 250, bestCombo, miniBossErrors };
}
export function rankFor({ starsTotal = 0, bossDefeated = false } = {}) {
  if (bossDefeated) return 'Мастер числовой галактики';
  if (starsTotal >= 20) return 'Командир экспедиции';
  if (starsTotal >= 15) return 'Исследователь';
  if (starsTotal >= 10) return 'Навигатор';
  if (starsTotal >= 5) return 'Пилот';
  return 'Курсант';
}

export function createBossState(phaseTaskCounts) {
  return {lives:3,phase:1,phaseTaskCounts:[...phaseTaskCounts],completedInPhase:0,completedTotal:0,combo:0,bestCombo:0,errors:{factorization:0,gcd:0,lcm:0,mixed:0},status:'fighting',critical:false};
}
export function bossCanAdvance(state) { return state.completedInPhase >= state.phaseTaskCounts[state.phase - 1]; }
export function applyBossAnswer(state,{correct,skill}) {
  if(state.status!=='fighting') return state;
  if(!correct){const lives=Math.max(0,state.lives-1);return {...state,lives,combo:0,critical:false,errors:{...state.errors,[skill]:(state.errors[skill]??0)+1},status:lives<=0?'defeat':'fighting'};}
  const combo=state.combo+1;
  return {...state,combo,bestCombo:Math.max(state.bestCombo,combo),completedInPhase:state.completedInPhase+1,completedTotal:state.completedTotal+1,critical:combo%3===0};
}
export function advanceBossPhase(state) {
  if(!bossCanAdvance(state)||state.phase>=state.phaseTaskCounts.length)return state;
  return {...state,phase:state.phase+1,completedInPhase:0,critical:false};
}
