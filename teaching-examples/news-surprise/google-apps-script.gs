const SHEET_NAME = "Risposte";
const HEADERS = [
  "Ricevuto il",
  "ID invio",
  "Nome",
  "Cognome",
  "Data edizione",
  "ID notizia",
  "Titolo",
  "Area",
  "Categoria",
  "Data notizia",
  "Sorpresa",
  "Veridicità percepita",
  "Valutato il",
];

function doGet() {
  return json_({ ok: true, service: "Digital Thinking news survey" });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    validate_(payload);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

      const rows = payload.risposte.map((response) => [
        new Date(),
        safeCell_(payload.submissionId),
        safeCell_(payload.nome),
        safeCell_(payload.cognome),
        safeCell_(payload.editionDate),
        safeCell_(response.newsId),
        safeCell_(response.headline),
        safeCell_(response.region),
        safeCell_(response.category),
        safeCell_(response.publishedAt),
        Number(response.surprise),
        Number(response.perceivedTruth),
        safeCell_(response.recordedAt),
      ]);

      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true, rows: payload.risposte.length });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function validate_(payload) {
  if (!payload || !String(payload.nome || "").trim() || !String(payload.cognome || "").trim()) {
    throw new Error("Nome e cognome sono obbligatori.");
  }

  if (!Array.isArray(payload.risposte) || payload.risposte.length !== 5) {
    throw new Error("Sono richieste esattamente cinque valutazioni.");
  }

  payload.risposte.forEach((response) => {
    const surprise = Number(response.surprise);
    const truth = Number(response.perceivedTruth);
    if (!response.newsId || !Number.isFinite(surprise) || !Number.isFinite(truth)
        || surprise < 0 || surprise > 100 || truth < 0 || truth > 100) {
      throw new Error("Una valutazione non è valida.");
    }
  });
}

function safeCell_(value) {
  const text = String(value == null ? "" : value).trim().slice(0, 1000);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
