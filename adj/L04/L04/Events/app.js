const PREF_KEY = "ra04.events.nick.v1";

const ui = {
  persistMode: document.getElementById("persistMode"),
  nicknameInput: document.getElementById("nicknameInput"),
  topicSelect: document.getElementById("topicSelect"),
  addForm: document.getElementById("addForm"),
  addInput: document.getElementById("addInput"),
  btnResetWrites: document.getElementById("btnResetWrites"),
  btnClearLog: document.getElementById("btnClearLog"),
  persistInfo: document.getElementById("persistInfo"),
  patternMode: document.getElementById("patternMode"),
  btnAll: document.getElementById("btnAll"),
  btnPending: document.getElementById("btnPending"),
  btnDone: document.getElementById("btnDone"),
  btnRerender: document.getElementById("btnRerender"),
  btnRebind: document.getElementById("btnRebind"),
  patternInfo: document.getElementById("patternInfo"),
  listEl: document.getElementById("listEl"),
  eventLog: document.getElementById("eventLog"),
  stateDump: document.getElementById("stateDump"),
};

let nextId = 5;

let state = {
  persistMode: "change",
  nicknameDraft: "",
  nicknameSaved: "",
  topic: "Asincronia",
  storageWrites: 0,
  patternMode: "delegation",
  filter: "all",
  items: [
    { id: 1, title: "Entendre input vs change", done: false },
    { id: 2, title: "Aplicar setState com a porta única", done: false },
    { id: 3, title: "Delegació d'events amb data-action", done: true },
    { id: 4, title: "Detectar listeners perduts", done: false },
  ],
  directBound: false,
  eventLog: [],
  info: "Demo inicialitzada.",
};

hydrateStorage();
bindStaticEvents();
render();

function bindStaticEvents() {
  ui.persistMode.addEventListener("change", () => {
    setState({
      persistMode: ui.persistMode.value,
      info: `Canvi de mode de persistència a '${ui.persistMode.value}'.`,
    });

    pushLog(`change → persistMode = ${ui.persistMode.value}`);
  });

  ui.nicknameInput.addEventListener("input", () => {
    setState({
      nicknameDraft: ui.nicknameInput.value,
      info: "input rebut al camp de nom.",
    });

    pushLog(`input → nickname = ${ui.nicknameInput.value}`);
    maybePersistNickname("input");
  });

  ui.nicknameInput.addEventListener("change", () => {
    setState({
      nicknameDraft: ui.nicknameInput.value,
      info: "change rebut al camp de nom.",
    });

    pushLog(`change → nickname = ${ui.nicknameInput.value}`);
    maybePersistNickname("change");
  });

  ui.topicSelect.addEventListener("change", () => {
    setState({
      topic: ui.topicSelect.value,
      info: "Topic actualitzat via change.",
    });

    pushLog(`change → topic = ${ui.topicSelect.value}`);
  });

  ui.addForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = ui.addInput.value.trim();
    if (!text) return;

    const item = { id: nextId++, title: text, done: false };

    setState({
      items: [item, ...state.items],
      info: `Nou element afegit amb submit (ID ${item.id}).`,
    });

    ui.addInput.value = "";
    pushLog(`submit → afegit item ID ${item.id}`);
  });

  ui.btnResetWrites.addEventListener("click", () => {
    setState({ storageWrites: 0, info: "Comptador d'escriptures reiniciat." });
    pushLog("click → reset comptador d'escriptures");
  });

  ui.btnClearLog.addEventListener("click", () => {
    setState({ eventLog: [], info: "Log d'events netejat." });
  });

  ui.patternMode.addEventListener("change", () => {
    const mode = ui.patternMode.value;

    setState({
      patternMode: mode,
      directBound: false,
      info:
        mode === "delegation"
          ? "Mode delegació activat."
          : "Mode directe fràgil activat (error típic).",
    });

    pushLog(`change → patternMode = ${mode}`);

    if (mode === "direct") {
      bindDirectListenersOnce();
    }
  });

  ui.btnAll.addEventListener("click", () => setFilter("all"));
  ui.btnPending.addEventListener("click", () => setFilter("pending"));
  ui.btnDone.addEventListener("click", () => setFilter("done"));

  ui.btnRerender.addEventListener("click", () => {
    setState({ info: "Re-render forçat." });
    pushLog("click → re-render forçat");
  });

  ui.btnRebind.addEventListener("click", () => {
    if (state.patternMode !== "direct") {
      setState({ info: "Rebind només aplica en mode directe." });
      return;
    }

    state.directBound = false;
    bindDirectListenersOnce();
    setState({ info: "Listeners directes reactivats (temporal)." });
    pushLog("click → rebind directe");
  });

  ui.listEl.addEventListener("click", (event) => {
    if (state.patternMode !== "delegation") return;

    const actionBtn = event.target.closest("button[data-action]");
    if (!actionBtn) return;

    const itemEl = actionBtn.closest("[data-id]");
    if (!itemEl) return;

    handleAction(actionBtn.dataset.action, Number(itemEl.dataset.id), "delegation");
  });
}

