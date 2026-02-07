alert("1️⃣ JS gestartet");

/* =========================
   FIREBASE CONFIG (COMPAT!)
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
alert("2️⃣ Firebase init OK");

/* =========================
   FIRESTORE (JETZT STABIL)
   ========================= */
const db = firebase.firestore();
alert("3️⃣ firestore() OK");

/* =========================
   OPTIONAL: AUTH TEST
   ========================= */
const auth = firebase.auth();
auth.onAuthStateChanged(() => {
  console.log("Auth ready");
});
