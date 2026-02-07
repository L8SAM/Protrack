console.log("APP START");

/* =========================
   FIREBASE (CDN ONLY)
   ========================= */

importScripts = () => {}; // iOS safety no-op

const script = src => {
  const s = document.createElement("script");
  s.src = src;
  s.defer = true;
  document.head.appendChild(s);
};

script("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
script("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js");
script("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js");

window.addEventListener("load", () => {

  firebase.initializeApp({
    // 🔴 DEINE firebaseConfig HIER (wie bisher)
  });

  const auth = firebase.auth();
  const db = firebase.firestore();

  /* =========================
     DATE (LOKAL, UTC-SAFE)
     ========================= */

  function localDateId(d = new Date()) {
    return d.getFullYear() + "-" +
      String(d.getMonth()+1).padStart(2,"0") + "-" +
      String(d.getDate()).padStart(2,"0");
  }

  const todayId = localDateId();
  const TARGET = 170;

  /* =========================
     LOGIN
     ========================= */

  const loginBtn = loginBtnEl();
  const logoutBtn = el("logoutBtn");
  const overlay = el("loginOverlay");
  const userName = el("userName");

  loginBtn.onclick = () => overlay.style.display = "flex";
  overlay.onclick = e => { if (e.target === overlay) overlay.style.display = "none"; };

  el("confirmLogin").onclick = async () => {
    try {
      await auth.signInWithEmailAndPassword(
        el("email").value,
        el("password").value
      );
      overlay.style.display = "none";
    } catch {
      alert("Login fehlgeschlagen");
    }
  };

  logoutBtn.onclick = () => auth.signOut();

  auth.onAuthStateChanged(user => {
    if (user) {
      userName.textContent = user.email;
      loginBtn.style.display = "none";
      logoutBtn.style.display = "inline";
      el("saveBar").classList.remove("hidden");
    } else {
      userName.textContent = "";
      loginBtn.style.display = "inline";
      logoutBtn.style.display = "none";
      el("saveBar").classList.add("hidden");
    }
  });

  /* =========================
     TODAY SNAPSHOT
     ========================= */

  db.collection("proteinTracker").doc(todayId)
    .onSnapshot(snap => {
      const d = snap.exists ? snap.data() : {};
      el("todayNoah").style.width = Math.min(100, ((d.Noah||0)/TARGET)*100) + "%";
      el("todayMax").style.width = Math.min(100, ((d.Max||0)/TARGET)*100) + "%";
    });

  /* =========================
     SAVE
     ========================= */

  el("saveBtn").onclick = async () => {
    const v = Number(el("proteinInput").value);
    if (!v) return;
    await db.collection("proteinTracker")
      .doc(todayId)
      .set({ Noah: v }, { merge: true });
    el("proteinInput").value = "";
  };

  function el(id){ return document.getElementById(id); }
  function loginBtnEl(){ return document.getElementById("loginBtn"); }

});
