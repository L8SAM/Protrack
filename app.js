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

// HEADER
const userName = document.getElementById("userName");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// LOGIN MODAL
const modal = document.getElementById("loginModal");
const confirmLogin = document.getElementById("confirmLogin");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// INPUT
const saveBtn = document.getElementById("saveBtn");
const proteinInput = document.getElementById("proteinInput");

// WEEK
const weekEl = document.getElementById("week");

let currentName = null;

// LOGIN FLOW
loginBtn.onclick = () => modal.style.display = "flex";
confirmLogin.onclick = async () => {
  await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  modal.style.display = "none";
};
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    saveBtn.disabled = false;

    currentName = user.email.startsWith("noah") ? "Noah" : "Max";
    userName.textContent = currentName;
  } else {
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
    saveBtn.disabled = true;
    userName.textContent = "Gast";
  }
});

// WEEK BUILD
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

const today = new Date();
const monday = startOfWeek(today);

for (let i = 0; i < 7; i++) {
  const d = new Date(monday);
  d.setDate(monday.getDate() + i);
  const id = d.toISOString().split("T")[0];

  const dayDiv = document.createElement("div");
  dayDiv.className = "day";
  if (id === today.toISOString().split("T")[0]) dayDiv.classList.add("today");

  dayDiv.innerHTML = `
    <div class="day-name">${d.toLocaleDateString("de-DE", { weekday: "short" })}</div>
    <div class="day-date">${d.getDate()}.${d.getMonth()+1}</div>
    <div class="bar"><div class="bar-fill" id="bar-${id}"></div></div>
  `;

  weekEl.appendChild(dayDiv);

  onSnapshot(doc(db, "proteinTracker", id), snap => {
    if (!snap.exists()) return;
    const data = snap.data();
    const total = (data.Noah ?? 0) + (data.Max ?? 0);
    const percent = Math.min(100, (total / TARGET) * 100);
    document.getElementById(`bar-${id}`).style.width = percent + "%";
  });
}

// SAVE (mit Micro-Feedback)
saveBtn.onclick = async () => {
  const val = Number(proteinInput.value);
  if (!val || !currentName) return;

  const todayId = today.toISOString().split("T")[0];
  saveBtn.textContent = "✓ Gespeichert";
  saveBtn.disabled = true;

  await setDoc(
    doc(db, "proteinTracker", todayId),
    { [currentName]: val },
    { merge: true }
  );

  setTimeout(() => {
    saveBtn.textContent = "Speichern";
    saveBtn.disabled = false;
  }, 1200);

  proteinInput.value = "";
};
