(() => {
  const subjectTabs = [...document.querySelectorAll('.subject-tab')];
  const gradePanels = [...document.querySelectorAll('.grade-panel')];
  const gradeButtons = [...document.querySelectorAll('.filter-chip')];
  const domainPanel = document.getElementById('math-domain-panel');
  const domainButtons = [...document.querySelectorAll('.domain-chip')];
  const cards = [...document.querySelectorAll('.trainer-card')];
  const counter = document.getElementById('material-counter');
  const resultsTitle = document.getElementById('results-title');
  const emptyState = document.getElementById('empty-results');
  const emptyText = document.getElementById('empty-results-text');

  const state = {
    subject: 'math',
    grade: 'all',
    domain: 'all',
  };

  const subjectNames = {
    math: 'Математика',
    physics: 'Физика',
  };

  const domainNames = {
    algebra: 'Алгебра',
    geometry: 'Геометрия',
  };

  function materialWord(count) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'материал';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'материала';
    return 'материалов';
  }

  function domainIsAvailable() {
    return state.subject === 'math' && ['7', '8', '9'].includes(state.grade);
  }

  function syncControls() {
    subjectTabs.forEach((button) => {
      const active = button.dataset.subject === state.subject;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    gradePanels.forEach((panel) => {
      panel.hidden = panel.dataset.gradePanel !== state.subject;
    });

    gradeButtons.forEach((button) => {
      const panel = button.closest('.grade-panel');
      const active = panel?.dataset.gradePanel === state.subject && button.dataset.grade === state.grade;
      button.classList.toggle('is-active', Boolean(active));
    });

    const showDomain = domainIsAvailable();
    domainPanel.hidden = !showDomain;
    if (!showDomain) state.domain = 'all';

    domainButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.domain === state.domain);
    });
  }

  function syncHash() {
    let next = `#${state.subject}`;
    if (state.grade !== 'all') next += `-${state.grade}`;
    if (domainIsAvailable() && state.domain !== 'all') next += `-${state.domain}`;
    if (window.location.hash !== next) history.replaceState(null, '', next);
  }

  function render(updateHash = true) {
    syncControls();

    let visibleCount = 0;
    cards.forEach((card) => {
      const subjectMatch = card.dataset.subject === state.subject;
      const grades = (card.dataset.grades || '').split(/\s+/).filter(Boolean);
      const gradeMatch = state.grade === 'all' || grades.includes(state.grade);
      const domainMatch = !domainIsAvailable() || state.domain === 'all' || card.dataset.domain === state.domain;
      const visible = subjectMatch && gradeMatch && domainMatch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    counter.textContent = `${visibleCount} ${materialWord(visibleCount)}`;

    const titleParts = [subjectNames[state.subject]];
    if (state.grade !== 'all') titleParts.push(`${state.grade} класс`);
    else titleParts.push('все классы');
    if (domainIsAvailable() && state.domain !== 'all') titleParts.push(domainNames[state.domain]);
    resultsTitle.textContent = titleParts.join(' · ');

    emptyState.hidden = visibleCount !== 0;
    if (visibleCount === 0) {
      if (state.subject === 'physics') {
        emptyText.textContent = state.grade === 'all'
          ? 'Тренажёры по физике появятся здесь по мере добавления материалов.'
          : `Тренажёры по физике для ${state.grade} класса появятся здесь позже.`;
      } else if (domainIsAvailable() && state.domain !== 'all') {
        emptyText.textContent = `Тренажёры: ${domainNames[state.domain].toLowerCase()}, ${state.grade} класс — появятся здесь позже.`;
      } else {
        emptyText.textContent = 'Материалы для выбранного класса появятся здесь позже.';
      }
    }

    if (updateHash) syncHash();
  }

  function loadFromHash() {
    const raw = window.location.hash.replace(/^#/, '').trim();
    if (!raw) return;
    const parts = raw.split('-');
    const subject = parts[0];
    if (!['math', 'physics'].includes(subject)) return;

    state.subject = subject;
    const allowedGrades = subject === 'math'
      ? ['5', '6', '7', '8', '9']
      : ['7', '8', '9', '10', '11'];

    if (parts[1] && allowedGrades.includes(parts[1])) state.grade = parts[1];
    if (subject === 'math' && ['7', '8', '9'].includes(state.grade) && ['algebra', 'geometry'].includes(parts[2])) {
      state.domain = parts[2];
    }
  }

  subjectTabs.forEach((button) => {
    button.addEventListener('click', () => {
      state.subject = button.dataset.subject;
      state.grade = 'all';
      state.domain = 'all';
      render();
    });
  });

  gradeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.grade = button.dataset.grade;
      state.domain = 'all';
      render();
    });
  });

  domainButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.domain = button.dataset.domain;
      render();
    });
  });

  window.addEventListener('hashchange', () => {
    state.subject = 'math';
    state.grade = 'all';
    state.domain = 'all';
    loadFromHash();
    render(false);
  });

  loadFromHash();
  render(false);
})();
