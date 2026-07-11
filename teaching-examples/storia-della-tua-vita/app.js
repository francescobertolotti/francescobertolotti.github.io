(function () {
  const BASE_STORY_INSTRUCTIONS =
    "Sei sempre e soltanto il narratore della vita dell'utente. " +
    "Qualunque scelta venga fatta dall'utente, devi rispondere come narratore, mai come assistente che spiega o commenta fuori dalla storia. " +
    "Trasforma ogni decisione in un avanzamento della trama. Mantieni coerenza narrativa, fai scorrere il tempo in modo realistico, evita il tono consolatorio, " +
    "e concludi sempre con una domanda che costringa l'utente a scegliere il passo successivo. " +
    "La scelta deve avere impatto limitato e ogni risposta deve restare entro 10 righe. " +
    "Ogni tua risposta deve includere anche la data e l'ora correnti della storia in formato italiano esatto 'giorno mese anno - ora:minuto'. " +
    "Alla prima risposta devi dedurre una data iniziale ragionevole a partire da epoca, luogo e contesto iniziale; poi devi far avanzare il tempo a ogni turno in modo elastico ma coerente con la situazione. " +
    "Valuta sempre anche quanto il protagonista e' vicino alla sua ambizione o desiderio con un punteggio intero goal_score da 0 a 100, dove 0 significa obiettivo lontanissimo e 100 significa obiettivo raggiunto. " +
    "Se la scelta dell'utente rompe la coerenza narrativa o introduce elementi arbitrari fuori trama, non devi far avanzare la storia: in quel caso segnala che la scelta non e' accettata, spiega brevemente perche' e lascia goal_score invariato rispetto al turno precedente.";

  const STORY_RESPONSE_SCHEMA = {
    type: "object",
    properties: {
      accepted: {
        type: "boolean",
        description:
          "True se la scelta dell'utente e' coerente con la trama e puo' far avanzare la storia. False se e' troppo fuori contesto o rompe la coerenza narrativa.",
      },
      current_datetime: {
        type: "string",
        description:
          "Data e ora correnti della storia in formato italiano: giorno mese anno - ora:minuto. Esempio: 5 giugno 2026 - 14:30",
      },
      narration: {
        type: "string",
        description:
          "Testo del narratore in italiano, coerente con la storia, massimo 10 righe, concluso con una domanda che costringe a scegliere il passo successivo. Se accepted e' false, restituisci una stringa vuota.",
      },
      warning: {
        type: "string",
        description:
          "Se accepted e' false, spiega in italiano perche' la scelta e' fuori trama e suggerisci di riformularla. Se accepted e' true, restituisci una stringa vuota.",
      },
      goal_score: {
        type: "integer",
        minimum: 0,
        maximum: 100,
        description:
          "Intero da 0 a 100 che misura quanto il protagonista e' vicino al raggiungimento della propria ambizione o desiderio nel punto attuale della storia.",
      },
    },
    required: ["accepted", "current_datetime", "narration", "warning", "goal_score"],
    additionalProperties: false,
  };

  const PROFILE_FIELDS = [
    "name",
    "age",
    "gender",
    "profession",
    "historicalPeriod",
    "place",
    "ambition",
    "initialContext",
  ];

  const appConfig =
    typeof window !== "undefined" && window.STORIA_APP_CONFIG
      ? window.STORIA_APP_CONFIG
      : {};

  const elements = {
    apiKey: document.getElementById("api-key"),
    profileForm: document.getElementById("profile-form"),
    resetButton: document.getElementById("reset-profile"),
    downloadButton: document.getElementById("download-profile"),
    loadButton: document.getElementById("load-profile"),
    startButton: document.getElementById("start-game"),
    openInstructionsButton: document.getElementById("open-instructions"),
    closeInstructionsButton: document.getElementById("close-instructions"),
    uploadInput: document.getElementById("upload-json"),
    statusMessage: document.getElementById("status-message"),
    gamePanel: document.getElementById("game-panel"),
    gameMessages: document.getElementById("game-messages"),
    gameForm: document.getElementById("game-form"),
    gameInput: document.getElementById("game-input"),
    newStoryButton: document.getElementById("new-story"),
    openEvaluationButton: document.getElementById("open-evaluation"),
    sendTurnButton: document.getElementById("send-turn"),
    warningModal: document.getElementById("warning-modal"),
    warningText: document.getElementById("warning-text"),
    closeWarningButton: document.getElementById("close-warning"),
    instructionsModal: document.getElementById("instructions-modal"),
    evaluationModal: document.getElementById("evaluation-modal"),
    evaluationCurrent: document.getElementById("evaluation-current"),
    evaluationChart: document.getElementById("evaluation-chart"),
    closeEvaluationButton: document.getElementById("close-evaluation"),
    goalReachedModal: document.getElementById("goal-reached-modal"),
    closeGoalReachedButton: document.getElementById("close-goal-reached"),
    loadingModal: document.getElementById("loading-modal"),
    inputs: {},
  };

  const gameState = {
    started: false,
    busy: false,
    history: [],
    scoreHistory: [],
    profile: null,
    storyId: null,
    currentGoalScore: null,
  };

  PROFILE_FIELDS.forEach((field) => {
    elements.inputs[field] = document.getElementById(`field-${field}`);
  });

  elements.resetButton.addEventListener("click", resetProfile);
  elements.downloadButton.addEventListener("click", downloadProfile);
  elements.loadButton.addEventListener("click", openUploadDialog);
  elements.startButton.addEventListener("click", startGame);
  elements.openInstructionsButton.addEventListener("click", openInstructionsModal);
  elements.closeInstructionsButton.addEventListener("click", closeInstructionsModal);
  elements.uploadInput.addEventListener("change", loadProfileFromFile);
  elements.gameForm.addEventListener("submit", submitTurn);
  elements.newStoryButton.addEventListener("click", restartStory);
  elements.openEvaluationButton.addEventListener("click", openEvaluationModal);
  elements.closeWarningButton.addEventListener("click", closeWarningModal);
  elements.closeEvaluationButton.addEventListener("click", closeEvaluationModal);
  elements.closeGoalReachedButton.addEventListener("click", closeGoalReachedModal);

  setStatus("Scheda pronta. Compila i campi e usa i pulsanti qui sotto.");

  function resetProfile() {
    elements.profileForm.reset();
    elements.apiKey.value = "";
    elements.uploadInput.value = "";
    hideGame();
    setStatus("Profilo azzerato.", "success");
  }

  function restartStory() {
    hideGame();
    setStatus("Storia azzerata. Puoi iniziarne una nuova con la stessa scheda.", "success");
  }

  function downloadProfile() {
    const payload = {
      exportedAt: new Date().toISOString(),
      story_id: gameState.storyId || "",
      profile: readProfileFromForm(),
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "storia-della-tua-vita-profile.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setStatus("JSON scaricato.", "success");
  }

  function openUploadDialog() {
    elements.uploadInput.value = "";
    elements.uploadInput.click();
  }

  function loadProfileFromFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result));
        const profile = normalizeImportedProfile(parsed);
        writeProfileToForm(profile);
        hideGame();
        setStatus(`JSON caricato: ${file.name}`, "success");
      } catch (error) {
        console.error(error);
        setStatus("Il file JSON non e' valido per questa scheda.", "error");
      }
    };

    reader.onerror = function () {
      setStatus("Non sono riuscito a leggere il file selezionato.", "error");
    };

    reader.readAsText(file);
  }

  function readProfileFromForm() {
    const profile = {};

    PROFILE_FIELDS.forEach((field) => {
      profile[field] = elements.inputs[field].value.trim();
    });

    return profile;
  }

  function writeProfileToForm(profile) {
    PROFILE_FIELDS.forEach((field) => {
      elements.inputs[field].value = profile[field] || "";
    });
  }

  async function startGame() {
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey) {
      setStatus("Inserisci prima una chiave API OpenAI per iniziare il gioco.", "error");
      return;
    }

    if (gameState.busy) {
      return;
    }

    const profile = readProfileFromForm();

    gameState.started = true;
    gameState.busy = true;
    gameState.history = [];
    gameState.scoreHistory = [];
    gameState.profile = profile;
    gameState.storyId = createStoryId();
    gameState.currentGoalScore = null;
    closeWarningModal();
    closeEvaluationModal();
    closeGoalReachedModal();
    elements.gamePanel.hidden = false;
    elements.gameMessages.innerHTML = "";
    elements.startButton.disabled = true;
    elements.sendTurnButton.disabled = true;
    setStatus("Sto avviando la storia...");
    showLoadingModal();

    try {
      const introduction = buildIntroductionPrompt(profile);
      gameState.history.push({ role: "user", content: introduction, hidden: true });
      const reply = await requestStoryTurn(apiKey, gameState.history);

      if (!reply.accepted) {
        throw new Error(reply.warning || "Il modello non ha accettato l'avvio della storia.");
      }

      gameState.history.push({
        role: "assistant",
        content: reply.narration,
        timestamp: reply.current_datetime,
        goalScore: reply.goal_score,
      });
      registerScoreEntry({
        timestamp: reply.current_datetime,
        score: reply.goal_score,
        userChoice: "Avvio della storia dalla scheda iniziale",
        narratorText: reply.narration,
      });
      renderMessages();
      logTurnToGoogleSheet({
        storyId: gameState.storyId,
        profile,
        storyTimestamp: reply.current_datetime,
        narratorText: reply.narration,
        userChoice: "Avvio della storia dalla scheda iniziale",
      });
      if (reply.goal_score === 100) {
        showGoalReachedModal();
      }
      setStatus("Gioco avviato. Ora puoi continuare la storia.", "success");
      elements.gameInput.focus();
    } catch (error) {
      console.error(error);
      hideGame();
      setStatus(error.message || "Non sono riuscito ad avviare il gioco.", "error");
    } finally {
      closeLoadingModal();
      gameState.busy = false;
      elements.startButton.disabled = false;
      elements.sendTurnButton.disabled = false;
    }
  }

  async function submitTurn(event) {
    event.preventDefault();

    const apiKey = elements.apiKey.value.trim();
    const turn = elements.gameInput.value.trim();

    if (!apiKey) {
      setStatus("La chiave API e' obbligatoria per continuare il gioco.", "error");
      return;
    }

    if (!gameState.started) {
      setStatus("Premi prima 'Inizia il gioco'.", "error");
      return;
    }

    if (!turn) {
      setStatus("Scrivi una scelta prima di continuare.", "error");
      return;
    }

    if (gameState.busy) {
      return;
    }

    gameState.busy = true;
    elements.sendTurnButton.disabled = true;
    elements.startButton.disabled = true;
    closeWarningModal();
    setStatus("Sto continuando la storia...");
    showLoadingModal();

    try {
      const previousGoalScore = gameState.currentGoalScore;
      const forceSetback = shouldInjectSetback(previousGoalScore);
      const proposedHistory = [...gameState.history, { role: "user", content: turn }];
      const reply = await requestStoryTurn(apiKey, proposedHistory, {
        previousGoalScore,
        forceSetback,
      });

      if (!reply.accepted) {
        showWarningModal(
          reply.warning || "Questa scelta esce troppo dalla coerenza della storia. Prova a riformularla."
        );
        setStatus("Scelta non accettata: prova a restare dentro la trama.", "error");
        return;
      }

      gameState.history.push({ role: "user", content: turn });
      gameState.history.push({
        role: "assistant",
        content: reply.narration,
        timestamp: reply.current_datetime,
        goalScore: reply.goal_score,
      });
      registerScoreEntry({
        timestamp: reply.current_datetime,
        score: reply.goal_score,
        userChoice: turn,
        narratorText: reply.narration,
      });
      elements.gameInput.value = "";
      renderMessages();
      logTurnToGoogleSheet({
        storyId: gameState.storyId,
        profile: gameState.profile || readProfileFromForm(),
        storyTimestamp: reply.current_datetime,
        narratorText: reply.narration,
        userChoice: turn,
      });
      if (reply.goal_score === 100) {
        showGoalReachedModal();
      }
      setStatus("Turno completato.", "success");
      elements.gameInput.focus();
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Non sono riuscito a continuare la storia.", "error");
    } finally {
      closeLoadingModal();
      gameState.busy = false;
      elements.sendTurnButton.disabled = false;
      elements.startButton.disabled = false;
    }
  }

  async function requestStoryTurn(apiKey, history, options) {
    const instructions = buildStoryInstructions(options);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        reasoning: { effort: "low" },
        instructions,
        text: {
          format: {
            type: "json_schema",
            name: "story_turn",
            schema: STORY_RESPONSE_SCHEMA,
            strict: true,
          },
        },
        input: history.map((message) => ({
          role: message.role,
          content:
            message.role === "assistant" && message.timestamp
              ? `[${message.timestamp} | goal_score: ${formatGoalScoreValue(message.goalScore)}] ${message.content}`
              : message.content,
        })),
      }),
    });

    if (!response.ok) {
      let detail = "Richiesta non riuscita.";
      try {
        const errorPayload = await response.json();
        detail = errorPayload.error?.message || detail;
      } catch {
        // Ignore parse failures and keep fallback detail.
      }
      throw new Error(detail);
    }

    const payload = await response.json();
    return parseStructuredStoryResponse(payload);
  }

  function buildIntroductionPrompt(profile) {
    const lines = [
      `Nome: ${profile.name || "non specificato"}`,
      `Eta: ${profile.age || "non specificata"}`,
      `Genere: ${profile.gender || "non specificato"}`,
      `Professione o ruolo: ${profile.profession || "non specificato"}`,
      `Epoca: ${profile.historicalPeriod || "non specificata"}`,
      `Luogo: ${profile.place || "non specificato"}`,
      `Ambizione: ${profile.ambition || "non specificata"}`,
      `Contesto iniziale: ${profile.initialContext || "non specificato"}`,
    ];

    return (
      `Questa e' la scheda iniziale del protagonista.\n${lines.join("\n")}\n\n` +
      "Inizia subito la storia a partire da questi dati. Definisci anche una data iniziale ragionevole coerente con epoca, luogo e contesto. Valuta anche il goal_score iniziale."
    );
  }

  function buildStoryInstructions(options) {
    const requestOptions = options || {};
    const additions = [];

    if (Number.isInteger(requestOptions.previousGoalScore)) {
      additions.push(
        `Il goal_score del turno precedente e' ${requestOptions.previousGoalScore}. Usa questo valore come riferimento di continuita'.`
      );
    }

    if (requestOptions.forceSetback && Number.isInteger(requestOptions.previousGoalScore)) {
      additions.push(
        "Inserisci un imprevisto spiacevole nella storia che porti lo stato di raggiungimento dell'obiettivo indietro rispetto allo stato di partenza."
      );
      additions.push(
        `In questo turno il nuovo goal_score deve essere strettamente inferiore a ${requestOptions.previousGoalScore}, pur restando coerente con la trama.`
      );
    }

    return additions.length ? `${BASE_STORY_INSTRUCTIONS} ${additions.join(" ")}` : BASE_STORY_INSTRUCTIONS;
  }

  function extractResponseText(payload) {
    if (payload && typeof payload.output_text === "string" && payload.output_text.trim()) {
      return payload.output_text.trim();
    }

    if (!payload || !Array.isArray(payload.output)) {
      return "";
    }

    return payload.output
      .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
      .filter((part) => part && part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }

  function parseStructuredStoryResponse(payload) {
    const rawText = extractResponseText(payload);

    if (!rawText) {
      throw new Error("La risposta del modello e' vuota.");
    }

    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.error("Structured output parse error:", rawText, error);
      throw new Error("La risposta strutturata del modello non e' valida.");
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("La risposta strutturata del modello e' vuota.");
    }

    const accepted = typeof parsed.accepted === "boolean" ? parsed.accepted : null;
    const currentDatetime =
      typeof parsed.current_datetime === "string" ? parsed.current_datetime.trim() : "";
    const narration = typeof parsed.narration === "string" ? parsed.narration.trim() : "";
    const warning = typeof parsed.warning === "string" ? parsed.warning.trim() : "";
    const goalScore = Number.isInteger(parsed.goal_score) ? parsed.goal_score : null;

    if (accepted === null || !currentDatetime || goalScore === null) {
      throw new Error("La risposta strutturata del modello e' incompleta.");
    }

    if (goalScore < 0 || goalScore > 100) {
      throw new Error("La risposta strutturata del modello contiene un goal_score non valido.");
    }

    if (accepted && !narration) {
      throw new Error("La risposta strutturata del modello non contiene la narrazione.");
    }

    if (!accepted && !warning) {
      throw new Error("La risposta strutturata del modello non contiene il warning.");
    }

    return {
      accepted,
      current_datetime: currentDatetime,
      narration,
      warning,
      goal_score: goalScore,
    };
  }

  function renderMessages() {
    elements.gameMessages.innerHTML = "";

    gameState.history
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") && !message.hidden
      )
      .forEach((message) => {
        const article = document.createElement("article");
        article.className = `game-message game-message--${message.role}`;

        const role = document.createElement("p");
        role.className = "game-message__role";
        role.textContent =
          message.role === "assistant"
            ? `Narratore · ${message.timestamp || "tempo non definito"}`
            : "Scelta";

        const text = document.createElement("p");
        text.className = "game-message__text";
        text.textContent = message.content;

        article.appendChild(role);
        article.appendChild(text);
        elements.gameMessages.appendChild(article);
      });
  }

  function hideGame() {
    gameState.started = false;
    gameState.history = [];
    gameState.scoreHistory = [];
    gameState.busy = false;
    gameState.profile = null;
    gameState.storyId = null;
    gameState.currentGoalScore = null;
    elements.gamePanel.hidden = true;
    elements.gameMessages.innerHTML = "";
    elements.gameForm.reset();
    elements.sendTurnButton.disabled = false;
    elements.startButton.disabled = false;
    closeWarningModal();
    closeEvaluationModal();
    closeGoalReachedModal();
    closeLoadingModal();
  }

  function normalizeImportedProfile(payload) {
    const source =
      payload && typeof payload === "object" && payload.profile ? payload.profile : payload;

    if (!source || typeof source !== "object") {
      throw new Error("Missing profile object");
    }

    const normalized = {};

    PROFILE_FIELDS.forEach((field) => {
      const value = source[field];
      normalized[field] = typeof value === "string" ? value : "";
    });

    return normalized;
  }

  function showWarningModal(message) {
    elements.warningText.textContent = message;
    elements.warningModal.hidden = false;
  }

  function closeWarningModal() {
    elements.warningModal.hidden = true;
    elements.warningText.textContent = "";
  }

  function openEvaluationModal() {
    renderEvaluationChart();
    elements.evaluationModal.hidden = false;
  }

  function closeEvaluationModal() {
    elements.evaluationModal.hidden = true;
  }

  function showGoalReachedModal() {
    elements.goalReachedModal.hidden = false;
  }

  function closeGoalReachedModal() {
    elements.goalReachedModal.hidden = true;
  }

  function showLoadingModal() {
    elements.loadingModal.hidden = false;
  }

  function closeLoadingModal() {
    elements.loadingModal.hidden = true;
  }

  function registerScoreEntry(entry) {
    gameState.currentGoalScore = entry.score;
    gameState.scoreHistory.push(entry);
    renderEvaluationChart();
  }

  function renderEvaluationChart() {
    const currentScore = gameState.currentGoalScore;

    if (currentScore === null) {
      elements.evaluationCurrent.textContent = "Nessuna valutazione disponibile per ora.";
    } else {
      elements.evaluationCurrent.textContent = `Valutazione attuale: ${currentScore}/100`;
    }

    if (!elements.evaluationChart) {
      return;
    }

    const svg = elements.evaluationChart;
    const width = 640;
    const height = 320;
    const margin = { top: 24, right: 24, bottom: 38, left: 46 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const values = gameState.scoreHistory.map((entry) => entry.score);
    const ns = "http://www.w3.org/2000/svg";

    svg.innerHTML = "";

    function appendSvg(tag, attributes) {
      const node = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([key, value]) => {
        node.setAttribute(key, String(value));
      });
      svg.appendChild(node);
      return node;
    }

    appendSvg("rect", {
      x: 0,
      y: 0,
      width,
      height,
      fill: "#f9fbfd",
    });

    [0, 25, 50, 75, 100].forEach((tick) => {
      const y = margin.top + innerHeight - (tick / 100) * innerHeight;
      appendSvg("line", {
        x1: margin.left,
        y1: y,
        x2: margin.left + innerWidth,
        y2: y,
        stroke: "rgba(25, 52, 88, 0.14)",
        "stroke-width": 1,
      });
      const label = appendSvg("text", {
        x: margin.left - 10,
        y: y + 4,
        fill: "#5b6b78",
        "font-size": 12,
        "text-anchor": "end",
      });
      label.textContent = `${tick}`;
    });

    appendSvg("line", {
      x1: margin.left,
      y1: margin.top,
      x2: margin.left,
      y2: margin.top + innerHeight,
      stroke: "#193458",
      "stroke-width": 1.4,
    });

    appendSvg("line", {
      x1: margin.left,
      y1: margin.top + innerHeight,
      x2: margin.left + innerWidth,
      y2: margin.top + innerHeight,
      stroke: "#193458",
      "stroke-width": 1.4,
    });

    if (!values.length) {
      const empty = appendSvg("text", {
        x: width / 2,
        y: height / 2,
        fill: "#5b6b78",
        "font-size": 15,
        "text-anchor": "middle",
      });
      empty.textContent = "La serie storica comparira' dopo il primo turno.";
      return;
    }

    const points = values.map((value, index) => {
      const x =
        values.length === 1
          ? margin.left + innerWidth / 2
          : margin.left + (index / (values.length - 1)) * innerWidth;
      const y = margin.top + innerHeight - (value / 100) * innerHeight;
      return { x, y, value, index };
    });

    const pathData = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    appendSvg("path", {
      d: pathData,
      fill: "none",
      stroke: "#0862a8",
      "stroke-width": 3,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });

    points.forEach((point, index) => {
      appendSvg("circle", {
        cx: point.x,
        cy: point.y,
        r: 4.5,
        fill: "#193458",
      });

      if (index === 0 || index === points.length - 1 || points.length <= 6) {
        const tick = appendSvg("text", {
          x: point.x,
          y: margin.top + innerHeight + 20,
          fill: "#5b6b78",
          "font-size": 12,
          "text-anchor": "middle",
        });
        tick.textContent = `${index + 1}`;
      }
    });
  }

  function logTurnToGoogleSheet(eventData) {
    const webhookUrl =
      typeof appConfig.sheetsWebhookUrl === "string" ? appConfig.sheetsWebhookUrl.trim() : "";

    if (!webhookUrl) {
      return;
    }

    const payload = {
      story_id: eventData.storyId || "",
      specs: formatSpecsForLog(eventData.profile),
      turn_pair:
        `[data]: ${eventData.storyTimestamp}\n` +
        `[Scelta]: ${eventData.userChoice}\n` +
        `[Narratore]: ${eventData.narratorText}`,
    };

    const body = JSON.stringify(payload);

    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
        const queued = navigator.sendBeacon(webhookUrl, blob);
        if (queued) {
          return;
        }
        console.warn("sendBeacon did not queue the Google Sheets log request.");
      }
    } catch (error) {
      console.error("sendBeacon failed", error);
    }

    if (sendGoogleSheetLogWithJsonp(webhookUrl, payload)) {
      return;
    }

    fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body,
    }).catch((error) => {
      console.error("Google Sheets log failed", error);
    });
  }

  function sendGoogleSheetLogWithJsonp(webhookUrl, payload) {
    if (typeof document === "undefined") {
      return false;
    }

    const callbackName = `storiaSheetCb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const params = new URLSearchParams({
      action: "log",
      story_id: payload.story_id || "",
      specs: payload.specs || "",
      turn_pair: payload.turn_pair || "",
      callback: callbackName,
    });
    const script = document.createElement("script");
    let done = false;

    function cleanup() {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }
    }

    window[callbackName] = function (response) {
      if (done) {
        return;
      }
      done = true;
      cleanup();
      if (!response || response.ok !== true) {
        console.error("Google Sheets JSONP log failed", response);
      }
    };

    script.onerror = function () {
      if (done) {
        return;
      }
      done = true;
      cleanup();
      console.error("Google Sheets JSONP log failed");
    };

    script.src = `${webhookUrl}${webhookUrl.includes("?") ? "&" : "?"}${params.toString()}`;
    document.body.appendChild(script);

    window.setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      cleanup();
      console.error("Google Sheets JSONP log timeout");
    }, 12000);

    return true;
  }

  function formatSpecsForLog(profile) {
    const source = profile || {};

    return [
      `nome=${source.name || ""}`,
      `eta=${source.age || ""}`,
      `genere=${source.gender || ""}`,
      `professione_ruolo=${source.profession || ""}`,
      `epoca=${source.historicalPeriod || ""}`,
      `luogo=${source.place || ""}`,
    ].join(" | ");
  }

  function createStoryId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `story-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function formatGoalScoreValue(value) {
    return Number.isInteger(value) ? value : "n/d";
  }

  function shouldInjectSetback(previousGoalScore) {
    return Number.isInteger(previousGoalScore) && previousGoalScore > 0 && Math.random() < 0.05;
  }

  function openInstructionsModal() {
    elements.instructionsModal.hidden = false;
  }

  function closeInstructionsModal() {
    elements.instructionsModal.hidden = true;
  }

  function setStatus(message, tone) {
    elements.statusMessage.textContent = message;
    if (tone) {
      elements.statusMessage.dataset.tone = tone;
      return;
    }
    delete elements.statusMessage.dataset.tone;
  }
})();
