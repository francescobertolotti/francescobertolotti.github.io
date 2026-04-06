const path = require("path");
const { analyzeExamCorpus } = require("../src/lib/examCorpusAnalyzer");

async function main() {
  const rootDir = path.resolve(__dirname, "..");

  const pdfDir = path.join(rootDir, "testi_vecchi");
  const analysisDir = path.join(rootDir, "analysis");
  const extractDir = path.join(rootDir, "output", "extracted");

  const result = await analyzeExamCorpus({ pdfDir, analysisDir, extractDir });

  console.log(`Prove analizzate: ${result.corpus.length}`);
  console.log(`Markdown tipi domande: ${result.questionTypesPath}`);
  console.log(`Markdown stile esame: ${result.examStylePath}`);
}

main().catch((error) => {
  console.error("Errore durante l'analisi delle prove:", error.message);
  process.exit(1);
});

