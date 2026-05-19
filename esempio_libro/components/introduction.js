export function mountIntroductionBlocks(root) {
  const blocks = root.querySelectorAll('[data-block]');

  blocks.forEach((el) => {
    if (el.dataset.block === 'coin-convergence') {
      mountCoinConvergence(el);
    }
  });
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
      <svg class="convergence-chart" viewBox="0 0 100 24" role="img">
        <title>Running frequency of heads</title>
        <rect class="convergence-band" x="6" y="10.65" width="92" height="1.7"></rect>
        <line class="convergence-axis" x1="6" y1="2.5" x2="6" y2="20"></line>
        <line class="convergence-axis" x1="6" y1="20" x2="98" y2="20"></line>
        <line class="convergence-grid" x1="6" y1="2.5" x2="98" y2="2.5"></line>
        <line class="convergence-grid" x1="6" y1="11.25" x2="98" y2="11.25"></line>
        <line class="convergence-target" x1="6" y1="11.25" x2="98" y2="11.25"></line>
        <polyline class="convergence-line" points=""></polyline>
        <text class="convergence-axis-label" x="6.5" y="1.7">frequency</text>
        <text class="convergence-tick-label" x="1.5" y="3.1">1</text>
        <text class="convergence-tick-label" x="0.7" y="11.75">0.5</text>
        <text class="convergence-tick-label" x="1.5" y="20.35">0</text>
        <text class="convergence-axis-label convergence-x-label" x="98" y="23">tosses</text>
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
    top: 2.5,
    bottom: 20
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
