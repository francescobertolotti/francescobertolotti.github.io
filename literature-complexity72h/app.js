const state = {
  query: "",
  sort: "year-desc",
  activeCategories: new Set(),
  activeKeywords: new Set(),
};

const elements = {
  searchInput: document.querySelector("#search-input"),
  sortSelect: document.querySelector("#sort-select"),
  resetButton: document.querySelector("#reset-filters"),
  categoryFilters: document.querySelector("#category-filters"),
  keywordFilters: document.querySelector("#keyword-filters"),
  resultsCount: document.querySelector("#results-count"),
  paperList: document.querySelector("#paper-list"),
  summaryModal: document.querySelector("#summary-modal"),
  summaryClose: document.querySelector("#summary-close"),
  summaryTitle: document.querySelector("#summary-modal-title"),
  summaryContent: document.querySelector("#summary-content"),
};

const dataset = window.PAPER_LIBRARY_DATA || null;
const keywordCatalog =
  dataset && Array.isArray(dataset.papers) ? buildKeywordCatalog(dataset.papers) : [];

if (!dataset || !Array.isArray(dataset.papers)) {
  elements.paperList.innerHTML =
    '<p class="empty-note">Paper data is not available. Rebuild the site folder.</p>';
} else {
  bindControls();
  renderCategories(dataset.categories || []);
  renderKeywords(keywordCatalog);
  render();
}

function bindControls() {
  elements.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  elements.resetButton.addEventListener("click", () => {
    state.query = "";
    state.sort = "year-desc";
    state.activeCategories.clear();
    state.activeKeywords.clear();
    elements.searchInput.value = "";
    elements.sortSelect.value = "year-desc";
    renderCategories(dataset.categories || []);
    renderKeywords(keywordCatalog);
    render();
  });

  elements.summaryClose.addEventListener("click", closeSummaryModal);
  elements.summaryModal.addEventListener("click", (event) => {
    if (event.target.dataset.closeSummary === "true") {
      closeSummaryModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.summaryModal.hidden) {
      closeSummaryModal();
    }
  });
}

function renderCategories(categories) {
  elements.categoryFilters.replaceChildren();

  for (const category of categories) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-filter";
    button.dataset.active = String(state.activeCategories.has(category.slug));

    const label = document.createElement("span");
    label.textContent = category.label;

    const count = document.createElement("span");
    count.className = "category-count";
    count.textContent = category.count;

    button.append(label, count);
    button.addEventListener("click", () => {
      if (state.activeCategories.has(category.slug)) {
        state.activeCategories.delete(category.slug);
      } else {
        state.activeCategories.add(category.slug);
      }
      renderCategories(categories);
      render();
    });

    elements.categoryFilters.append(button);
  }
}

function renderKeywords(keywords) {
  elements.keywordFilters.replaceChildren();

  if (keywords.length === 0) {
    const note = document.createElement("span");
    note.className = "empty-note";
    note.textContent = "Keyword unavailable";
    elements.keywordFilters.append(note);
    return;
  }

  for (const keyword of keywords) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-filter";
    button.dataset.active = String(state.activeKeywords.has(keyword.label));

    const label = document.createElement("span");
    label.textContent = keyword.label;

    const count = document.createElement("span");
    count.className = "category-count";
    count.textContent = keyword.count;

    button.append(label, count);
    button.addEventListener("click", () => {
      if (state.activeKeywords.has(keyword.label)) {
        state.activeKeywords.delete(keyword.label);
      } else {
        state.activeKeywords.add(keyword.label);
      }
      renderKeywords(keywords);
      render();
    });

    elements.keywordFilters.append(button);
  }
}

function render() {
  const papers = filterAndSort(dataset.papers);
  elements.resultsCount.textContent = `${papers.length} / ${dataset.paperCount} paper`;
  elements.paperList.replaceChildren();

  for (const paper of papers) {
    elements.paperList.append(renderPaperRow(paper));
  }
}

function filterAndSort(papers) {
  const filtered = papers.filter(
    (paper) => matchesSearch(paper) && matchesCategories(paper) && matchesKeywords(paper)
  );
  return filtered.sort(comparePapers);
}

