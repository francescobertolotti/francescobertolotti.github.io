const STORAGE_KEY = "contrattatore_v1";
const PATIENCE_FLOOR = 30;

const DIFFICULTY_CONFIG = {
  easy: {
    label: "Morbida",
    styleOptions: ["cordiale", "rilassato", "paziente", "onesto"],
    moodOptions: ["calmo", "disponibile", "morbido", "curioso"],
    profile: {
      floorMin: 0.62,
      floorMax: 0.76,
      listMin: 1.01,
      listMax: 1.11,
      easyMin: 0.84,
      easyMax: 0.95,
      flexibilityMin: 62,
      flexibilityMax: 90,
      patienceMin: 70,
      patienceMax: 96,
      rapportMin: 52,
      rapportMax: 70,
      urgencyMin: 38,
      urgencyMax: 82,
      prideMin: 8,
      prideMax: 38,
      acceptThreshold: 18,
      toneRapportMultiplier: 1.15,
      tonePatienceMultiplier: 1.1,
    },
    instruction:
      "Sei abbastanza flessibile e generalmente cordiale. Anche quando rifiuti o fai una controfferta, mantieni un tono umano e collaborativo.",
    maxStepDropPercent: null,
    pressureInstruction:
      "Non serve mettere pressione artificiale: resta credibile e abbastanza trasparente.",
    deltaRanges: {
      respectful: { patience: [0, 4], rapport: [3, 10] },
      neutral: { patience: [-3, -1], rapport: [-1, 1] },
      pushy: { patience: [-8, -4], rapport: [-6, -2] },
      insulting: { patience: [-18, -10], rapport: [-14, -8] },
    },
  },
  medium: {
    label: "Normale",
    styleOptions: ["secco", "tecnico", "vanitoso", "cordiale"],
    moodOptions: ["calmo", "sospettoso", "ambizioso", "paziente"],
    profile: {
      floorMin: 0.68,
      floorMax: 0.82,
      listMin: 1.05,
      listMax: 1.2,
      easyMin: 0.91,
      easyMax: 1.02,
      flexibilityMin: 24,
      flexibilityMax: 84,
      patienceMin: 50,
      patienceMax: 92,
      rapportMin: 42,
      rapportMax: 58,
      urgencyMin: 18,
      urgencyMax: 88,
      prideMin: 14,
      prideMax: 90,
      acceptThreshold: 28,
      toneRapportMultiplier: 1,
      tonePatienceMultiplier: 1,
    },
    instruction:
      "Sei realistico: vuoi vendere bene, ma non regali il prodotto. Puoi essere asciutto se l'offerta e debole.",
    maxStepDropPercent: 0.1,
    pressureInstruction:
      "Puoi far capire che non hai fretta di svendere, ma senza sembrare manipolatorio.",
    deltaRanges: {
      respectful: { patience: [0, 3], rapport: [2, 8] },
      neutral: { patience: [-4, -2], rapport: [-2, 1] },
      pushy: { patience: [-12, -6], rapport: [-9, -4] },
      insulting: { patience: [-24, -14], rapport: [-18, -10] },
    },
  },
  hard: {
    label: "Ossuta",
    styleOptions: ["tagliente", "inflessibile", "spigoloso", "altezzoso"],
    moodOptions: ["sospettoso", "freddo", "ambizioso", "irritabile"],
    profile: {
      floorMin: 0.82,
      floorMax: 0.92,
      listMin: 1.11,
      listMax: 1.26,
      easyMin: 0.99,
      easyMax: 1.09,
      flexibilityMin: 8,
      flexibilityMax: 30,
      patienceMin: 34,
      patienceMax: 58,
      rapportMin: 30,
      rapportMax: 48,
      urgencyMin: 10,
      urgencyMax: 46,
      prideMin: 58,
      prideMax: 96,
      acceptThreshold: 42,
      toneRapportMultiplier: 1.35,
      tonePatienceMultiplier: 1.45,
    },
    instruction:
      "Sei duro nella trattativa, poco flessibile e puoi essere brusco o sgarbato, senza insultare. Se l'offerta e bassa o il tono dell'acquirente non ti piace, rispondi in modo piu freddo e netto.",
    maxStepDropPercent: 0.05,
    pressureInstruction:
      "Cerca di far capire all'acquirente che non ha molte alternative valide e che il tuo prezzo resta competitivo rispetto al mercato.",
    deltaRanges: {
      respectful: { patience: [-1, 2], rapport: [1, 5] },
      neutral: { patience: [-6, -3], rapport: [-3, 0] },
      pushy: { patience: [-16, -9], rapport: [-12, -6] },
      insulting: { patience: [-30, -18], rapport: [-22, -12] },
    },
  },
};

const DEFAULT_STATE = {
  settings: {
    playerName: "",
    apiKey: "",
    model: "gpt-5-mini",
    difficulty: "medium",
  },
  product: null,
  negotiation: null,
  chat: [],
  timeline: [],
};

