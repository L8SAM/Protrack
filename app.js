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

const saveBtn = document.getElementById("saveBtn");
const input = document.getElementById("proteinInput");
const userName = document.getElementById("userName");
const offlineHint = document.getElementById("offlineHint");

const todayNoah = document.getElementById("todayNoah");
const todayMax = document.getElementById("todayMax");
const todayNoahText = document.getElementById("todayNoahText");
const todayMaxText = document.getElementById("todayMaxText");

let currentName = null;
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
    saveBtn.disabled = false;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    overlay.style.display = "none";
  } else {
    saveBtn.disabled = true;
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
  }
});

// HEUTE
const today = new Date().toISOString().split("T")[0];

onSnapshot(doc(db, "proteinTracker", today), snap => {
  const data = snap.data() || {};
  renderToday("Noah", data.Noah ?? 0);
  renderToday("Max", data.Max ?? 0);
});

function renderToday(name, grams) {
  const pct = Math.round((grams / TARGET) * 100);
  const barPct = Math.min(100, pct);

  const bar = name === "Noah" ? todayNoah : todayMax;
  const text = name === "Noah" ? todayNoahText : todayMaxText;

  bar.style.width = barPct + "%";
  text.textContent = `${pct}% · ${grams} g / ${TARGET} g`;

  if (grams >= TARGET && !goalReached[name]) {
    goalReached[name] = true;
    if (navigator.vibrate) navigator.vibrate([20,40,20]);
  }
}

// SPEICHERN
saveBtn.onclick = async () => {
  const val = Number(input.value);
  if (!val) return;

  if (navigator.vibrate) navigator.vibrate(15);

  saveBtn.disabled = true;
  input.value = "";

  try {
    if (navigator.onLine) {
      await saveToFirebase(today, currentName, val);
    } else {
      await addOfflineEntry({ date: today, user: currentName, value: val });
      offlineHint.style.display = "block";
    }
  } finally {
    setTimeout(() => saveBtn.disabled = false, 700);
  }
};

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
