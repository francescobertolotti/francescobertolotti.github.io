const INPUT_SIZE = 28 * 28;
const HIDDEN_SIZE = 12;
const OUTPUT_SIZE = 10;
const HISTORY_WINDOW = 50;

const state = {
  dataset: [],
  sampleOrder: [],
  currentSamplePosition: 0,
  network: null,
  selectedNode: { layer: "hidden", index: 0 },
  learningRate: 0.08,
  autoTrainTimer: null,
  trainingSteps: 0,
  metrics: {
    recentAccuracy: [],
    accuracyTrend: [],
  },
  currentPass: null,
  elements: {},
};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  bootstrap();
});

async function bootstrap() {
  setStatus("Sto caricando il campione locale MNIST...");
  try {
    const response = await fetch("data/mnist-sample-3000.json");
    const payload = await response.json();
    state.dataset = payload.images.map((image, index) => ({
      id: index,
      label: image.label,
      pixels: image.pixels,
      input: Float32Array.from(image.pixels, (value) => value / 255),
    }));
  } catch (error) {
    setStatus("Non riesco a caricare il dataset locale.");
    console.error(error);
    return;
  }

  state.sampleOrder = makeShuffledOrder(state.dataset.length, 42);
  resetNetwork();
  setStatus("La rete e pronta: mostra una cifra o avvia l'auto training.");
}

function cacheElements() {
  const ids = [
    "dataset-progress",
    "training-status",
    "sample-canvas",
    "true-label",
    "predicted-label",
    "predicted-confidence",
    "steps-trained",
    "rolling-accuracy",
    "history-summary",
    "accuracy-history-canvas",
    "prediction-bars",
    "network-svg",
    "selected-node-title",
    "selected-node-description",
    "bias-slider",
    "bias-value",
    "weightmap-canvas",
    "learning-rate",
    "learning-rate-value",
  ];

  state.elements = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
}

function bindEvents() {
  document.getElementById("next-sample-btn").addEventListener("click", () => {
    nextSample();
    render();
    setStatus("Nuovo esempio mostrato: la rete lo osserva prima di correggersi.");
  });

  document.getElementById("train-once-btn").addEventListener("click", () => {
    trainOnCurrentSample();
    render();
  });

  document.getElementById("train-and-next-btn").addEventListener("click", () => {
    trainOnCurrentSample();
    nextSample();
    render();
  });

  document.getElementById("auto-train-btn").addEventListener("click", startAutoTrain);
  document.getElementById("stop-auto-btn").addEventListener("click", stopAutoTrain);

  document.getElementById("shuffle-btn").addEventListener("click", () => {
    state.sampleOrder = makeShuffledOrder(state.dataset.length, Date.now());
    state.currentSamplePosition = 0;
    render();
    setStatus("Le 3000 cifre sono state mescolate.");
  });

  document.getElementById("reset-network-btn").addEventListener("click", () => {
    stopAutoTrain();
    resetNetwork();
    setStatus("Rete resettata: tutti i pesi sono tornati casuali.");
  });

  state.elements["learning-rate"].addEventListener("input", (event) => {
    state.learningRate = Number(event.target.value);
    state.elements["learning-rate-value"].textContent = state.learningRate.toFixed(2);
  });

  state.elements["bias-slider"].addEventListener("input", (event) => {
    updateSelectedBias(Number(event.target.value));
    render();
  });

  document.getElementById("bias-down-btn").addEventListener("click", () => {
    updateSelectedBias(getSelectedBias() - 0.1);
    render();
  });

  document.getElementById("bias-up-btn").addEventListener("click", () => {
    updateSelectedBias(getSelectedBias() + 0.1);
    render();
  });

  state.elements["network-svg"].addEventListener("click", (event) => {
    const target = event.target.closest("[data-node-layer]");
    if (!target) {
      return;
    }
    state.selectedNode = {
      layer: target.dataset.nodeLayer,
      index: Number(target.dataset.nodeIndex),
    };
    render();
  });
}

function resetNetwork() {
  state.network = createNetwork(20260629);
  state.trainingSteps = 0;
  state.metrics = {
    recentAccuracy: [],
    accuracyTrend: [],
  };
  state.selectedNode = { layer: "hidden", index: 0 };
  state.currentSamplePosition = 0;
  render();
}

