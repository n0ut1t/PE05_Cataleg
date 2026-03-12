const THEME_KEY = "ra04.arch.theme.v1";
const FONT_KEY = "ra04.arch.font.v1";
const MOTION_KEY = "ra04.arch.motion.v1";
const FILTER_KEY = "ra04.arch.filter.v1";
const ONLY_FAVS_KEY = "ra04.arch.onlyFavs.v1";
const VIEW_KEY = "ra04.arch.view.v1";
const IDS_KEY = "ra04.arch.ids.v1";

const ui = {
  themeSelect: document.getElementById("themeSelect"),
  fontRange: document.getElementById("fontRange"),
  fontValue: document.getElementById("fontValue"),
  motionToggle: document.getElementById("motionToggle"),
  searchInput: document.getElementById("searchInput"),
  onlyFavs: document.getElementById("onlyFavs"),
  btnCards: document.getElementById("btnCards"),
  btnList: document.getElementById("btnList"),
  btnReload: document.getElementById("btnReload"),
  btnCorrupt: document.getElementById("btnCorrupt"),
  btnReset: document.getElementById("btnReset"),
  statusLine: document.getElementById("statusLine"),
  itemsView: document.getElementById("itemsView"),
  stateDump: document.getElementById("stateDump"),
};

const catalog = [
  { id: 1, title: "Introducció a fetch", category: "Asincronia" },
  { id: 2, title: "UI States robustos", category: "Arquitectura" },
  { id: 3, title: "LocalStorage versionat", category: "Persistència" },
  { id: 4, title: "Render centralitzat", category: "Arquitectura" },
  { id: 5, title: "Gestió d'errors", category: "Asincronia" },
  { id: 6, title: "Fallback segur JSON", category: "Persistència" },
];

let state = {
  items: catalog,
  filterText: "",
  onlyFavs: false,
  favorites: new Set(),
  view: "cards",
  prefs: {
    theme: "light",
    fontScale: 100,
    reduceMotion: false,
  },
  info: "Estat inicial carregat.",
};

hydrateFromStorage();
bindEvents();
render();

function bindEvents() {
  ui.themeSelect.addEventListener("change", () => {
    setState({
      prefs: {
        ...state.prefs,
        theme: ui.themeSelect.value,
      },
      info: "Preferència de tema actualitzada.",
    });
  });

  ui.fontRange.addEventListener("input", () => {
    const fontScale = Number(ui.fontRange.value);

    setState({
      prefs: {
        ...state.prefs,
        fontScale,
      },
      info: "Mida de font actualitzada.",
    });
  });

  ui.motionToggle.addEventListener("change", () => {
    setState({
      prefs: {
        ...state.prefs,
        reduceMotion: ui.motionToggle.checked,
      },
      info: "Preferència de motion actualitzada.",
    });
  });

  ui.searchInput.addEventListener("input", () => {
    setState({
      filterText: ui.searchInput.value.trimStart(),
      info: "Filtre guardat.",
    });
  });

  ui.onlyFavs.addEventListener("change", () => {
    setState({
      onlyFavs: ui.onlyFavs.checked,
      info: "Estat del filtre de favorits guardat.",
    });
  });

  ui.btnCards.addEventListener("click", () => {
    setState({ view: "cards", info: "Vista targetes guardada." });
  });

  ui.btnList.addEventListener("click", () => {
    setState({ view: "list", info: "Vista llista guardada." });
  });

  ui.btnReload.addEventListener("click", () => {
    hydrateFromStorage();
    render();
  });

  ui.btnCorrupt.addEventListener("click", () => {
    localStorage.setItem(IDS_KEY, "{JSON-corromput");
    setState({ info: "Clau d'IDs corrompuda. Prem 'Recarregar'." });
  });

  ui.btnReset.addEventListener("click", () => {
    resetStorage();
    state = {
      ...state,
      filterText: "",
      onlyFavs: false,
      favorites: new Set(),
      view: "cards",
      prefs: {
        theme: "light",
        fontScale: 100,
        reduceMotion: false,
      },
      info: "Storage netejat i estat reinicialitzat.",
    };
    render();
  });

  ui.itemsView.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-item-id]");
    if (!button) return;

    const itemId = Number(button.dataset.itemId);
    toggleFavorite(itemId);
  });
}

function setState(patch) {
  state = { ...state, ...patch };
  render();
  persistState(patch);
}

function render() {
  applyUiFromState();

  const filtered = selectVisibleItems();

  ui.statusLine.textContent = [
    `Elements visibles: ${filtered.length}/${state.items.length}`,
    `Favorits: ${state.favorites.size}`,
    state.info,
  ].join(" · ");

  ui.itemsView.className = `items-view ${state.view}`;

  if (filtered.length === 0) {
    ui.itemsView.innerHTML = `<p class="empty">Cap element per mostrar amb aquest filtre.</p>`;
  } else {
    ui.itemsView.innerHTML = filtered.map(renderItem).join("");
  }

  ui.stateDump.textContent = JSON.stringify(
    {
      filterText: state.filterText,
      onlyFavs: state.onlyFavs,
      favorites: [...state.favorites],
      view: state.view,
      prefs: state.prefs,
      rule: "render() no toca localStorage",
    },
    null,
    2,
  );
}