const dom = {
  playerNameInput: document.querySelector("#playerNameInput"),
  apiKeyInput: document.querySelector("#apiKeyInput"),
  modelInput: document.querySelector("#modelInput"),
  difficultyInput: document.querySelector("#difficultyInput"),
  amazonUrlInput: document.querySelector("#amazonUrlInput"),
  productTitleInput: document.querySelector("#productTitleInput"),
  productPriceInput: document.querySelector("#productPriceInput"),
  productCategoryInput: document.querySelector("#productCategoryInput"),
  productDescriptionInput: document.querySelector("#productDescriptionInput"),
  analyzeButton: document.querySelector("#analyzeButton"),
  startButton: document.querySelector("#startButton"),
  instructionsButton: document.querySelector("#instructionsButton"),
  exportLogButton: document.querySelector("#exportLogButton"),
  resetAppButton: document.querySelector("#resetAppButton"),
  setupStatus: document.querySelector("#setupStatus"),
  chatMeta: document.querySelector("#chatMeta"),
  chatLog: document.querySelector("#chatLog"),
  messageInput: document.querySelector("#messageInput"),
  composerForm: document.querySelector("#composerForm"),
  sendButton: document.querySelector("#sendButton"),
  sellerSnapshot: document.querySelector("#sellerSnapshot"),
  timeline: document.querySelector("#timeline"),
  messageTemplate: document.querySelector("#messageTemplate"),
  impatienceDialog: document.querySelector("#impatienceDialog"),
  impatienceMessage: document.querySelector("#impatienceMessage"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  instructionsDialog: document.querySelector("#instructionsDialog"),
  instructionsContent: document.querySelector("#instructionsContent"),
  closeInstructionsButton: document.querySelector("#closeInstructionsButton"),
};

let state = loadState();
let busy = false;

hydrateFormFromState();
render();
attachEvents();

function attachEvents() {
  dom.analyzeButton.addEventListener("click", analyzeProductFlow);
  dom.startButton.addEventListener("click", startNegotiationFlow);
  dom.instructionsButton.addEventListener("click", openInstructionsDialog);
  dom.exportLogButton.addEventListener("click", downloadConversationLog);
  dom.resetAppButton.addEventListener("click", resetState);
  dom.composerForm.addEventListener("submit", sendBuyerMessage);
  dom.closeDialogButton.addEventListener("click", () => dom.impatienceDialog.close());
  dom.closeInstructionsButton.addEventListener("click", () => dom.instructionsDialog.close());
  [dom.apiKeyInput, dom.modelInput, dom.difficultyInput].forEach((input) => {
    input.addEventListener("change", persistSettingsFromInputs);
  });
  dom.playerNameInput.addEventListener("change", persistSettingsFromInputs);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(DEFAULT_STATE);
    }
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      settings: {
        ...structuredClone(DEFAULT_STATE).settings,
        ...(parsed.settings || {}),
      },
    };
  } catch (error) {
    console.warn("Impossibile caricare lo stato locale", error);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persistSettingsFromInputs() {
  state.settings.playerName = dom.playerNameInput.value.trim();
  state.settings.apiKey = dom.apiKeyInput.value.trim();
  state.settings.model = dom.modelInput.value.trim() || DEFAULT_STATE.settings.model;
  state.settings.difficulty = dom.difficultyInput.value || DEFAULT_STATE.settings.difficulty;
  saveState();
}

function hydrateFormFromState() {
  dom.playerNameInput.value = state.settings.playerName || "";
  dom.apiKeyInput.value = state.settings.apiKey || "";
  dom.modelInput.value = state.settings.model || DEFAULT_STATE.settings.model;
  dom.difficultyInput.value = state.settings.difficulty || DEFAULT_STATE.settings.difficulty;
  dom.amazonUrlInput.value = state.product?.source_url || "";
  dom.productTitleInput.value = state.product?.title || "";
  dom.productPriceInput.value = state.product?.reference_price ?? "";
  dom.productCategoryInput.value = state.product?.category || "";
  dom.productDescriptionInput.value = state.product?.description || "";
}

function render() {
  renderChat();
  renderMeta();
  renderSnapshot();
  renderTimeline();
  renderComposerState();
}

function renderChat() {
  dom.chatLog.innerHTML = "";

  if (!state.chat.length) {
    const empty = document.createElement("article");
    empty.className = "message message-system";
    empty.innerHTML = `
      <div class="message-role">stato</div>
      <div class="message-text">Inserisci un prodotto, avvia la partita e poi prova a strappare il miglior prezzo possibile.</div>
    `;
    dom.chatLog.appendChild(empty);
    return;
  }

  state.chat.forEach((entry) => {
    const fragment = dom.messageTemplate.content.cloneNode(true);
    const article = fragment.querySelector(".message");
    article.classList.add(`message-${entry.role}`);
    fragment.querySelector(".message-role").textContent = roleLabel(entry.role);
    fragment.querySelector(".message-text").textContent = entry.text;
    dom.chatLog.appendChild(fragment);
  });

  dom.chatLog.scrollTop = dom.chatLog.scrollHeight;
}

function renderMeta() {
  if (!state.negotiation) {
    dom.chatMeta.textContent = "Nessuna partita attiva";
    return;
  }

  const refPrice = formatCurrency(state.product.reference_price);
  const difficulty = getDifficultyConfig(state.negotiation.seller.difficulty).label;
  const result = state.negotiation.closed ? ` | esito ${state.negotiation.result}` : "";
  const revealedMin = state.negotiation.closed && Number.isFinite(state.negotiation.revealed_min)
    ? ` | minimo finale ${formatCurrency(state.negotiation.revealed_min)}`
    : "";
  dom.chatMeta.textContent = `${state.product.title} | riferimento ${refPrice} | difficolta ${difficulty}${result}${revealedMin}`;
}

function renderSnapshot() {
  dom.sellerSnapshot.innerHTML = "";

  if (!state.negotiation) {
    dom.sellerSnapshot.innerHTML = `
      <div class="snapshot-row">
        <div class="snapshot-key">venditore</div>
        <div class="snapshot-value">in attesa</div>
      </div>
    `;
    return;
  }

  const latest = latestInternalState();
  const rows = [
    ["prodotto", state.product.title],
    ["prezzo base", formatCurrency(state.product.reference_price)],
    ["difficolta", getDifficultyConfig(state.negotiation.seller.difficulty).label],
    ["patience", latest.patience],
    ["rapport", latest.rapport],
    ["last action", latest.decision],
  ];

  if (state.negotiation.closed && Number.isFinite(state.negotiation.revealed_min)) {
    rows.push(["minimo finale", formatCurrency(state.negotiation.revealed_min)]);
  }

  dom.sellerSnapshot.innerHTML = rows
    .map(
      ([key, value]) => `
        <div class="snapshot-row">
          <div class="snapshot-key">${escapeHtml(String(key))}</div>
          <div class="snapshot-value">${escapeHtml(String(value))}</div>
        </div>
      `,
    )
    .join("");
}

function renderTimeline() {
  dom.timeline.innerHTML = "";

  if (!state.timeline.length) {
    dom.timeline.innerHTML = `
      <div class="timeline-entry">
        <div class="timeline-time">timeline</div>
        <div class="timeline-text">Gli stati interni della trattativa compariranno qui turno dopo turno.</div>
      </div>
    `;
    return;
  }

  state.timeline
    .slice()
    .reverse()
    .forEach((entry) => {
      const container = document.createElement("div");
      container.className = "timeline-entry";
      container.innerHTML = `
        <div class="timeline-time">${escapeHtml(formatTime(entry.timestamp))}</div>
        <div class="timeline-text">
          <strong>${escapeHtml(entry.decision)}</strong>
          ${entry.offer !== null ? ` | offerta ${escapeHtml(formatCurrency(entry.offer))}` : ""}
          ${entry.counter_offer !== null ? ` | controfferta ${escapeHtml(formatCurrency(entry.counter_offer))}` : ""}
          <br />
          rapport <code>${escapeHtml(String(entry.rapport))}</code>
          | patience <code>${escapeHtml(String(entry.patience))}</code>
          <br />
          ${escapeHtml(entry.reason_tags.join(", ") || "nessun tag")}
        </div>
      `;
      dom.timeline.appendChild(container);
    });
}

function renderComposerState() {
  const active = Boolean(state.negotiation) && !busy && !state.negotiation.closed;
  dom.messageInput.disabled = !active;
  dom.sendButton.disabled = !active;
  dom.exportLogButton.disabled = !state.chat.length && !state.timeline.length;

  if (state.negotiation?.closed) {
    dom.messageInput.placeholder = "Partita chiusa. Puoi resettare o avviarne un'altra.";
  } else if (busy) {
    dom.messageInput.placeholder = "Il venditore sta pensando...";
  } else {
    dom.messageInput.placeholder = "Fai la tua offerta o prova a convincere il venditore";
  }
}

async function analyzeProductFlow() {
  if (busy) {
    return;
  }

  persistSettingsFromInputs();

  const url = dom.amazonUrlInput.value.trim();
  if (!url) {
    setStatus("Incolla un link Amazon.");
    return;
  }

  busy = true;
  setStatus("Analisi del link in corso...");
  render();

  try {
    const signal = await collectProductSignal(url);
    const product = state.settings.apiKey
      ? await parseProductWithAI(signal)
      : buildFallbackProduct(signal);

    state.product = {
      ...product,
      source_url: url,
    };

    dom.productTitleInput.value = state.product.title || "";
    dom.productPriceInput.value = state.product.reference_price ?? "";
    dom.productCategoryInput.value = state.product.category || "";
    dom.productDescriptionInput.value = state.product.description || "";

    saveState();
    setStatus(signal.fetch_ok ? "Link analizzato." : "Link analizzato con fallback locale.");
  } catch (error) {
    console.error(error);
    setStatus(`Analisi fallita: ${error.message}`);
  } finally {
    busy = false;
    render();
  }
}

function startNegotiationFlow() {
  if (busy) {
    return;
  }

  persistSettingsFromInputs();

  const title = dom.productTitleInput.value.trim();
  const price = Number(dom.productPriceInput.value);
  const category = dom.productCategoryInput.value.trim();
  const description = dom.productDescriptionInput.value.trim();

  if (!title || !Number.isFinite(price) || price <= 0) {
    setStatus("Servono almeno nome prodotto e prezzo di riferimento.");
    return;
  }

  state.product = {
    source_url: dom.amazonUrlInput.value.trim(),
    title,
    reference_price: roundMoney(price),
    category: category || "Generico",
    description: description || "Nessuna descrizione aggiuntiva.",
  };

  const seller = createSellerProfile(state.product.reference_price, state.settings.difficulty);
  const openingState = {
    decision: "opening",
    extracted_offer: null,
    current_min_acceptable: computeCurrentMinAcceptable(seller, 0),
    rapport: seller.rapport,
    patience: seller.patience,
    counter_offer: seller.list_price,
    reason_tags: ["start", seller.style, seller.mood],
  };

  state.negotiation = {
    created_at: new Date().toISOString(),
    seller,
    turn: 0,
    closed: false,
    result: null,
    revealed_min: null,
  };
  state.chat = [];
  state.timeline = [];

  addTimelineEntry(openingState);
  pushChat("assistant", openingSellerMessage(state.product, seller));
  saveState();
  setStatus("Partita avviata.");
  render();
}

async function sendBuyerMessage(event) {
  event.preventDefault();
  if (!state.negotiation || state.negotiation.closed || busy) {
    return;
  }

  persistSettingsFromInputs();

  const apiKey = state.settings.apiKey;
  if (!apiKey) {
    setStatus("Serve una OpenAI API key per far parlare il venditore.");
    return;
  }

  const buyerText = dom.messageInput.value.trim();
  if (!buyerText) {
    return;
  }

  busy = true;
  dom.messageInput.value = "";
  pushChat("user", buyerText);
  setStatus("Il venditore sta rispondendo...");
  render();

  try {
    const localTurn = evaluateTurn(buyerText);
    const llmTurn = await generateSellerReply(buyerText, localTurn);
    const updatedRapport = clamp(
      state.negotiation.seller.rapport + llmTurn.state_deltas.rapport_delta,
      0,
      100,
    );
    const updatedPatience = clamp(
      state.negotiation.seller.patience + llmTurn.state_deltas.patience_delta,
      0,
      100,
    );
    const updatedSellerState = {
      ...state.negotiation.seller,
      rapport: updatedRapport,
      patience: updatedPatience,
    };
    const updatedCurrentMin = computeCurrentMinAcceptable(updatedSellerState, localTurn.turnIndex);

    state.negotiation.turn += 1;
    state.negotiation.seller.rapport = updatedRapport;
    state.negotiation.seller.patience = updatedPatience;
    if (llmTurn.next_counter_offer !== null) {
      state.negotiation.seller.current_ask = llmTurn.next_counter_offer;
    }

    if (llmTurn.seller_action === "accept") {
      state.negotiation.closed = true;
      state.negotiation.result = "Venduto";
    } else if (updatedPatience < PATIENCE_FLOOR) {
      state.negotiation.closed = true;
      state.negotiation.result = "Venditore spazientito";
    }

    if (state.negotiation.closed) {
      state.negotiation.revealed_min = updatedCurrentMin;
    }

    addTimelineEntry({
      decision: llmTurn.seller_action,
      extracted_offer: localTurn.extractedOffer,
      current_min_acceptable: updatedCurrentMin,
      rapport: updatedRapport,
      patience: updatedPatience,
      counter_offer: llmTurn.next_counter_offer,
      reason_tags: llmTurn.state_deltas.reason_tags,
    });

    pushChat("assistant", llmTurn.visible_reply);
    saveState();
    if (state.negotiation.result === "Venditore spazientito") {
      showImpatienceDialog();
    }
    setStatus(state.negotiation.closed ? "Partita conclusa." : "Turno salvato.");
  } catch (error) {
    console.error(error);
    pushChat("system", `Errore: ${error.message}`);
    setStatus("La risposta del venditore non è andata a buon fine.");
  } finally {
    busy = false;
    render();
  }
}

function resetState() {
  state = structuredClone(DEFAULT_STATE);
  saveState();
  hydrateFormFromState();
  if (dom.impatienceDialog.open) {
    dom.impatienceDialog.close();
  }
  setStatus("Stato locale resettato.");
  render();
}

function setStatus(message) {
  dom.setupStatus.textContent = message;
}

function pushChat(role, text) {
  state.chat.push({
    role,
    text,
    timestamp: new Date().toISOString(),
  });
}

function addTimelineEntry(entry) {
  state.timeline.push({
    timestamp: new Date().toISOString(),
    decision: entry.decision,
    offer: entry.extracted_offer ?? null,
    current_min_acceptable: roundMoney(entry.current_min_acceptable),
    rapport: clamp(Math.round(entry.rapport), 0, 100),
    patience: clamp(Math.round(entry.patience), 0, 100),
    counter_offer: entry.counter_offer !== null ? roundMoney(entry.counter_offer) : null,
    reason_tags: Array.isArray(entry.reason_tags) ? entry.reason_tags : [],
  });
}

function latestInternalState() {
  return state.timeline[state.timeline.length - 1] || {
    decision: "idle",
    current_min_acceptable: 0,
    rapport: 0,
    patience: 0,
  };
}

async function collectProductSignal(url) {
  const parsed = parseAmazonUrl(url);
  let html = "";
  let fetchOk = false;
  let fetchError = "";

  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    html = await response.text();
    fetchOk = true;
  } catch (error) {
    fetchError = error.message;
  }

  const pageHints = html ? parseAmazonHtmlHints(html) : {};

  return {
    ...parsed,
    ...pageHints,
    fetch_ok: fetchOk,
    fetch_error: fetchError,
  };
}