function setFilter(filter) {
  setState({ filter, info: `Filtre actiu: ${filter}.` });
  pushLog(`click → filtre ${filter}`);
}

function maybePersistNickname(fromEvent) {
  if (state.persistMode !== fromEvent) {
    return;
  }

  localStorage.setItem(PREF_KEY, ui.nicknameInput.value);

  setState({
    nicknameSaved: ui.nicknameInput.value,
    storageWrites: state.storageWrites + 1,
    info: `Persistit amb event '${fromEvent}'.`,
  });

  pushLog(`storage write (${fromEvent})`);
}

function bindDirectListenersOnce() {
  if (state.patternMode !== "direct" || state.directBound) return;

  const buttons = ui.listEl.querySelectorAll("button[data-action]");
  buttons.forEach((button) => {
    button.addEventListener("click", onDirectClick);
  });

  state.directBound = true;
}

function onDirectClick(event) {
  if (state.patternMode !== "direct") return;

  const actionBtn = event.target.closest("button[data-action]");
  if (!actionBtn) return;

  const itemEl = actionBtn.closest("[data-id]");
  if (!itemEl) return;

  handleAction(actionBtn.dataset.action, Number(itemEl.dataset.id), "direct");
}

function handleAction(action, id, source) {
  if (action === "toggle") {
    const updated = state.items.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item,
    );

    setState({
      items: updated,
      info: `Item ${id} alternat via ${source}.`,
    });

    pushLog(`click(${source}) → toggle item ${id}`);
    return;
  }

  if (action === "remove") {
    const updated = state.items.filter((item) => item.id !== id);

    setState({
      items: updated,
      info: `Item ${id} eliminat via ${source}.`,
    });

    pushLog(`click(${source}) → remove item ${id}`);
  }
}

function render() {
  ui.persistMode.value = state.persistMode;
  ui.nicknameInput.value = state.nicknameDraft;
  ui.topicSelect.value = state.topic;
  ui.patternMode.value = state.patternMode;

  ui.persistInfo.innerHTML = [
    `Mode actual de persistència: <strong>${state.persistMode}</strong>`,
    `Valor guardat: <strong>${escapeHtml(state.nicknameSaved || "(buit)")}</strong>`,
    `Escriptures a localStorage: <strong>${state.storageWrites}</strong>`,
  ].join(" · ");

  const filteredItems = selectVisibleItems();
  ui.listEl.innerHTML = filteredItems.map(renderItem).join("");

  if (state.patternMode === "direct" && !state.directBound) {
    bindDirectListenersOnce();
  }

  ui.patternInfo.className = "info-line";
  if (state.patternMode === "delegation") {
    ui.patternInfo.classList.add("tip-ok");
    ui.patternInfo.textContent =
      "Delegació activa: un sol listener al contenidor funciona encara que es re-renderitzi la llista.";
  } else if (state.directBound) {
    ui.patternInfo.classList.add("tip-warn");
    ui.patternInfo.textContent =
      "Mode directe: listeners units als nodes actuals. Després d'un re-render, els nous nodes poden quedar sense listeners.";
  } else {
    ui.patternInfo.classList.add("tip-danger");
    ui.patternInfo.textContent =
      "Mode directe sense listeners actius. Prem 'Reactivar listeners directes'.";
  }

  ui.eventLog.textContent =
    state.eventLog.length > 0 ? state.eventLog.join("\n") : "(encara no hi ha events)";

  ui.stateDump.textContent = JSON.stringify(
    {
      persistMode: state.persistMode,
      nicknameDraft: state.nicknameDraft,
      nicknameSaved: state.nicknameSaved,
      topic: state.topic,
      storageWrites: state.storageWrites,
      patternMode: state.patternMode,
      filter: state.filter,
      directBound: state.directBound,
      info: state.info,
      rule: "Tots els canvis passen per setState",
    },
    null,
    2,
  );
}

function selectVisibleItems() {
  if (state.filter === "done") {
    return state.items.filter((item) => item.done);
  }

  if (state.filter === "pending") {
    return state.items.filter((item) => !item.done);
  }

  return state.items;
}

function renderItem(item) {
  return `
    <li class="item ${item.done ? "done" : ""}" data-id="${item.id}">
      <div class="item-head">
        <p class="title">${escapeHtml(item.title)}</p>
        <span class="badge">ID ${item.id}</span>
      </div>
      <div class="actions">
        <button type="button" data-action="toggle">${item.done ? "Desmarcar" : "Marcar fet"}</button>
        <button type="button" data-action="remove">Eliminar</button>
      </div>
    </li>
  `;
}

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function pushLog(entry) {
  const stamp = new Date().toLocaleTimeString();
  const nextLog = [`[${stamp}] ${entry}`, ...state.eventLog].slice(0, 20);
  setState({ eventLog: nextLog });
}

function hydrateStorage() {
  const saved = localStorage.getItem(PREF_KEY);

  if (saved) {
    state = {
      ...state,
      nicknameDraft: saved,
      nicknameSaved: saved,
      info: "Nom recuperat des de localStorage.",
    };
  }
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
