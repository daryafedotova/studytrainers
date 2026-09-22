import { Download, Trophy } from 'lucide-react';

function resultFilename(displayName) {
  const safe = String(displayName || 'result').trim().replace(/[\\/:*?"<>|]+/g, '-').slice(0, 40) || 'result';
  return `nod-nok-${safe}.png`;
}

export function downloadResultCard(profile, bossResult) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
  gradient.addColorStop(0, '#07152f');
  gradient.addColorStop(0.55, '#2b1762');
  gradient.addColorStop(1, '#12081f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 675);
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 137) % 1180 + 10;
    const y = (i * 79) % 650 + 10;
    ctx.beginPath();
    ctx.arc(x, y, i % 7 === 0 ? 2.2 : 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#7dd3fc';
  ctx.font = '700 26px Trebuchet MS, sans-serif';
  ctx.fillText('КОСМИЧЕСКАЯ ЭКСПЕДИЦИЯ · НОД И НОК', 70, 82);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px Trebuchet MS, sans-serif';
  ctx.fillText(profile.displayName, 70, 165);
  ctx.fillStyle = '#c4b5fd';
  ctx.font = '800 34px Trebuchet MS, sans-serif';
  ctx.fillText(profile.rank, 70, 215);
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.font = '800 31px Trebuchet MS, sans-serif';
  ctx.fillText(`${profile.starsTotal}/24 звезды`, 70, 325);
  ctx.fillText(`${profile.expeditionPoints ?? 0} очков экспедиции`, 70, 375);
  ctx.fillText(`Лучшее комбо: x${bossResult.bestCombo}`, 70, 425);
  ctx.fillText(`Осталось жизней: ${bossResult.livesRemaining}/3`, 70, 475);
  ctx.fillStyle = '#fde68a';
  ctx.font = '900 34px Trebuchet MS, sans-serif';
  ctx.fillText('Ядро Сингулярности побеждено', 70, 565);
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.font = '700 22px Trebuchet MS, sans-serif';
  ctx.fillText('Математика · 6 класс', 70, 610);
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = resultFilename(profile.displayName);
    anchor.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function ResultCard({ profile, bossResult }) {
  return <div className="final-result-card">
    <div className="result-trophy"><Trophy size={34}/></div>
    <p className="eyebrow">Итог экспедиции</p>
    <h2>{profile.displayName}</h2>
    <strong className="final-rank">{profile.rank}</strong>
    <div className="result-card-grid">
      <div><span>Звёзды</span><strong>{profile.starsTotal}/24 ⭐</strong></div>
      <div><span>Очки</span><strong>{profile.expeditionPoints ?? 0}</strong></div>
      <div><span>Лучшее комбо</span><strong>×{bossResult.bestCombo}</strong></div>
      <div><span>Жизни</span><strong>{bossResult.livesRemaining}/3 ❤️</strong></div>
    </div>
    <p className="singularity-stamp">✓ Ядро Сингулярности побеждено</p>
    {profile.achievements?.length > 0 && <div className="achievement-row">{profile.achievements.map(item => <span key={item}>{item}</span>)}</div>}
    <button className="primary-button save-result" type="button" onClick={() => downloadResultCard(profile, bossResult)}><Download size={18}/> Сохранить PNG</button>
  </div>;
}
