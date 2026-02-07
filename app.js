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
const offlineHint = document.getElementById("offlineHint");

const todayNoah = document.getElementById("todayNoah");
const todayMax = document.getElementById("todayMax");
const todayNoahPct = document.getElementById("todayNoahPct");
const todayMaxPct = document.getElementById("todayMaxPct");

const weekChart = document.getElementById("weekChart");
const avgNoahEl = document.getElementById("avgNoah");
const avgMaxEl = document.getElementById("avgMax");

let currentName = null;
let weekValues = {};

// ---------------- LOGIN ----------------
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

// ---------------- HEUTE ----------------
const today = new Date().toISOString().split("T")[0];

onSnapshot(doc(db, "proteinTracker", today), snap => {
  const data = snap.data();
  if (!data) return;                 // ⛔ nichts überschreiben
  updateBars(data.Noah ?? 0, data.Max ?? 0);
});

// ---------------- WOCHE ----------------
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

const monday = startOfWeek(new Date());
weekChart.innerHTML = ""; // reset

for (let i = 0; i < 7; i++) {
  const d = new Date(monday);
  d.setDate(monday.getDate() + i);
  const id = d.toISOString().split("T")[0];

  const el = document.createElement("div");
  el.className = "week-day";
  el.innerHTML = `
    ${d.toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    })}
    <div class="week-bars">
      <div class="week-bar"><div id="n-${id}" class="week-fill" style="background:#3b82f6"></div></div>
      <div class="week-bar"><div id="m-${id}" class="week-fill" style="background:#22c55e"></div></div>
    </div>
  `;
  weekChart.appendChild(el);

  onSnapshot(doc(db, "proteinTracker", id), snap => {
    const data = snap.data() || {};

    weekValues[id] = {
      Noah: data.Noah ?? 0,
      Max: data.Max ?? 0
    };

    document.getElementById(`n-${id}`).style.width =
      Math.min(100, (weekValues[id].Noah / TARGET) * 100) + "%";

    document.getElementById(`m-${id}`).style.width =
      Math.min(100, (weekValues[id].Max / TARGET) * 100) + "%";

    const days = Object.values(weekValues);
    const avg = p =>
      Math.round(
        days.reduce((s, d) => s + Math.min(100, (d[p] / TARGET) * 100), 0) /
        days.length
      );

    avgNoahEl.textContent = avg("Noah") + "%";
    avgMaxEl.textContent = avg("Max") + "%";
  });
}

// ---------------- SPEICHERN ----------------
saveBtn.onclick = async () => {
  if (!currentName) return;

  const val = Number(input.value);
  if (!val || val <= 0) return;

  input.value = "";
  saveBtn.disabled = true;
  setTimeout(() => (saveBtn.disabled = false), 800);

  // sofort UI
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
};

// ---------------- FIREBASE ----------------
async function saveToFirebase(date, user, val) {
  const ref = doc(db, "proteinTracker", date);
  const snap = await getDoc(ref);
  const prev = snap.exists() ? snap.data()[user] ?? 0 : 0;
  await setDoc(ref, { [user]: prev + val }, { merge: true });
}

// ---------------- OFFLINE SYNC ----------------
window.addEventListener("online", async () => {
  offlineHint.style.display = "none";
  const entries = await getOfflineEntries();
  for (const e of entries) {
    await saveToFirebase(e.date, e.user, e.value);
  }
  if (entries.length) await clearOfflineEntries();
});

// ---------------- UI HELPERS ----------------
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
    const next = Math.min(100, parseInt(todayNoahPct.textContent) + pct);
    todayNoahPct.textContent = next + "%";
    todayNoah.style.width = next + "%";
  } else {
    const next = Math.min(100, parseInt(todayMaxPct.textContent) + pct);
    todayMaxPct.textContent = next + "%";
    todayMax.style.width = next + "%";
  }
}
