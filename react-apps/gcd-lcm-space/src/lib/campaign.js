export const CAMPAIGN_LEVELS = [
  {id:1, icon:'🪐', title:'Планета Простых чисел', duration:'4–5 мин', skill:'primes', goal:'Различай простые, составные числа и число 1.'},
  {id:2, icon:'☄️', title:'Астероидное поле множителей', duration:'6–7 мин', skill:'factorization', goal:'Разлагай числа на простые множители двумя способами.'},
  {id:3, icon:'🛰️', title:'Станция Степеней', duration:'4–5 мин', skill:'powers', goal:'Сворачивай повторяющиеся множители в степени.'},
  {id:4, icon:'🌌', title:'Сектор Общих множителей', duration:'5 мин', skill:'common-factors', goal:'Находи общую часть двух разложений.'},
  {id:5, icon:'🔵', title:'Планета НОД', duration:'6–7 мин', skill:'gcd', goal:'Находи НОД через простые множители.'},
  {id:6, icon:'🛸', title:'Орбита Кратных', duration:'4–5 мин', skill:'multiples', goal:'Пойми кратные и смысл наименьшего общего кратного.'},
  {id:7, icon:'🟣', title:'Планета НОК', duration:'6–7 мин', skill:'lcm', goal:'Находи НОК через разложение на простые множители.'},
  {id:8, icon:'🌫️', title:'Туманность НОД–НОК', duration:'5–6 мин', skill:'mixed', goal:'Определи, нужен НОД или НОК, и реши задачу.'}
];

export function getCampaignState(profile) {
  const starsTotal = Object.values(profile?.levels ?? {}).reduce((sum, level) => sum + (Number(level.bestStars) || 0), 0);
  return {
    starsTotal,
    bossUnlocked: starsTotal >= 18,
    levels: CAMPAIGN_LEVELS.map(level => ({...level, ...(profile?.levels?.[String(level.id)] ?? {unlocked:level.id===1,bestStars:0,completed:false})}))
  };
}
