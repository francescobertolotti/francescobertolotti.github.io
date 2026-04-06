const fs = require("fs");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const { analyzeExamCorpus } = require("./lib/examCorpusAnalyzer");
const { generateExamText, saveGeneratedExam } = require("./lib/examGenerator");
const { createExamPdf } = require("./lib/pdfExamRenderer");
const { createExamWorkbook } = require("./lib/examWorkbookBuilder");

dotenv.config();

const app = express();

const rootDir = path.resolve(__dirname, "..");
const pdfDir = path.join(rootDir, "testi_vecchi");
const analysisDir = path.join(rootDir, "analysis");
const extractDir = path.join(rootDir, "output", "extracted");
const generatedDir = path.join(rootDir, "output", "generated");
const feedbackDir = path.join(rootDir, "output", "feedback");
const feedbackLogPath = path.join(feedbackDir, "feedback-log.jsonl");
const logoPath = path.join(rootDir, "logo_liuc.png");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(rootDir, "public")));

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function appendFeedbackEntry(feedback) {
  ensureDirectory(feedbackDir);
  fs.appendFileSync(feedbackLogPath, `${JSON.stringify(feedback)}\n`, "utf8");
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-5-mini"
  });
});

app.post("/api/generate-exam", async (_req, res) => {
  try {
    const generated = await generateExamText({ analysisDir });

    const savedMarkdown = saveGeneratedExam({
      examText: generated.text,
      outputDir: generatedDir,
      examProfileId: generated.selectedProfile.id
    });

    const pdfFileName = savedMarkdown.fileName.replace(/\.md$/i, ".pdf");
    const pdfPath = path.join(generatedDir, pdfFileName);
    const excelFileName = savedMarkdown.fileName.replace(/\.md$/i, ".xlsx");
    const excelPath = path.join(generatedDir, excelFileName);

    await createExamPdf({
      outputPath: pdfPath,
      generatedExamText: generated.text,
      logoPath
    });

    await createExamWorkbook({
      outputPath: excelPath,
      examProfileId: generated.selectedProfile.id,
      examText: generated.text,
      cellMapping: generated.cellMapping
    });

    res.json({
      ok: true,
      examText: generated.text,
      saved: {
        fileName: savedMarkdown.fileName,
        filePath: savedMarkdown.filePath,
        markdownFileName: savedMarkdown.fileName,
        markdownPath: savedMarkdown.filePath,
        pdfFileName,
        pdfPath,
        excelFileName,
        excelPath
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

app.post("/api/feedback", (req, res) => {
  try {
    const feedback = String(req.body?.feedback || "").trim();
    if (!feedback) {
      return res.status(400).json({ ok: false, error: "Feedback is required." });
    }

    if (feedback.length > 4000) {
      return res.status(400).json({
        ok: false,
        error: "Feedback is too long (max 4000 characters)."
      });
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      createdAt: new Date().toISOString(),
      feedback
    };

    appendFeedbackEntry(entry);
    return res.status(201).json({ ok: true, entry });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.get("/api/generated-files", (_req, res) => {
  if (!fs.existsSync(generatedDir)) {
    return res.json({ ok: true, files: [] });
  }

  const files = fs
    .readdirSync(generatedDir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .reverse();

  return res.json({ ok: true, files });
});

app.get("/api/generated-files/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(generatedDir, fileName);

  if (!filePath.startsWith(generatedDir)) {
    return res.status(400).json({ ok: false, error: "Nome file non valido." });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, error: "File non trovato." });
  }

  const content = fs.readFileSync(filePath, "utf8");
  return res.type("text/markdown").send(content);
});

app.get("/api/generated-pdfs/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(generatedDir, fileName);

  if (!filePath.startsWith(generatedDir)) {
    return res.status(400).json({ ok: false, error: "Nome file non valido." });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, error: "File PDF non trovato." });
  }

  return res.download(filePath);
});

app.get("/api/generated-excels/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(generatedDir, fileName);

  if (!filePath.startsWith(generatedDir)) {
    return res.status(400).json({ ok: false, error: "Nome file non valido." });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, error: "File Excel non trovato." });
  }

  return res.download(filePath);
});

async function bootstrap() {
  try {
    ensureDirectory(feedbackDir);

    const questionTypesPath = path.join(analysisDir, "tipi_domande.md");
    const stylePath = path.join(analysisDir, "stile_esame.md");
    const analysisMissing = !fs.existsSync(questionTypesPath) || !fs.existsSync(stylePath);

    if (analysisMissing) {
      await analyzeExamCorpus({ pdfDir, analysisDir, extractDir });
      console.log("Analisi iniziale completata.");
    }
  } catch (error) {
    console.error("Avvio con analisi iniziale fallito:", error.message);
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
  });
}

bootstrap();
