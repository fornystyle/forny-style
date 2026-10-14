/**
 * CONFIGURACIÓN CENTRAL DEL NEGOCIO — FORNY STYLE
 * -------------------------------------------------
 * Este es el ÚNICO lugar donde deben editarse los datos del negocio:
 * nombre, logo, servicios, precios, banco, redes sociales, galería, horario base.
 * Ningún otro archivo debe tener estos datos repetidos.
 *
 * Los campos marcados con [AGREGAR] son placeholders: no se inventó
 * ningún dato real ahí, están vacíos a propósito hasta que los agregues.
 */

const BUSINESS_CONFIG = {
  nombre: "Forny Style",

  telefono: "228 119 0209",
  direccion: "Calle Riva Palacios #130, Coatepec, Veracruz",

  // Coloca aquí el archivo del logo real con ese nombre exacto.
  // Si el archivo no existe todavía, el sitio simplemente no muestra imagen de logo
  // (no se inventa ningún logo sustituto).
  logo: "assets/logo arny.jpeg",

  redes: {
    instagram: "", // [AGREGAR] ej. "https://instagram.com/fornystyle"
    facebook: "",  // [AGREGAR]
    tiktok: ""     // [AGREGAR]
  },

  banco: {
  banco: "BBVA",
  titular: "Arnoldo Castelan Gómez",
  clabe: "012853015099032727",
  cuenta: "4152314698114611",
  concepto: "Cita Forny Style"
},
  // Servicios y precios reales proporcionados — no agregar ni inventar otros aquí.
  servicios: [
  { id: "pomada",          nombre: "Corte de cabello + pomada para peinar",                    precio: 250 },
  { id: "minoxidil",       nombre: "Corte de cabello + minoxidil",                              precio: 300 },
  { id: "barba-pomada",    nombre: "Corte de cabello + barba + pomada para peinar",             precio: 350 },
  { id: "barba-minoxidil", nombre: "Corte de cabello + barba + minoxidil",                      precio: 400 },
  { id: "completo",        nombre: "Corte de cabello + barba + minoxidil + pomada para peinar", precio: 480 },
  { id: "fade",            nombre: "Corte fade",                                                precio: 130 },
  { id: "escolar",         nombre: "Corte escolar",                                             precio: 100 },
  { id: "cumpleanos",      nombre: "Corte de cumpleaños",                                       precio: 60 }
],

  // Agrega aquí las rutas de las fotos reales cuando las tengas, ej:
  // "assets/gallery/corte1.jpg". Mientras esté vacío, la sección muestra placeholders.
  galeria: [
  "assets/corte1.jpeg",
  "assets/corte2.jpeg",
  "assets/corte3.jpeg",
  "assets/corte4.jpeg",
  "assets/corte5.jpeg"
],

  // Horario BASE por defecto, solo se usa cuando el administrador NO ha definido
  // un horario especial para una fecha concreta en Firestore. El admin puede
  // sobreescribir cualquier día individual sin afectar este horario base.
  // 0=domingo, 1=lunes ... 6=sábado. Cada día es una lista de bloques [inicio, fin].
  horarioDefault: {
  0: [],
  1: [["10:00", "20:00"]],
  2: [["10:00", "20:00"]],
  3: [["10:00", "20:00"]],
  4: [["10:00", "20:00"]],
  5: [["10:00", "20:00"]],
  6: [["10:00", "20:00"]]
},

  duracionCitaMin: 50,

  textos: {
    heroFrase: "Cortes con personalidad propia. Agenda tu cita en segundos, sin llamadas.",
    footer: "hecho para agendar sin líneas ni llamadas."
  }
};
