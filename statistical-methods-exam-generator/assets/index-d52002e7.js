const generatorForm = document.getElementById("generatorForm");
const generationStatus = document.getElementById("generationStatus");
const generatedExamOutput = document.getElementById("generatedExamOutput");
const downloadBtn = document.getElementById("downloadBtn");
const downloadExcelBtn = document.getElementById("downloadExcelBtn");
const generateBtn = document.getElementById("generateBtn");
const feedbackToggleBtn = document.getElementById("feedbackToggleBtn");
const feedbackPanel = document.getElementById("feedbackPanel");
const feedbackInput = document.getElementById("feedbackInput");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
const feedbackStatus = document.getElementById("feedbackStatus");
const staticModePanel = document.getElementById("staticModePanel");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const staticModeStatus = document.getElementById("staticModeStatus");

const STORAGE_API_KEY = "liuc_openai_api_key";
const DEFAULT_OPENAI_MODEL = "Qwen/Qwen3.5-9B";
const DEFAULT_OPENAI_BASE_URL = "http://193.222.104.68:8000/v1";
const DEFAULT_MAX_TOKENS = 1000;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TOP_P = 0.8;
const DEFAULT_PRESENCE_PENALTY = 1.5;
const DEFAULT_TOP_K = 20;

const THEMES = [
  "hourly energy consumption in an industrial district",
  "delivery times for e-commerce orders",
  "operating temperatures in a chemical plant",
  "line pressures in a hydraulic network",
  "daily defects in an assembly line",
  "call durations in a contact center",
  "response latency of a cloud service",
  "traffic volumes at a logistics hub",
  "waiting times in an emergency department",
  "biometric measurements in a university screening program",
  "environmental noise in urban areas",
  "wind speeds in a wind farm",
  "humidity in automated agricultural greenhouses",
  "water consumption of smart buildings",
  "bed occupancy saturation in a healthcare facility",
  "daily returns of an educational portfolio",
  "price volatility of raw materials",
  "cycle times of CNC machines",
  "dimensional deviations in mechanical production",
  "storage temperatures in the cold chain",
  "instantaneous flow rates in a pipeline",
  "failure frequency of IoT devices",
  "CPU load of corporate servers",
  "errors per batch in quality control",
  "average delays of regional trains",
  "access flows to a university library",
  "sales performance by commercial area",
  "battery life of electric vehicles",
  "fuel consumption of a corporate fleet",
  "daily demand for a spare parts warehouse"
];

const EXAM_PROFILES = [
  {
    id: "prova1",
    label:
      "First midterm: univariate descriptive statistics, frequency distributions, bivariate analysis, correlation."
  },
  {
    id: "prova2",
    label:
      "Second midterm: time series, regression, residual analysis, statistical process control, forecasting."
  }
];

let runtimeMode = "unknown"; // backend | static
let latestExamText = "";
let latestPdfFileName = "";
let latestExcelFileName = "";
let latestPdfBlobUrl = "";
let latestExcelBlobUrl = "";
const APP_BASE_URL = new URL("./", window.location.href);

function appUrl(relativePath) {
  const sanitized = String(relativePath || "").replace(/^\/+/, "");
  return new URL(sanitized, APP_BASE_URL).toString();
}

function setStatus(message, type = "") {
  generationStatus.textContent = message;
  generationStatus.className = `status ${type}`.trim();
}

function setFeedbackStatus(message, type = "") {
  if (!feedbackStatus) {
    return;
  }
  feedbackStatus.textContent = message;
  feedbackStatus.className = `status ${type}`.trim();
}

function setStaticModeStatus(message, type = "") {
  if (!staticModeStatus) {
    return;
  }
  staticModeStatus.textContent = message;
  staticModeStatus.className = `status ${type}`.trim();
}

function getAppConfig() {
  if (typeof window.APP_CONFIG === "object" && window.APP_CONFIG !== null) {
    return window.APP_CONFIG;
  }
  return {};
}

function getConfiguredApiKey() {
  return String(getAppConfig().OPENAI_API_KEY || "").trim();
}

function getStoredApiKey() {
  try {
    return String(localStorage.getItem(STORAGE_API_KEY) || "").trim();
  } catch (_error) {
    return "";
  }
}

function getActiveApiKey() {
  return getConfiguredApiKey() || getStoredApiKey();
}