function matchesSearch(paper) {
  if (!state.query) {
    return true;
  }

  const haystack = [
    paper.key,
    paper.title,
    paper.authors,
    paper.source,
    ...(paper.categories || []),
    ...(paper.keywords || []),
    paper.abstract || "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(state.query);
}

function matchesCategories(paper) {
  if (state.activeCategories.size === 0) {
    return true;
  }

  return (paper.categories || []).some((category) => state.activeCategories.has(category));
}

function matchesKeywords(paper) {
  if (state.activeKeywords.size === 0) {
    return true;
  }

  return (paper.keywords || []).some((keyword) => state.activeKeywords.has(keyword));
}

function comparePapers(left, right) {
  if (state.sort === "title-asc") {
    return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
  }

  const leftYear = normalizeYear(left.year);
  const rightYear = normalizeYear(right.year);

  if (state.sort === "year-asc") {
    if (leftYear !== rightYear) {
      return leftYear - rightYear;
    }
  } else if (leftYear !== rightYear) {
    return rightYear - leftYear;
  }

  return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
}

function normalizeYear(value) {
  const year = Number.parseInt(String(value), 10);
  return Number.isFinite(year) ? year : 0;
}

function renderPaperRow(paper) {
  const row = document.createElement("article");
  row.className = "paper-row";

  const year = document.createElement("div");
  year.className = "paper-year";
  year.textContent = paper.year || "N/A";

  const main = document.createElement("div");
  main.className = "paper-main";

  const title = document.createElement("a");
  title.className = "paper-title";
  title.href = pdfHref(paper.pdfFilename);
  title.target = "_blank";
  title.rel = "noopener noreferrer";
  title.textContent = paper.title;

  const meta = document.createElement("div");
  meta.className = "paper-meta";
  meta.append(
    renderMetaLine("Authors", paper.authors || "N/A"),
    renderMetaLine("Source", paper.source || "N/A"),
    renderMetaLine("Keywords", (paper.keywords || []).join("; ") || "N/A")
  );

  const categories = document.createElement("div");
  categories.className = "paper-categories";
  if ((paper.categories || []).length > 0) {
    for (const category of paper.categories) {
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = "category-tag";
      tag.textContent = category;
      tag.addEventListener("click", () => {
        if (state.activeCategories.has(category)) {
          state.activeCategories.delete(category);
        } else {
          state.activeCategories.add(category);
        }
        renderCategories(dataset.categories || []);
        render();
      });
      categories.append(tag);
    }
  } else {
    const missing = document.createElement("span");
    missing.className = "empty-note";
    missing.textContent = "Category unavailable";
    categories.append(missing);
  }

  const details = document.createElement("details");
  details.className = "abstract-details";

  const summary = document.createElement("summary");
  summary.className = "details-toggle";
  summary.textContent = "Abstract";

  const abstractBody = document.createElement("div");
  abstractBody.className = "abstract-body";
  abstractBody.textContent = paper.abstract || "Abstract unavailable.";

  details.append(summary, abstractBody);
  main.append(title, meta, categories, details);

  const actions = document.createElement("div");
  actions.className = "paper-actions";
  actions.append(
    renderActionLink("PDF", pdfHref(paper.pdfFilename), true),
    renderActionButton("Summary", () => openSummary(paper), !paper.summaryAvailable),
    renderActionButton("Copy BibTeX", () => copyBibtexEntry(paper))
  );

  row.append(year, main, actions);
  return row;
}

function renderMetaLine(label, value) {
  const line = document.createElement("div");
  line.className = "meta-line";

  const metaLabel = document.createElement("span");
  metaLabel.className = "meta-label";
  metaLabel.textContent = `${label}: `;

  const text = document.createElement("span");
  text.textContent = value;

  line.append(metaLabel, text);
  return line;
}

function renderActionLink(label, href, isExternal) {
  const link = document.createElement("a");
  link.className = "action-link";
  link.href = href;
  link.textContent = label;

  if (isExternal) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  return link;
}

function renderActionButton(label, onClick, isDisabled = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "action-link";
  button.textContent = label;
  button.disabled = Boolean(isDisabled);
  if (!isDisabled) {
    button.addEventListener("click", onClick);
  }
  return button;
}

async function copyBibtexEntry(paper) {
  const value = paper.bibtex || fallbackBibtex(paper);
  try {
    await navigator.clipboard.writeText(value);
  } catch (error) {
    window.prompt("Copy the BibTeX entry:", value);
  }
}

function fallbackBibtex(paper) {
  const authors = paper.authors || "";
  const title = paper.title || "";
  const source = paper.source || "";
  const year = paper.year || "";
  return [
    `@misc{${paper.key || "reference"},`,
    `  author = {${authors}},`,
    `  title = {${title}},`,
    `  year = {${year}},`,
    `  note = {${source}}`,
    `}`,
  ].join("\n");
}

async function openSummary(paper) {
  elements.summaryTitle.textContent = paper.title || "Paper summary";
  elements.summaryContent.replaceChildren();
  elements.summaryContent.classList.remove("summary-content-frame");
  const status = renderStatusMessage("Loading summary...");
  const frame = document.createElement("iframe");
  frame.className = "summary-frame";
  frame.title = `${paper.title || "Paper"} summary`;
  frame.loading = "eager";
  frame.hidden = true;

  frame.addEventListener("load", () => {
    if (elements.summaryContent.contains(status)) {
      status.remove();
    }
    frame.hidden = false;
    elements.summaryContent.classList.add("summary-content-frame");
  });

  frame.addEventListener("error", () => {
    elements.summaryContent.classList.remove("summary-content-frame");
    elements.summaryContent.replaceChildren(
      renderStatusMessage("Summary unavailable for this paper.")
    );
  });

  frame.src = summaryPageHref(paper.summaryPageFilename || `${paper.key}.html`);
  elements.summaryContent.append(status, frame);
  elements.summaryModal.hidden = false;
  document.body.classList.add("summary-open");
}

function closeSummaryModal() {
  elements.summaryModal.hidden = true;
  document.body.classList.remove("summary-open");
  elements.summaryContent.classList.remove("summary-content-frame");
  elements.summaryContent.replaceChildren();
}

function renderStatusMessage(message) {
  const note = document.createElement("p");
  note.className = "summary-status";
  note.textContent = message;
  return note;
}

function summaryPageHref(filename) {
  return `summary-pages/${encodeURIComponent(filename)}`;
}

function buildKeywordCatalog(papers) {
  const counts = new Map();

  for (const paper of papers) {
    for (const keyword of paper.keywords || []) {
      const label = String(keyword || "").trim();
      if (!label) {
        continue;
      }
      counts.set(label, (counts.get(label) || 0) + 1);
    }
  }

  return Array.from(counts.entries(), ([label, count]) => ({ label, count })).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }
    return left.label.localeCompare(right.label, "en", { sensitivity: "base" });
  });
}

function pdfHref(filename) {
  return `pdf/${encodeURIComponent(filename)}`;
}