function createNetwork(seed) {
  const rand = mulberry32(seed);
  const weightsIH = [];
  const biasH = new Float32Array(HIDDEN_SIZE);
  const weightsHO = [];
  const biasO = new Float32Array(OUTPUT_SIZE);

  for (let h = 0; h < HIDDEN_SIZE; h += 1) {
    const row = new Float32Array(INPUT_SIZE);
    for (let i = 0; i < INPUT_SIZE; i += 1) {
      row[i] = (rand() - 0.5) * 0.18;
    }
    weightsIH.push(row);
    biasH[h] = (rand() - 0.5) * 0.1;
  }

  for (let o = 0; o < OUTPUT_SIZE; o += 1) {
    const row = new Float32Array(HIDDEN_SIZE);
    for (let h = 0; h < HIDDEN_SIZE; h += 1) {
      row[h] = (rand() - 0.5) * 0.6;
    }
    weightsHO.push(row);
    biasO[o] = (rand() - 0.5) * 0.1;
  }

  return { weightsIH, biasH, weightsHO, biasO };
}

function currentSample() {
  if (!state.dataset.length) {
    return null;
  }
  return state.dataset[state.sampleOrder[state.currentSamplePosition]];
}

function nextSample() {
  if (!state.dataset.length) {
    return;
  }
  state.currentSamplePosition = (state.currentSamplePosition + 1) % state.dataset.length;
}

function startAutoTrain() {
  if (state.autoTrainTimer) {
    return;
  }
  state.autoTrainTimer = window.setInterval(() => {
    trainOnCurrentSample();
    nextSample();
    render();
  }, 140);
  setStatus("Auto training attivo: la rete si aggiusta esempio dopo esempio.");
}

function stopAutoTrain() {
  if (!state.autoTrainTimer) {
    return;
  }
  window.clearInterval(state.autoTrainTimer);
  state.autoTrainTimer = null;
  setStatus("Auto training in pausa.");
}

function trainOnCurrentSample() {
  const sample = currentSample();
  if (!sample) {
    return;
  }

  const before = forwardPass(sample.input);
  const target = new Float32Array(OUTPUT_SIZE);
  target[sample.label] = 1;

  const outputError = new Float32Array(OUTPUT_SIZE);
  for (let o = 0; o < OUTPUT_SIZE; o += 1) {
    outputError[o] = before.probabilities[o] - target[o];
  }

  const hiddenError = new Float32Array(HIDDEN_SIZE);
  for (let h = 0; h < HIDDEN_SIZE; h += 1) {
    let total = 0;
    for (let o = 0; o < OUTPUT_SIZE; o += 1) {
      total += outputError[o] * state.network.weightsHO[o][h];
    }
    hiddenError[h] = total * before.hiddenActivations[h] * (1 - before.hiddenActivations[h]);
  }

  for (let o = 0; o < OUTPUT_SIZE; o += 1) {
    for (let h = 0; h < HIDDEN_SIZE; h += 1) {
      const delta = state.learningRate * outputError[o] * before.hiddenActivations[h];
      state.network.weightsHO[o][h] -= delta;
    }
    const biasDelta = state.learningRate * outputError[o];
    state.network.biasO[o] -= biasDelta;
  }

  for (let h = 0; h < HIDDEN_SIZE; h += 1) {
    for (let i = 0; i < INPUT_SIZE; i += 1) {
      const delta = state.learningRate * hiddenError[h] * sample.input[i];
      state.network.weightsIH[h][i] -= delta;
    }
    const biasDelta = state.learningRate * hiddenError[h];
    state.network.biasH[h] -= biasDelta;
  }

  const after = forwardPass(sample.input);
  state.trainingSteps += 1;
  pushHistory(state.metrics.recentAccuracy, after.prediction === sample.label ? 1 : 0);
  state.metrics.accuracyTrend.push(average(state.metrics.recentAccuracy));

  setStatus(
    `Esempio ${state.trainingSteps}: la rete ha visto un ${sample.label}, prevedeva ${before.prediction} e ora punta a ${after.prediction}.`
  );
}

