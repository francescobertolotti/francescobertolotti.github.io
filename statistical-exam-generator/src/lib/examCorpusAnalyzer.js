const fs = require("fs");
const path = require("path");
const { loadExamCorpus } = require("./pdfCorpus");

const QUESTION_TYPE_RULES = [
  {
    id: "generazione_dati",
    title: "Generazione Di Campioni O Serie Temporali",
    description:
      "Richieste in cui lo studente deve creare dati sintetici (campioni casuali o serie storiche con legge di evoluzione).",
    regex:
      /(genera\s+un\s+campione|genera\s+la\s+serie\s+storica|x\(t\+\s*δ?t\)\s*=\s*x\(t\)|numero\s+(intero|decimale)\s+casuale)/i
  },
  {
    id: "descrittiva_univariata",
    title: "Statistica Descrittiva Univariata",
    description:
      "Calcolo e confronto di media, deviazione standard, percentili e indicatori di dispersione.",
    regex:
      /(media\s+campionaria|deviazione\s+standard|percentile|ventesimo|cinquantesimo|indice\s+di\s+variabilit|rapporto\s+tra\s+deviazione\s+standard\s+e\s+media)/i
  },
  {
    id: "intervalli_contenimento",
    title: "Intervalli Di Contenimento E Lettura Probabilistica",
    description:
      "Domande su intervalli attesi (es. almeno il 75% dei dati) e interpretazione statistica del risultato.",
    regex:
      /(almeno\s+il\s+75%|intervallo\s+\[m\w*\s*[-–]\s*\d+s\w*|intervallo\s+entro\s+cui)/i
  },
  {
    id: "distribuzioni_frequenza",
    title: "Distribuzioni Di Frequenza",
    description:
      "Costruzione di distribuzioni assolute/relative/cumulate con classi scelte o imposte.",
    regex:
      /(distribuzione\s+a\s+frequenze|frequenze\s+assolute|frequenze\s+relative|frequenze\s+relative\s+cumulate|categorie\s+di\s+uguale\s+ampiezza)/i
  },
  {
    id: "grafici_esplorativi",
    title: "Visualizzazioni E Grafici",
    description:
      "Produzione di grafici con richiesta esplicita di scelta del tipo e posizionamento nel foglio.",
    regex:
      /(visualizza\s+.*\s+grafico|grafico\s+con\s+l[’']angolo\s+in\s+alto\s+a\s+sinistra|grafico\s+a\s+fianco)/i
  },
  {
    id: "bivariata_correlazione",
    title: "Analisi Bivariata, Covarianza E Correlazione",
    description:
      "Uso di campioni bivariati con scatter plot, covarianza e coefficiente di correlazione campionaria.",
    regex:
      /(campione\s+bivariato|covarianza|coefficiente\s+di\s+correlazione\s+campionaria)/i
  },
  {
    id: "regressione_lineare",
    title: "Regressione Lineare E Metriche Del Modello",
    description:
      "Stima con minimi quadrati, pendenza/intercetta, coefficiente di determinazione e RMSE.",
    regex:
      /(metodo\s+dei\s+minimi\s+quadrati|retta\s+di\s+regressione|pendenza|intercetta|coefficiente\s+di\s+determinazione|rmse)/i
  },
  {
    id: "previsioni_extrapolazione",
    title: "Previsioni Ed Extrapolazione",
    description:
      "Domande di previsione su punti futuri e discussione dell'affidabilità della previsione.",
    regex:
      /(prevedi\s+\w+\(\d+\)|estrapolazione|affidabilit[aà]\s+della\s+previsione)/i
  },
  {
    id: "residui_medie_mobili",
    title: "Residui, Medie Mobili E Medie Progressive",
    description:
      "Costruzione e lettura di residui, medie mobili o progressive su serie storiche.",
    regex:
      /(serie\s+dei\s+residui|media\s+mobile|media\s+progressiva|finestra\s+di\s+ampiezza)/i
  },
  {
    id: "autocorrelazione_stagionalita",
    title: "Autocorrelazione, Stagionalità E Periodicità",
    description:
      "Verifica di periodicità o stagionalità con autocorrelazione e autocorrelogramma.",
    regex:
      /(autocorrelazione|autocorrelogramma|stagionalit[aà]|periodicit[aà])/i
  },
  {
    id: "controllo_statistico",
    title: "Controllo Statistico Di Processo",
    description:
      "Carte di controllo, soglie a 3 sigma e valutazione se il processo è sotto controllo.",
    regex:
      /(carta\s+di\s+controllo|3\s+deviazioni\s+standard|sotto\s+controllo\s+statistico|processo)/i
  },
  {
    id: "regressione_polinomiale",
    title: "Regressione Polinomiale E Confronto Modelli",
    description:
      "Uso di polinomi (es. quarto grado) e confronto con regressione lineare.",
    regex:
      /(polinomio\s+di\s+regressione|regressione\s+di\s+quarto\s+grado|modello\s+lineare)/i
  },
  {
    id: "interpretazione_testuale",
    title: "Interpretazione Testuale Dei Risultati",
    description:
      "Presenza sistematica di mini-commenti: 'spiega', 'commenta', 'chiarisci'.",
    regex: /(spiega|commenta|chiarendo|con\s+un\s+breve\s+testo)/i
  }
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function splitSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .split(/(?<=[.;!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getEvidenceSentences(body, regex, maxEvidence = 2) {
  return splitSentences(body)
    .filter((sentence) => regex.test(sentence))
    .slice(0, maxEvidence);
}

function sanitizeSentence(sentence, maxLength = 210) {
  if (sentence.length <= maxLength) {
    return sentence;
  }
  return `${sentence.slice(0, maxLength - 1).trim()}…`;
}

function buildQuestionTypesMarkdown(corpus, questionTypeStats) {
  const header = [
    "# Tipi Di Domande Ricavabili Dalle Prove",
    "",
    `Prove analizzate: **${corpus.length}**.`,
    "",
    "## Elenco prove lette",
    ...corpus.map((doc) => {
      const label = doc.dateIso ? `${doc.dateIso}` : "data non riconosciuta";
      return `- ${doc.fileName} (${label})`;
    }),
    "",
    "## Catalogo tipi di domanda",
    ""
  ];

  const sections = [];
  let index = 1;

  for (const stat of questionTypeStats) {
    if (stat.count === 0) {
      continue;
    }

    sections.push(`### ${index}. ${stat.title}`);
    sections.push(`Ricorrenza: **${stat.count}/${corpus.length}** prove.`);
    sections.push(`${stat.description}`);
    sections.push("Esempi testuali osservati:");

    for (const evidence of stat.evidence.slice(0, 3)) {
      sections.push(`- ${sanitizeSentence(evidence)}`);
    }

    sections.push("");
    index += 1;
  }

  return [...header, ...sections].join("\n");
}

function buildStyleMarkdown(corpus) {
  const joinedBodies = corpus.map((doc) => doc.body).join("\n\n");
  const joinedTexts = corpus.map((doc) => doc.text).join("\n\n");
  const countInBodies = (regex) => (joinedBodies.match(regex) || []).length;
  const countInTexts = (regex) => (joinedTexts.match(regex) || []).length;

  const styleSignals = {
    cellRefs: countInBodies(/\bcella\b|\bcelle\b/gi),
    chartRefs: countInBodies(/\bgrafico\b/gi),
    explainRefs: countInBodies(/\bspiega\b|\bcommenta\b|\bbreve testo\b/gi),
    openTaskFlow: countInBodies(/\bcalcola\b|\bcostruisci\b|\bvisualizza\b/gi),
    formulaPolicy: countInTexts(/formule calcolate e non di valori numerici/gi)
  };

  const lines = [
    "# Stile Ricorrente Delle Prove",
    "",
    `Prove analizzate: **${corpus.length}**.`,
    "",
    "## Struttura ricorrente del testo",
    "- Scenario iniziale con dati e contesto applicativo (misure fisiche, consumi, serie temporali).",
    "- Sequenza di task in un unico blocco narrativo, con ordine logico: calcolo -> grafico -> interpretazione.",
    "- Chiusura con richieste di commento qualitativo sui risultati numerici.",
    "",
    "## Tratti stilistici osservati",
    `- Riferimenti espliciti a celle del foglio: circa **${styleSignals.cellRefs}** occorrenze.`,
    `- Richieste di grafici posizionati in area precisa: circa **${styleSignals.chartRefs}** occorrenze.`,
    `- Richieste di spiegazione testuale (\"spiega/commenta\"): circa **${styleSignals.explainRefs}** occorrenze.`,
    `- Policy di output in formula (nelle istruzioni iniziali): **${styleSignals.formulaPolicy}** richiami diretti.`,
    `- Verbi operativi (calcola/costruisci/visualizza) molto frequenti: circa **${styleSignals.openTaskFlow}** occorrenze.`,
    "",
    "## Modello di consegna da imitare",
    "1. Presenta dataset e variabili con unità di misura.",
    "2. Chiedi indicatori descrittivi (media/deviazione/percentili/dispersione).",
    "3. Inserisci una distribuzione di frequenza con numero classi e confronto media campione vs media distribuzione.",
    "4. Aggiungi visualizzazione bivariata o serie storica.",
    "5. Richiedi regressione (parametri, R², RMSE) e una previsione con commento sull'affidabilità.",
    "6. Concludi con almeno una richiesta interpretativa in testo breve.",
    "",
    "## Registro linguistico",
    "- Registro formale, tecnico, con imperativi diretti (\"Calcola\", \"Costruisci\", \"Visualizza\", \"Spiega\").",
    "- Consegne dense ma precise, senza fronzoli, orientate all'operatività in Excel/Calc.",
    "- Varianti A/B/recupero costruite sullo stesso schema, con parametri numerici modificati."
  ];

  return lines.join("\n");
}

function writeExtractedTexts(corpus, extractDir) {
  ensureDir(extractDir);
  for (const doc of corpus) {
    const txtName = doc.fileName.replace(/\.pdf$/i, ".txt");
    fs.writeFileSync(path.join(extractDir, txtName), doc.text, "utf8");
  }
}

function buildQuestionTypeStats(corpus) {
  return QUESTION_TYPE_RULES.map((rule) => {
    const docsWithRule = corpus.filter((doc) => rule.regex.test(doc.body));
    const evidence = docsWithRule.flatMap((doc) =>
      getEvidenceSentences(doc.body, rule.regex, 1)
    );

    return {
      id: rule.id,
      title: rule.title,
      description: rule.description,
      count: docsWithRule.length,
      evidence
    };
  });
}

async function analyzeExamCorpus({ pdfDir, analysisDir, extractDir }) {
  const corpus = await loadExamCorpus({ pdfDir });
  if (corpus.length === 0) {
    throw new Error(`Nessun PDF trovato in ${pdfDir}`);
  }

  ensureDir(analysisDir);
  ensureDir(extractDir);

  writeExtractedTexts(corpus, extractDir);

  const questionTypeStats = buildQuestionTypeStats(corpus);
  const questionTypesMarkdown = buildQuestionTypesMarkdown(corpus, questionTypeStats);
  const examStyleMarkdown = buildStyleMarkdown(corpus);

  const questionTypesPath = path.join(analysisDir, "tipi_domande.md");
  const examStylePath = path.join(analysisDir, "stile_esame.md");

  fs.writeFileSync(questionTypesPath, questionTypesMarkdown, "utf8");
  fs.writeFileSync(examStylePath, examStyleMarkdown, "utf8");

  return {
    corpus,
    questionTypeStats,
    questionTypesPath,
    examStylePath
  };
}

module.exports = {
  analyzeExamCorpus
};
