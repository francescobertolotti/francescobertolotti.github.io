const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwf7NsxyDTqSs0p6PM4g6_BcK24DYX-sK8mEhIenIf0EB3l7fPvmBF1hT3Gi1-o_CEr/exec";

const state = {
  total: 0,
  items: [],
  responses: new Map(),
  sending: false,
  submitted: false,
};

const elements = {
  edition: document.querySelector("#edition"),
  firstName: document.querySelector("#first-name"),
  lastName: document.querySelector("#last-name"),
  progress: document.querySelector("#progress"),
  sendButton: document.querySelector("#send-button"),
  sendStatus: document.querySelector("#send-status"),
  loading: document.querySelector("#loading"),
  newsList: document.querySelector("#news-list"),
  errorPanel: document.querySelector("#error-panel"),
  errorMessage: document.querySelector("#error-message"),
  retryButton: document.querySelector("#retry-button"),
  template: document.querySelector("#news-template"),
};

const italianDate = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});

function parseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "data non disponibile";
  return italianDate.format(date);
}

function setSendStatus(message, status = "") {
  elements.sendStatus.textContent = message;
  elements.sendStatus.dataset.state = status;
}

function updateSubmissionState() {
  const hasIdentity = elements.firstName.value.trim() && elements.lastName.value.trim();
  const hasAllResponses = state.total > 0 && state.responses.size === state.total;
  const ready = hasIdentity && hasAllResponses;

  elements.sendButton.disabled = state.sending || state.submitted || !ready;
  elements.sendButton.textContent = state.sending
    ? "Invio in corso…"
    : state.submitted
      ? "Risposte inviate"
      : "Invia a Google Sheets";

  if (state.sending || state.submitted) return;
  if (!hasIdentity) setSendStatus("Inserisci nome e cognome.");
  else if (!hasAllResponses) setSendStatus(`Conferma ancora ${state.total - state.responses.size} valutazioni.`);
  else setSendStatus("Tutto pronto per l’invio.");
}

function updateProgress() {
  const completed = state.responses.size;
  elements.progress.textContent = `${completed} di ${state.total} notizie valutate in questa sessione`;
  updateSubmissionState();
}

function connectRating(input, output) {
  const showValue = () => {
    output.value = `${input.value}/100`;
    output.textContent = output.value;
  };

  input.addEventListener("input", showValue);
  showValue();
}

function renderNewsItem(item, index) {
  const fragment = elements.template.content.cloneNode(true);
  const article = fragment.querySelector("article");
  const headline = fragment.querySelector(".headline");
  const publishedAt = fragment.querySelector(".published-at");
  const politicsBadge = fragment.querySelector(".politics-badge");
  const form = fragment.querySelector("form");
  const surpriseInput = fragment.querySelector(".surprise-input");
  const truthInput = fragment.querySelector(".truth-input");
  const surpriseValue = fragment.querySelector(".surprise-value");
  const truthValue = fragment.querySelector(".truth-value");
  const message = fragment.querySelector(".form-message");
  const button = fragment.querySelector("button");
  const id = String(item.id || index);
  const headingId = `notizia-${item.id || index}`;

  article.setAttribute("aria-labelledby", headingId);
  headline.id = headingId;
  headline.textContent = item.headline || "Titolo non disponibile";
  fragment.querySelector(".region").textContent = item.region || item.country || "Mondo";
  fragment.querySelector(".category").textContent = item.category || "Attualità";
  fragment.querySelector(".summary").textContent = item.summary || "";
  fragment.querySelector(".article-body").textContent = item.body || "";

  if (item.political === true) politicsBadge.hidden = false;

  publishedAt.dateTime = item.publishedAt || "";
  publishedAt.textContent = parseDate(item.publishedAt);
  connectRating(surpriseInput, surpriseValue);
  connectRating(truthInput, truthValue);

  const invalidateResponse = () => {
    if (!state.responses.delete(id)) return;
    state.submitted = false;
    message.textContent = "Valutazione modificata: confermala di nuovo.";
    button.textContent = "Conferma valutazione";
    updateProgress();
  };

  surpriseInput.addEventListener("input", invalidateResponse);
  truthInput.addEventListener("input", invalidateResponse);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    state.responses.set(id, {
      newsId: id,
      headline: item.headline || "",
      region: item.region || "",
      category: item.category || "",
      publishedAt: item.publishedAt || "",
      surprise: Number(surpriseInput.value),
      perceivedTruth: Number(truthInput.value),
      recordedAt: new Date().toISOString(),
    });

    state.submitted = false;
    message.textContent = "Valutazione registrata nella sessione corrente.";
    button.textContent = "Aggiorna valutazione";
    updateProgress();
  });

  return fragment;
}

async function submitResponses() {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(APPS_SCRIPT_URL)) {
    setSendStatus("Collegamento a Google Sheets non configurato: inserisci l’URL /exec in app.js.", "error");
    return;
  }

  state.sending = true;
  updateSubmissionState();

  const payload = {
    submissionId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    nome: elements.firstName.value.trim(),
    cognome: elements.lastName.value.trim(),
    editionDate: italianDate.format(new Date()),
    submittedAt: new Date().toISOString(),
    risposte: state.items.map((item) => state.responses.get(String(item.id))),
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    state.submitted = true;
    setSendStatus("Risposte inviate. Puoi chiudere la pagina.", "success");
  } catch {
    setSendStatus("Invio non riuscito. Controlla la connessione e riprova.", "error");
  } finally {
    state.sending = false;
    updateSubmissionState();
  }
}

function validateEdition(data) {
  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("Il file news.json non contiene un elenco di notizie valido.");
  }

  const ids = data.items.map((item) => String(item.id || ""));
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) {
    throw new Error("Ogni notizia deve avere un id univoco.");
  }
}

async function loadNews() {
  elements.loading.hidden = false;
  elements.newsList.hidden = true;
  elements.errorPanel.hidden = true;

  try {
    const response = await fetch("./news.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Il server ha risposto con stato ${response.status}.`);

    const data = await response.json();
    validateEdition(data);

    state.total = data.items.length;
    state.items = data.items;
    state.responses.clear();
    state.submitted = false;
    elements.edition.textContent = italianDate.format(new Date());
    elements.newsList.replaceChildren(...data.items.map(renderNewsItem));
    elements.loading.hidden = true;
    elements.newsList.hidden = false;
    updateProgress();
  } catch (error) {
    elements.loading.hidden = true;
    elements.errorPanel.hidden = false;
    elements.errorMessage.textContent = `${error.message} Avvia il sito tramite un server statico e riprova.`;
    elements.progress.textContent = "Notizie non caricate";
  }
}

elements.retryButton.addEventListener("click", loadNews);
elements.sendButton.addEventListener("click", submitResponses);
[elements.firstName, elements.lastName].forEach((input) => {
  input.addEventListener("input", () => {
    state.submitted = false;
    updateSubmissionState();
  });
});
loadNews();
