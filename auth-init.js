/**
 * auth-init.js — Initialisation Firebase centralisée
 * Importer ce module dans chaque page pour partager app/auth/db
 * et garantir la persistance de session entre les pages.
 */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence,
         signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore }
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDxi-HmCweLukbYF2KMq9O72yS9PIMoeA",
  authDomain: "myz-campagne.firebaseapp.com",
  projectId: "myz-campagne",
  storageBucket: "myz-campagne.firebasestorage.app",
  messagingSenderId: "352488409798",
  appId: "1:352488409798:web:e6d3daa4bc6e8a09a065c7"
};

export const ADMIN_UID = "NQDL7LT3zmewlfSJa69VWY6qSPU2";

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Persiste la session dans localStorage → survit aux rechargements et navigations
setPersistence(auth, browserLocalPersistence).catch(console.error);

export async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}

export { onAuthStateChanged };