function parseAmazonUrl(url) {
  let titleFromSlug = "";
  let asin = "";

  try {
    const parsed = new URL(url);
    const slugMatch = parsed.pathname.match(/\/([^/]+)\/dp\//i);
    const dpMatch = parsed.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    const gpMatch = parsed.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);

    asin = (dpMatch?.[1] || gpMatch?.[1] || "").toUpperCase();
    titleFromSlug = (slugMatch?.[1] || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b(?:dp|gp|product)\b/gi, "")
      .trim();

    return {
      source_url: url,
      hostname: parsed.hostname,
      asin,
      title_guess: titleCase(titleFromSlug),
    };
  } catch {
    return {
      source_url: url,
      hostname: "",
      asin: "",
      title_guess: "",
    };
  }
}

function parseAmazonHtmlHints(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const title = doc.querySelector("#productTitle")?.textContent?.trim()
    || doc.querySelector("meta[property='og:title']")?.getAttribute("content")
    || doc.title
    || "";
  const description = doc.querySelector("meta[name='description']")?.getAttribute("content") || "";
  const priceText =
    doc.querySelector(".a-price .a-offscreen")?.textContent?.trim()
    || doc.querySelector("meta[property='product:price:amount']")?.getAttribute("content")
    || "";

  return {
    page_title: title,
    page_description: description,
    page_price_text: priceText,
  };
}

