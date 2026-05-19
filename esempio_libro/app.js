import { mountShannonBlocks } from './components/shannon.js';

const chapterListEl = document.getElementById('chapter-list');
const chapterContentEl = document.getElementById('chapter-content');
const viewModeButtons = document.querySelectorAll('[data-view-mode]');

let chaptersData = [];
let currentChapterId = '';
let viewMode = getSavedViewMode();
let currentChapterMarkdown = '';
let currentSections = [];
let activeSectionId = '';
let slideDeckState = null;
let fullscreenListenerBound = false;

init().catch((err) => {
  chapterContentEl.innerHTML = `<p>Loading error: ${escapeHtml(err.message)}</p>`;
});

async function init() {
  setupViewModeControls();

  if (window.location.protocol === 'file:') {
    chapterContentEl.innerHTML = `
      <h2>Local preview needs a small server</h2>
      <p>This project cannot load chapter files when opened as <code>file://</code>.</p>
      <p>Run:</p>
      <pre><code>python3 -m http.server 8080</code></pre>
      <p>Then open <a href="http://localhost:8080">http://localhost:8080</a>.</p>
    `;
    return;
  }

  chaptersData = await loadChapters();
  setupChapterListInteractions();
  await loadCurrentChapter(chaptersData);

  window.addEventListener('hashchange', async () => {
    await loadCurrentChapter(chaptersData);
  });
}

async function loadChapters() {
  const res = await fetch('./chapters/chapters.json');
  if (!res.ok) throw new Error('Cannot read chapters.json');
  return res.json();
}

function renderChapterList(chapters) {
  chapterListEl.innerHTML = chapters
    .map((ch) => {
      const isActive = ch.id === currentChapterId;
      const subListHtml =
        isActive && currentSections.length
          ? `
            <ul class="subchapter-list">
              ${currentSections
                .map(
                  (section) => `
                    <li>
                      <button
                        type="button"
                        class="subchapter-link${section.id === activeSectionId ? ' active' : ''}"
                        data-section-id="${section.id}"
                      >
                        ${escapeHtml(section.title)}
                      </button>
                    </li>
                  `
                )
                .join('')}
            </ul>
          `
          : '';

      return `
        <li class="chapter-item">
          <a href="#${ch.id}" data-id="${ch.id}" class="${isActive ? 'active' : ''}">${escapeHtml(ch.title)}</a>
          ${subListHtml}
        </li>
      `;
    })
    .join('');
}

async function loadCurrentChapter(chapters) {
  const currentId = (window.location.hash || `#${chapters[0].id}`).slice(1);
  const chapter = chapters.find((ch) => ch.id === currentId) || chapters[0];
  currentChapterId = chapter.id;

  currentChapterMarkdown = await fetchText(`./chapters/${chapter.file}`);
  currentSections = buildSectionIndex(getH2Sections(currentChapterMarkdown));
  activeSectionId = '';
  renderChapterList(chaptersData);
  renderCurrentChapterView();
}

