const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readAnalysisFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File analisi non trovato: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function formatTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Lista vuota: impossibile estrarre elemento casuale.");
  }
  const index = Math.floor(Math.random() * list.length);
  return list[index];
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

function extractTextFromResponse(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  if (!Array.isArray(response.output)) {
    return "";
  }

  const chunks = [];
  for (const item of response.output) {
    if (!Array.isArray(item.content)) {
      continue;
    }
    for (const content of item.content) {
      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n").trim();
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

function isEnglishLikely(text) {
  const tokens = (text.toLowerCase().match(/[a-z]+/g) || []);
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

async function normalizeToEnglish({ client, model, draftText }) {
  const response = await client.responses.create({
    model,
    input: [
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

  return extractTextFromResponse(response);
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

function materializePlaceholders(rawText) {
  // All single-value outputs are vertical in one column (F1, F2, F3, ...)
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

async function generateExamText({
  analysisDir,
  model = process.env.OPENAI_MODEL || "gpt-5-mini"
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY non impostata. Inseriscila in .env oppure nelle variabili ambiente."
    );
  }

  // Keep local analysis files as availability checks but avoid injecting Italian text in the prompt.
  readAnalysisFile(path.join(analysisDir, "tipi_domande.md"));
  readAnalysisFile(path.join(analysisDir, "stile_esame.md"));

  const selectedTheme = pickRandom(THEMES);
  const selectedProfile = pickRandom(EXAM_PROFILES);

  const prompt = buildPrompt({
    selectedProfile,
    selectedTheme
  });

  const client = new OpenAI({ apiKey });
  let text = "";
  let attempts = 0;
  let consistent = false;

  while (attempts < 5) {
    attempts += 1;
    const response = await client.responses.create({
      model,
      input: [
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

    text = extractTextFromResponse(response);
    if (!text) {
      continue;
    }

    if (!isEnglishLikely(text) || hasItalianEvidence(text)) {
      const normalized = await normalizeToEnglish({ client, model, draftText: text });
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

  return {
    text: materialized.text,
    rawText: text,
    cellMapping: materialized.mapping,
    selectedTheme,
    selectedProfile
  };
}

function saveGeneratedExam({ examText, outputDir, examProfileId }) {
  ensureDir(outputDir);
  const stamp = formatTimestamp();
  const safeType = examProfileId || "prova";
  const fileName = `${stamp}-${safeType}.md`;
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, examText, "utf8");

  return {
    fileName,
    filePath
  };
}

module.exports = {
  generateExamText,
  saveGeneratedExam,
  THEMES
};
