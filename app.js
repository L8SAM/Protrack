import { db, auth } from "./firebase.js";
import { addOfflineEntry, getOfflineEntries, clearOfflineEntries } from "./offline-db.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const TARGET = 170;

// ELEMENTE
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const overlay = document.getElementById("loginOverlay");
const confirmLogin = document.getElementById("confirmLogin");
const email = document.getElementById("email");
const password = document.getElementById("password");
const saveBtn = document.getElementById("saveBtn");
const input = document.getElementById("proteinInput");
const userName = document.getElementById("userName");
const saveHint = document.getElementById("saveHint");
const offlineHint = document.getElementById("offlineHint");

const todayNoah = document.getElementById("todayNoah");
const todayMax = document.getElementById("todayMax");
const todayNoahPct = document.getElementById("todayNoahPct");
const todayMaxPct = document.getElementById("todayMaxPct");

let currentName = null;

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
    saveBtn.disabled = false;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    overlay.style.display = "none";
  } else {
    currentName = null;
    userName.textContent = "";
    saveBtn.disabled = true;
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
  }
});

// HEUTE – nur Anzeige
const today = new Date().toISOString().split("T")[0];
onSnapshot(doc(db, "proteinTracker", today), snap => {
  const data = snap.data() || {};
  updateBars(data.Noah ?? 0, data.Max ?? 0);
});

// SPEICHERN
saveBtn.onclick = async () => {
  if (!currentName) return;

  const val = Number(input.value);
  if (!val || val <= 0) return;

  // 🔒 UX-Schutz
  saveBtn.disabled = true;
  saveBtn.classList.add("saving");
  saveBtn.textContent = "✓";
  input.value = "";

  // 🧠 sofort UI
  incrementLocal(currentName, val);

  try {
    if (navigator.onLine) {
      await saveToFirebase(today, currentName, val);
    } else {
      await addOfflineEntry({ date: today, user: currentName, value: val });
      offlineHint.style.display = "block";
    }
  } catch (e) {
    console.error(e);
  }

  setTimeout(() => {
    saveBtn.disabled = false;
    saveBtn.classList.remove("saving");
    saveBtn.textContent = "Speichern";
  }, 1000);
};

// FIREBASE SAVE
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

// UI HELFER
function updateBars(noah, max) {
  const n = Math.min(100, (noah / TARGET) * 100);
  const m = Math.min(100, (max / TARGET) * 100);

  todayNoah.style.width = n + "%";
  todayMax.style.width = m + "%";
  todayNoahPct.textContent = Math.round(n) + "%";
  todayMaxPct.textContent = Math.round(m) + "%";
}

function incrementLocal(user, val) {
  const pct = Math.round((val / TARGET) * 100);

  if (user === "Noah") {
    todayNoahPct.textContent = Math.min(100, parseInt(todayNoahPct.textContent) + pct) + "%";
    todayNoah.style.width = todayNoahPct.textContent;
  } else {
    todayMaxPct.textContent = Math.min(100, parseInt(todayMaxPct.textContent) + pct) + "%";
    todayMax.style.width = todayMaxPct.textContent;
  }
}