function forwardPass(input) {
  const hiddenPre = new Float32Array(HIDDEN_SIZE);
  const hiddenActivations = new Float32Array(HIDDEN_SIZE);
  const outputPre = new Float32Array(OUTPUT_SIZE);

  for (let h = 0; h < HIDDEN_SIZE; h += 1) {
    let total = state.network.biasH[h];
    const row = state.network.weightsIH[h];
    for (let i = 0; i < INPUT_SIZE; i += 1) {
      total += row[i] * input[i];
    }
    hiddenPre[h] = total;
    hiddenActivations[h] = sigmoid(total);
  }

  for (let o = 0; o < OUTPUT_SIZE; o += 1) {
    let total = state.network.biasO[o];
    const row = state.network.weightsHO[o];
    for (let h = 0; h < HIDDEN_SIZE; h += 1) {
      total += row[h] * hiddenActivations[h];
    }
    outputPre[o] = total;
  }

  const probabilities = softmax(outputPre);
  const prediction = argmax(probabilities);

  return {
    hiddenPre,
    hiddenActivations,
    outputPre,
    probabilities,
    prediction,
  };
}

function render() {
  const sample = currentSample();
  if (!sample || !state.network) {
    return;
  }

  state.currentPass = forwardPass(sample.input);
  renderDatasetProgress();
  renderSampleCanvas(sample);
  renderSampleMeta(sample);
  renderMetrics();
  renderPredictionBars(sample);
  renderNetwork(sample);
  renderInspector(sample);
}

function renderDatasetProgress() {
  state.elements["dataset-progress"].textContent =
    `Campione ${state.currentSamplePosition + 1} di ${state.dataset.length}`;
}

