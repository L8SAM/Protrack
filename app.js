// ================================
// PROTRACK – app.js (MONOLITH)
// Woche + Letzte Woche (stabil)
// ================================

import { db, auth } from "./firebase.js";
import { addOfflineEntry, getOfflineEntries, clearOfflineEntries } from "./offline-db.js";

import { signInWithEmailAndPassword, onAuthStateChanged, signOut }
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { doc, setDoc, getDoc, onSnapshot }
from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const TARGET = 170;
const todayId = new Date().toISOString().split("T")[0];

// ---------- HELFER ----------
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay() || 7; // Mo = Start
  date.setDate(date.getDate() - day + 1);
  date.setHours(0,0,0,0);
  return date;
}

// ---------- WOCHE RENDERN ----------
function renderWeek(containerId, startDate) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const id = d.toISOString().split("T")[0];

    // Klassenlogik
    let classes = "week-day";
    if (containerId === "weekChart" && id === todayId) {
      classes += " today";
    }
    if (containerId === "lastWeekChart") {
      classes += " past";
    }

    const el = document.createElement("div");
    el.className = classes;
    el.innerHTML = `
      <div class="week-label">
        ${d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit" })}
      </div>
      <div class="week-bars">
        <div class="week-bar">
          <div id="${containerId}-n-${id}" class="week-fill noah"></div>
        </div>
        <div class="week-bar">
          <div id="${containerId}-m-${id}" class="week-fill max"></div>
        </div>
      </div>
    `;

    container.appendChild(el);

    // 🔥 Snapshot – immer mit Fallback
    onSnapshot(doc(db, "proteinTracker", id), snap => {
      const data = snap.exists() ? snap.data() : {};
      const noah = data.Noah || 0;
      const max = data.Max || 0;

      const noahEl = document.getElementById(`${containerId}-n-${id}`);
      const maxEl  = document.getElementById(`${containerId}-m-${id}`);

      if (noahEl) {
        noahEl.style.width = Math.min(100, (noah / TARGET) * 100) + "%";
      }
      if (maxEl) {
        maxEl.style.width = Math.min(100, (max / TARGET) * 100) + "%";
      }
    });
  }
}

// ---------- INIT ----------
const monday = startOfWeek(new Date());
const lastMonday = new Date(monday);
lastMonday.setDate(monday.getDate() - 7);

renderWeek("weekChart", monday);       // Diese Woche
renderWeek("lastWeekChart", lastMonday); // Letzte Woche
