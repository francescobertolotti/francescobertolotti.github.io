function doGet(e) {
  return handleRequest_(e, "get");
}

function doPost(e) {
  return handleRequest_(e, "post");
}

function handleRequest_(e, method) {
  try {
    var payload = readPayload_(e, method);
    var action = payload.action || "log";

    if (action !== "log") {
      return buildResponse_({ ok: false, error: "Unsupported action" }, payload.callback);
    }

    appendLogRow_(payload);
    return buildResponse_({ ok: true }, payload.callback);
  } catch (error) {
    var callback = e && e.parameter ? e.parameter.callback : "";
    return buildResponse_({ ok: false, error: String(error) }, callback);
  }
}

function readPayload_(e, method) {
  if (method === "post") {
    return JSON.parse((e && e.postData && e.postData.contents) || "{}");
  }

  return {
    action: e && e.parameter ? e.parameter.action : "",
    story_id: e && e.parameter ? e.parameter.story_id : "",
    specs: e && e.parameter ? e.parameter.specs : "",
    turn_pair: e && e.parameter ? e.parameter.turn_pair : "",
    callback: e && e.parameter ? e.parameter.callback : "",
  };
}

function appendLogRow_(payload) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Logs") || spreadsheet.getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["story_id", "specifiche", "timestamp", "ultima_coppia_narratore_scelta"]);
  }

  sheet.appendRow([
    payload.story_id || "",
    payload.specs || "",
    new Date(),
    payload.turn_pair || "",
  ]);
}

function buildResponse_(payload, callback) {
  var output;

  if (callback) {
    output = callback + "(" + JSON.stringify(payload) + ")";
    return ContentService
      .createTextOutput(output)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
