const introScreen = document.getElementById('prefix-power-intro-screen');
const introStartBtn = document.getElementById('prefix-power-intro-start');
const introBackBtn = document.getElementById('prefix-power-intro-back');
const blockGrid = document.getElementById('block-grid');
const stagePill = document.getElementById('stage-pill');
const progressPill = document.getElementById('progress-pill');
const ruleBtn = document.getElementById('rule-btn');
const lengthButtons = [...document.querySelectorAll('[data-count]')];

let currentBlock = null;
let pendingButton = null;
let bypassIntroOnce = false;

function showIntro() {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  introScreen?.classList.add('active');
  if (progressPill) progressPill.hidden = true;
  if (ruleBtn) ruleBtn.hidden = true;
  if (stagePill) stagePill.textContent = 'Приставка и степень 10 · справка';
  window.scrollTo({top:0, behavior:'smooth'});
}

function showSetup() {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById('length-screen')?.classList.add('active');
  if (stagePill) stagePill.textContent = 'Приставка и степень 10';
  window.scrollTo({top:0, behavior:'smooth'});
}

blockGrid?.addEventListener('click', event => {
  const card = event.target.closest('[data-block-id]');
  if (card) currentBlock = card.dataset.blockId;
});

lengthButtons.forEach(button => {
  button.addEventListener('click', event => {
    if (currentBlock !== 'prefix-power' || bypassIntroOnce) {
      bypassIntroOnce = false;
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    pendingButton = button;
    showIntro();
  }, true);
});

introStartBtn?.addEventListener('click', () => {
  if (!pendingButton) return;
  const button = pendingButton;
  pendingButton = null;
  bypassIntroOnce = true;
  button.click();
});

introBackBtn?.addEventListener('click', () => {
  pendingButton = null;
  showSetup();
});