function renderSampleCanvas(sample) {
  const canvas = state.elements["sample-canvas"];
  const ctx = canvas.getContext("2d");
  const cell = canvas.width / 28;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fcfbf6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < 28; y += 1) {
    for (let x = 0; x < 28; x += 1) {
      const value = sample.pixels[y * 28 + x];
      const shade = 255 - value;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  ctx.strokeStyle = "rgba(31, 42, 43, 0.10)";
  ctx.lineWidth = 1;
  for (let line = 0; line <= 28; line += 1) {
    ctx.beginPath();
    ctx.moveTo(line * cell, 0);
    ctx.lineTo(line * cell, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, line * cell);
    ctx.lineTo(canvas.width, line * cell);
    ctx.stroke();
  }
}

function renderSampleMeta(sample) {
  const confidence = state.currentPass.probabilities[state.currentPass.prediction];
  state.elements["true-label"].textContent = sample.label;
  state.elements["predicted-label"].textContent = state.currentPass.prediction;
  state.elements["predicted-confidence"].textContent = `${Math.round(confidence * 100)}%`;
  state.elements["steps-trained"].textContent = state.trainingSteps;
}

function renderMetrics() {
  const accuracy = average(state.metrics.recentAccuracy);

  state.elements["rolling-accuracy"].textContent = `${Math.round(accuracy * 100)}%`;
  state.elements["history-summary"].textContent = `${state.metrics.accuracyTrend.length} punti`;
  renderAccuracyHistory();
}

function renderPredictionBars(sample) {
  const container = state.elements["prediction-bars"];
  container.innerHTML = "";

  for (let digit = 0; digit < OUTPUT_SIZE; digit += 1) {
    const row = document.createElement("div");
    row.className = "prediction-row";
    if (digit === sample.label) {
      row.classList.add("truth");
    }
    if (digit === state.currentPass.prediction) {
      row.classList.add("predicted");
    }

    const label = document.createElement("strong");
    label.textContent = digit;

    const track = document.createElement("div");
    track.className = "prediction-track";

    const fill = document.createElement("div");
    fill.className = "prediction-fill";
    fill.style.width = `${Math.max(4, state.currentPass.probabilities[digit] * 100)}%`;
    track.appendChild(fill);

    const value = document.createElement("span");
    value.textContent = `${Math.round(state.currentPass.probabilities[digit] * 100)}%`;

    row.append(label, track, value);
    container.appendChild(row);
  }
}

function renderNetwork(sample) {
  const svg = state.elements["network-svg"];
  svg.innerHTML = "";

  const hiddenPositions = Array.from({ length: HIDDEN_SIZE }, (_, index) => ({
    x: 460,
    y: 52 + index * 38,
  }));
  const outputPositions = Array.from({ length: OUTPUT_SIZE }, (_, index) => ({
    x: 690,
    y: 90 + index * 42,
  }));

  svg.appendChild(svgText(152, 56, "Ingresso", "layer-label"));
  svg.appendChild(svgText(hiddenPositions[0].x, 28, "Neuroni nascosti", "layer-label"));
  svg.appendChild(svgText(outputPositions[0].x, 56, "Cifre in uscita", "layer-label"));

  const inputGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const inputFrame = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  inputFrame.setAttribute("x", "42");
  inputFrame.setAttribute("y", "104");
  inputFrame.setAttribute("rx", "24");
  inputFrame.setAttribute("ry", "24");
  inputFrame.setAttribute("width", "220");
  inputFrame.setAttribute("height", "382");
  inputFrame.setAttribute("fill", "rgba(255,255,255,0.7)");
  inputFrame.setAttribute("stroke", "rgba(31,42,43,0.12)");
  inputGroup.appendChild(inputFrame);

  inputGroup.appendChild(svgText(152, 162, "28 x 28 pixel", "input-label"));
  inputGroup.appendChild(svgText(152, 206, `Cifra reale: ${sample.label}`, "input-label"));
  inputGroup.appendChild(svgText(152, 250, `Vista numero ${state.currentSamplePosition + 1}`, "input-label"));
  inputGroup.appendChild(svgText(152, 336, "Il disegno completo", "hidden-badge"));
  inputGroup.appendChild(svgText(152, 364, "entra nella rete qui.", "hidden-badge"));
  inputGroup.appendChild(inputPreviewAsSvg(sample.pixels, 96, 390, 4));
  svg.appendChild(inputGroup);

  for (let h = 0; h < HIDDEN_SIZE; h += 1) {
    const meanWeight = meanAbsolute(state.network.weightsIH[h]);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "262");
    line.setAttribute("y1", String(286 + (h - (HIDDEN_SIZE - 1) / 2) * 13));
    line.setAttribute("x2", String(hiddenPositions[h].x - 25));
    line.setAttribute("y2", String(hiddenPositions[h].y));
    line.setAttribute("stroke", mixColor("#0f8b8d", "#d1663c", state.currentPass.hiddenActivations[h]));
    line.setAttribute("stroke-opacity", String(0.18 + meanWeight * 2.2));
    line.setAttribute("stroke-width", String(1 + meanWeight * 12));
    svg.appendChild(line);
  }

  for (let h = 0; h < HIDDEN_SIZE; h += 1) {
    for (let o = 0; o < OUTPUT_SIZE; o += 1) {
      const weight = state.network.weightsHO[o][h];
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(hiddenPositions[h].x + 24));
      line.setAttribute("y1", String(hiddenPositions[h].y));
      line.setAttribute("x2", String(outputPositions[o].x - 22));
      line.setAttribute("y2", String(outputPositions[o].y));
      line.setAttribute("stroke", signedColor(weight, 0.9));
      line.setAttribute("stroke-opacity", String(0.12 + Math.min(0.8, Math.abs(weight) * 0.95)));
      line.setAttribute("stroke-width", String(0.9 + Math.abs(weight) * 2.4));
      svg.appendChild(line);
    }
  }

  hiddenPositions.forEach((position, index) => {
    const group = svgNode(position, {
      layer: "hidden",
      index,
      label: `H${index + 1}`,
      sublabel: state.currentPass.hiddenActivations[index].toFixed(2),
      fill: activationColor(state.currentPass.hiddenActivations[index]),
      stroke: signedColor(state.network.biasH[index], 1.4),
      radius: 20,
    });
    svg.appendChild(group);
  });

  outputPositions.forEach((position, index) => {
    const isPrediction = state.currentPass.prediction === index;
    const group = svgNode(position, {
      layer: "output",
      index,
      label: String(index),
      sublabel: `${Math.round(state.currentPass.probabilities[index] * 100)}%`,
      fill: probabilityColor(state.currentPass.probabilities[index]),
      stroke: isPrediction ? "#1f2a2b" : signedColor(state.network.biasO[index], 1.2),
      radius: 18,
    });
    svg.appendChild(group);
  });
}

function renderInspector(sample) {
  const { layer, index } = state.selectedNode;
  const isHidden = layer === "hidden";
  const title = isHidden ? `Neurone nascosto H${index + 1}` : `Neurone di uscita ${index}`;
  const bias = getSelectedBias();
  const activation = isHidden
    ? state.currentPass.hiddenActivations[index]
    : state.currentPass.probabilities[index];
  const description = isHidden
    ? `Questo neurone si attiva a ${activation.toFixed(2)} sulla cifra corrente. Il suo bias e ${bias.toFixed(
        2
      )}, mentre i suoi collegamenti verso le uscite cambiano il peso che da a ciascuna cifra.`
    : `Questa uscita rappresenta la cifra ${index}. Sulla cifra corrente assegna una probabilita del ${Math.round(
        activation * 100
      )}%, con bias ${bias.toFixed(2)}.`;

  state.elements["selected-node-title"].textContent = title;
  state.elements["selected-node-description"].textContent = description;
  state.elements["bias-slider"].value = bias.toFixed(2);
  state.elements["bias-value"].textContent = bias.toFixed(2);

  renderWeightMap(sample, layer, index);
}

