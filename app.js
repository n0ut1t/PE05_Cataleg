const THEME_KEY = "pe05.theme.v1";
const FONT_KEY = "pe05.font.v1";
const MOTION_KEY = "pe05.motion.v1";
const FAV_KEY = "pe05.favorites.v1";

const section_load = document.getElementById('loading');
const loading_msg = document.getElementById('loading_msg');
const section_pref = document.getElementById('form_preferencias');
const form = document.getElementById('form_pref');

const section_menu = document.getElementById('menu');
const inventoryGrid = document.getElementById('inventoryGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

const ui = {
  themeSelect: document.getElementById("theme"),
  fontRange: document.getElementById("fontRange"),
  reduceMotion: document.getElementById("reduce"),
};

let globalItems = [];
let favoriteItems = [];

try {
  const storedFavs = localStorage.getItem(FAV_KEY);
  if (storedFavs) favoriteItems = JSON.parse(storedFavs);
} catch(e) {
  console.warn("Corrupt favorite data in localStorage, resetting.");
  favoriteItems = [];
}

const applyPreferences = (theme, font, motion) => {
  const root = document.documentElement;
  if (theme === 'light'){
    root.style.setProperty("--background", "#FFFFFF");
  } else {
    root.style.setProperty("--background", "#555454");
  }
  if (font) {
    root.style.setProperty("--font-size", font + "px");
  }
  if (motion === 'true') {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
};

const checkPreferences = () => {
    const theme = localStorage.getItem(THEME_KEY);
    const font = localStorage.getItem(FONT_KEY);
    const motion = localStorage.getItem(MOTION_KEY);

    if (theme && font && motion !== null) {
      applyPreferences(theme, font, motion);
      return true;
    }
    return false;
};

ui.themeSelect.addEventListener('change', () => {
  applyPreferences(ui.themeSelect.value, ui.fontRange.value, ui.reduceMotion.checked.toString());
});

ui.fontRange.addEventListener("input", () => {
  applyPreferences(ui.themeSelect.value, ui.fontRange.value, ui.reduceMotion.checked.toString());
  document.getElementById("fontValue").innerText = ui.fontRange.value;
});   

const DB_LOAD = "./data/obj.json";

async function load_db(db){
  try{
    const response = await fetch(db, {cache: "no-store"});
    if (!response.ok) {throw new Error(`No s'ha pogut carregar el JSON (HTTP ${response.status})`)}
    const data = await response.json();
    if (!data || typeof data != "object") {throw new Error("JSON INVALID: no es un objecte")}
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}   

async function startLoading() {
  section_pref.hidden = true;
  section_load.hidden = false;
  section_menu.hidden = true;

  try {
    const data = await load_items();
    globalItems = data.inventory || [];
    renderInventory(globalItems);
    
    await new Promise((resolve) => setTimeout(resolve,1000));
    section_load.hidden = true;
    section_menu.hidden = false;
  } catch (error) {
    console.error("Error en el proceso:", error);
    loading_msg.textContent = "Error al cargar los datos.";
    loading_msg.classList.add('error');
    loading_msg.classList.remove('loading');
  }
}

async function load_items() {
  let db = await load_db(DB_LOAD);
  const mensajes = [
    "Loading items...",
    "Calculating power...",
    "Looking for materia...",
    "final touches..."
  ];
  let i = 0;
  const intervalid = setInterval(() => {
    loading_msg.classList.add('loading');
    loading_msg.textContent=mensajes[i % mensajes.length];
    i++;
  }, 1200);

  // Simulate network wait as in original code
  await new Promise((resolve) => setTimeout(resolve, 3500));
  clearInterval(intervalid);

  loading_msg.classList.remove('loading');
  loading_msg.classList.add('ok');
  loading_msg.textContent = "Success, Welcome back!";
  loading_msg.style.fontWeight = "bold";

  return db;
}

form.addEventListener('submit', async(e) => {
  e.preventDefault();
  
  // Save preferences versioned
  localStorage.setItem(THEME_KEY, ui.themeSelect.value);
  localStorage.setItem(FONT_KEY, ui.fontRange.value);
  localStorage.setItem(MOTION_KEY, ui.reduceMotion.checked);

  await startLoading();
});

// INITIALIZE
if (checkPreferences()) {
  startLoading();
} else {
  section_pref.hidden = false;
  section_load.hidden = true;
  section_menu.hidden = true;
}

// INVENTORY LOGIC
function toggleFavorite(id, btnElement) {
  if (favoriteItems.includes(id)) {
    favoriteItems = favoriteItems.filter(fav => fav !== id);
    btnElement.classList.remove('active');
    btnElement.innerHTML = '☆';
  } else {
    favoriteItems.push(id);
    btnElement.classList.add('active');
    btnElement.innerHTML = '★';
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favoriteItems));
}

function renderInventory(items) {
  inventoryGrid.innerHTML = '';
  
  if (items.length === 0) {
    inventoryGrid.innerHTML = '<p style="color: white; text-align: center; grid-column: 1 / -1;">No hay items para mostrar.</p>';
    return;
  }

  items.forEach(item => {
    const isFav = favoriteItems.includes(item.id);
    const cardClass = item.rarity ? item.rarity.replace(" ", "") : "común";

    const card = document.createElement('div');
    card.className = `item-card ${cardClass}`;
    
    card.innerHTML = `
      <div class="item-header">
        <div>
          <!-- Poner icono de la Categoría aquí. Ejemplo: <img src="public/materia.png" /> -->
          <div class="item-icon-ph">Icon</div> 
        </div>
        <div style="flex-grow: 1; padding-left: 10px;">
          <h3 class="item-title">${item.name}</h3>
          <span class="item-category">${item.category} • ${item.rarity}</span>
        </div>
        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${item.id}" aria-label="Añadir a favoritos">
          <!-- Poner icono de Favorito aquí en lugar del texto -->
          ${isFav ? '★' : '☆'}
        </button>
      </div>
      <div class="item-body">
        <p class="item-desc">${item.description}</p>
      </div>
      <div class="item-footer">
        <span class="item-price">
          <!-- Poner icono de Dinero(G) aquí -->
          🪙 ${item.price} G
        </span>
        <span class="item-lvl">Nv. req: ${item.level_req}</span>
      </div>
    `;

    const favBtn = card.querySelector('.btn-fav');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(item.id, favBtn);
    });

    inventoryGrid.appendChild(card);
  });
}

function filterItems() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = globalItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'todos' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  renderInventory(filtered);
}

if (searchInput) searchInput.addEventListener('input', filterItems);
if (categoryFilter) categoryFilter.addEventListener('change', filterItems);
