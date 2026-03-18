const THEME_KEY = "pe05.theme.v1";
const FONT_KEY = "pe05.font.v1";
const MOTION_KEY = "pe05.motion.v1";

const section_load = document.getElementById('loading');
const loading_msg = document.getElementById('loading_msg');
const section_pref = document.getElementById('form_preferencias');
const form = document.getElementById('form_pref');

const section_menu = document.getElementById('menu');

const ui = {
  themeSelect: document.getElementById("theme"),
  fontRange: document.getElementById("fontRange"),
  reduceMotion: document.getElementById("reduce"),
};

section_pref.hidden = false;
section_load.hidden = true;
section_menu.hidden = true

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

  await new Promise((resolve) => setTimeout(resolve, 5500));
  clearInterval(intervalid)

  loading_msg.classList.remove('loading');
  loading_msg.classList.add('ok');
  loading_msg.textContent = "Success, Welcome back!"
  loading_msg.style.fontWeight = "bold";

  return db;
}

ui.themeSelect.addEventListener('change', () => {
  const root = document.documentElement;
  let theme = ui.themeSelect.value
  if (theme == 'light'){
    root.style.setProperty("--background", "#FFFFFF");
  } else {
    root.style.setProperty("--background", "#555454");
  }
})
ui.fontRange.addEventListener("input", () => {
    const fontScale = Number(ui.fontRange.value);
    const root = document.documentElement;
    root.style.setProperty("--font-size", fontScale)
});   

form.addEventListener('submit', async(e) => {
  e.preventDefault()
  section_pref.hidden = true;
  section_load.hidden = false;
  try{
    const data = await load_items();
    console.log("Datos cargados:", data);
    await new Promise((resolve) => setTimeout(resolve,1000));
    section_load.hidden = true;
    section_menu.hidden = false;

  }catch (error) {
    console.error("Error en el proceso:", error);
    loading_msg.textContent = "Error al cargar los datos.";
    loading_msg.classList.add('error');
  }
})


