alert("1️⃣ JS gestartet");

if (typeof firebase === "undefined") {
  alert("❌ Firebase undefined");
} else {
  alert("✅ Firebase vorhanden");
}

/* TEST: NUR INIT */
try {
  firebase.initializeApp({
    apiKey: "TEST",
    projectId: "TEST"
  });
  alert("✅ firebase.initializeApp OK");
} catch (e) {
  alert("❌ INIT FEHLER: " + e.message);
}
