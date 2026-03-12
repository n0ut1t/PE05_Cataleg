
const section_load = document.getElementById('loading');
const loading_msg = document.getElementById('loading_msg');

section_load.style.display = "none";

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

  return db;
}

load_items()