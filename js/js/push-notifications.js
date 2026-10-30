const VAPID_KEY = "BDLSrNH3qW-P62K2t4kg_QPMycGVWdGw9juvDHlP-jcIp_TPsGp3_6zbrRvrxIzL5GRdLUGf1nu84eCsJOfI6YQ";

async function activarNotificaciones() {
const boton = document.getElementById("btn-activar-notificaciones");
const estado = document.getElementById("estado-notificaciones");

try {
if (!firebaseReady || !auth.currentUser) {
throw new Error("Primero debes iniciar sesión como administrador.");
}

```
if (!("serviceWorker" in navigator) || !("Notification" in window)) {
  throw new Error("Este navegador no admite notificaciones push.");
}

if (!firebase.messaging.isSupported()) {
  throw new Error("Este navegador no admite Firebase Messaging.");
}

boton.disabled = true;
estado.textContent = "Solicitando permiso para las notificaciones...";

const permiso = await Notification.requestPermission();

if (permiso !== "granted") {
  throw new Error("No se concedió permiso para las notificaciones.");
}

const registro = await navigator.serviceWorker.register(
  "/forny-style/firebase-messaging-sw.js"
);

const messaging = firebase.messaging();

const token = await messaging.getToken({
  vapidKey: VAPID_KEY,
  serviceWorkerRegistration: registro
});

if (!token) {
  throw new Error("Firebase no pudo generar el token del dispositivo.");
}

const usuario = auth.currentUser;

await db.collection("admin_devices").doc(usuario.uid).set({
  uid: usuario.uid,
  token: token,
  actualizadoEn: firebase.firestore.FieldValue.serverTimestamp(),
  navegador: navigator.userAgent
});

estado.textContent = "¡Notificaciones activadas en este dispositivo!";

boton.textContent = "Notificaciones activadas";
```

} catch (error) {
console.error("[Forny Style] Error de notificaciones:", error);

```
estado.textContent = error.message || "No se pudieron activar las notificaciones.";

boton.disabled = false;
```

}
}

document.addEventListener("DOMContentLoaded", () => {
const boton = document.getElementById("btn-activar-notificaciones");

if (boton) {
boton.addEventListener("click", activarNotificaciones);
}
});
