alert("1️⃣ JS gestartet");

const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "DEINE_ID",
  appId: "DEINE_APP_ID"
};

firebase.initializeApp(firebaseConfig);
alert("2️⃣ Firebase init OK");

const db = firebase.firestore();
alert("3️⃣ firestore() OK");