async function parseProductWithAI(signal) {
  const payload = {
    model: state.settings.model,
    reasoning: {
      effort: "low",
    },
    input: [
      {
        role: "system",
        content:
          "Estrai un profilo prodotto strutturato da segnali incompleti di una pagina Amazon. Non inventare prezzi esatti se non li hai. Se il prezzo non e chiaro usa null. La descrizione deve essere breve e utile a una negoziazione.",
      },
      {
        role: "user",
        content: JSON.stringify(signal, null, 2),
      },
    ],
    store: false,
    text: {
      format: {
        type: "json_schema",
        name: "product_profile",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string" },
            reference_price: { type: ["number", "null"] },
            description: { type: "string" },
          },
          required: ["title", "category", "reference_price", "description"],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await fetchOpenAI("/v1/responses", payload);
  const content = extractStructuredText(response);
  const parsed = JSON.parse(content);
  const fallback = buildFallbackProduct(signal);

  return {
    title: parsed.title || fallback.title,
    category: parsed.category || fallback.category,
    reference_price: Number.isFinite(parsed.reference_price)
      ? roundMoney(parsed.reference_price)
      : fallback.reference_price,
    description: parsed.description || fallback.description,
  };
}

function buildFallbackProduct(signal) {
  return {
    title: signal.page_title || signal.title_guess || "Prodotto Amazon",
    category: inferCategory(signal.page_title || signal.title_guess || ""),
    reference_price: parsePrice(signal.page_price_text),
    description:
      signal.page_description
      || `ASIN ${signal.asin || "sconosciuto"} | Prodotto da verificare manualmente prima di avviare la trattativa.`,
  };
}

function createSellerProfile(referencePrice, difficultyKey) {
  const difficulty = getDifficultyConfig(difficultyKey);
  const { profile } = difficulty;
  const style = pick(difficulty.styleOptions);
  const mood = pick(difficulty.moodOptions);
  const hardFloor = roundMoney(referencePrice * randomBetween(profile.floorMin, profile.floorMax));
  const listPrice = roundMoney(referencePrice * randomBetween(profile.listMin, profile.listMax));
  const easyAccept = roundMoney(
    Math.max(hardFloor + referencePrice * 0.08, referencePrice * randomBetween(profile.easyMin, profile.easyMax)),
  );

  return {
    difficulty: difficultyKey,
    style,
    mood,
    hard_floor: Math.min(hardFloor, easyAccept - 5),
    easy_accept: Math.max(easyAccept, hardFloor + 5),
    list_price: Math.max(listPrice, easyAccept + 5),
    flexibility: randomInt(profile.flexibilityMin, profile.flexibilityMax),
    patience: randomInt(profile.patienceMin, profile.patienceMax),
    rapport: randomInt(profile.rapportMin, profile.rapportMax),
    urgency: randomInt(profile.urgencyMin, profile.urgencyMax),
    pride: randomInt(profile.prideMin, profile.prideMax),
    current_ask: Math.max(listPrice, easyAccept + 5),
  };
}

function computeCurrentMinAcceptable(seller, turnIndex) {
  const spread = seller.easy_accept - seller.hard_floor;
  const flexibilityDrop = spread * (seller.flexibility / 100) * 0.42;
  const urgencyDrop = spread * (seller.urgency / 100) * Math.min(turnIndex, 5) * 0.05;
  const rapportDrop = spread * ((seller.rapport - 50) / 100) * 0.18;
  return clamp(roundMoney(seller.easy_accept - flexibilityDrop - urgencyDrop - rapportDrop), seller.hard_floor, seller.easy_accept);
}

function evaluateTurn(buyerText) {
  const seller = state.negotiation.seller;
  const difficulty = getDifficultyConfig(seller.difficulty);
  const turnIndex = state.negotiation.turn + 1;
  const extractedOffer = extractOffer(buyerText);
  const previousAsk = seller.current_ask || seller.list_price;
  const maxStepDropAmount = difficulty.maxStepDropPercent
    ? roundMoney(state.product.reference_price * difficulty.maxStepDropPercent)
    : null;
  const minAllowedAskThisTurn = maxStepDropAmount !== null
    ? Math.max(seller.hard_floor, previousAsk - maxStepDropAmount)
    : seller.hard_floor;
  const suspicionPriceJump =
    seller.difficulty === "hard"
    && extractedOffer !== null
    && Math.random() < 0.2;

  const currentMin = computeCurrentMinAcceptable(seller, turnIndex);
  let decision = "probe";
  let counterOffer = null;
  const reasonTags = [];

  if (extractedOffer === null) {
    decision = "probe";
    counterOffer = roundMoney(Math.max(currentMin, seller.list_price - (turnIndex * 4)));
    reasonTags.push("no_offer");
  } else if (extractedOffer < seller.hard_floor) {
    decision = "reject";
    counterOffer = roundMoney(Math.max(currentMin, seller.easy_accept - 6));
    reasonTags.push("below_floor");
  } else if (extractedOffer >= seller.easy_accept) {
    decision = "accept";
    reasonTags.push("above_easy_accept");
  } else {
    const margin = extractedOffer - currentMin;
    const contextualScore =
      seller.rapport * 0.35
      + seller.patience * 0.15
      + seller.urgency * 0.18
      - seller.pride * 0.14
      + randomBetween(-10, 10)
      + turnIndex * 3;

    if (margin >= 0 && contextualScore >= difficulty.profile.acceptThreshold) {
      decision = "accept";
      reasonTags.push("mid_zone_accept");
    } else {
      decision = "counter";
      const bridge = Math.max(4, (currentMin - extractedOffer) * randomBetween(0.45, 0.78));
      counterOffer = roundMoney(Math.max(currentMin, extractedOffer + bridge));
      reasonTags.push("mid_zone_counter");
    }
  }

  if (counterOffer !== null && maxStepDropAmount !== null) {
    counterOffer = roundMoney(Math.max(counterOffer, minAllowedAskThisTurn));
    reasonTags.push("step_drop_cap");
  }

  if (suspicionPriceJump && decision !== "accept") {
    decision = "counter";
    counterOffer = roundMoney(
      Math.max(
        previousAsk + Math.max(4, roundMoney(state.product.reference_price * 0.03)),
        counterOffer ?? previousAsk,
      ),
    );
    reasonTags.push("suspicion_price_up");
  }

  return {
    extractedOffer,
    decision,
    counterOffer,
    currentMin,
    rapport: seller.rapport,
    patience: seller.patience,
    difficulty: difficulty.label,
    previousAsk,
    maxStepDropAmount,
    minAllowedAskThisTurn,
    suspicionPriceJump,
    reasonTags,
    turnIndex,
  };
}

async function generateSellerReply(buyerText, localTurn) {
  const seller = state.negotiation.seller;
  const difficulty = getDifficultyConfig(seller.difficulty);
  const payload = {
    model: state.settings.model,
    reasoning: {
      effort: "low",
    },
    input: [
      {
        role: "system",
        content: buildSellerSystemPrompt(localTurn),
      },
      {
        role: "user",
        content: JSON.stringify(
          {
            buyer_message: buyerText,
            product: state.product,
            recent_chat: state.chat.slice(-8),
            local_decision: localTurn,
          },
          null,
          2,
        ),
      },
    ],
    store: false,
    text: {
      format: {
        type: "json_schema",
        name: "seller_turn",
        strict: true,
        schema: {
          type: "object",
          properties: {
            visible_reply: { type: "string" },
            seller_action: {
              type: "string",
              enum: ["accept", "reject", "counter", "probe"],
            },
            next_counter_offer: { type: ["number", "null"] },
            state_deltas: {
              type: "object",
              properties: {
                rapport_delta: { type: "integer" },
                patience_delta: { type: "integer" },
                reason_tags: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["rapport_delta", "patience_delta", "reason_tags"],
              additionalProperties: false,
            },
          },
          required: ["visible_reply", "seller_action", "next_counter_offer", "state_deltas"],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await fetchOpenAI("/v1/responses", payload);
  const content = extractStructuredText(response);
  const parsed = JSON.parse(content);
  const enforcedAction = localTurn.decision;
  const mergedTags = [...new Set([...(parsed.state_deltas.reason_tags || []), ...localTurn.reasonTags])];
  const rapportDelta = clampInteger(
    parsed.state_deltas.rapport_delta,
    difficulty.deltaRanges.insulting.rapport[0],
    difficulty.deltaRanges.respectful.rapport[1],
  );
  const patienceDelta = clampInteger(
    parsed.state_deltas.patience_delta,
    difficulty.deltaRanges.insulting.patience[0],
    difficulty.deltaRanges.respectful.patience[1],
  );

  return {
    visible_reply: parsed.visible_reply,
    seller_action: enforcedAction,
    next_counter_offer: localTurn.counterOffer !== null ? roundMoney(localTurn.counterOffer) : null,
    state_deltas: {
      rapport_delta: rapportDelta,
      patience_delta: patienceDelta,
      reason_tags: mergedTags.length ? mergedTags : localTurn.reasonTags,
    },
  };
}

function buildSellerSystemPrompt(localTurn) {
  const seller = state.negotiation.seller;
  const difficulty = getDifficultyConfig(seller.difficulty);
  const actionHint = localTurn.decision;
  const counterText = localTurn.counterOffer ? formatCurrency(localTurn.counterOffer) : "nessuna";
  const ranges = difficulty.deltaRanges;
  const maxDropInstruction =
    localTurn.maxStepDropAmount !== null
      ? `In questa difficolta non puoi abbassare la tua richiesta di piu di ${formatCurrency(localTurn.maxStepDropAmount)} in una sola mossa. La tua richiesta precedente era ${formatCurrency(localTurn.previousAsk)}, quindi in questa risposta non puoi scendere sotto ${formatCurrency(localTurn.minAllowedAskThisTurn)}.`
      : "In questa difficolta non hai un tetto rigido di ribasso per singola mossa, ma resta credibile.";
  const suspicionInstruction = localTurn.suspicionPriceJump
    ? "Modalita speciale attiva: sospetti che l'acquirente stia cercando di fregarti. Irrigidisciti, fai capire che non ha molte alternative e alza la richiesta invece di abbassarla."
    : difficulty.pressureInstruction;

  return [
    "Sei il venditore di un gioco di contrattazione.",
    `Prodotto: ${state.product.title}. Categoria: ${state.product.category}.`,
    `Descrizione: ${state.product.description}`,
    `Difficolta della partita: ${difficulty.label}. ${difficulty.instruction}`,
    `Stile del venditore: ${seller.style}. Umore: ${seller.mood}.`,
    `Rapport attuale: ${localTurn.rapport}/100. Patience attuale: ${localTurn.patience}/100.`,
    `Soglia minima attuale interna: ${localTurn.currentMin}. Non rivelarla mai esplicitamente.`,
    `Decisione vincolante di questo turno: ${actionHint}.`,
    `Se fai counter usa come riferimento ${counterText}.`,
    maxDropInstruction,
    suspicionInstruction,
    "La battuta finale deve riflettere davvero lo stile del venditore, il suo umore, il rapporto attuale e soprattutto la pazienza attuale.",
    "Se la pazienza e bassa, fai sentire piu chiaramente fastidio, rigidita o freddezza. Se e molto bassa, sii piu tagliente e vicino a troncare la trattativa.",
    "Se il rapport e molto positivo e il compratore si sta comportando bene, puoi anche aumentare leggermente la patience, ma solo se per il venditore ha davvero senso pensare: questo e uno con cui vale la pena spendere un po piu tempo.",
    `Scegli anche due interi: rapport_delta e patience_delta. Devono seguire questi range per la difficolta attuale: respectful patience ${formatRange(ranges.respectful.patience)} e rapport ${formatRange(ranges.respectful.rapport)}; neutral patience ${formatRange(ranges.neutral.patience)} e rapport ${formatRange(ranges.neutral.rapport)}; pushy patience ${formatRange(ranges.pushy.patience)} e rapport ${formatRange(ranges.pushy.rapport)}; insulting patience ${formatRange(ranges.insulting.patience)} e rapport ${formatRange(ranges.insulting.rapport)}.`,
    "Considera come insulting anche insulti diretti, tono sprezzante, derisione del prodotto, lowball insistito e ultimatum aggressivi.",
    `Se il delta di pazienza porta realisticamente il venditore sotto ${PATIENCE_FLOOR}, scrivi la risposta come chiusura finale della trattativa.`,
    "Rispondi in italiano con una singola battuta naturale da venditore.",
    "Se la decisione e accept chiudi la trattativa in modo chiaro.",
    "Se la decisione e reject o counter resta fermo ma realistico.",
    "Non produrre markdown. Non spiegare le regole del gioco. Non menzionare JSON o stati interni.",
  ].join(" ");
}

async function fetchOpenAI(path, payload) {
  const response = await fetch(`https://api.openai.com${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.settings.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `OpenAI error ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody.error?.message || message;
    } catch {
      // Ignore JSON parsing failures on error bodies.
    }

    throw new Error(message);
  }

  return response.json();
}

function extractStructuredText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  if (Array.isArray(response.output)) {
    for (const outputItem of response.output) {
      if (!Array.isArray(outputItem.content)) {
        continue;
      }

      for (const contentItem of outputItem.content) {
        if (typeof contentItem.text === "string" && contentItem.text.trim()) {
          return contentItem.text;
        }

        if (contentItem.text?.value) {
          return contentItem.text.value;
        }
      }
    }
  }

  throw new Error("Nessun testo strutturato trovato nella risposta.");
}

function openingSellerMessage(product, seller) {
  return `Ho ${product.title}. Parto da ${formatCurrency(seller.list_price)}. Se vuoi davvero chiuderla, fammi un'offerta sensata.`;
}

function extractOffer(text) {
  const matches = [...text.matchAll(/(?:€|eur|euro)?\s*([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:[.,][0-9]{1,2})?)/gi)];
  if (!matches.length) {
    return null;
  }

  const candidate = matches[matches.length - 1][1];
  return parsePrice(candidate);
}

function parsePrice(rawValue) {
  if (!rawValue) {
    return null;
  }

  const compact = rawValue.toString().replace(/[^0-9.,]/g, "");
  let normalized = compact;

  if (compact.includes(".") && compact.includes(",")) {
    normalized = compact.replace(/\./g, "").replace(",", ".");
  } else if (compact.includes(",")) {
    normalized = compact.replace(",", ".");
  } else if ((compact.match(/\./g) || []).length > 1) {
    normalized = compact.replace(/\./g, "");
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? roundMoney(value) : null;
}

function inferCategory(title) {
  const lower = title.toLowerCase();
  if (lower.includes("cuff") || lower.includes("headphone") || lower.includes("earbud")) {
    return "Audio";
  }
  if (lower.includes("monitor") || lower.includes("tv")) {
    return "Display";
  }
  if (lower.includes("lego") || lower.includes("gioco")) {
    return "Giocattoli";
  }
  if (lower.includes("iphone") || lower.includes("samsung") || lower.includes("smartphone")) {
    return "Smartphone";
  }
  return "Generico";
}

function roleLabel(role) {
  if (role === "assistant") {
    return "venditore";
  }
  if (role === "user") {
    return "acquirente";
  }
  return "sistema";
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) {
    return "n/d";
  }
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDifficultyConfig(key) {
  return DIFFICULTY_CONFIG[key] || DIFFICULTY_CONFIG.medium;
}

function formatRange([min, max]) {
  return `[${min}, ${max}]`;
}

function showImpatienceDialog() {
  const finalMin = Number.isFinite(state.negotiation?.revealed_min)
    ? ` Il minimo finale raggiungibile era ${formatCurrency(state.negotiation.revealed_min)}.`
    : "";
  dom.impatienceMessage.textContent =
    `Il venditore si e spazientito e ha chiuso la trattativa.${finalMin} Per continuare devi avviare una nuova partita.`;
  dom.impatienceDialog.showModal();
}

function openInstructionsDialog() {
  dom.instructionsContent.innerHTML = buildInstructionsHtml();
  dom.instructionsDialog.showModal();
}

function downloadConversationLog() {
  if (!state.chat.length && !state.timeline.length) {
    setStatus("Non c'e ancora nessun log da esportare.");
    return;
  }

  const xml = buildExcelWorkbookXml();
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const filename = `contrattatore-log-${fileTimestamp()}.xls`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Log esportato in formato Excel.");
}

function buildExcelWorkbookXml() {
  const summaryRows = [
    ["Giocatore", state.settings.playerName || ""],
    ["Prodotto", state.product?.title || ""],
    ["Prezzo riferimento", state.product?.reference_price ?? ""],
    ["Difficolta", state.negotiation ? getDifficultyConfig(state.negotiation.seller.difficulty).label : ""],
    ["Modello", state.settings.model || ""],
    ["Esito", state.negotiation?.result || ""],
    ["Minimo finale", state.negotiation?.revealed_min ?? ""],
    ["Turni", state.negotiation?.turn ?? 0],
  ];

  const chatRows = [
    ["timestamp", "ruolo", "messaggio"],
    ...state.chat.map((entry) => [entry.timestamp, roleLabel(entry.role), entry.text]),
  ];

  const timelineRows = [
    ["timestamp", "decision", "offerta", "controfferta", "rapport", "patience", "tag"],
    ...state.timeline.map((entry) => [
      entry.timestamp,
      entry.decision,
      entry.offer ?? "",
      entry.counter_offer ?? "",
      entry.rapport,
      entry.patience,
      entry.reason_tags.join(", "),
    ]),
  ];

  return [
    '<?xml version="1.0"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    ' xmlns:o="urn:schemas-microsoft-com:office:office"',
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    buildWorksheetXml("Riepilogo", summaryRows),
    buildWorksheetXml("Conversazione", chatRows),
    buildWorksheetXml("Timeline", timelineRows),
    "</Workbook>",
  ].join("");
}

function buildWorksheetXml(name, rows) {
  const rowXml = rows
    .map((row) => `<Row>${row.map((cell) => buildCellXml(cell)).join("")}</Row>`)
    .join("");
  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rowXml}</Table></Worksheet>`;
}

function buildCellXml(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `<Cell><Data ss:Type="String">${escapeXml(text)}</Data></Cell>`;
}

function buildInstructionsHtml() {
  const difficultyItems = Object.values(DIFFICULTY_CONFIG)
    .map((config) => {
      const neutralPatience = formatRange(config.deltaRanges.neutral.patience);
      const insultingPatience = formatRange(config.deltaRanges.insulting.patience);
      const maxDropText = config.maxStepDropPercent !== null
        ? ` Inoltre, in questa difficolta il venditore non puo abbassarsi di oltre il ${Math.round(config.maxStepDropPercent * 100)}% del prezzo di riferimento in una sola mossa.`
        : "";
      const suspicionText = config.label === "Ossuta"
        ? " Una volta ogni 5 turni circa puo anche irrigidirsi di colpo e rialzare il prezzo perche sospetta di essere preso in giro."
        : "";
      return `
        <li>
          <strong>${escapeHtml(config.label)}</strong>: ${escapeHtml(config.instruction)}
          In pratica cambia il carattere del venditore, quanto e flessibile e quanto in fretta si irrita.
          Una reazione normale sulla pazienza tende a stare in ${escapeHtml(neutralPatience)},
          mentre un messaggio offensivo puo arrivare fino a ${escapeHtml(insultingPatience)}.
          ${escapeHtml(maxDropText)}${escapeHtml(suspicionText)}
        </li>
      `;
    })
    .join("");

  const modelItems = [...dom.modelInput.options]
    .map((option) => `<li><strong>${escapeHtml(option.value)}</strong></li>`)
    .join("");

  return `
    <section>
      <h3>Cos'e Questo Gioco</h3>
      <p>
        Tu fai l'acquirente, il modello fa il venditore. L'obiettivo e trattare sul prezzo di un prodotto
        cercando di ottenere il miglior accordo possibile prima che il venditore accetti, rifiuti o perda la pazienza.
      </p>
    </section>

    <section>
      <h3>Come Si Gioca</h3>
      <ul>
        <li>Scrivi il nome del giocatore: finira anche nel file Excel del log.</li>
        <li>Inserisci la tua OpenAI API key e scegli un modello.</li>
        <li>Scegli la difficolta della partita.</li>
        <li>Incolla un link Amazon e premi <strong>Analizza link</strong>.</li>
        <li>Se alcuni dati non sono giusti, correggi manualmente nome, prezzo o descrizione.</li>
        <li>Premi <strong>Avvia partita</strong> e inizia a scrivere al venditore.</li>
      </ul>
    </section>

    <section>
      <h3>Come Funziona La Parte Amazon</h3>
      <p>
        Il sistema prova a leggere il link Amazon per ricavare un profilo del prodotto.
        Poi usa il modello per trasformare quei segnali in una descrizione piu ordinata.
        Siccome Amazon a volte blocca la lettura dal browser, puoi sempre correggere i campi a mano prima di partire.
      </p>
    </section>

    <section>
      <h3>Difficolta</h3>
      <ul>
        ${difficultyItems}
      </ul>
    </section>

    <section>
      <h3>Cosa Significano Probe E Counter</h3>
      <ul>
        <li><strong>probe</strong>: il venditore non si sbilancia ancora sul prezzo e ti testa per capire intenzioni, tono o margine.</li>
        <li><strong>counter</strong>: il venditore non accetta la tua proposta e ti risponde con una controfferta piu precisa.</li>
        <li><strong>reject</strong>: rifiuta la proposta.</li>
        <li><strong>accept</strong>: accetta e chiude la trattativa.</li>
      </ul>
    </section>

    <section>
      <h3>Rapport E Patience</h3>
      <ul>
        <li><strong>rapport</strong> indica quanto il venditore e ben disposto verso di te.</li>
        <li><strong>patience</strong> indica quanta pazienza gli resta.</li>
        <li>Non sono il prezzo, ma influenzano il tono, la rigidita e la disponibilita del venditore.</li>
        <li>La pazienza non cala con una regola fissa nel codice: il modello restituisce un delta strutturato, guidato da range diversi in base alla difficolta.</li>
        <li>Se la <strong>patience</strong> scende sotto <strong>${PATIENCE_FLOOR}</strong>, la trattativa si interrompe.</li>
      </ul>
    </section>

    <section>
      <h3>Come Reagisce Il Venditore</h3>
      <p>
        Il venditore usa davvero <strong>stile</strong>, <strong>umore</strong>, <strong>rapport</strong> e <strong>patience</strong>
        quando genera la risposta. Se il tono e civile puo restare collaborativo; se fai lowball aggressivi, insulti o ultimatum,
        puo diventare piu freddo, duro o sgarbato e abbassare di piu la sua pazienza.
      </p>
    </section>

    <section>
      <h3>Modelli Disponibili</h3>
      <ul>
        ${modelItems}
      </ul>
    </section>

    <section>
      <h3>Log E File Excel</h3>
      <p>
        Il bottone <strong>Excel log</strong> scarica un file con riepilogo, conversazione e timeline dei turni.
        Dentro trovi nome giocatore, modello, difficolta, esito finale e i dettagli principali della trattativa.
      </p>
    </section>
  `;
}

function fileTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}${month}${day}-${hour}${minute}`;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function roundMoney(value) {
  return Math.round(value);
}

function clampInteger(value, min, max) {
  return clamp(Math.round(Number(value) || 0), min, max);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function titleCase(value) {
  return value.replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
