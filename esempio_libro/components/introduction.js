export function mountIntroductionBlocks(root) {
  const blocks = root.querySelectorAll('[data-block]');

  blocks.forEach((el) => {
    const block = el.dataset.block;
    const config = readBlockConfig(el);

    if (block === 'coin-convergence') {
      mountCoinConvergence(el);
      return;
    }

    if (block === 'embed') {
      mountEmbedBlock(el, config);
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

function mountEmbedBlock(el, config) {
  const fields = config.fields || {};
  const src = fields.src || '';
  if (!src) {
    el.className = 'shannon-box media-block';
    el.innerHTML = `<p class="media-error">Embed missing required field: <code>src</code>.</p>`;
    return;
  }

  const title = fields.title || 'Embedded page';
  const caption = fields.caption || '';
  const height = normalizeEmbedHeight(fields.height);
  const layout = normalizeLayout(fields.layout || 'wide');

  el.className = `shannon-box media-block embed-block layout-${layout}`;
  el.innerHTML = `
    <p class="media-badge">Embed</p>
    <div class="embed-frame-wrap">
      <iframe
        class="embed-frame"
        src="${escapeHtml(src)}"
        title="${escapeHtml(title)}"
        style="height: ${height}px"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      ></iframe>
    </div>
    ${caption ? `<p class="media-caption">${escapeHtml(caption)}</p>` : ''}
  `;

  setupResponsiveEmbed(el.querySelector('.embed-frame'), height);
}

function setupResponsiveEmbed(iframe, baseHeight) {
  if (!iframe) return;

  const fitToFrame = () => {
    try {
      const doc = iframe.contentDocument;
      if (!doc || !doc.body) return;

      const html = doc.documentElement;
      const body = doc.body;
      body.style.transform = '';
      body.style.transformOrigin = 'top left';
      body.style.width = '';
      body.style.margin = '0';
      html.style.overflowX = 'hidden';
      body.style.overflowX = 'hidden';

      const contentWidth = Math.max(
        html.scrollWidth,
        body.scrollWidth,
        html.offsetWidth,
        body.offsetWidth
      );
      const frameWidth = iframe.clientWidth || contentWidth;
      const scale = contentWidth > 0 ? Math.min(1, frameWidth / contentWidth) : 1;

      body.style.width = `${contentWidth}px`;
      body.style.transform = `scale(${scale})`;

      const contentHeight = Math.max(
        html.scrollHeight,
        body.scrollHeight,
        html.offsetHeight,
        body.offsetHeight
      );
      iframe.style.height = `${Math.max(baseHeight, Math.ceil(contentHeight * scale) + 16)}px`;
    } catch {
      iframe.style.height = `${baseHeight}px`;
    }
  };

  iframe.addEventListener('load', () => {
    [0, 250, 1000].forEach((delay) => window.setTimeout(fitToFrame, delay));
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(fitToFrame);
    observer.observe(iframe);
  }
}

function mountCoinConvergence(el) {
  el.className = 'shannon-box intro-simulation coin-convergence';
  el.innerHTML = `
    <h4>Interactive: convergence in probability</h4>
    <p class="convergence-note">
      Start with no data. Choose how many times to toss the coin, then add observations step by step.
    </p>

    <div class="convergence-controls">
      <label>
        Tosses per click: <span class="batch-size-value">50</span>
        <input class="batch-size-slider" type="range" min="1" max="500" step="1" value="50" />
      </label>

      <div class="convergence-actions">
        <button type="button" class="convergence-btn toss-btn">Toss coins</button>
        <button type="button" class="convergence-btn reset-btn">Reset tosses</button>
      </div>
    </div>

    <div class="convergence-chart-wrap" aria-label="Running frequency of heads chart">
      <svg class="convergence-chart" viewBox="0 0 100 50" role="img">
        <title>Running frequency of heads</title>
        <rect class="convergence-band" x="6" y="22.4" width="92" height="4.2"></rect>
        <line class="convergence-axis" x1="6" y1="5" x2="6" y2="42"></line>
        <line class="convergence-axis" x1="6" y1="42" x2="98" y2="42"></line>
        <line class="convergence-grid" x1="6" y1="5" x2="98" y2="5"></line>
        <line class="convergence-grid" x1="6" y1="23.5" x2="98" y2="23.5"></line>
        <line class="convergence-target" x1="6" y1="23.5" x2="98" y2="23.5"></line>
        <polyline class="convergence-line" points=""></polyline>
        <g class="convergence-x-ticks"></g>
        <text class="convergence-axis-label" x="6.5" y="3.5">frequency</text>
        <text class="convergence-tick-label" x="1.5" y="5.8">1</text>
        <text class="convergence-tick-label" x="0.7" y="24.2">0.5</text>
        <text class="convergence-tick-label" x="1.5" y="42.5">0</text>
        <text class="convergence-axis-label convergence-x-label" x="98" y="48">tosses</text>
      </svg>
      <p class="convergence-empty">No tosses yet. Choose n and press "Toss coins".</p>
    </div>

    <div class="convergence-stats">
      <p>Total tosses: <strong class="total-tosses">0</strong></p>
      <p>Heads frequency: <strong class="heads-frequency">-</strong></p>
      <p>Distance from 0.5: <strong class="heads-distance">-</strong></p>
      <p>Current run within epsilon: <strong class="epsilon-status">-</strong></p>
      <p>Estimated probability within epsilon: <strong class="epsilon-probability">-</strong></p>
    </div>

    <p class="convergence-explain">
      The formal theorem is about probability, not certainty: as the number of tosses grows, large deviations become less likely.
    </p>
  `;

  const batchSizeValue = el.querySelector('.batch-size-value');
  const batchSizeSlider = el.querySelector('.batch-size-slider');
  const tossBtn = el.querySelector('.toss-btn');
  const resetBtn = el.querySelector('.reset-btn');
  const chartWrapEl = el.querySelector('.convergence-chart-wrap');
  const lineEl = el.querySelector('.convergence-line');
  const xTicksEl = el.querySelector('.convergence-x-ticks');
  const totalTossesEl = el.querySelector('.total-tosses');
  const headsFrequencyEl = el.querySelector('.heads-frequency');
  const headsDistanceEl = el.querySelector('.heads-distance');
  const epsilonStatusEl = el.querySelector('.epsilon-status');
  const epsilonProbabilityEl = el.querySelector('.epsilon-probability');

  const epsilon = 0.05;
  let series = [];
  let heads = 0;

  const tossCoins = (batchSize) => {
    const start = series.length;
    const end = start + batchSize;
    for (let i = start + 1; i <= end; i += 1) {
      if (Math.random() < 0.5) heads += 1;
      series.push(heads / i);
    }

    render();
  };

  const resetTosses = () => {
    series = [];
    heads = 0;
    render();
  };

  const render = () => {
    const n = series.length;
    const frequency = series[series.length - 1] || 0;
    const distance = Math.abs(frequency - 0.5);

    batchSizeValue.textContent = batchSizeSlider.value;
    totalTossesEl.textContent = String(n);
    headsFrequencyEl.textContent = n > 0 ? frequency.toFixed(3) : '-';
    headsDistanceEl.textContent = n > 0 ? distance.toFixed(3) : '-';
    epsilonStatusEl.textContent = n > 0 ? (distance <= epsilon ? 'yes' : 'not yet') : '-';
    epsilonProbabilityEl.textContent = n > 0 ? estimateWithinEpsilon(n, epsilon).toFixed(2) : '-';
    lineEl.setAttribute('points', makePolylinePoints(series));
    xTicksEl.innerHTML = makeXAxisTicks(n);
    chartWrapEl.classList.toggle('is-empty', n === 0);
  };

  batchSizeSlider.addEventListener('input', () => {
    render();
  });

  tossBtn.addEventListener('click', () => {
    tossCoins(Number(batchSizeSlider.value));
  });

  resetBtn.addEventListener('click', () => {
    resetTosses();
  });

  render();
}

function makePolylinePoints(values) {
  if (values.length === 0) return '';

  const maxPoints = 260;
  const stride = Math.max(1, Math.floor(values.length / maxPoints));
  const visible = values.filter((_, index) => index % stride === 0 || index === values.length - 1);
  const denominator = Math.max(1, visible.length - 1);
  const plot = {
    left: 6,
    right: 98,
    top: 5,
    bottom: 42
  };
  const width = plot.right - plot.left;
  const height = plot.bottom - plot.top;

  return visible
    .map((value, index) => {
      const x = plot.left + (index / denominator) * width;
      const y = plot.top + (1 - clamp(value, 0, 1)) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function makeXAxisTicks(totalTosses) {
  const plot = {
    left: 6,
    right: 98,
    axisY: 42,
    labelY: 45.8
  };
  const ticks = totalTosses > 0
    ? [0, Math.round(totalTosses / 2), totalTosses]
    : [0];
  const uniqueTicks = [...new Set(ticks)];

  return uniqueTicks
    .map((tick) => {
      const ratio = totalTosses > 0 ? tick / totalTosses : 0;
      const x = plot.left + ratio * (plot.right - plot.left);
      const anchor = tick === 0 ? 'start' : tick === totalTosses ? 'end' : 'middle';
      return `
        <line class="convergence-tick" x1="${x.toFixed(2)}" y1="${plot.axisY}" x2="${x.toFixed(2)}" y2="${(plot.axisY + 1.2).toFixed(2)}"></line>
        <text class="convergence-tick-label convergence-x-tick-label" x="${x.toFixed(2)}" y="${plot.labelY}" text-anchor="${anchor}">${tick}</text>
      `;
    })
    .join('');
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeLayout(layout) {
  return layout === 'wide' ? 'wide' : 'inline';
}

function normalizeEmbedHeight(height) {
  const numericHeight = Number(height);
  if (!Number.isFinite(numericHeight)) return 720;
  return Math.min(1400, Math.max(240, numericHeight));
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function estimateWithinEpsilon(tosses, epsilon) {
  const experiments = 80;
  let within = 0;

  for (let experiment = 0; experiment < experiments; experiment += 1) {
    let heads = 0;
    for (let toss = 0; toss < tosses; toss += 1) {
      if (Math.random() < 0.5) heads += 1;
    }

    if (Math.abs(heads / tosses - 0.5) <= epsilon) within += 1;
  }

  return within / experiments;
}
