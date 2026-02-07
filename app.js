alert("1️⃣ JS gestartet");

firebase.initializeApp({
  apiKey: "TEST",
  projectId: "TEST"
});

alert("2️⃣ Firebase init OK");

/* === AUTH TEST === */
try {
  const auth = firebase.auth();
  alert("3️⃣ firebase.auth() OK");

  auth.onAuthStateChanged(() => {
    alert("4️⃣ onAuthStateChanged ausgelöst");
  });
} catch (e) {
  alert("❌ AUTH FEHLER: " + e.message);
}
