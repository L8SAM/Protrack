/* =========================
   FIREBASE INIT (COMPAT)
   ========================= */
const firebaseConfig = {
  apiKey: "AIzaSyA5ZCHkx2mTINSJyRMUhZXwNZk7mqrZZLo",
  authDomain: "protrack-d4ab4.firebaseapp.com",
  projectId: "protrack-d4ab4",
  storageBucket: "protrack-d4ab4.firebasestorage.app",
  messagingSenderId: "522219668711",
  appId: "1:522219668711:web:2d132ee2e8ae007bfbce42"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/* =========================
   FIRESTORE PERSISTENCE (iOS)
   ========================= */
db.enablePersistence({ synchronizeTabs: false }).catch(() => {
  // bewusst still – iOS / Mehrfach-Tabs
});

/* =========================
   DATE HELPERS (lokal, kein UTC-Bug)
   ========================= */
function todayId() {
  const d = new Date();
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

const TODAY = todayId();
const TARGET = 170;

/* =========================
   HELPERS
   ========================= */
const el = id => document.getElementById(id);

/* =========================
   AUTH UI
   ========================= */
el("loginBtn").onclick = () => el("loginOverlay").style.display = "flex";
el("loginOverlay").onclick = e => {
  if (e.target.id === "loginOverlay") el("loginOverlay").style.display = "none";
};

el("confirmLogin").onclick = async () => {
  await auth.signInWithEmailAndPassword(
    el("email").value,
    el("password").value
  );
  el("loginOverlay").style.display = "none";
};

el("logoutBtn").onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  if (user) {
    el("userName").textContent = user.email;
    el("loginBtn").style.display = "none";
    el("logoutBtn").style.display = "inline";
    el("saveBar").classList.remove("hidden");
  } else {
    el("userName").textContent = "";
    el("loginBtn").style.display = "inline";
    el("logoutBtn").style.display = "none";
    el("saveBar").classList.add("hidden");
  }
});

/* =========================
   TODAY VIEW
   ========================= */
db.collection("proteinTracker").doc(TODAY)
  .onSnapshot(snap => {
    const d = snap.exists ? snap.data() : {};
    el("todayNoah").style.width =
      Math.min(100, ((d.Noah || 0) / TARGET) * 100) + "%";
    el("todayMax").style.width =
      Math.min(100, ((d.Max || 0) / TARGET) * 100) + "%";
  });

/* =========================
   SAVE
   ========================= */
el("saveBtn").onclick = async () => {
  const value = Number(el("proteinInput").value);
  if (!value) return;

  await db.collection("proteinTracker")
    .doc(TODAY)
    .set({ Noah: value }, { merge: true });

  el("proteinInput").value = "";
};
