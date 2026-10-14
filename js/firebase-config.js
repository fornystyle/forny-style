/**
 * CONFIGURACIÓN DE FIREBASE — FORNY STYLE
 */

const firebaseConfig = {
  apiKey: "AIzaSyBQRU-noQpQmKsS61TdnXaLQVL8e2jIBLI",
  authDomain: "forny-style.firebaseapp.com",
  projectId: "forny-style",
  storageBucket: "forny-style.firebasestorage.app",
  messagingSenderId: "1071345954995",
  appId: "1:1071345954995:web:122dd0963811455b4080c6",
  measurementId: "G-R6H506DLC5"
};

let firebaseReady = false;
let db = null;
let auth = null;

try {
  const configured =
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("PENDIENTE");

  if (configured && typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);

    db = firebase.firestore();
    auth = firebase.auth();

    firebaseReady = true;

    console.log("[Forny Style] Firebase conectado correctamente.");
  } else {
    console.warn(
      "[Forny Style] Firebase no está configurado todavía."
    );
  }
} catch (e) {
  console.error(
    "[Forny Style] Error iniciando Firebase:",
    e
  );
}