async function fetchText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Chapter not found: ${path}`);
  return res.text();
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  return parseLines(lines).join('\n');
}

function markdownToSlideDeckHtml(markdown, sections) {
  const safeSections = sections.length
    ? sections
    : [{ id: 'slide', title: 'Slide', lines: markdown.replace(/\r/g, '').split('\n') }];

  const slideHtml = safeSections
    .map((section, index) => {
      const bodyHtml = parseLines(section.lines).join('\n');
      return `
        <section class="slide" data-slide-index="${index}" data-section-id="${section.id}">
          <h2 class="slide-title" tabindex="0" role="button">${inlineMarkdown(section.title)}</h2>
          <div class="slide-points">${bodyHtml}</div>
        </section>
      `;
    })
    .join('\n');

  return `
    <div class="slide-toolbar">
      <button type="button" class="slide-nav prev" aria-label="Previous slide">←</button>
      <button type="button" class="slide-nav next" aria-label="Next slide">→</button>
      <span class="slide-counter"></span>
      <button
        type="button"
        class="slide-nav slide-fullscreen"
        aria-label="Toggle full screen"
        aria-pressed="false"
      >
        Full screen
      </button>
    </div>
    <div class="slide-deck">${slideHtml}</div>
  `;
}

function getH2Sections(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: line.slice(3).trim(), lines: [] };
      continue;
    }
    if (currentSection) currentSection.lines.push(line);
  }

  if (currentSection) sections.push(currentSection);
  return sections;
}

function buildSectionIndex(sections) {
  const idCounts = new Map();

  return sections.map((section, index) => {
    const base = slugifyHeading(section.title || `section-${index + 1}`);
    const nextCount = (idCounts.get(base) || 0) + 1;
    idCounts.set(base, nextCount);
    const id = nextCount === 1 ? base : `${base}-${nextCount}`;
    return { ...section, id };
  });
}

function slugifyHeading(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function parseLines(lines) {
  const out = [];
  let inList = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!line.trim()) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      i += 1;
      continue;
    }

    if (trimmed.startsWith(':::details ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }

      const title = trimmed.replace(/^:::details\s+/, '').replace(/:::$/, '').trim();
      i += 1;

      const detailLines = [];
      while (i < lines.length && lines[i].trim() !== ':::end:::') {
        detailLines.push(lines[i]);
        i += 1;
      }

      if (i < lines.length && lines[i].trim() === ':::end:::') {
        i += 1;
      }

      const detailHtml = parseLines(detailLines).join('\n');
      out.push(
        `<details class="expand-point"><summary>${inlineMarkdown(title)}</summary><div class="expand-body">${detailHtml}</div></details>`
      );
      continue;
    }

    if (trimmed.startsWith(':::') && trimmed.endsWith(':::')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      const blockName = trimmed.slice(3, -3).trim();
      out.push(`<div data-block="${escapeHtml(blockName)}"></div>`);
      i += 1;
      continue;
    }

    if (line.startsWith('# ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      i += 1;
      continue;
    }

    if (line.startsWith('### ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      i += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      i += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
      i += 1;
      continue;
    }

    if (inList) {
      out.push('</ul>');
      inList = false;
    }

    out.push(`<p>${inlineMarkdown(line)}</p>`);
    i += 1;
  }

  if (inList) out.push('</ul>');
  return out;
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setupViewModeControls() {
  updateViewModeButtons();
  document.body.dataset.viewMode = viewMode;

  viewModeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedMode = btn.dataset.viewMode;
      if (selectedMode !== 'slide' && selectedMode !== 'book') return;
      viewMode = selectedMode;
      localStorage.setItem('viewMode', viewMode);
      updateViewModeButtons();
      renderCurrentChapterView();
    });
  });
}

function updateViewModeButtons() {
  viewModeButtons.forEach((btn) => {
    const isActive = btn.dataset.viewMode === viewMode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function applyViewMode() {
  document.body.dataset.viewMode = viewMode;

  if (viewMode === 'book') {
    slideDeckState = null;
    chapterContentEl.querySelectorAll('.expand-point').forEach((details) => {
      details.open = true;
    });
    return;
  }

  chapterContentEl.querySelectorAll('.expand-point').forEach((details) => {
    details.open = false;
  });
  initSlideDeck();
}

function getSavedViewMode() {
  const saved = localStorage.getItem('viewMode');
  return saved === 'book' ? 'book' : 'slide';
}

function renderCurrentChapterView() {
  if (!currentChapterMarkdown) return;

  if (viewMode === 'slide') {
    chapterContentEl.innerHTML = markdownToSlideDeckHtml(currentChapterMarkdown, currentSections);
  } else {
    chapterContentEl.innerHTML = markdownToHtml(currentChapterMarkdown);
    applyBookSectionAnchors();
  }

  mountShannonBlocks(chapterContentEl);
  applyViewMode();
}

function applyBookSectionAnchors() {
  const headings = chapterContentEl.querySelectorAll('h2');
  headings.forEach((heading, index) => {
    const section = currentSections[index];
    if (!section) return;
    heading.id = section.id;
    heading.dataset.sectionId = section.id;
  });
}

function initSlideDeck() {
  const deck = chapterContentEl.querySelector('.slide-deck');
  if (!deck) return;

  const slides = Array.from(deck.querySelectorAll('.slide'));
  if (!slides.length) return;
  const stepsBySlide = [];

  slides.forEach((slide, slideIndex) => {
    const pointsContainer = slide.querySelector('.slide-points');
    const steps = pointsContainer ? Array.from(pointsContainer.children) : [];
    stepsBySlide[slideIndex] = steps;

    steps.forEach((step) => {
      step.classList.add('slide-step', 'is-hidden');
    });

    const title = slide.querySelector('.slide-title');
    if (!title) return;

    title.addEventListener('click', () => {
      advanceWithinSlideOrNext();
    });

    title.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      advanceWithinSlideOrNext();
    });
  });

  slideDeckState = {
    slides,
    stepsBySlide,
    revealedCounts: slides.map(() => 0),
    currentIndex: 0,
    counterEl: chapterContentEl.querySelector('.slide-counter'),
    nextBtn: chapterContentEl.querySelector('.slide-nav.next'),
    prevBtn: chapterContentEl.querySelector('.slide-nav.prev'),
    fullscreenBtn: chapterContentEl.querySelector('.slide-fullscreen'),
    history: []
  };

  pushSlideHistory();
  renderSlideState();

  if (slideDeckState.nextBtn) {
    slideDeckState.nextBtn.addEventListener('click', advanceWithinSlideOrNext);
  }
  if (slideDeckState.prevBtn) {
    slideDeckState.prevBtn.addEventListener('click', undoSlideStep);
  }
  if (slideDeckState.fullscreenBtn) {
    slideDeckState.fullscreenBtn.addEventListener('click', toggleSlideFullscreen);
  }
  ensureFullscreenListener();
  updateFullscreenButtonState();
}

function advanceWithinSlideOrNext() {
  if (!slideDeckState) return;
  const idx = slideDeckState.currentIndex;
  const currentSteps = slideDeckState.stepsBySlide[idx] || [];
  const currentCount = slideDeckState.revealedCounts[idx];

  if (currentCount < currentSteps.length) {
    slideDeckState.revealedCounts[idx] = currentCount + 1;
    pushSlideHistory();
    renderSlideState();
    return;
  }

  if (idx < slideDeckState.slides.length - 1) {
    slideDeckState.currentIndex = idx + 1;
    pushSlideHistory();
    renderSlideState();
  }
}

function undoSlideStep() {
  if (!slideDeckState) return;
  if (slideDeckState.history.length <= 1) return;

  slideDeckState.history.pop();
  const previous = slideDeckState.history[slideDeckState.history.length - 1];
  slideDeckState.currentIndex = previous.currentIndex;
  slideDeckState.revealedCounts = [...previous.revealedCounts];
  renderSlideState();
}

function pushSlideHistory() {
  if (!slideDeckState) return;
  slideDeckState.history.push({
    currentIndex: slideDeckState.currentIndex,
    revealedCounts: [...slideDeckState.revealedCounts]
  });
}

function renderSlideState() {
  if (!slideDeckState) return;
  const { slides, currentIndex, counterEl, stepsBySlide, revealedCounts, prevBtn } = slideDeckState;

  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentIndex);

    const steps = stepsBySlide[index] || [];
    const visibleCount = revealedCounts[index] || 0;

    steps.forEach((step, stepIndex) => {
      const visible = stepIndex < visibleCount;
      step.classList.toggle('is-hidden', !visible);
      if (step.tagName === 'DETAILS') {
        // In slide mode, revealed points stay compact (summary visible, body hidden).
        step.open = false;
      }
    });
  });

  if (counterEl) {
    counterEl.textContent = `Slide ${currentIndex + 1}/${slides.length}`;
  }

  if (prevBtn) {
    prevBtn.disabled = slideDeckState.history.length <= 1;
  }

  const currentSection = currentSections[currentIndex];
  setActiveSection(currentSection ? currentSection.id : '');
  updateFullscreenButtonState();
}

function ensureFullscreenListener() {
  if (fullscreenListenerBound) return;
  document.addEventListener('fullscreenchange', updateFullscreenButtonState);
  fullscreenListenerBound = true;
}

function toggleSlideFullscreen() {
  const target = chapterContentEl.closest('.chapter-card');
  if (!target || typeof target.requestFullscreen !== 'function' || !document.fullscreenEnabled) return;

  if (isSlideFullscreen()) {
    document.exitFullscreen();
    return;
  }

  target.requestFullscreen();
}

function isSlideFullscreen() {
  const target = chapterContentEl.closest('.chapter-card');
  return !!(target && document.fullscreenElement === target);
}

function updateFullscreenButtonState() {
  if (!slideDeckState || !slideDeckState.fullscreenBtn) return;

  const btn = slideDeckState.fullscreenBtn;
  if (!document.fullscreenEnabled) {
    btn.hidden = true;
    return;
  }

  btn.hidden = false;
  const isFullscreen = isSlideFullscreen();
  btn.textContent = isFullscreen ? 'Exit full screen' : 'Full screen';
  btn.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
}

function setupChapterListInteractions() {
  chapterListEl.addEventListener('click', (event) => {
    const subchapterButton = event.target.closest('.subchapter-link');
    if (!subchapterButton) return;

    event.preventDefault();
    const { sectionId } = subchapterButton.dataset;
    if (!sectionId) return;
    navigateToSection(sectionId);
  });
}

function navigateToSection(sectionId) {
  const sectionIndex = currentSections.findIndex((section) => section.id === sectionId);
  if (sectionIndex === -1) return;

  setActiveSection(sectionId);

  if (viewMode === 'slide' && slideDeckState) {
    slideDeckState.currentIndex = sectionIndex;
    pushSlideHistory();
    renderSlideState();
    return;
  }

  const target = chapterContentEl.querySelector(`[data-section-id="${sectionId}"]`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setActiveSection(sectionId) {
  activeSectionId = sectionId;
  chapterListEl.querySelectorAll('.subchapter-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sectionId === sectionId);
  });
}
