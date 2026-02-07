import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================
   FIREBASE INIT
   ========================= */

const firebaseConfig = {
  // 🔴 DEINE DATEN HIER (unverändert lassen falls schon korrekt)
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   DATE (LOKAL, UTC-SAFE)
   ========================= */

function localDateId(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const todayId = localDateId();
const TARGET = 170;

/* =========================
   LOGIN UI
   ========================= */

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const overlay = document.getElementById("loginOverlay");
const confirmLogin = document.getElementById("confirmLogin");
const userName = document.getElementById("userName");

loginBtn.onclick = () => overlay.style.display = "flex";
overlay.onclick = e => { if (e.target === overlay) overlay.style.display = "none"; };

confirmLogin.onclick = async () => {
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, pw);
    overlay.style.display = "none";
  } catch (e) {
    alert("Login fehlgeschlagen");
  }
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    userName.textContent = user.email;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    document.getElementById("saveBar").classList.remove("hidden");
  } else {
    userName.textContent = "";
    loginBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    document.getElementById("saveBar").classList.add("hidden");
  }
});

/* =========================
   TODAY SNAPSHOT
   ========================= */

onSnapshot(doc(db, "proteinTracker", todayId), snap => {
  const d = snap.exists() ? snap.data() : {};
  document.getElementById("todayNoah").style.width =
    Math.min(100, ((d.Noah || 0) / TARGET) * 100) + "%";
  document.getElementById("todayMax").style.width =
    Math.min(100, ((d.Max || 0) / TARGET) * 100) + "%";
});

/* =========================
   SAVE
   ========================= */

document.getElementById("saveBtn").onclick = async () => {
  const val = Number(document.getElementById("proteinInput").value);
  if (!val) return;

  const ref = doc(db, "proteinTracker", todayId);
  await setDoc(ref, { Noah: val }, { merge: true });
  document.getElementById("proteinInput").value = "";
};