function getOpenAIModel() {
  return String(getAppConfig().OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim() || DEFAULT_OPENAI_MODEL;
}

function getOpenAIBaseUrl() {
  const baseUrl = String(getAppConfig().OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).trim();
  return baseUrl.replace(/\/+$/, "");
}

function shouldForceConfigPanel() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("config") === "1";
  } catch (_error) {
    return false;
  }
}

function clearBlobUrls() {
  if (latestPdfBlobUrl) {
    URL.revokeObjectURL(latestPdfBlobUrl);
    latestPdfBlobUrl = "";
  }
  if (latestExcelBlobUrl) {
    URL.revokeObjectURL(latestExcelBlobUrl);
    latestExcelBlobUrl = "";
  }
}

function pickRandom(list) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

function formatTimestamp() {
  const pad = (value) => String(value).padStart(2, "0");
  const now = new Date();
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join("");
}

async function detectRuntimeMode() {
  try {
    const response = await fetch(appUrl("api/health"), {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      return "static";
    }

    const payload = await response.json();
    return payload?.ok ? "backend" : "static";
  } catch (_error) {
    return "static";
  }
}

function applyRuntimeModeUI() {
  if (runtimeMode === "backend") {
    staticModePanel.hidden = true;
    feedbackToggleBtn.hidden = false;
    downloadExcelBtn.hidden = false;
    setStatus("Backend mode active.", "");
    return;
  }

  const configuredApiKey = getConfiguredApiKey();
  const storedApiKey = getStoredApiKey();
  const forceConfigPanel = shouldForceConfigPanel();
  const hasConfiguredKey = Boolean(configuredApiKey);

  staticModePanel.hidden = hasConfiguredKey && !forceConfigPanel;
  feedbackPanel.hidden = true;
  feedbackToggleBtn.hidden = true;
  downloadExcelBtn.hidden = false;
  apiKeyInput.value = storedApiKey;

  if (hasConfiguredKey) {
    if (forceConfigPanel) {
      setStaticModeStatus(
        "Configured key detected. You can override it locally from this panel.",
        "ok"
      );
    } else {
      setStaticModeStatus("", "");
    }
    setStatus("GitHub Pages static mode active.", "ok");
  } else if (storedApiKey) {
    setStaticModeStatus("Local browser key loaded for static mode.", "ok");
    setStatus("GitHub Pages static mode active (local key).", "ok");
  } else {
    setStaticModeStatus("Set an OpenAI key below or in env.js to enable generation.", "");
    setStatus("GitHub Pages static mode active.", "");
  }
}

async function ensureRuntimeMode() {
  if (runtimeMode === "backend" || runtimeMode === "static") {
    return runtimeMode;
  }

  runtimeMode = await detectRuntimeMode();
  applyRuntimeModeUI();
  return runtimeMode;
}

function saveApiKeyLocally() {
  const value = String(apiKeyInput.value || "").trim();
  if (!value) {
    setStaticModeStatus("Please enter a valid API key.", "error");
    return;
  }

  try {
    localStorage.setItem(STORAGE_API_KEY, value);
    setStaticModeStatus("API key saved in browser local storage.", "ok");
  } catch (_error) {
    setStaticModeStatus("Unable to persist key in this browser.", "error");
  }
}

function buildPrompt({ selectedProfile, selectedTheme }) {
  const hardRules =
    selectedProfile.id === "prova2"
      ? [
          "- Include a time series with a time index in range A2:A121 and values in range B2:B121.",
          "- Require a linear regression line with slope/intercept and at least one between RMSE and coefficient of determination.",
          "- Require at least one forecast (extrapolation) and a short reliability comment.",
          "- Include one point on residuals, moving average, or statistical process control."
        ]
      : [
          "- Include a bivariate sample with first variable in range A2:A121 and second variable in range B2:B121.",
          "- Include at least two descriptive indicators (mean, standard deviation, percentiles, intervals).",
          "- Require one frequency distribution with explicit classes.",
          "- Require correlation coefficient or covariance on the bivariate sample.",
          "- Require at least one comparison between computed values with short interpretation."
        ];

  return [
    "Generate a new exam task in English in ADSS LIUC style.",
    "Output must be English only.",
    "If any Italian sentence or Italian wording appears, regenerate before finalizing.",
    "Return only the exam task text, no markdown, no bullet list, no administrative preface.",
    "Use one continuous paragraph, similar to the historical exams.",
    "",
    "Mandatory constraints:",
    "- Use technical English (R² and RMSE acronyms are allowed).",
    "- Use direct imperative style verbs.",
    "- Include explicit worksheet references (ranges and chart anchors).",
    "- All single-value placeholders [CELL_n] and [TEXT_n] must represent single cells in one vertical logical column.",
    "- Include numeric requests and at least three theory/comment requests ('text in cell ...').",
    "- Each theory request must directly follow a computed result (interpretation, reason, operational definition).",
    "- Use patterns such as: 'calculate ... in [CELL_x] and explain ... (text in [TEXT_y])'.",
    "- Structure: data context -> computations -> charts -> interpretation.",
    "- Keep the task shorter: 5-7 operational requests.",
    "- Avoid redundancy and keep raw output around 1100-1700 characters.",
    "- Maximum 2 charts.",
    "- Do not use real A1 references for outputs in draft text: use placeholders only.",
    "- For initial data ranges (e.g., A2:A121) you may use real ranges.",
    ...hardRules,
    "",
    "Mandatory placeholder format for outputs:",
    "- single numeric cells: [CELL_1], [CELL_2], ...",
    "- single theory/text cells: [TEXT_1], [TEXT_2], ...",
    "- chart anchors: [CHART_1], [CHART_2], ...",
    "- output ranges: [RANGE_1:6x1], [RANGE_2:5x3], ... (rows x cols)",
    "- Repeated placeholders are allowed; materialization happens by occurrence order.",
    "- Correct example: '... value in [CELL_1] ... chart with top-left corner in [CHART_1] ... text in [TEXT_1] ...'.",
    "- Never write phrases like 'label it as ...' or 'annotate as ...'.",
    "- Never write explicit output references like 'cell F1' in the draft; use placeholders only.",
    "",
    `Exam profile: ${selectedProfile.label}`,
    `Mandatory theme: ${selectedTheme}`
  ].join("\n");
}

function extractTextFromChatResponse(response) {
  const content = response?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return "";
  }

  const chunks = content
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item.text === "string") {
        return item.text;
      }
      return "";
    })
    .filter(Boolean);

  return chunks.join("\n").trim();
}

