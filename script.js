// 👉 Paste your Google Apps Script Web App URL here (see README.md)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhJtpwxX02SSXtbIWGJTc9C7Bpq_ObQ8b2rOdo9zWdaQRthoqFFM31rpz9iN5jQr_hvg/exec";

// Party date: Church starts 7:30 AM Philippine time (UTC+8)
const PARTY_DATE = new Date("2026-11-28T07:30:00+08:00");

/* ---------- Countdown ---------- */
const cd = {
  days: document.getElementById("cd-days"),
  hours: document.getElementById("cd-hours"),
  mins: document.getElementById("cd-mins"),
  secs: document.getElementById("cd-secs"),
};

function tick() {
  const diff = PARTY_DATE - Date.now();
  if (diff <= 0) {
    document.getElementById("countdown").innerHTML =
      '<p style="grid-column:1/-1;font-weight:700;color:var(--pink-dark)">It\'s party day! 🎉</p>';
    clearInterval(timer);
    return;
  }
  const s = Math.floor(diff / 1000);
  cd.days.textContent = Math.floor(s / 86400);
  cd.hours.textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
  cd.mins.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  cd.secs.textContent = String(s % 60).padStart(2, "0");
}
const timer = setInterval(tick, 1000);
tick();

/* ---------- RSVP form ---------- */
const form = document.getElementById("rsvp-form");
const f = form.elements;
const ifYes = document.getElementById("if-yes");
const errorBox = document.getElementById("form-error");
const submitBtn = document.getElementById("submit-btn");
const thanks = document.getElementById("thanks");
const thanksMsg = document.getElementById("thanks-msg");

// Show companions / event choice only when attending
form.querySelectorAll('input[name="attending"]').forEach((r) =>
  r.addEventListener("change", () => {
    ifYes.hidden = f.attending.value !== "Yes";
    form.querySelector(".choices").classList.remove("invalid");
  })
);

/* ---------- Companions (adult / child) ---------- */
const MAX_COMPANIONS = 4;
const companionList = document.getElementById("companions");
const addBtn = document.getElementById("add-companion");
const hint = document.getElementById("companion-hint");
const rowTpl = document.getElementById("companion-row");
let rowId = 0;

function updateCompanionUI() {
  const n = companionList.children.length;
  addBtn.hidden = n >= MAX_COMPANIONS;
  hint.textContent = n >= MAX_COMPANIONS
    ? `Maximum of ${MAX_COMPANIONS} companions reached.`
    : `You can add up to ${MAX_COMPANIONS} companions.`;
}

addBtn.addEventListener("click", () => {
  const row = rowTpl.content.firstElementChild.cloneNode(true);
  const group = `ctype-${rowId++}`;
  row.querySelectorAll('input[type="radio"]').forEach((r) => (r.name = group));
  row.querySelector(".c-remove").addEventListener("click", () => {
    row.remove();
    updateCompanionUI();
    addBtn.focus();
  });
  companionList.appendChild(row);
  row.querySelector(".c-name").focus();
  updateCompanionUI();
});

function getCompanions() {
  return [...companionList.children].map((row) => ({
    input: row.querySelector(".c-name"),
    name: row.querySelector(".c-name").value.trim(),
    type: row.querySelector('input[type="radio"]:checked').value,
  }));
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.hidden = true;

  const name = f.name.value.trim();
  const attending = f.attending.value;

  f.name.classList.toggle("invalid", !name);
  form.querySelector(".choices").classList.toggle("invalid", !attending);
  if (!name) return showError("Please enter your name."), f.name.focus();
  if (!attending) return showError("Please let us know if you can attend.");

  const yes = attending === "Yes";
  const companions = yes ? getCompanions() : [];
  const missing = companions.find((c) => !c.name);
  companions.forEach((c) => c.input.classList.toggle("invalid", !c.name));
  if (missing) return showError("Please enter your companion's name, or remove the empty row."), missing.input.focus();

  // Honeypot: silently "succeed" for bots
  if (f.website.value) return showThanks(attending, name);

  if (SCRIPT_URL.startsWith("PASTE_")) {
    return showError("RSVP isn't connected yet. Please contact the family directly.");
  }

  // The person filling the form counts as an adult
  const adults = yes ? 1 + companions.filter((c) => c.type === "Adult").length : 0;
  const children = companions.filter((c) => c.type === "Child").length;
  const data = new URLSearchParams({
    name,
    attending,
    guests: String(adults + children),
    adults: String(adults),
    children: String(children),
    companions: companions.map((c) => `${c.name} (${c.type})`).join(", "),
    event: yes ? f.event.value : "-",
    contact: f.contact.value.trim(),
    message: f.message.value.trim(),
  });

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    // URL-encoded body = "simple" request, so no CORS preflight is needed
    const res = await fetch(SCRIPT_URL, { method: "POST", body: data });
    const json = await res.json();
    if (json.result !== "success") throw new Error(json.error || "Unknown error");
    showThanks(attending, name);
  } catch (err) {
    console.error(err);
    showError("Sorry, something went wrong. Please try again in a moment.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Send RSVP";
  }
});

function showThanks(attending, name) {
  const first = name.split(" ")[0];
  thanksMsg.textContent =
    attending === "Yes"
      ? `See you there, ${first}! Emma can't wait to celebrate with you. 🎂`
      : `We'll miss you, ${first}! Thank you for letting us know. 💕`;
  form.hidden = true;
  thanks.hidden = false;
  thanks.scrollIntoView({ behavior: "smooth", block: "center" });
}
