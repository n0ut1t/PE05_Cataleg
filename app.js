// ==========================================
// keys versionades
// ==========================================
const THEME_KEY = "0612.pe05.theme.v1";
const FONT_KEY = "0612.pe05.font.v1";
const MOTION_KEY = "0612.pe05.motion.v1";
const FAV_KEY = "0612.pe05.favorites.v1";
const CUSTOM_KEY = "0612.pe05.customs.v1"; // Guardar apart els items custom
const DB_LOAD = "./data/obj.json";

const DOM = {
  // Seccions de l'App
  secPref: document.getElementById('form_preferencias'),
  secLoad: document.getElementById('loading'),
  secMenu: document.getElementById('menu'),
  secAddItem: document.getElementById('add_item_section'),
  
  // Formulari Preferències
  formPref: document.getElementById('form_pref'),
  themeSelect: document.getElementById("theme"),
  fontRange: document.getElementById("fontRange"),
  fontValue: document.getElementById("fontValue"),
  reduceMotion: document.getElementById("reduce"),
  
  // UI Càrrega i Error
  loadingMsg: document.getElementById('loading_msg'),
  loadingSpinner: document.getElementById('loading_spinner'),
  btnRetry: document.getElementById('btn_retry'),
  
  // UI Inventari Global
  inventoryGrid: document.getElementById('inventoryGrid'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  btnShowAdd: document.getElementById('btn_show_add'),
  
  // Formulari Crear Item 
  formAdd: document.getElementById('form_add'),
  btnCancelAdd: document.getElementById('btn_cancel_add')
};

// ==========================================
// STATE VARIABLES
// ==========================================
let globalItems = [];
let favoriteItems = [];
let customItems = [];

// ==========================================
// 1. STORAGE
// ==========================================
function loadPersistedData() {
  // Gestionar null i corrupció. validació d'estructura 
  try {
    const storedFavs = localStorage.getItem(FAV_KEY);
    if (storedFavs) {
      const parsed = JSON.parse(storedFavs);
      // Validació que sigui un Array
      favoriteItems = Array.isArray(parsed) ? parsed : [];
    }
  } catch(e) {
    console.warn("Dades de favorits corruptes a localStorage, resetejant fallback.");
    favoriteItems = []; 
  }

  try {
    const storedCustoms = localStorage.getItem(CUSTOM_KEY);
    if (storedCustoms) {
      const parsed = JSON.parse(storedCustoms);
      customItems = Array.isArray(parsed) ? parsed : [];
    }
  } catch(e) {
    console.warn("Dades de customs corruptes a localStorage, resetejant fallback.");
    customItems = [];
  }
}

function saveFavorites() {
  localStorage.setItem(FAV_KEY, JSON.stringify(favoriteItems));
}

function saveCustoms() {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(customItems));
}

