import { db, auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const TARGET = 150;

// Elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const overlay = document.getElementById("loginOverlay");
const confirmLogin = document.getElementById("confirmLogin");
const email = document.getElementById("email");
const password = document.getElementById("password");
const saveBtn = document.getElementById("saveBtn");
const input = document.getElementById("proteinInput");
const userName = document.getElementById("userName");

const todayNoah = document.getElementById("todayNoah");
const todayMax = document.getElementById("todayMax");
const todayNoahPct = document.getElementById("todayNoahPct");
const todayMaxPct = document.getElementById("todayMaxPct");

const weekChart = document.getElementById("weekChart");
const offlineHint = document.getElementById("offlineHint");

let currentName = null;

// LOGIN
loginBtn.onclick = () => overlay.style.display = "flex";
overlay.onclick = e => {
  if (e.target === overlay) overlay.style.display = "none";
};
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
    userName.textContent = "Gast";
    saveBtn.disabled = true;
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
  }
});

// TODAY
const today = new Date().toISOString().split("T")[0];
onSnapshot(doc(db, "proteinTracker", today), snap => {
  const data = snap.data() || {};
  const n = Math.min(100, ((data.Noah ?? 0) / TARGET) * 100);
  const m = Math.min(100, ((data.Max ?? 0) / TARGET) * 100);

  todayNoah.style.width = n + "%";
  todayMax.style.width = m + "%";
  todayNoahPct.textContent = Math.round(n) + "%";
  todayMaxPct.textContent = Math.round(m) + "%";
});

// WEEK
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

const monday = startOfWeek(new Date());

for (let i = 0; i < 7; i++) {
  const d = new Date(monday);
  d.setDate(monday.getDate() + i);
  const id = d.toISOString().split("T")[0];

  const dayEl = document.createElement("div");
  dayEl.className = "week-day";
  dayEl.innerHTML = `
    ${d.toLocaleDateString("de-DE", { weekday: "short" })}
    <div class="week-bars">
      <div class="week-bar"><div id="n-${id}" class="week-fill" style="background:#3b82f6"></div></div>
      <div class="week-bar"><div id="m-${id}" class="week-fill" style="background:#22c55e"></div></div>
    </div>
  `;
  weekChart.appendChild(dayEl);

  onSnapshot(doc(db, "proteinTracker", id), snap => {
    const data = snap.data() || {};
    document.getElementById(`n-${id}`).style.width =
      Math.min(100, ((data.Noah ?? 0) / TARGET) * 100) + "%";
    document.getElementById(`m-${id}`).style.width =
      Math.min(100, ((data.Max ?? 0) / TARGET) * 100) + "%";
  });
}

// SAVE
saveBtn.onclick = async () => {
  if (!currentName) return;
  const val = Number(input.value);
  if (!val) return;

  await setDoc(
    doc(db, "proteinTracker", today),
    { [currentName]: val },
    { merge: true }
  );

  input.value = "";
};

// OFFLINE
function updateConnection() {
  offlineHint.style.display = navigator.onLine ? "none" : "block";
}
window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);
updateConnection();
