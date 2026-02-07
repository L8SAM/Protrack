alert("1️⃣ JS gestartet");

/* =========================
   FIREBASE INIT
   ========================= */
firebase.initializeApp({
  // 🔴 DEINE ECHTE firebaseConfig HIER
});

alert("2️⃣ Firebase init OK");

/* =========================
   FIRESTORE – ZUERST PERSISTENCE
   ========================= */
const db = firebase.firestore();

db.enablePersistence({ synchronizeTabs: false })
  .then(() => {
    alert("3️⃣ ✅ Firestore Persistence AKTIV");
    startApp(); // 🔥 erst JETZT weiter
  })
  .catch(err => {
    alert("3️⃣ ⚠️ Persistence Fehler: " + err.code);
    startApp(); // trotzdem weiter (wichtig)
  });

/* =========================
   APP START
   ========================= */
function startApp() {
  alert("4️⃣ App startet jetzt");

  // 🔹 MINIMALER TEST-READ
  db.collection("test").doc("ping").get()
    .then(() => {
      alert("5️⃣ ✅ Firestore READ OK");
    })
    .catch(e => {
      alert("❌ Firestore READ Fehler: " + e.message);
    });
}
