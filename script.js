const state = {
  step: 1,
  objectType: "",
  project: "",
  area: "",
  usage: "",
  land: "",
  location: "",
  deadline: "",
  installation: "",
  budget: "",
  message: "",
  name: "",
  phone: "",
  email: "",
  contactTime: ""
};

const totalSteps = 4;
const steps = [...document.querySelectorAll(".step")];
const currentStepEl = document.getElementById("currentStep");
const progressBar = document.getElementById("progressBar");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const errorEl = document.getElementById("formError");
const form = document.getElementById("inquiryForm");
const successScreen = document.getElementById("successScreen");

function setError(message) {
  errorEl.textContent = message || "";
  errorEl.style.display = message ? "block" : "none";
}

function setState(group, value) {
  state[group] = value;
  const container = document.querySelector(`[data-group="${group}"]`);
  if (!container) return;
  container.querySelectorAll("button").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.value === value);
  });
}

document.querySelectorAll("[data-group]").forEach(container => {
  container.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      setState(container.dataset.group, btn.dataset.value);
      setError("");
    });
  });
});

["project","location","deadline","message","name","phone","email"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", () => {
    state[id] = el.value;
    setError("");
  });
  el.addEventListener("change", () => {
    state[id] = el.value;
    setError("");
  });
});

function renderStep() {
  steps.forEach(step => step.classList.toggle("active", Number(step.dataset.step) === state.step));
  currentStepEl.textContent = state.step;
  progressBar.style.width = `${(state.step / totalSteps) * 100}%`;
  backBtn.style.visibility = state.step === 1 ? "hidden" : "visible";
  nextBtn.textContent = state.step === totalSteps ? "Pateikti užklausą" : "Tęsti →";
  setError("");
  window.scrollTo({top: document.querySelector(".form-shell").offsetTop - 25, behavior: "smooth"});
  if (state.step === totalSteps) renderSummary();
}

function validateStep() {
  if (state.step === 1 && !state.objectType) return "Pasirinkite, kokio objekto ieškote.";
  if (state.step === 2 && (!state.area || !state.usage || !state.land)) return "Pasirinkite atsakymus į visus klausimus.";
  if (state.step === 3 && (!state.location || !state.deadline || !state.installation || !state.budget)) return "Užpildykite pagrindinę projekto informaciją.";
  if (state.step === 4) {
    if (!state.name.trim() || !state.phone.trim() || !state.email.trim()) return "Įrašykite vardą, telefoną ir el. paštą.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return "Patikrinkite el. pašto adresą.";
    if (!document.getElementById("consent").checked) return "Pažymėkite sutikimą dėl duomenų naudojimo.";
  }
  return "";
}

function renderSummary() {
  const items = [
    ["Objektas", state.objectType],
    ["Projektas", state.project || "Dar nepasirinktas"],
    ["Plotas", state.area],
    ["Naudojimas", state.usage],
    ["Sklypas", state.land],
    ["Vieta", state.location],
    ["Pradžia", state.deadline],
    ["Montavimas", state.installation],
    ["Biudžetas", state.budget],
    ["Kontaktas", state.contactTime || "Nesvarbu"]
  ];
  document.getElementById("summaryContent").innerHTML = `
    <div class="summary-grid">
      ${items.map(([label,value]) => `
        <div class="summary-item">${label}<strong>${escapeHtml(value)}</strong></div>
      `).join("")}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[char]));
}

nextBtn.addEventListener("click", () => {
  const error = validateStep();
  if (error) {
    setError(error);
    return;
  }
  if (state.step < totalSteps) {
    state.step++;
    renderStep();
  } else {
    form.hidden = true;
    successScreen.hidden = false;
    document.querySelector(".form-top").style.display = "none";
    document.querySelector(".progress").style.display = "none";
  }
});

backBtn.addEventListener("click", () => {
  if (state.step > 1) {
    state.step--;
    renderStep();
  }
});

document.getElementById("editSummary").addEventListener("click", () => {
  state.step = 1;
  renderStep();
});

document.getElementById("restartBtn").addEventListener("click", () => {
  Object.keys(state).forEach(key => state[key] = key === "step" ? 1 : "");
  form.reset();
  document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));
  form.hidden = false;
  successScreen.hidden = true;
  document.querySelector(".form-top").style.display = "";
  document.querySelector(".progress").style.display = "";
  renderStep();
});

renderStep();
