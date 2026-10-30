// ==========================================
// FORNY STYLE — SERVICIO DE NOTIFICACIONES
// ==========================================

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBQRU-noQpQmKsS61TdnXaLQVL8e2jIBLI",
  authDomain: "forny-style.firebaseapp.com",
  projectId: "forny-style",
  storageBucket: "forny-style.firebasestorage.app",
  messagingSenderId: "1071345954995",
  appId: "1:1071345954995:web:122dd0963811455b4080c6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};

  self.registration.showNotification(
    notification.title || "Nueva reserva — Forny Style",
    {
      body: notification.body || "Se ha registrado una nueva cita.",
      data: {
        url: "https://fornystyle.github.io/forny-style/admin.html"
      }
    }
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data.url ||
    "https://fornystyle.github.io/forny-style/admin.html";

  event.waitUntil(clients.openWindow(url));
});
