import { db, auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const loginBox = document.getElementById("loginBox");
const appDiv = document.getElementById("app");
const userInfo = document.getElementById("userInfo");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");

const proteinInput = document.getElementById("proteinInput");
const saveBtn = document.getElementById("saveBtn");
const calendar = document.getElementById("calendar");

let canWrite = false;
let currentUserName = null;

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

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

// AUTH STATUS
onAuthStateChanged(auth, user => {
  if (user) {
    loginBox.style.display = "none";
    appDiv.style.display = "block";
    canWrite = true;

    if (user.email.startsWith("noah")) currentUserName = "Noah";
    if (user.email.startsWith("max")) currentUserName = "Max";

    userInfo.textContent = `Eingeloggt als ${currentUserName}`;
  } else {
    loginBox.style.display = "block";
    appDiv.style.display = "none";
    canWrite = false;
  }
});

// SAVE
saveBtn.onclick = async () => {
  if (!canWrite) {
    alert("Bitte einloggen");
    return;
  }

  const protein = Number(proteinInput.value);
  if (!protein) return;

  const dateId = formatDate(new Date());

  await setDoc(
    doc(db, "proteinTracker", dateId),
    { [currentUserName]: protein },
    { merge: true }
  );

  proteinInput.value = "";
};

// KALENDER
function buildCalendar() {
  calendar.innerHTML = "";
  const days = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const id = formatDate(date);

    const div = document.createElement("div");
    div.className = "day";
    div.id = id;
    div.textContent = d;
    calendar.appendChild(div);

    onSnapshot(doc(db, "proteinTracker", id), snap => {
      if (snap.exists()) {
        const data = snap.data();
        div.innerHTML = `
          ${d}<br>
          Noah: ${data.Noah ?? "-"}<br>
          Max: ${data.Max ?? "-"}
        `;
      }
    });
  }
}

buildCalendar();
