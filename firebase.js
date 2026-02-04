import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5ZCHkx2mTINSJyRMUhZXwNZk7mqrZZLo",
  authDomain: "protrack-d4ab4.firebaseapp.com",
  projectId: "protrack-d4ab4",
  storageBucket: "protrack-d4ab4.firebasestorage.app",
  messagingSenderId: "522219668711",
  appId: "1:522219668711:web:2d132ee2e8ae007bfbce42"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
