alert("1️⃣ JS gestartet");

firebase.initializeApp({
  // 🔴 deine echte firebaseConfig
});

alert("2️⃣ Firebase init OK");

try {
  const db = firebase.firestore();
  alert("3️⃣ firestore() OK");
} catch (e) {
  alert("❌ firestore() CRASH:\n" + e.message);
}
