alert("1️⃣ JS gestartet");

firebase.initializeApp({
  apiKey: "TEST",
  projectId: "TEST"
});

alert("2️⃣ Firebase init OK");

/* === FIRESTORE TEST === */
try {
  const db = firebase.firestore();
  alert("3️⃣ firebase.firestore() OK");

  db.collection("test").doc("ping").get()
    .then(() => {
      alert("4️⃣ Firestore READ OK");
    })
    .catch(e => {
      alert("❌ Firestore READ Fehler: " + e.message);
    });

} catch (e) {
  alert("❌ Firestore INIT Fehler: " + e.message);
}