function applyUiFromState() {
  document.body.dataset.theme = state.prefs.theme;
  document.documentElement.style.fontSize = `${state.prefs.fontScale}%`;
  document.documentElement.style.setProperty(
    "scroll-behavior",
    state.prefs.reduceMotion ? "auto" : "smooth",
  );

  ui.themeSelect.value = state.prefs.theme;
  ui.fontRange.value = String(state.prefs.fontScale);
  ui.fontValue.textContent = `${state.prefs.fontScale}%`;
  ui.motionToggle.checked = state.prefs.reduceMotion;
  ui.searchInput.value = state.filterText;
  ui.onlyFavs.checked = state.onlyFavs;

  ui.btnCards.setAttribute("aria-pressed", String(state.view === "cards"));
  ui.btnList.setAttribute("aria-pressed", String(state.view === "list"));
}

function selectVisibleItems() {
  const term = state.filterText.toLocaleLowerCase("ca");

  return state.items.filter((item) => {
    if (state.onlyFavs && !state.favorites.has(item.id)) {
      return false;
    }

    if (!term) return true;

    const haystack = `${item.title} ${item.category}`.toLocaleLowerCase("ca");
    return haystack.includes(term);
  });
}

function renderItem(item) {
  const isFav = state.favorites.has(item.id);

  return `
    <article class="item-card">
      <div class="item-top">
        <p class="item-title">${escapeHtml(item.title)}</p>
        <button
          type="button"
          class="fav-btn"
          data-item-id="${item.id}"
          data-active="${String(isFav)}"
          aria-label="Marcar favorit"
        >
          ${isFav ? "★" : "☆"}
        </button>
      </div>
      <p class="item-meta">Categoria: ${escapeHtml(item.category)} · ID: ${item.id}</p>
    </article>
  `;
}

function toggleFavorite(itemId) {
  const next = new Set(state.favorites);

  if (next.has(itemId)) {
    next.delete(itemId);
  } else {
    next.add(itemId);
  }

  setState({
    favorites: next,
    info: `Favorits actualitzats (ID ${itemId}).`,
  });
}

function persistState(patch) {
  if ("prefs" in patch) {
    saveTheme(state.prefs.theme);
    saveFontScale(state.prefs.fontScale);
    saveMotion(state.prefs.reduceMotion);
  }

  if ("filterText" in patch) {
    saveFilter(state.filterText);
  }

  if ("onlyFavs" in patch) {
    saveOnlyFavs(state.onlyFavs);
  }

  if ("favorites" in patch) {
    saveIds(state.favorites);
  }

  if ("view" in patch) {
    saveView(state.view);
  }
}

function hydrateFromStorage() {
  state = {
    ...state,
    prefs: {
      theme: loadTheme(),
      fontScale: loadFontScale(),
      reduceMotion: loadMotion(),
    },
    filterText: loadFilter(),
    onlyFavs: loadOnlyFavs(),
    favorites: loadIds(),
    view: loadView(),
    info: "Estat restaurat des de localStorage.",
  };
}

function loadTheme() {
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "dark" ? "dark" : "light";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function loadFontScale() {
  const raw = Number(localStorage.getItem(FONT_KEY));
  return Number.isFinite(raw) && raw >= 90 && raw <= 120 ? raw : 100;
}

function saveFontScale(scale) {
  localStorage.setItem(FONT_KEY, String(scale));
}

function loadMotion() {
  return localStorage.getItem(MOTION_KEY) === "true";
}

function saveMotion(value) {
  localStorage.setItem(MOTION_KEY, String(value));
}

function loadFilter() {
  return localStorage.getItem(FILTER_KEY) || "";
}

function saveFilter(value) {
  localStorage.setItem(FILTER_KEY, value);
}

function loadOnlyFavs() {
  return localStorage.getItem(ONLY_FAVS_KEY) === "true";
}

function saveOnlyFavs(value) {
  localStorage.setItem(ONLY_FAVS_KEY, String(value));
}

function loadView() {
  const raw = localStorage.getItem(VIEW_KEY);
  return raw === "list" ? "list" : "cards";
}

function saveView(view) {
  localStorage.setItem(VIEW_KEY, view);
}

// Per a la llista d'IDs, guardem un array JSON stringificat. 
// A la lectura, validem que sigui un array d'enters.
function loadIds() {
  const raw = localStorage.getItem(IDS_KEY);
  if (!raw) return new Set();

  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter(Number.isFinite)) : new Set();
  } catch {
    return new Set();
  }
}
// Guardem un Set com els IDs favorits, convertit a array per
function saveIds(idsSet) {
  localStorage.setItem(IDS_KEY, JSON.stringify([...idsSet]));
}

function resetStorage() {
  [THEME_KEY, FONT_KEY, MOTION_KEY, FILTER_KEY, ONLY_FAVS_KEY, VIEW_KEY, IDS_KEY].forEach(
    (key) => localStorage.removeItem(key),
  );
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
