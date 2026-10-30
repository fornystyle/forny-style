// ==========================================
// FORNY STYLE — SERVICIO DE NOTIFICACIONES
// ==========================================

// Cargar Firebase
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

// Configuración de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBQRU-noQpQmKsS61TdnXaLQVL8e2jIBLI",
  authDomain: "forny-style.firebaseapp.com",
  projectId: "forny-style",
  storageBucket: "forny-style.firebasestorage.app",
  messagingSenderId: "1071345954995",
  appId: "1:1071345954995:web:122dd0963811455b4080c6"
});

// Inicializar notificaciones
const messaging = firebase.messaging();

// Recibir notificaciones cuando la página está en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[Forny Style] Notificación recibida:",
    payload
  );

  const notification = payload.notification || {};

  const notificationTitle =
    notification.title || "Nueva reserva — Forny Style";

  const notificationOptions = {
    body:
      notification.body ||
      "Se ha registrado una nueva cita en tu barbería.",
    icon: "/forny-style/assets/icon.png",
    badge: "/forny-style/assets/icon.png",
    data: {
      url: "https://fornystyle.github.io/forny-style/admin.html"
    }
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Abrir el panel de administración al pulsar la notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url ||
    "https://fornystyle.github.io/forny-style/admin.html";

  event.waitUntil(
    clients.openWindow(url)
  );
});
