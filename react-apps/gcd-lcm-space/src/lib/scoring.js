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
