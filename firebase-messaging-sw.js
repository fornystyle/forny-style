// ==========================================
// FORNY STYLE — SERVICIO DE NOTIFICACIONES
// ==========================================

// Cargar Firebase
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Configuración de Firebase
firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "forny-style.firebaseapp.com",
  projectId: "forny-style",
  storageBucket: "forny-style.firebasestorage.app",
  messagingSenderId: "1071345954995",
  appId: "TU_APP_ID"
});

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Recibir notificaciones en segundo plano
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

// Abrir administración al pulsar la notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data.url ||
    "https://fornystyle.github.io/forny-style/admin.html";

  event.waitUntil(clients.openWindow(url));
});
