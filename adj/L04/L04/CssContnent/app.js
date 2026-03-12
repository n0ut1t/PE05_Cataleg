const ui = {
  scaleSelect: document.getElementById("scaleSelect"),
  statusLine: document.getElementById("statusLine"),
  checkList: document.getElementById("checkList"),
  overviewList: document.getElementById("overviewList"),
};

const checks = [
  "Variables d'espaiat --s-1/2/3",
  ".container amb gap coherent",
  "Variants .btn-primary / .btn-secondary / .btn-danger",
  "Focus visible en botons/inputs",
  "Responsive mínim per layout i botons",
];

bindEvents();
renderOverview();
setSpacingScale("base");

function bindEvents() {
  ui.scaleSelect.addEventListener("change", () => {
    setSpacingScale(ui.scaleSelect.value);
  });
}

function setSpacingScale(mode) {
  const root = document.documentElement;

  if (mode === "compacta") {
    root.style.setProperty("--s-1", "6px");
    root.style.setProperty("--s-2", "12px");
    root.style.setProperty("--s-3", "18px");
    ui.statusLine.textContent = "Escala compacta aplicada: 6/12/18.";
    return;
  }

  if (mode === "ampla") {
    root.style.setProperty("--s-1", "10px");
    root.style.setProperty("--s-2", "20px");
    root.style.setProperty("--s-3", "30px");
    ui.statusLine.textContent = "Escala ampla aplicada: 10/20/30.";
    return;
  }

  root.style.setProperty("--s-1", "8px");
  root.style.setProperty("--s-2", "16px");
  root.style.setProperty("--s-3", "24px");
  ui.statusLine.textContent = "Escala base aplicada: 8/16/24.";
}

function renderOverview() {
  ui.overviewList.innerHTML = checks
    .map((item) => `<li class="done">✅ ${escapeHtml(item)}</li>`)
    .join("");

  ui.checkList.querySelectorAll("li").forEach((li) => {
    li.classList.add("done");
  });
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
