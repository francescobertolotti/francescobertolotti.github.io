export function mountShannonBlocks(root) {
  const blocks = root.querySelectorAll('[data-block]');

  blocks.forEach((el) => {
    const block = el.dataset.block;
    const config = readBlockConfig(el);

    if (block === 'figure') {
      mountFigureBlock(el, config);
      return;
    }

    if (block === 'figure-step') {
      mountFigureStepBlock(el, config);
      return;
    }

    if (block === 'binary-riddle') {
      mountBinaryRiddle(el);
      return;
    }

    if (block === 'entropy-slider') {
      mountEntropySlider(el);
      return;
    }
  });
}

function readBlockConfig(el) {
  if (!el.dataset.config) return { fields: {}, body: '' };
  try {
    return JSON.parse(decodeURIComponent(el.dataset.config));
  } catch {
    return { fields: {}, body: '' };
  }
}

function mountFigureBlock(el, config) {
  const fields = config.fields || {};
  const src = fields.src || '';
  if (!src) {
    el.className = 'shannon-box media-block';
    el.innerHTML = `<p class="media-error">Figure missing required field: <code>src</code>.</p>`;
    return;
  }

  const alt = fields.alt || '';
  const caption = fields.caption || '';
  const layout = normalizeLayout(fields.layout);
  renderMediaBlock(el, {
    typeClass: 'figure-block',
    layout,
    src,
    alt,
    caption,
    badge: 'Figure'
  });
}

function mountFigureStepBlock(el, config) {
  const fields = config.fields || {};
  const frameList = parseCsvList(fields.frames || '');
  const stepCaptions = parsePipeList(fields['step-captions'] || '');
  const src = fields.src || '';
  const caption = fields.caption || '';
  const layout = normalizeLayout(fields.layout);

  if (frameList.length > 0) {
    mountFigureStepSequence(el, {
      frames: frameList,
      stepCaptions,
      caption,
      layout
    });
    return;
  }

  if (!src) {
    el.className = 'shannon-box media-block';
    el.innerHTML = `<p class="media-error">Figure step missing required field: <code>src</code> or <code>frames</code>.</p>`;
    return;
  }

  const alt = fields.alt || '';
  renderMediaBlock(el, {
    typeClass: 'figure-step-block',
    layout,
    src,
    alt,
    caption,
    badge: 'Figure step'
  });
}

function mountFigureStepSequence(el, { frames, stepCaptions, caption, layout }) {
  el.className = `shannon-box media-block figure-step-block figure-step-sequence layout-${layout}`;
  el.innerHTML = `
    <p class="media-badge">Figure step</p>
    <figure class="media-figure">
      <img class="step-frame-image" src="${escapeHtml(frames[0])}" alt="Figure step 1" loading="lazy" />
      <figcaption class="media-caption">
        <span class="step-caption">${escapeHtml(stepCaptions[0] || '')}</span>
        ${caption ? `<span class="step-global-caption">${escapeHtml(caption)}</span>` : ''}
      </figcaption>
    </figure>
    <div class="step-controls">
      <button type="button" class="step-btn prev-step" aria-label="Previous figure step">←</button>
      <span class="step-counter">Step 1/${frames.length}</span>
      <button type="button" class="step-btn next-step" aria-label="Next figure step">→</button>
    </div>
  `;

  const imageEl = el.querySelector('.step-frame-image');
  const stepCaptionEl = el.querySelector('.step-caption');
  const counterEl = el.querySelector('.step-counter');
  const prevBtn = el.querySelector('.prev-step');
  const nextBtn = el.querySelector('.next-step');
  let index = 0;

  const render = () => {
    imageEl.src = frames[index];
    imageEl.alt = `Figure step ${index + 1}`;
    counterEl.textContent = `Step ${index + 1}/${frames.length}`;
    if (stepCaptionEl) {
      stepCaptionEl.textContent = stepCaptions[index] || '';
    }
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === frames.length - 1;
  };

  prevBtn.addEventListener('click', () => {
    if (index === 0) return;
    index -= 1;
    render();
  });

  nextBtn.addEventListener('click', () => {
    if (index >= frames.length - 1) return;
    index += 1;
    render();
  });

  render();
}

function renderMediaBlock(el, { typeClass, layout, src, alt, caption, badge }) {
  el.className = `shannon-box media-block ${typeClass} layout-${layout}`;
  el.innerHTML = `
    <p class="media-badge">${escapeHtml(badge)}</p>
    <figure class="media-figure">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />
      ${caption ? `<figcaption class="media-caption">${escapeHtml(caption)}</figcaption>` : ''}
    </figure>
  `;
}

function normalizeLayout(layout) {
  return layout === 'wide' ? 'wide' : 'inline';
}

function parseCsvList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePipeList(value) {
  return value
    .split('|')
    .map((item) => item.trim());
}


