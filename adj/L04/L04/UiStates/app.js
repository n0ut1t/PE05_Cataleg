const viewEl = document.getElementById("view");
const badgeEl = document.getElementById("statusBadge");
const buttons = document.querySelectorAll("button[data-scenario]");

// Model d'estat mínim (patró reusable)
const state = {
  status: "idle", // "idle" | "loading" | "ready" | "empty" | "error"
  data: null,
  errorMessage: "",
};

const scenarioUrl = {
  ready: "./data-ready.json",
  empty: "./data-empty.json",
  http: "./no-existeix.json",
  json: "./data-bad.txt",
  network: "https://domini-que-no-existeix-12345.test/data.json",
};

buttons.forEach((button) => {
  button.addEventListener("click", () => runScenario(button.dataset.scenario));
});

setState({ status: "idle", data: null, errorMessage: "" });

async function runScenario(scenario) {
  if (scenario === "idle") {
    setState({ status: "idle", data: null, errorMessage: "" });
    return;
  }

  setState({ status: "loading", data: null, errorMessage: "" });

  try {
    const data = await fetchJson(scenarioUrl[scenario]);

    setState({
      status: isEmpty(data) ? "empty" : "ready",
      data,
      errorMessage: "",
    });
  } catch (error) {
    setState({
      status: "error",
      data: null,
      errorMessage: buildUserMessage(error),
    });

    // Per formació: detall tècnic a DevTools, missatge net a UI.
    console.error("Detall tècnic:", error);
  }
}

async function fetchJson(url) {
  const response = await fetch(url);

  // Error típic #1: creure que fetch ja falla en 404.
  // Solució: validar response.ok i convertir-ho en excepció.
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }

  return await response.json();
}

function isEmpty(data) {
  if (Array.isArray(data)) return data.length === 0;
  if (data == null) return true;

  // Si és objecte amb propietat items, també podem considerar empty.
  if (typeof data === "object" && Array.isArray(data.items)) {
    return data.items.length === 0;
  }

  return false;
}

function buildUserMessage(error) {
  const text = String(error?.message || "Error desconegut");

  if (text.includes("HTTP")) {
    return "Error HTTP: recurs no trobat o no disponible.";
  }

  if (text.toLowerCase().includes("json")) {
    return "Error de format: la resposta no és JSON vàlid.";
  }

  return "Error de xarxa/CORS: no s'ha pogut contactar amb el servidor.";
}

function setState(next) {
  state.status = next.status;
  state.data = next.data;
  state.errorMessage = next.errorMessage;

  render();
}

// Render centralitzat segons status (evita ifs escampats)
function render() {
  badgeEl.textContent = `status: ${state.status}`;
  badgeEl.className = `status-badge ${state.status}`;

  if (state.status === "loading") {
    viewEl.innerHTML = renderLoading();
    return;
  }

  if (state.status === "error") {
    viewEl.innerHTML = renderError(state.errorMessage);
    return;
  }

  if (state.status === "empty") {
    viewEl.innerHTML = renderEmpty();
    return;
  }

  if (state.status === "ready") {
    viewEl.innerHTML = renderReady(state.data);
    return;
  }

  viewEl.innerHTML = renderIdle();
}

function renderIdle() {
  return `
    <p class="idle"><strong>Idle:</strong> encara no s'ha carregat res.</p>
    <p>Selecciona un escenari per veure la transició d'estats.</p>
  `;
}

function renderLoading() {
  return `
    <p class="loading"><strong>Loading:</strong> carregant dades...</p>
    <p>La UI informa l'usuari que el procés està en marxa.</p>
  `;
}

function renderError(message) {
  return `
    <p class="error"><strong>Error:</strong> ${escapeHtml(message)}</p>
    <p>Important: evitem una UI en blanc mostrant una explicació clara.</p>
  `;
}

function renderEmpty() {
  return `
    <p class="empty"><strong>Empty:</strong> petició correcta, però no hi ha dades.</p>
    <p>Això no és un error tècnic; és un estat de negoci.</p>
  `;
}

function renderReady(data) {
  const items = Array.isArray(data?.items) ? data.items : [];

  const listHtml = items
    .map(
      (item) => `
        <article class="card">
          <div class="label">Element</div>
          <div>${escapeHtml(String(item))}</div>
        </article>
      `,
    )
    .join("");

  return `
    <p class="ready"><strong>Ready:</strong> dades disponibles i renderitzades.</p>
    ${listHtml || "<p>No hi ha elements per mostrar.</p>"}
  `;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
