import { db, auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc, setDoc, onSnapshot, getDocs, collection
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const saveBtn = document.getElementById("saveBtn");
const proteinInput = document.getElementById("proteinInput");

const todayValue = document.getElementById("todayValue");
const progressBar = document.getElementById("progressBar");
const calendar = document.getElementById("calendar");
const stats = document.getElementById("stats");

const TARGET = 150;

let currentUser = null;
let currentName = null;

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const todayId = formatDate(now);

// LOGIN
loginBtn.onclick = async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );
  } catch {
    alert("Login fehlgeschlagen");
  }
};

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    saveBtn.disabled = false;
    if (user.email.startsWith("noah")) currentName = "Noah";
    if (user.email.startsWith("max")) currentName = "Max";
  } else {
    currentUser = null;
    saveBtn.disabled = true;
  }
});

// SAVE
saveBtn.onclick = async () => {
  if (!currentUser) return;

  const val = Number(proteinInput.value);
  if (!val) return;

  await setDoc(
    doc(db, "proteinTracker", todayId),
    { [currentName]: val },
    { merge: true }
  );

  proteinInput.value = "";
};

// TODAY LISTENER
onSnapshot(doc(db, "proteinTracker", todayId), snap => {
  if (!snap.exists()) return;
  const data = snap.data();
  const total = (data.Noah ?? 0) + (data.Max ?? 0);
  todayValue.textContent = `${total} g`;
  progressBar.style.width = `${Math.min(100, total / TARGET * 100)}%`;
});

// CALENDAR
function buildCalendar() {
  calendar.innerHTML = "";
  const days = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const id = formatDate(date);

    const div = document.createElement("div");
    div.className = "day";
    if (id === todayId) div.classList.add("today");
    div.textContent = d;
    calendar.appendChild(div);

    onSnapshot(doc(db, "proteinTracker", id), snap => {
      if (snap.exists()) {
        const data = snap.data();
        div.innerHTML = `
          ${d}<br>
          N: ${data.Noah ?? "-"}<br>
          M: ${data.Max ?? "-"}
        `;
      }
    });
  }
}

// STATS
async function loadStats() {
  let n = [], m = [];

  const snap = await getDocs(collection(db, "proteinTracker"));
  snap.forEach(docu => {
    const d = new Date(docu.id);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const data = docu.data();
      if (data.Noah) n.push(data.Noah);
      if (data.Max) m.push(data.Max);
    }
  });

  stats.innerHTML = `
    Noah Ø: ${avg(n)} g<br>
    Max Ø: ${avg(m)} g
  `;
}

function avg(arr) {
  if (!arr.length) return "-";
  return (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1);
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

buildCalendar();
loadStats();
