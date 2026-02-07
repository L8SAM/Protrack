import { db, auth } from "./firebase.js";
import { addOfflineEntry, getOfflineEntries, clearOfflineEntries } from "./offline-db.js";

import { signInWithEmailAndPassword, onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { doc, setDoc, getDoc, onSnapshot }
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const TARGET = 170;

// ELEMENTE
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const overlay = document.getElementById("loginOverlay");
const confirmLogin = document.getElementById("confirmLogin");
const email = document.getElementById("email");
const password = document.getElementById("password");

const saveBar = document.getElementById("saveBar");
const saveBtn = document.getElementById("saveBtn");
const input = document.getElementById("proteinInput");
const undoBar = document.getElementById("undoBar");
const undoBtn = document.getElementById("undoBtn");

const userName = document.getElementById("userName");
const offlineHint = document.getElementById("offlineHint");
const eveningHint = document.getElementById("eveningHint");

const todayNoah = document.getElementById("todayNoah");
const todayMax = document.getElementById("todayMax");
const todayNoahText = document.getElementById("todayNoahText");
const todayMaxText = document.getElementById("todayMaxText");

let currentName = null;
let lastEntry = null;
let goalReached = { Noah:false, Max:false };

// LOGIN
loginBtn.onclick = () => overlay.style.display = "flex";
overlay.onclick = e => e.target === overlay && (overlay.style.display = "none");
confirmLogin.onclick = () =>
  signInWithEmailAndPassword(auth, email.value, password.value);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    currentName = user.email.startsWith("noah") ? "Noah" : "Max";
    userName.textContent = currentName;
    saveBar.classList.remove("hidden");
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    overlay.style.display = "none";
  } else {
    saveBar.classList.add("hidden");
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
  }
});

// SNAPSHOT HEUTE
const today = new Date().toISOString().split("T")[0];

onSnapshot(doc(db, "proteinTracker", today), snap => {
  const data = snap.data() || {};
  renderToday("Noah", data.Noah ?? 0);
  renderToday("Max", data.Max ?? 0);
  updateEveningHint(data[currentName] ?? 0);
});

function renderToday(name, grams) {
  const pct = Math.round((grams / TARGET) * 100);
  const barPct = Math.min(100, pct);

  const bar = name === "Noah" ? todayNoah : todayMax;
  const text = name === "Noah" ? todayNoahText : todayMaxText;

  bar.style.width = barPct + "%";
  bar.className = "today-fill " +
    (pct > 100 ? "gold" : name === "Noah" ? "blue" : "green");

  text.textContent = `${pct}% · ${grams} g / ${TARGET} g`;

  if (grams >= TARGET && !goalReached[name]) {
    goalReached[name] = true;
    if (navigator.vibrate) navigator.vibrate([20,40,20]);
  }
}

// LIVE PREVIEW
input.oninput = () => {
  const val = Number(input.value);
  if (!val || !currentName) {
    saveBtn.textContent = "Eintragen";
    return;
  }
  saveBtn.textContent = `+${val} g speichern`;
};

// SPEICHERN
saveBtn.onclick = async () => {
  const val = Number(input.value);
  if (!val) return;

  if (val > 300 && !confirm(`Meintest du wirklich ${val} g?`)) return;

  if (navigator.vibrate) navigator.vibrate(15);

  lastEntry = val;
  input.value = "";
  saveBtn.textContent = "Eintragen";

  try {
    if (navigator.onLine) {
      await saveToFirebase(today, currentName, val);
    } else {
      await addOfflineEntry({ date: today, user: currentName, value: val });
      offlineHint.style.display = "block";
    }
  } finally {
    showUndo();
  }
};

function showUndo() {
  undoBar.classList.remove("hidden");
  setTimeout(() => undoBar.classList.add("hidden"), 5000);
}

undoBtn.onclick = async () => {
  if (!lastEntry) return;
  await saveToFirebase(today, currentName, -lastEntry);
  lastEntry = null;
  undoBar.classList.add("hidden");
};

// EVENING HINT
function updateEveningHint(grams) {
  const hour = new Date().getHours();
  if (hour >= 19 && grams < TARGET) {
    eveningHint.style.display = "block";
    eveningHint.textContent = `Noch ${TARGET - grams} g bis zum Ziel`;
  } else {
    eveningHint.style.display = "none";
  }
}

// FIREBASE WRITE
async function saveToFirebase(date, user, val) {
  const ref = doc(db, "proteinTracker", date);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? snap.data()[user] ?? 0 : 0;
  await setDoc(ref, { [user]: prev + val }, { merge: true });
}

// OFFLINE SYNC
window.addEventListener("online", async () => {
  offlineHint.style.display = "none";
  const entries = await getOfflineEntries();
  for (const e of entries) {
    await saveToFirebase(e.date, e.user, e.value);
  }
  if (entries.length) await clearOfflineEntries();
});
