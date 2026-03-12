const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll("button[data-scenario]");

const scenarioUrl = {
  ok: "./data-ok.json",
  http: "./no-existeix.json", // 404 forçat
  json: "./data-bad.txt", // resposta 200, però JSON invàlid
  network: "https://domini-que-no-existeix-12345.test/data.json", // error de xarxa/DNS
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const scenario = button.dataset.scenario;
    loadScenario(scenario);
  });
});

async function fetchJson(url) {
  const response = await fetch(url);

  // Error típic docent: pensar que fetch llença error en 404.
  // No sempre: fetch resol igualment i cal mirar response.ok.
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }

  // Aquí pot fallar si el JSON està mal format.
  return await response.json();
}

async function loadScenario(scenario) {
  setUiState("loading", "Carregant dades...");
  resultEl.textContent = "";

  try {
    const url = scenarioUrl[scenario];
    const data = await fetchJson(url);

    setUiState("success", "Dades carregades correctament.");
    resultEl.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    // Aquest catch evita una UI trencada i permet missatge educatiu.
    setUiState("error", buildUserMessage(error));

    // Missatge tècnic per al docent/alumne a DevTools.
    console.error("Detall tècnic de l'error:", error);
  }
}

function setUiState(type, message) {
  statusEl.className = `status ${type}`;
  statusEl.textContent = message;
}

function buildUserMessage(error) {
  const text = String(error?.message || "Error desconegut");

  if (text.includes("HTTP")) {
    return "Error HTTP: recurs no trobat o resposta incorrecta.";
  }

  if (text.toLowerCase().includes("json")) {
    return "Error de format: la resposta no és un JSON vàlid.";
  }

  return "Error de xarxa o CORS: no s'ha pogut contactar amb el servidor.";
}
