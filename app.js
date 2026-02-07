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
const loginBtn = loginBtn = document.getElementById("loginBtn");
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

// HEUTE
const today = new Date().toISOString().split("T")[0];

onSnapshot(doc(db, "proteinTracker", today), snap => {
  const data = snap.data() || {};
  const n = Math.min(100, ((data.Noah ?? 0) / TARGET) * 100);
  const m = Math.min(100, ((data.Max ?? 0) / TARGET) * 100);

  document.getElementById("todayNoah").style.width = n + "%";
  document.getElementById("todayMax").style.width = m + "%";
  document.getElementById("todayNoahPct").textContent = Math.round(n) + "%";
  document.getElementById("todayMaxPct").textContent = Math.round(m) + "%";
});

// SPEICHERN (ONLINE / OFFLINE)
saveBtn.onclick = async () => {
  if (!currentName) return;
  const val = Number(input.value);
  if (!val) return;

  if (!navigator.onLine) {
    await addOfflineEntry({ date: today, user: currentName, value: val });
    offlineHint.style.display = "block";
  } else {
    await saveToFirebase(today, currentName, val);
  }

  input.value = "";
  saveHint.style.display = "block";
  setTimeout(() => saveHint.style.display = "none", 1500);
};

// SYNC OFFLINE → FIREBASE
async function saveToFirebase(date, user, val) {
  const ref = doc(db, "proteinTracker", date);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? snap.data()[user] ?? 0 : 0;
  await setDoc(ref, { [user]: prev + val }, { merge: true });
}

window.addEventListener("online", async () => {
  offlineHint.style.display = "none";
  const entries = await getOfflineEntries();
  for (const e of entries) {
    await saveToFirebase(e.date, e.user, e.value);
  }
  if (entries.length) await clearOfflineEntries();
});
