const introScreen = document.getElementById('mantissa-intro-screen');
const introStartBtn = document.getElementById('mantissa-intro-start');
const introBackBtn = document.getElementById('mantissa-intro-back');
const fixedStartBtn = document.getElementById('fixed-start-btn');
const blockGrid = document.getElementById('block-grid');
const stagePill = document.getElementById('stage-pill');
const progressPill = document.getElementById('progress-pill');
const ruleBtn = document.getElementById('rule-btn');

let currentBlock = null;
let bypassIntroOnce = false;

function showIntro() {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  introScreen?.classList.add('active');
  if (progressPill) progressPill.hidden = true;
  if (ruleBtn) ruleBtn.hidden = true;
  if (stagePill) stagePill.textContent = 'Изменение мантиссы · справка';
  window.scrollTo({top:0, behavior:'smooth'});
}

function showSetup() {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById('length-screen')?.classList.add('active');
  if (stagePill) stagePill.textContent = 'Изменение мантиссы';
  window.scrollTo({top:0, behavior:'smooth'});
}

blockGrid?.addEventListener('click', event => {
  const card = event.target.closest('[data-block-id]');
  if (card) currentBlock = card.dataset.blockId;
});

fixedStartBtn?.addEventListener('click', event => {
  if (currentBlock !== 'mantissa-shift' || bypassIntroOnce) {
    bypassIntroOnce = false;
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  showIntro();
}, true);

introStartBtn?.addEventListener('click', () => {
  bypassIntroOnce = true;
  fixedStartBtn?.click();
});

introBackBtn?.addEventListener('click', showSetup);