async function callOpenAIChat({ apiKey, model, messages, temperature = DEFAULT_TEMPERATURE }) {
  const response = await fetch(`${getOpenAIBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature,
      top_p: DEFAULT_TOP_P,
      presence_penalty: DEFAULT_PRESENCE_PENALTY,
      top_k: DEFAULT_TOP_K,
      chat_template_kwargs: { enable_thinking: false }
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = payload?.error?.message || `OpenAI request failed (${response.status}).`;
    throw new Error(reason);
  }

  if (!payload) {
    throw new Error("Empty response from OpenAI.");
  }

  return payload;
}

function isEnglishLikely(text) {
  const tokens = text.toLowerCase().match(/[a-z]+/g) || [];
  if (tokens.length === 0) {
    return false;
  }

  const englishMarkers = new Set([
    "the", "and", "in", "cell", "cells", "calculate", "compute", "build", "chart",
    "plot", "value", "mean", "sample", "standard", "deviation", "range",
    "regression", "forecast", "explain", "text", "distribution", "series"
  ]);
  const italianMarkers = new Set([
    "della", "delle", "nella", "nelle", "cella", "celle", "calcola", "costruisci",
    "grafico", "valore", "media", "deviazione", "campione", "serie", "intervallo",
    "spiega", "testo", "prova", "confronta", "quali", "deve", "devi"
  ]);

  let englishCount = 0;
  let italianCount = 0;
  for (const token of tokens) {
    if (englishMarkers.has(token)) englishCount += 1;
    if (italianMarkers.has(token)) italianCount += 1;
  }

  const hasItalianAccents = /[àèéìòù]/i.test(text);
  return englishCount >= 8 && englishCount >= italianCount * 2 && !hasItalianAccents;
}

function hasItalianEvidence(text) {
  const lower = ` ${text.toLowerCase()} `;
  const italianSignals = [
    " il ", " lo ", " la ", " gli ", " le ", " un ", " una ", " della ", " delle ",
    " nella ", " nelle ", " con ", " quindi ", " calcola ", " costruisci ", " visualizza ",
    " spiega ", " commenta ", " grafico ", " cella ", " celle "
  ];

  let count = 0;
  for (const signal of italianSignals) {
    if (lower.includes(signal)) {
      count += 1;
    }
  }
  return count >= 3;
}

function isTemplateConsistent(rawText) {
  const englishLikely = isEnglishLikely(rawText);
  const italianEvidence = hasItalianEvidence(rawText);
  const hasPlaceholders = /\[(CELL|TEXT|CHART|RANGE)_\d+/i.test(rawText);
  const hasExplicitCellMentions =
    /\bcell\s+[A-Z]{1,3}\d+\b/i.test(rawText) ||
    /\bcells\s+[A-Z]{1,3}\d+/i.test(rawText) ||
    /\bcella\s+[A-Z]{1,3}\d+\b/i.test(rawText) ||
    /\bcelle\s+[A-Z]{1,3}\d+/i.test(rawText);
  const hasBadPhrase =
    /\bannotalo\s+come\b/i.test(rawText) ||
    /\bannotate\s+as\b/i.test(rawText) ||
    /\blabel\s+it\s+as\b/i.test(rawText);
  const placeholderCount = (rawText.match(/\[(CELL|TEXT|CHART|RANGE)_\d+/gi) || []).length;
  const textPlaceholderCount = (rawText.match(/\[TEXT_\d+\]/gi) || []).length;
  const cellPlaceholderCount = (rawText.match(/\[CELL_\d+\]/gi) || []).length;
  const chartPlaceholderCount = (rawText.match(/\[CHART_\d+\]/gi) || []).length;
  const rawLength = rawText.length;
  const theoryLinkedCount = (
    rawText.match(
      /(explain|comment|interpret|define|justify|motivate|reason)[^.]{0,220}\[TEXT_\d+\]/gi
    ) || []
  ).length;

  return {
    ok:
      hasPlaceholders &&
      !hasExplicitCellMentions &&
      !hasBadPhrase &&
      placeholderCount >= 8 &&
      cellPlaceholderCount >= 4 &&
      textPlaceholderCount >= 3 &&
      theoryLinkedCount >= 3 &&
      chartPlaceholderCount <= 2 &&
      rawLength >= 900 &&
      rawLength <= 1700 &&
      englishLikely &&
      !italianEvidence
  };
}

async function normalizeToEnglish({ apiKey, model, draftText }) {
  const response = await callOpenAIChat({
    apiKey,
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Rewrite the provided exam task in strict English only. Preserve every placeholder token exactly as-is (e.g. [CELL_1], [TEXT_2], [CHART_1], [RANGE_1:6x1]). Do not remove or rename placeholders."
      },
      {
        role: "user",
        content: draftText
      }
    ]
  });

  return extractTextFromChatResponse(response);
}

function columnNumberToLabel(columnNumber) {
  let n = columnNumber;
  let label = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

function buildCellAllocator({ columns, startRow = 1 }) {
  let index = 0;
  return () => {
    const column = columns[index % columns.length];
    const row = startRow + Math.floor(index / columns.length);
    index += 1;
    return `${column}${row}`;
  };
}

function buildChartAllocator() {
  const anchors = [];
  const baseCols = ["E", "M"];
  for (let row = 20; row <= 220; row += 18) {
    for (const col of baseCols) {
      anchors.push(`${col}${row}`);
    }
  }

  let index = 0;
  return () => {
    if (index < anchors.length) {
      const value = anchors[index];
      index += 1;
      return value;
    }

    const extra = `Q${20 + (index - anchors.length) * 18}`;
    index += 1;
    return extra;
  };
}

function buildRangeAllocator() {
  let currentRow = 20;
  let currentCol = 8; // H
  const maxRow = 220;
  const rowGap = 2;
  const colGap = 3;

  return ({ rows, cols }) => {
    const safeRows = Math.max(1, rows);
    const safeCols = Math.max(1, cols);

    if (currentRow + safeRows - 1 > maxRow) {
      currentRow = 20;
      currentCol += safeCols + colGap;
    }

    const startCol = currentCol;
    const startRow = currentRow;
    const endCol = startCol + safeCols - 1;
    const endRow = startRow + safeRows - 1;

    currentRow = endRow + rowGap + 1;

    const startLabel = `${columnNumberToLabel(startCol)}${startRow}`;
    const endLabel = `${columnNumberToLabel(endCol)}${endRow}`;

    if (startLabel === endLabel) {
      return startLabel;
    }

    return `${startLabel}:${endLabel}`;
  };
}

function materializePlaceholders(rawText) {
  const singleAllocator = buildCellAllocator({ columns: ["F"], startRow: 1 });
  const chartAllocator = buildChartAllocator();
  const rangeAllocator = buildRangeAllocator();

  const mapping = {};
  const counters = {
    CELL: 0,
    TEXT: 0,
    CHART: 0,
    RANGE: 0
  };
  const tokenRegex = /\[(CELL|TEXT|CHART)_(\d+)\]|\[RANGE_(\d+):(\d+)x(\d+)\]/g;

  const materialized = rawText.replace(
    tokenRegex,
    (match, simpleType, simpleId, rangeId, rows, cols) => {
      if (simpleType) {
        counters[simpleType] += 1;
        const occurrenceKey = `${simpleType}_${counters[simpleType]}`;

        let value = "";
        if (simpleType === "CELL" || simpleType === "TEXT") {
          value = singleAllocator();
        } else {
          value = chartAllocator();
        }

        mapping[occurrenceKey] = value;
        return value;
      }

      counters.RANGE += 1;
      const occurrenceKey = `RANGE_${counters.RANGE}`;
      const value = rangeAllocator({
        rows: Number.parseInt(rows, 10),
        cols: Number.parseInt(cols, 10)
      });
      mapping[occurrenceKey] = value;
      return value;
    }
  );

  return {
    text: materialized,
    mapping
  };
}

function createPdfBlobUrl(examText) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    return "";
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxTextWidth = pageWidth - margin * 2;

  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Test generator - Statistical Methods", margin, y);

  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(examText, maxTextWidth);
  const lineHeight = 14;

  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = 56;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

function createExcelBlobUrl(examText, mapping) {
  if (!window.XLSX) {
    return "";
  }

  const XLSX = window.XLSX;

  const worksheetRows = [["Generated exam text"], [examText], [], ["Output cell mapping"]];
  for (const [key, value] of Object.entries(mapping || {})) {
    worksheetRows.push([key, value]);
  }

  const ws = XLSX.utils.aoa_to_sheet(worksheetRows);
  ws["!cols"] = [{ wch: 30 }, { wch: 110 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Exam");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  return URL.createObjectURL(blob);
}

function triggerBlobDownload(blobUrl, fileName) {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function generateExamViaBackend() {
  const response = await fetch(appUrl("api/generate-exam"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });

  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(payload.error || "Test generation error.");
  }

  const saved = payload.saved || {};
  const markdownFileName = saved.markdownFileName || saved.fileName || "";
  const pdfFileName =
    saved.pdfFileName ||
    (markdownFileName ? markdownFileName.replace(/\.md$/i, ".pdf") : "");
  const excelFileName =
    saved.excelFileName ||
    (markdownFileName ? markdownFileName.replace(/\.md$/i, ".xlsx") : "");

  clearBlobUrls();
  latestExamText = payload.examText;
  latestPdfFileName = pdfFileName;
  latestExcelFileName = excelFileName;
  generatedExamOutput.value = payload.examText;
  downloadBtn.disabled = !latestPdfFileName;
  downloadExcelBtn.disabled = !latestExcelFileName;

  setStatus(
    `Test generated. PDF: ${pdfFileName || "n/a"}. Excel: ${excelFileName || "n/a"}.`,
    "ok"
  );
}

async function generateExamStatic() {
  const apiKey = getActiveApiKey();
  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Add it in env.js or save it locally.");
  }

  const selectedTheme = pickRandom(THEMES);
  const selectedProfile = pickRandom(EXAM_PROFILES);
  const model = getOpenAIModel();
  const prompt = buildPrompt({ selectedProfile, selectedTheme });

  let text = "";
  let attempts = 0;
  let consistent = false;

  while (attempts < 5) {
    attempts += 1;

    const response = await callOpenAIChat({
      apiKey,
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a university instructor for Statistical Methods and Experimental Data Analysis. Write realistic, verifiable exam tasks consistent with Excel/Calc workflows. You will write the test in english."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    text = extractTextFromChatResponse(response);
    if (!text) {
      continue;
    }

    if (!isEnglishLikely(text) || hasItalianEvidence(text)) {
      const normalized = await normalizeToEnglish({ apiKey, model, draftText: text });
      if (normalized) {
        text = normalized;
      }
    }

    consistent = isTemplateConsistent(text).ok;
    if (consistent) {
      break;
    }
  }

  if (!text) {
    throw new Error("Model returned no usable text.");
  }
  if (!consistent) {
    throw new Error("Generated text did not pass strict English/placeholder validation.");
  }

  const materialized = materializePlaceholders(text);

  clearBlobUrls();
  latestExamText = materialized.text;
  latestPdfFileName = `generated-test-${formatTimestamp()}.pdf`;
  latestExcelFileName = `generated-test-${formatTimestamp()}.xlsx`;
  latestPdfBlobUrl = createPdfBlobUrl(materialized.text);
  latestExcelBlobUrl = createExcelBlobUrl(materialized.text, materialized.mapping);

  generatedExamOutput.value = materialized.text;
  downloadBtn.disabled = !latestPdfBlobUrl;
  downloadExcelBtn.disabled = !latestExcelBlobUrl;

  setStatus(
    `Test generated in static mode with model ${model}. Theme: ${selectedTheme}.`,
    "ok"
  );
}

async function generateExam(event) {
  event.preventDefault();

  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  downloadExcelBtn.disabled = true;
  setStatus("Test generation in progress...", "");

  try {
    const mode = await ensureRuntimeMode();
    if (mode === "backend") {
      await generateExamViaBackend();
    } else {
      await generateExamStatic();
    }
  } catch (error) {
    setStatus(error.message || "Unexpected generation error.", "error");
  } finally {
    generateBtn.disabled = false;
  }
}

function downloadLatestExam() {
  if (runtimeMode === "backend") {
    if (!latestPdfFileName) {
      return;
    }
    window.location.href = appUrl(
      `api/generated-pdfs/${encodeURIComponent(latestPdfFileName)}`
    );
    return;
  }

  if (latestPdfBlobUrl) {
    triggerBlobDownload(latestPdfBlobUrl, latestPdfFileName || `generated-test-${formatTimestamp()}.pdf`);
  }
}

function downloadLatestExcel() {
  if (runtimeMode === "backend") {
    if (!latestExcelFileName) {
      return;
    }
    window.location.href = appUrl(
      `api/generated-excels/${encodeURIComponent(latestExcelFileName)}`
    );
    return;
  }

  if (latestExcelBlobUrl) {
    triggerBlobDownload(
      latestExcelBlobUrl,
      latestExcelFileName || `generated-test-${formatTimestamp()}.xlsx`
    );
  }
}

function toggleFeedbackPanel() {
  if (runtimeMode !== "backend") {
    return;
  }

  const shouldOpen = feedbackPanel.hidden;
  feedbackPanel.hidden = !shouldOpen;
  feedbackToggleBtn.textContent = shouldOpen ? "Hide Feedback" : "Leave Feedback";

  if (shouldOpen) {
    setFeedbackStatus("", "");
    feedbackInput.focus();
  }
}

async function submitFeedback() {
  if (runtimeMode !== "backend") {
    setFeedbackStatus("Feedback is available only in backend mode.", "error");
    return;
  }

  const feedback = feedbackInput.value.trim();
  if (!feedback) {
    setFeedbackStatus("Please write feedback before sending.", "error");
    return;
  }

  submitFeedbackBtn.disabled = true;
  setFeedbackStatus("Saving feedback...", "");

  try {
    const response = await fetch(appUrl("api/feedback"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback })
    });

    const payload = await response.json();
    if (!payload.ok) {
      throw new Error(payload.error || "Unable to save feedback.");
    }

    feedbackInput.value = "";
    setFeedbackStatus("Feedback saved privately in backend.", "ok");
  } catch (error) {
    setFeedbackStatus(error.message || "Unable to save feedback.", "error");
  } finally {
    submitFeedbackBtn.disabled = false;
  }
}

async function initialize() {
  await ensureRuntimeMode();
}

generatorForm.addEventListener("submit", generateExam);
downloadBtn.addEventListener("click", downloadLatestExam);
downloadExcelBtn.addEventListener("click", downloadLatestExcel);
feedbackToggleBtn.addEventListener("click", toggleFeedbackPanel);
submitFeedbackBtn.addEventListener("click", submitFeedback);
saveApiKeyBtn.addEventListener("click", saveApiKeyLocally);

initialize().catch((error) => {
  setStatus(error.message || "Initialization error.", "error");
});
