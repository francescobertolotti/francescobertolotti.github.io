export function mountShannonBlocks(root) {
  const blocks = root.querySelectorAll('[data-block]');

  blocks.forEach((el) => {
    const block = el.dataset.block;

    if (block === 'entropy-slider') {
      mountEntropySlider(el);
      return;
    }

    if (block === 'coin-entropy') {
      mountCoinEntropy(el);
    }
  });
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

function mountCoinEntropy(el) {
  el.className = 'shannon-box';
  el.innerHTML = `
    <h4>Interactive: entropy of a biased coin</h4>
    <label>Heads probability p(H): <span class="head-value">0.50</span></label>
    <input class="head-slider" type="range" min="0.01" max="0.99" step="0.01" value="0.50" />
    <p class="metric">H(X) = <strong class="entropy-value">1.000</strong> bit</p>
    <div class="bar-wrap">
      <div class="bar-line"><span>Heads</span><div class="bar bar-h"></div><span class="label-h">50%</span></div>
      <div class="bar-line"><span>Tails</span><div class="bar bar-t"></div><span class="label-t">50%</span></div>
    </div>
  `;

  const slider = el.querySelector('.head-slider');
  const headValue = el.querySelector('.head-value');
  const entropyValue = el.querySelector('.entropy-value');
  const barH = el.querySelector('.bar-h');
  const barT = el.querySelector('.bar-t');
  const labelH = el.querySelector('.label-h');
  const labelT = el.querySelector('.label-t');

  const render = () => {
    const p = Number(slider.value);
    const q = 1 - p;
    const h = -p * Math.log2(p) - q * Math.log2(q);

    headValue.textContent = p.toFixed(2);
    entropyValue.textContent = h.toFixed(3);

    barH.style.width = `${p * 100}%`;
    barT.style.width = `${q * 100}%`;

    labelH.textContent = `${Math.round(p * 100)}%`;
    labelT.textContent = `${Math.round(q * 100)}%`;
  };

  slider.addEventListener('input', render);
  render();
}