// ==========================================
// 2. PREFERENCES
// ==========================================
function applyPreferences(theme, font, motion) {
  const root = document.documentElement;
  // Aplica variables obligatòries 
  if (theme === 'light') {
    root.style.setProperty("--bg", "#FFFFFF");
    root.style.setProperty("--text", "#333333");
  } else {
    root.style.setProperty("--bg", "#555454");
    root.style.setProperty("--text", "#FFFFFF");
  }
  
  if (font) {
    root.style.setProperty("--font-size", font + "px");
    if(DOM.fontValue) DOM.fontValue.innerText = font;
  }
  
  if (motion === 'true') {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
}

function checkAndApplyPreferences() {
    const theme = localStorage.getItem(THEME_KEY);
    const font = localStorage.getItem(FONT_KEY);
    const motion = localStorage.getItem(MOTION_KEY);

    if (theme !== null && font !== null && motion !== null) {
      DOM.themeSelect.value = theme;
      DOM.fontRange.value = font;
      DOM.reduceMotion.checked = (motion === 'true');
      
      applyPreferences(theme, font, motion);
      return true;
    }
    return false;
}

// ==========================================
// 3. API (simulacio)
// ==========================================
async function fetchDatabase(url) {
  // fetch, async/await, try/catch/finally, response.ok
  let response = null;
  try {
    response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    // Control error de parseig JSON 
    const data = await response.json();
    if (!data || typeof data !== "object") {
      throw new Error("JSON invalid.");
    }
    
    return data;
    
  } catch (err) {
    console.error("Error durant la càrrega del JSON:", err);
    throw err;
  } finally {
    //  Ús de finally per completar el flux o mostrar un missatge 
    console.info(`Operació asíncrona fetch() a ${url} finalitzada.`);
  }
}

// ==========================================
// 4. UI STATE LOGIC 
// ==========================================
async function startAppLoading() {
  // Transició a estat Loading
  DOM.secPref.hidden = true;
  DOM.secLoad.hidden = false;
  DOM.secMenu.hidden = true;
  DOM.btnRetry.hidden = true; // botó de reintent per defecte
  DOM.loadingSpinner.style.display = 'block';

  const mensajes = [
    "Carregant...", 
    "Calculant poder...",
    "Buscant matèria...",
    "Últims retocs..."
  ];
  let i = 0;
  
  DOM.loadingMsg.textContent = mensajes[0]; 
  DOM.loadingMsg.className = 'loading'; 

  // Iniciem l'interval
  const intervalid = setInterval(() => {
    i++;
    DOM.loadingMsg.textContent = mensajes[i % mensajes.length];
  }, 1200);

  await new Promise(resolve => setTimeout(resolve, 3500));

  try {
    const data = await fetchDatabase(DB_LOAD);
    
    clearInterval(intervalid); // Netegem l'interval 
    
    // Integrarem els ítems custom creats junt als descarregats del json local
    globalItems = [...(data.inventory || []), ...customItems];
    
    DOM.loadingMsg.textContent = "Èxit!";
    DOM.loadingMsg.className = 'ok';
    
    // Mostrar aplicació principal preparant l'estat "Ready"
    await new Promise(resolve => setTimeout(resolve, 500));
    DOM.secLoad.hidden = true;
    DOM.secMenu.hidden = false;
    
    renderInventory(globalItems);

  } catch (error) {
    clearInterval(intervalid); // Netegem l'interval en cas d'error
    
    // missatge + botó
    DOM.loadingSpinner.style.display = 'none';
    DOM.loadingMsg.textContent = "Error al carregar les dades.";
    DOM.loadingMsg.className = 'error';
    DOM.btnRetry.hidden = false; // Mostrar opció de reintentar
  }
}

// ==========================================
// 5. INVENTORY LOGIC 
// ==========================================
function toggleFavorite(id, btnElement) {
  if (favoriteItems.includes(id)) {
    // Eliminar de favorits 
    favoriteItems = favoriteItems.filter(fav => fav !== id);
    btnElement.classList.remove('active');
    btnElement.innerHTML = '☆';
  } else {
    // Afegir a favorits 
    favoriteItems.push(id);
    btnElement.classList.add('active');
    btnElement.innerHTML = '★';
  }
  saveFavorites();
}

function renderInventory(items) {
  DOM.inventoryGrid.innerHTML = '';
  
  if (items.length === 0) {
    //Empty State amb text 
    DOM.inventoryGrid.innerHTML = `
      <p style="text-align: center; grid-column: 1 / -1; font-weight: bold; font-size: calc(var(--font-size)*1.5);">
        No hi ha resultats
      </p>`;
    return;
  }

  items.forEach(item => {
    // Reestablir classes en base a custom o raritat
    const isFav = favoriteItems.includes(item.id);
    const rarityClass = item.rarity ? item.rarity.replace(" ", "") : "común";
    const modCardClass = item.isCustom ? "custom" : rarityClass;

    const card = document.createElement('div');
    card.className = `item-card ${modCardClass}`;
    // Utilitzem button per millorar accessibilitat focus respecte de simples .onclick
    card.innerHTML = `
      <div class="item-header">
        <div>
          <div class="item-icon-ph">${item.isCustom ? 'CUST' : 'ICON'}</div> 
        </div>
        <div style="flex-grow: 1; padding-left: 10px;">
          <h3 class="item-title">${item.name}</h3>
          <span class="item-category">${item.category} • ${item.rarity}</span>
        </div>
        <button type="button" class="btn-fav ${isFav ? 'active' : ''}" data-id="${item.id}" aria-label="${isFav ? 'Treure favorit' : 'Afegir a favorits'}">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
      <div class="item-body">
        <p class="item-desc">${item.description}</p>
      </div>
      <div class="item-footer">
        <span class="item-price">🪙 ${item.price} G</span>
        <span class="item-lvl">Nv. req: ${item.level_req}</span>
      </div>
    `;

    // Vinculem botó Favorit
    const favBtn = card.querySelector('.btn-fav');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar esdeveniment per propagació 
      toggleFavorite(item.id, favBtn);
    });

    DOM.inventoryGrid.appendChild(card);
  });
}

