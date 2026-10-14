# Forny Style — sitio web + sistema de reservas

## Estructura del proyecto

```
index.html              → sitio público (clientes, sin login)
admin.html               → panel privado del barbero (requiere login)
css/style.css             → todos los estilos
js/business-config.js     → ÚNICO lugar para editar nombre, servicios, precios, banco, redes, horario base
js/firebase-config.js     → claves de Firebase (pendientes de completar)
js/data-store.js          → acceso a datos (Firestore o modo local de vista previa)
js/availability.js        → lógica de horarios disponibles
js/auth.js                → login del administrador
js/admin-panel.js         → lógica del panel /admin
js/main.js                → lógica del sitio público
firestore.rules           → reglas de seguridad para pegar en la consola de Firebase
assets/logo.png           → (falta) coloca aquí el logo real
assets/gallery/           → (falta) coloca aquí las fotos reales de cortes
```

## Estado actual: modo de vista previa

Mientras no conectes Firebase, el sitio **ya funciona completo** usando el
navegador como base de datos temporal (localStorage). Puedes abrir
`index.html` directo y probar todo el flujo de reserva, y `admin.html` para
ver el panel (sin login real, porque Firebase Auth tampoco está conectado
todavía). Nada de esto se pierde al conectar Firebase — simplemente el sitio
empieza a usar la base de datos real en vez de la local.

## Cómo conectar Firebase (una sola vez)

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → activa "Correo electrónico/Contraseña".
3. En la pestaña **Users**, crea manualmente las cuentas del administrador (tú y Arny). No hay registro público — así lo pide la especificación.
4. **Firestore Database** → crea la base de datos (modo producción).
5. **Firestore Database → Reglas** → pega el contenido completo de `firestore.rules` → Publicar.
6. **Configuración del proyecto → Tus apps** → agrega una app web → copia el bloque `firebaseConfig`.
7. Pega esas claves en `js/firebase-config.js`, reemplazando los valores "PENDIENTE".

A partir de ahí, el sitio usa Firestore automáticamente — no hay que tocar ningún otro archivo.

## Qué datos editar y dónde

| Quiero cambiar... | Edito este archivo |
|---|---|
| Servicios y precios | `js/business-config.js` |
| Datos bancarios | `js/business-config.js` (sección `banco`) |
| Redes sociales | `js/business-config.js` (sección `redes`) |
| Horario base por día de la semana | `js/business-config.js` (sección `horarioDefault`) |
| Logo | sube el archivo como `assets/logo.png` |
| Fotos de la galería | sube los archivos a `assets/gallery/` y agrega su ruta en `js/business-config.js` (sección `galeria`) |
| Horario especial de un día puntual (vacaciones, evento, etc.) | directo desde `/admin`, sin tocar código |

## Desplegar en GitHub Pages (gratis)

1. Sube toda esta carpeta tal cual a un repositorio llamado `usuario.github.io`.
2. Settings → Pages → Source: rama `main` → Save.
3. En 1-2 minutos el sitio queda público en `https://usuario.github.io`.
4. `/admin` queda accesible en `https://usuario.github.io/admin.html`.

## Limitación honesta que debes conocer

Las reglas de Firestore evitan que alguien sin sesión edite disponibilidad o
borre citas. Pero **no** garantizan al 100% que dos personas no puedan tomar
el mismo horario si lo confirman en el mismo segundo exacto — eso requeriría
una Cloud Function con transacción, que ya es un paso más avanzado (sigue
siendo gratis en el plan de Firebase, pero implica más configuración). Para
el volumen de una barbería con un solo barbero, el riesgo real de que esto
pase es prácticamente nulo. Si más adelante quieres blindarlo del todo, se
puede agregar.
