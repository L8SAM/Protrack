/* =========================
   FIREBASE INIT (STABIL)
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

db.enablePersistence({ synchronizeTabs: false }).catch(() => {});

/* =========================
   KONSTANTEN
   ========================= */
const TARGET = 170;
const USERS = ["Noah", "Max"];

/* =========================
   HELPERS
   ========================= */
const el = id => document.getElementById(id);

function dateId(d) {
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0,0,0,0);
  return d;
}

function addDays(d, days) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

/* =========================
   LOGIN / USER
   ========================= */
let currentUser = "Noah"; // default

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
    // Zuordnung Mail → Name (wie vorher)
    if (user.email.includes("max")) currentUser = "Max";
    else currentUser = "Noah";

    el("userName").textContent = currentUser;
    el("loginBtn").style.display = "none";
    el("logoutBtn").style.display = "inline";
    el("saveBar").classList.remove("hidden");

    loadToday();
    loadWeek(0);
    loadWeek(-7);
  } else {
    el("userName").textContent = "";
    el("loginBtn").style.display = "inline";
    el("logoutBtn").style.display = "none";
    el("saveBar").classList.add("hidden");
  }
});

/* =========================
   HEUTE
   ========================= */
function loadToday() {
  const today = dateId(new Date());

  db.collection("proteinTracker").doc(today)
    .onSnapshot(snap => {
      const d = snap.exists ? snap.data() : {};

      USERS.forEach(name => {
        const value = d[name] || 0;
        const percent = Math.round((value / TARGET) * 100);

        el(`today${name}`).style.width = Math.min(100, percent) + "%";
        el(`today${name}Text`).textContent =
          `${value} g / ${TARGET} g (${percent}%)`;
      });
    });
}

/* =========================
   WOCHE / LETZTE WOCHE
   ========================= */
function loadWeek(offsetDays) {
  const base = startOfWeek(new Date());
  base.setDate(base.getDate() + offsetDays);

  const targetEl = offsetDays === 0
    ? el("weekChart")
    : el("lastWeekChart");

  targetEl.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const d = addDays(base, i);
    const id = dateId(d);

    const dayEl = document.createElement("div");
    dayEl.className = "week-day";

    dayEl.innerHTML = `
      <div class="week-label">
        ${["Mo","Di","Mi","Do","Fr","Sa","So"][i]}<br>
        ${d.getDate()}.${d.getMonth()+1}
      </div>
      <div class="week-bars">
        <div class="week-bar">
          <div class="week-fill noah" id="w-${id}-Noah"></div>
        </div>
        <div class="week-bar">
          <div class="week-fill max" id="w-${id}-Max"></div>
        </div>
      </div>
    `;

    targetEl.appendChild(dayEl);

    db.collection("proteinTracker").doc(id)
      .onSnapshot(snap => {
        const data = snap.exists ? snap.data() : {};

        USERS.forEach(name => {
          const v = data[name] || 0;
          const p = Math.min(100, (v / TARGET) * 100);
          const bar = el(`w-${id}-${name}`);
          if (bar) bar.style.width = p + "%";
        });
      });
  }
}

/* =========================
   SAVE
   ========================= */
el("saveBtn").onclick = async () => {
  const value = Number(el("proteinInput").value);
  if (!value) return;

  const today = dateId(new Date());

  await db.collection("proteinTracker")
    .doc(today)
    .set(
      { [currentUser]: firebase.firestore.FieldValue.increment(value) },
      { merge: true }
    );

  el("proteinInput").value = "";
};
