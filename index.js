const { setGlobalOptions } = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

setGlobalOptions({
  maxInstances: 10,
  region: "us-central1"
});

const DURACION_CITA_MIN = 50;

const HORARIO_DEFAULT = {
  0: [],
  1: [["10:00", "20:00"]],
  2: [["10:00", "20:00"]],
  3: [["10:00", "20:00"]],
  4: [["10:00", "20:00"]],
  5: [["10:00", "20:00"]],
  6: [["10:00", "20:00"]]
};

const SERVICIOS = {
  pomada: { nombre: "Corte de cabello + pomada para peinar", precio: 250 },
  minoxidil: { nombre: "Corte de cabello + minoxidil", precio: 300 },
  "barba-pomada": { nombre: "Corte de cabello + barba + pomada para peinar", precio: 350 },
  "barba-minoxidil": { nombre: "Corte de cabello + barba + minoxidil", precio: 400 },
  completo: { nombre: "Corte de cabello + barba + minoxidil + pomada para peinar", precio: 480 },
  fade: { nombre: "Corte fade", precio: 130 },
  escolar: { nombre: "Corte escolar", precio: 100 },
  cumpleanos: { nombre: "Corte de cumpleaños", precio: 60 }
};

function esFechaValida(fecha) {
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia));

  return d.getUTCFullYear() === anio &&
    d.getUTCMonth() === mes - 1 &&
    d.getUTCDate() === dia;
}

function minutos(hora) {
  if (typeof hora !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    return -1;
  }

  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function fechaHoraYaPaso(fecha, hora) {
  const ahora = new Date();

  const fechaActual = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(ahora);

  const horaActual = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(ahora);

  return fecha < fechaActual ||
    (fecha === fechaActual && hora <= horaActual);
}

function bloquePermiteHora(hora, bloques) {
  const inicio = minutos(hora);
  if (inicio < 0) return false;

  const fin = inicio + DURACION_CITA_MIN;

  return bloques.some(([desde, hasta]) => {
    const limiteInicio = minutos(desde);
    const limiteFin = hasta === "24:00" ? 1440 : minutos(hasta);

    return limiteInicio >= 0 &&
      limiteFin >= 0 &&
      inicio >= limiteInicio &&
      fin <= limiteFin &&
      (inicio - limiteInicio) % DURACION_CITA_MIN === 0;
  });
}

function horarioPermitido(fecha, hora, disponibilidad) {
  let bloques;

  if (disponibilidad) {
    bloques = (Array.isArray(disponibilidad.bloques) ? disponibilidad.bloques : [])
      .filter(b => b && b.disponible === true)
      .map(b => [b.inicio, b.fin]);
  } else {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
    bloques = HORARIO_DEFAULT[diaSemana] || [];
  }

  return bloquePermiteHora(hora, bloques);
}

exports.crearReserva = onCall(async (request) => {
  const datos = request.data || {};

  const fecha = datos.fecha;
  const hora = datos.hora;
  const nombre = typeof datos.nombre === "string" ? datos.nombre.trim() : "";
  const telefono = typeof datos.telefono === "string" ? datos.telefono.trim() : "";
  const servicio = SERVICIOS[datos.servicioId];

  if (!esFechaValida(fecha)) {
    throw new HttpsError("invalid-argument", "La fecha no es válida.");
  }

  if (minutos(hora) < 0) {
    throw new HttpsError("invalid-argument", "La hora no es válida.");
  }

  if (!nombre || nombre.length > 100) {
    throw new HttpsError("invalid-argument", "Escribe un nombre válido.");
  }

  if (!telefono || telefono.length > 30) {
    throw new HttpsError("invalid-argument", "Escribe un teléfono válido.");
  }

  if (!servicio) {
    throw new HttpsError("invalid-argument", "El servicio no es válido.");
  }

  if (fechaHoraYaPaso(fecha, hora)) {
    throw new HttpsError("failed-precondition", "Ese horario ya pasó.");
  }

  const disponibilidadRef = db.collection("disponibilidad").doc(fecha);
  const slotRef = db.collection("reservas_slots")
    .doc(`${fecha}_${hora.replace(":", "-")}`);
  const citaRef = db.collection("citas").doc();

  try {
    await db.runTransaction(async (tx) => {
      const disponibilidadSnap = await tx.get(disponibilidadRef);
      const slotSnap = await tx.get(slotRef);

      const disponibilidad = disponibilidadSnap.exists
        ? disponibilidadSnap.data()
        : null;

      if (!horarioPermitido(fecha, hora, disponibilidad)) {
        throw new HttpsError(
          "failed-precondition",
          "Ese horario no está disponible."
        );
      }

      if (slotSnap.exists) {
        throw new HttpsError(
          "already-exists",
          "Ese horario ya fue reservado. Elige otro."
        );
      }

      // Evita duplicar una cita antigua que todavía no tenga
      // documento en reservas_slots.
      const citasQuery = db.collection("citas")
        .where("fecha", "==", fecha)
        .where("hora", "==", hora)
        .limit(1);

      const citasSnap = await tx.get(citasQuery);

      if (!citasSnap.empty) {
        throw new HttpsError(
          "already-exists",
          "Ese horario ya está reservado. Elige otro."
        );
      }

      tx.create(slotRef, {
        fecha,
        hora,
        citaId: citaRef.id,
        creadoEn: FieldValue.serverTimestamp()
      });

      tx.create(citaRef, {
        fecha,
        hora,
        nombre,
        telefono,
        servicio: servicio.nombre,
        servicioId: datos.servicioId,
        precio: servicio.precio,
        creadoEn: FieldValue.serverTimestamp()
      });
    });

    return { ok: true, citaId: citaRef.id };
  } catch (error) {
    if (error instanceof HttpsError) throw error;

    console.error("Error al crear reserva:", error);

    throw new HttpsError(
      "internal",
      "No se pudo confirmar la cita. Inténtalo de nuevo."
    );
  }
});