function renderAccuracyHistory() {
  const canvas = state.elements["accuracy-history-canvas"];
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 18, right: 18, bottom: 30, left: 42 };
  const values = state.metrics.accuracyTrend;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fcfcf8";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(22, 33, 43, 0.08)";
  ctx.lineWidth = 1;
  for (let row = 0; row <= 4; row += 1) {
    const y = padding.top + ((height - padding.top - padding.bottom) / 4) * row;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#62707a";
  ctx.font = '12px "Inter", sans-serif';
  ctx.textAlign = "right";
  ctx.fillText("100%", padding.left - 8, padding.top + 4);
  ctx.fillText("50%", padding.left - 8, padding.top + (height - padding.top - padding.bottom) / 2 + 4);
  ctx.fillText("0%", padding.left - 8, height - padding.bottom + 4);

  if (!values.length) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#8a96a0";
    ctx.fillText("L'andamento comparira dopo i primi passi di training.", width / 2, height / 2);
    return;
  }

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const lastValue = values[values.length - 1];

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#1a8b84";
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(values.length - 1, 1);
    const y = padding.top + plotHeight * (1 - value);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = "rgba(26, 139, 132, 0.14)";
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(values.length - 1, 1);
    const y = padding.top + plotHeight * (1 - value);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.lineTo(padding.left + plotWidth, height - padding.bottom);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.closePath();
  ctx.fill();

  const lastX = padding.left + (plotWidth * (values.length - 1)) / Math.max(values.length - 1, 1);
  const lastY = padding.top + plotHeight * (1 - lastValue);
  ctx.fillStyle = "#ef6a32";
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#62707a";
  ctx.textAlign = "left";
  ctx.fillText("inizio", padding.left, height - 8);
  ctx.textAlign = "right";
  ctx.fillText(`passo ${state.trainingSteps}`, width - padding.right, height - 8);
}

function renderWeightMap(sample, layer, index) {
  const canvas = state.elements["weightmap-canvas"];
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fbf8f1";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (layer === "hidden") {
    const weights = state.network.weightsIH[index];
    const cell = Math.max(4, Math.floor(Math.min(canvas.width / 28, (canvas.height - 28) / 28)));
    const xOffset = Math.floor((canvas.width - 28 * cell) / 2);
    const yOffset = Math.floor((canvas.height - 28 * cell) / 2);
    for (let y = 0; y < 28; y += 1) {
      for (let x = 0; x < 28; x += 1) {
        const weight = weights[y * 28 + x];
        ctx.fillStyle = signedColor(weight, 1.6);
        ctx.fillRect(xOffset + x * cell, yOffset + y * cell, cell, cell);
      }
    }
    ctx.strokeStyle = "rgba(31,42,43,0.08)";
    ctx.strokeRect(xOffset - 1, yOffset - 1, 28 * cell + 2, 28 * cell + 2);
    return;
  }

  const weights = state.network.weightsHO[index];
  const maxAbs = Math.max(...Array.from(weights, (value) => Math.abs(value)), 0.001);
  const barWidth = canvas.width / HIDDEN_SIZE;
  const midY = Math.round(canvas.height * 0.58);
  const maxBarHeight = Math.min(132, Math.round(canvas.height * 0.34));
  ctx.font = '12px "Avenir Next", sans-serif';
  ctx.textAlign = "center";

  for (let h = 0; h < HIDDEN_SIZE; h += 1) {
    const weight = weights[h];
    const height = (Math.abs(weight) / maxAbs) * maxBarHeight;
    const x = h * barWidth + 8;
    const y = weight >= 0 ? midY - height : midY;
    ctx.fillStyle = signedColor(weight, 1.1);
    ctx.fillRect(x, y, barWidth - 16, height);
    ctx.fillStyle = "#1f2a2b";
    ctx.fillText(`H${h + 1}`, x + (barWidth - 16) / 2, midY + 34);
  }

  ctx.strokeStyle = "rgba(31,42,43,0.22)";
  ctx.beginPath();
  ctx.moveTo(12, midY);
  ctx.lineTo(canvas.width - 12, midY);
  ctx.stroke();

  drawMiniSample(ctx, sample.pixels, canvas.width - 74, 18, 2);
}

