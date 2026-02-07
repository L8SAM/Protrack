// ⚠️ Hinweis:
// app.js ist länger – aber logisch sauber.
// Wenn du willst, splitten wir später in Module.

import { db, auth } from "./firebase.js";
import { addOfflineEntry, getOfflineEntries, clearOfflineEntries } from "./offline-db.js";

import { signInWithEmailAndPassword, onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { doc, setDoc, getDoc, onSnapshot }
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const TARGET = 170;

// ---------- Helfer ----------
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
}

function renderWeek(containerId, startDate) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const id = d.toISOString().split("T")[0];

    const el = document.createElement("div");
    el.className = "week-day";
    el.innerHTML = `
      ${d.toLocaleDateString("de-DE",{weekday:"short",day:"2-digit"})}
      <div class="week-bars">
        <div class="week-bar"><div id="${containerId}-n-${id}" class="week-fill" style="background:#3b82f6"></div></div>
        <div class="week-bar"><div id="${containerId}-m-${id}" class="week-fill" style="background:#22c55e"></div></div>
      </div>
    `;
    container.appendChild(el);

    onSnapshot(doc(db,"proteinTracker",id),snap=>{
      const data=snap.data()||{};
      document.getElementById(`${containerId}-n-${id}`).style.width =
        Math.min(100,(data.Noah||0)/TARGET*100)+"%";
      document.getElementById(`${containerId}-m-${id}`).style.width =
        Math.min(100,(data.Max||0)/TARGET*100)+"%";
    });
  }
}

// ---------- INIT ----------
const monday = startOfWeek(new Date());
const lastMonday = new Date(monday);
lastMonday.setDate(monday.getDate() - 7);

renderWeek("weekChart", monday);
renderWeek("lastWeekChart", lastMonday);