function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function mountEntropySlider(el) {
  el.className = 'shannon-box';
  el.innerHTML = `
    <h4>Interactive: information of an event</h4>
    <label>Event probability p(x): <span class="p-value">0.50</span></label>
    <input class="p-slider" type="range" min="0.01" max="0.99" step="0.01" value="0.50" />
    <p class="metric">I(x) = -log2(p) = <strong class="info-value">1.000</strong> bit</p>
  `;

  const slider = el.querySelector('.p-slider');
  const pValue = el.querySelector('.p-value');
  const infoValue = el.querySelector('.info-value');

  const render = () => {
    const p = Number(slider.value);
    const info = -Math.log2(p);
    pValue.textContent = p.toFixed(2);
    infoValue.textContent = info.toFixed(3);
  };

  slider.addEventListener('input', render);
  render();
}

function mountBinaryRiddle(el) {
  el.className = 'shannon-box binary-riddle';
  el.innerHTML = `
    <h4>Interactive: binary yes/no guessing (1 to 16)</h4>
    <p class="binary-note">A hidden number is chosen. Ask yes/no questions and track how uncertainty shrinks.</p>
    <div class="binary-controls">
      <label>Question threshold: Is the number greater than <span class="threshold-value">8</span>?</label>
      <input class="threshold-slider" type="range" min="1" max="15" step="1" value="8" />
      <div class="binary-actions">
        <button type="button" class="binary-btn ask-btn">Ask this question</button>
        <button type="button" class="binary-btn best-btn">Ask best split</button>
        <button type="button" class="binary-btn reset-btn">New number</button>
      </div>
    </div>
    <p class="binary-answer">Question 0. Remaining alternatives: <strong>16</strong>.</p>
    <p class="binary-metric">Uncertainty upper bound: <strong class="bits-value">4.00</strong> bits</p>
    <div class="binary-remaining"></div>
  `;

  const thresholdValue = el.querySelector('.threshold-value');
  const thresholdSlider = el.querySelector('.threshold-slider');
  const askBtn = el.querySelector('.ask-btn');
  const bestBtn = el.querySelector('.best-btn');
  const resetBtn = el.querySelector('.reset-btn');
  const answerEl = el.querySelector('.binary-answer');
  const bitsValueEl = el.querySelector('.bits-value');
  const remainingEl = el.querySelector('.binary-remaining');

  let secret = randomInt(1, 16);
  let remaining = range(1, 16);
  let questions = 0;

  const updateThresholdLabel = () => {
    thresholdValue.textContent = String(Number(thresholdSlider.value));
  };

  const updateRemainingView = () => {
    remainingEl.innerHTML = remaining.map((n) => `<span class="num-chip">${n}</span>`).join('');
    const bits = remaining.length > 0 ? Math.log2(remaining.length) : 0;
    bitsValueEl.textContent = bits.toFixed(2);
    const solved = remaining.length <= 1;
    askBtn.disabled = solved;
    bestBtn.disabled = solved;
    thresholdSlider.disabled = solved;
  };

  const askQuestion = (threshold) => {
    if (remaining.length <= 1) return;

    const answerYes = secret > threshold;
    remaining = remaining.filter((n) => (answerYes ? n > threshold : n <= threshold));
    questions += 1;

    const answerText = answerYes ? 'Yes' : 'No';
    const remainingCount = remaining.length;
    const noun = remainingCount === 1 ? 'number' : 'numbers';
    answerEl.innerHTML = `Question ${questions}: Is it greater than ${threshold}? <strong>${answerText}</strong>. Remaining alternatives: <strong>${remainingCount}</strong> ${noun}.`;

    updateRemainingView();

    if (remaining.length > 1) {
      const nextThreshold = Math.floor((remaining[0] + remaining[remaining.length - 1]) / 2);
      thresholdSlider.value = String(nextThreshold);
      updateThresholdLabel();
      return;
    }

    if (remaining.length === 1) {
      answerEl.innerHTML += ` Hidden number found: <strong>${remaining[0]}</strong>.`;
    }
  };

  const resetGame = () => {
    secret = randomInt(1, 16);
    remaining = range(1, 16);
    questions = 0;
    thresholdSlider.value = '8';
    updateThresholdLabel();
    answerEl.innerHTML = 'Question 0. Remaining alternatives: <strong>16</strong>.';
    updateRemainingView();
  };

  thresholdSlider.addEventListener('input', updateThresholdLabel);
  askBtn.addEventListener('click', () => askQuestion(Number(thresholdSlider.value)));
  bestBtn.addEventListener('click', () => {
    if (remaining.length <= 1) return;
    const threshold = Math.floor((remaining[0] + remaining[remaining.length - 1]) / 2);
    thresholdSlider.value = String(threshold);
    updateThresholdLabel();
    askQuestion(threshold);
  });
  resetBtn.addEventListener('click', resetGame);

  updateThresholdLabel();
  updateRemainingView();
}

function range(start, end) {
  const out = [];
  for (let n = start; n <= end; n += 1) out.push(n);
  return out;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