function updateSelectedBias(value) {
  const clamped = clamp(value, -3, 3);
  const { layer, index } = state.selectedNode;
  if (layer === "hidden") {
    state.network.biasH[index] = clamped;
  } else {
    state.network.biasO[index] = clamped;
  }
}

function getSelectedBias() {
  const { layer, index } = state.selectedNode;
  return layer === "hidden" ? state.network.biasH[index] : state.network.biasO[index];
}

function setStatus(text) {
  state.elements["training-status"].textContent = text;
}

function pushHistory(history, value) {
  history.push(value);
  if (history.length > HISTORY_WINDOW) {
    history.shift();
  }
}

function average(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function meanAbsolute(arrayLike) {
  let total = 0;
  for (let i = 0; i < arrayLike.length; i += 1) {
    total += Math.abs(arrayLike[i]);
  }
  return total / arrayLike.length;
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function softmax(values) {
  const max = Math.max(...values);
  const shifted = Array.from(values, (value) => Math.exp(value - max));
  const total = shifted.reduce((sum, value) => sum + value, 0);
  return Float32Array.from(shifted, (value) => value / total);
}

function argmax(values) {
  let bestIndex = 0;
  let bestValue = values[0];
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > bestValue) {
      bestValue = values[i];
      bestIndex = i;
    }
  }
  return bestIndex;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function makeShuffledOrder(length, seed) {
  const array = Array.from({ length }, (_, index) => index);
  const rand = mulberry32(seed);
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function activationColor(value) {
  return mixColor("#d9d5cf", "#0f8b8d", value);
}

function probabilityColor(value) {
  return mixColor("#f6ead8", "#d1663c", value);
}

function signedColor(value, scale = 1) {
  const magnitude = clamp(Math.abs(value) * scale, 0, 1);
  return value >= 0
    ? mixColor("#f8dcc1", "#d1663c", magnitude)
    : mixColor("#dbeff0", "#0f8b8d", magnitude);
}

function mixColor(start, end, t) {
  const [r1, g1, b1] = hexToRgb(start);
  const [r2, g2, b2] = hexToRgb(end);
  const mix = (first, second) => Math.round(first + (second - first) * clamp(t, 0, 1));
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

function svgNode(position, options) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.dataset.nodeLayer = options.layer;
  group.dataset.nodeIndex = String(options.index);

  const isSelected =
    state.selectedNode.layer === options.layer && state.selectedNode.index === options.index;

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", String(position.x));
  circle.setAttribute("cy", String(position.y));
  circle.setAttribute("r", String(options.radius));
  circle.setAttribute("fill", options.fill);
  circle.setAttribute("stroke", options.stroke);
  circle.setAttribute("stroke-width", isSelected ? "4" : "2.5");
  circle.setAttribute("class", "node-circle");
  group.appendChild(circle);

  const label = svgText(position.x, position.y, options.label, "node-label");
  group.appendChild(label);
  group.appendChild(svgText(position.x, position.y + options.radius + 16, options.sublabel, "hidden-badge"));

  return group;
}

function svgText(x, y, content, className) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(x));
  text.setAttribute("y", String(y));
  text.setAttribute("class", className);
  text.textContent = content;
  return text;
}

function inputPreviewAsSvg(pixels, x, y, scale) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  for (let row = 0; row < 28; row += 1) {
    for (let col = 0; col < 28; col += 1) {
      const pixel = 255 - pixels[row * 28 + col];
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(x + col * scale));
      rect.setAttribute("y", String(y + row * scale));
      rect.setAttribute("width", String(scale));
      rect.setAttribute("height", String(scale));
      rect.setAttribute("fill", `rgb(${pixel}, ${pixel}, ${pixel})`);
      group.appendChild(rect);
    }
  }
  return group;
}

function drawMiniSample(ctx, pixels, x, y, scale) {
  for (let row = 0; row < 28; row += 1) {
    for (let col = 0; col < 28; col += 1) {
      const pixel = 255 - pixels[row * 28 + col];
      ctx.fillStyle = `rgb(${pixel}, ${pixel}, ${pixel})`;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