function filterItems() {
  const searchTerm = DOM.searchInput.value.toLowerCase();
  const category = DOM.categoryFilter.value;

  const filtered = globalItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'todos' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  renderInventory(filtered);
}

// ==========================================
// 6. EVENT LISTENERS 
// ==========================================
function setupEventListeners() {
  
  // Preferències Updates
  DOM.themeSelect.addEventListener('change', () => {
    applyPreferences(DOM.themeSelect.value, DOM.fontRange.value, DOM.reduceMotion.checked.toString());
  });

  DOM.fontRange.addEventListener("input", () => {
    applyPreferences(DOM.themeSelect.value, DOM.fontRange.value, DOM.reduceMotion.checked.toString());
  });
  
  DOM.reduceMotion.addEventListener('change', () => {
    applyPreferences(DOM.themeSelect.value, DOM.fontRange.value, DOM.reduceMotion.checked.toString());
  });

  // Guardar preferències
  DOM.formPref.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem(THEME_KEY, DOM.themeSelect.value);
    localStorage.setItem(FONT_KEY, DOM.fontRange.value);
    localStorage.setItem(MOTION_KEY, DOM.reduceMotion.checked.toString());
    startAppLoading();
  });
  
  // Opció de Reintentar quan fa error el fetch
  DOM.btnRetry.addEventListener('click', () => {
    startAppLoading();
  });

  // Filtres Cercador i Select
  if (DOM.searchInput) DOM.searchInput.addEventListener('input', filterItems);
  if (DOM.categoryFilter) DOM.categoryFilter.addEventListener('change', filterItems);
  
  // FORMULARI DE CREACIÓ LÒGICA
  DOM.btnShowAdd.addEventListener('click', () => {
    DOM.secAddItem.hidden = !DOM.secAddItem.hidden;
    if(!DOM.secAddItem.hidden) DOM.formAdd.elements[0].focus(); 
  });
  
  DOM.btnCancelAdd.addEventListener('click', () => {
    DOM.secAddItem.hidden = true;
    DOM.formAdd.reset(); // Neteja formulari 
  });
  
  DOM.formAdd.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita reload 
    
    const name = document.getElementById('add_name').value.trim();
    const cat = document.getElementById('add_cat').value;
    const rarity = document.getElementById('add_rarity').value;
    const price = parseInt(document.getElementById('add_price').value);
    const lvl = parseInt(document.getElementById('add_lvl').value);
    const desc = document.getElementById('add_desc').value.trim();
    
    // Validació Extra protecció accions i camps fora de rang
    if (!name || !desc) {
      alert("Error: Informació incompleta.");
      return;
    }
    if (price < 0 || isNaN(price) || lvl < 1 || lvl > 99 || isNaN(lvl)) {
      alert("Error: Valors numèrics impossibles o fora de rang.");
      return;
    }
    
    // Muntem l'objecte personalitzat per afegir-lo a l'app i memòria del navegador
    const newItem = {
      id: "cust_" + Date.now(),
      name: name,
      category: cat,
      rarity: rarity,
      level_req: lvl,
      price: price,
      description: desc,
      isCustom: true
    };
    
    customItems.unshift(newItem); // Col·locar al davant de la vista
    saveCustoms(); // Persistir a localstorage
    
    globalItems.unshift(newItem); // Unim als globals renderitzables
    
    filterItems(); // Torna a dibuixar la llista
    
    // Netejar estat UI
    DOM.formAdd.reset();
    DOM.secAddItem.hidden = true;
  });
}

// ==========================================
// 7. APP 
// ==========================================
function initApp() {
  loadPersistedData();
  setupEventListeners();
  
  if (checkAndApplyPreferences()) {
    // Si tenim preferències s'apliquen directament i carreguem dades
    startAppLoading();
  } else {
    // Si no hi ha preferències, mantenir menú ocult i demanar input a l'usuari
    DOM.secPref.hidden = false;
    DOM.secLoad.hidden = true;
    DOM.secMenu.hidden = true;
  }
}

// Inicialitza l'aplicatiu Javascript
initApp();
