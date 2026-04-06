const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

function normalizeWhitespace(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])-\n([A-Za-zÀ-ÖØ-öø-ÿ])/g, "$1$2")
    .replace(/\u00a0/g, " ")
    .trim();
}

function splitHeaderAndBody(text) {
  const marker = "---";
  const index = text.indexOf(marker);
  if (index === -1) {
    return {
      header: "",
      body: text
    };
  }

  return {
    header: text.slice(0, index).trim(),
    body: text.slice(index + marker.length).trim()
  };
}

function parseFileMetadata(fileName) {
  const metadata = {
    fileName,
    dateIso: null,
    provaLabel: null
  };

  const match = fileName.match(
    /^(?<date>\d{6})\s+prova\s+(?<prova>\d(?:\s+recupero|[ab]))\.pdf$/i
  );

  if (!match || !match.groups) {
    return metadata;
  }

  const rawDate = match.groups.date;
  const year = `20${rawDate.slice(0, 2)}`;
  const month = rawDate.slice(2, 4);
  const day = rawDate.slice(4, 6);

  metadata.dateIso = `${year}-${month}-${day}`;
  metadata.provaLabel = `prova ${match.groups.prova.toLowerCase()}`;

  return metadata;
}

async function extractTextFromPdf(filePath) {
  const data = fs.readFileSync(filePath);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return normalizeWhitespace(result.text || "");
  } finally {
    await parser.destroy();
  }
}

async function loadExamCorpus({ pdfDir }) {
  if (!fs.existsSync(pdfDir)) {
    throw new Error(`Cartella PDF non trovata: ${pdfDir}`);
  }

  const files = fs
    .readdirSync(pdfDir)
    .filter((file) => file.toLowerCase().endsWith(".pdf"))
    .sort();

  const corpus = [];

  for (const fileName of files) {
    const filePath = path.join(pdfDir, fileName);
    const text = await extractTextFromPdf(filePath);
    const { header, body } = splitHeaderAndBody(text);
    const metadata = parseFileMetadata(fileName);

    corpus.push({
      ...metadata,
      filePath,
      header,
      body,
      text
    });
  }

  return corpus;
}

module.exports = {
  extractTextFromPdf,
  loadExamCorpus,
  parseFileMetadata,
  splitHeaderAndBody
};
