const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const YELLOW_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFFF00" }
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function gaussianRandom(mean = 0, stdDev = 1) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + z * stdDev;
}

function generateBivariateSample(size = 120) {
  const sample = [];
  for (let index = 0; index < size; index += 1) {
    const xBase = 80 + gaussianRandom(0, 12) + index * 0.06;
    const x = Number(clamp(xBase, 25, 160).toFixed(2));
    const yNoise = gaussianRandom(0, 8);
    const y = Number(clamp(18 + 0.72 * x + yNoise, 8, 160).toFixed(2));
    sample.push({ x, y });
  }
  return sample;
}

function generateTimeSeries(size = 120) {
  const points = [];
  let level = 95;
  for (let t = 1; t <= size; t += 1) {
    const seasonal = 4.2 * Math.sin((2 * Math.PI * t) / 18);
    const trend = 0.11 * t;
    const noise = gaussianRandom(0, 2.5);
    level += gaussianRandom(0, 0.7);
    const value = Number(clamp(level + seasonal + trend + noise, 55, 170).toFixed(2));
    points.push({ t, value });
  }
  return points;
}

function columnLabelToNumber(label) {
  let sum = 0;
  for (const char of label.toUpperCase()) {
    sum = sum * 26 + (char.charCodeAt(0) - 64);
  }
  return sum;
}

function expandRangeAddress(address) {
  if (!address.includes(":")) {
    return [address];
  }

  const [start, end] = address.split(":");
  const startMatch = start.match(/^([A-Z]+)(\d+)$/i);
  const endMatch = end.match(/^([A-Z]+)(\d+)$/i);
  if (!startMatch || !endMatch) {
    return [];
  }

  const startCol = columnLabelToNumber(startMatch[1]);
  const startRow = Number.parseInt(startMatch[2], 10);
  const endCol = columnLabelToNumber(endMatch[1]);
  const endRow = Number.parseInt(endMatch[2], 10);

  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const cells = [];
  for (let col = minCol; col <= maxCol; col += 1) {
    for (let row = minRow; row <= maxRow; row += 1) {
      const colLabel = columnNumberToLabel(col);
      cells.push(`${colLabel}${row}`);
    }
  }
  return cells;
}

function columnNumberToLabel(number) {
  let n = number;
  let label = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

function applyYellowToAddress(worksheet, address) {
  const addresses = expandRangeAddress(address);
  for (const cellAddress of addresses) {
    worksheet.getCell(cellAddress).fill = YELLOW_FILL;
  }
}

function hasInitialDatasetReference(examText) {
  return /\bA2:A1(0[0-9]|1[0-9]|20|21)\b/i.test(examText) && /\bB2:B1(0[0-9]|1[0-9]|20|21)\b/i.test(examText);
}

async function createExamWorkbook({
  outputPath,
  examProfileId,
  examText,
  cellMapping = {}
}) {
  ensureDir(path.dirname(outputPath));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("prova");
  worksheet.properties.defaultColWidth = 14;

  const hasDataset = hasInitialDatasetReference(examText);

  if (hasDataset) {
    if (examProfileId === "prova1") {
      const sample = generateBivariateSample(120);
      sample.forEach((item, index) => {
        const row = index + 2;
        worksheet.getCell(`A${row}`).value = item.x;
        worksheet.getCell(`B${row}`).value = item.y;
      });
    } else {
      const series = generateTimeSeries(120);
      series.forEach((item, index) => {
        const row = index + 2;
        worksheet.getCell(`A${row}`).value = item.t;
        worksheet.getCell(`B${row}`).value = item.value;
      });
    }
  }

  for (const [token, address] of Object.entries(cellMapping)) {
    if (!address || typeof address !== "string") {
      continue;
    }
    if (token.startsWith("CHART_")) {
      continue;
    }
    applyYellowToAddress(worksheet, address);
  }

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}

module.exports = {
  createExamWorkbook
};

