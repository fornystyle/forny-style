/**
 * CAPA DE DATOS
 * -------------------------------------------------
 * Todo el resto del código pide y guarda datos a través de este módulo,
 * nunca habla con Firestore directamente. Así, si Firebase no está
 * configurado (ver firebase-config.js), el sitio sigue funcionando
 * guardando los datos en el navegador (localStorage) como vista previa.
 */

const DataStore = (() => {
  const LS_KEYS = { citas: "fs_citas_local", disponibilidad: "fs_disponibilidad_local" };

  function lsGet(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function lsSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function getCitasPorFecha(fecha) {
    if (firebaseReady) {
      const snap = await db.collection("citas").where("fecha", "==", fecha).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return lsGet(LS_KEYS.citas, []).filter(c => c.fecha === fecha);
  }

  async function getTodasCitas() {
    if (firebaseReady) {
      const snap = await db.collection("citas").orderBy("fecha").get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return lsGet(LS_KEYS.citas, []).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }

async function crearCita(cita) {
  if (firebaseReady) {
    return db.collection("citas").add({
      ...cita,
      creadoEn: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  const all = lsGet(LS_KEYS.citas, []);
  all.push({ id: "local_" + Date.now(), ...cita });
  lsSet(LS_KEYS.citas, all);
}


async function getDisponibilidad(fecha) {
  if (typeof fecha !== "string" || !fecha.trim()) {
    console.error(
      "[Forny Style] getDisponibilidad recibió una fecha vacía:",
      fecha
    );
    return null;
  }

  if (firebaseReady) {
    const doc = await db.collection("disponibilidad").doc(fecha).get();
    return doc.exists ? doc.data() : null;
  }

  const all = lsGet(LS_KEYS.disponibilidad, {});
  return all[fecha] || null;
}


  async function getTodasDisponibilidades() {
    if (firebaseReady) {
      const snap = await db.collection("disponibilidad").get();
      const out = {};
      snap.docs.forEach(d => (out[d.id] = d.data()));
      return out;
    }
    return lsGet(LS_KEYS.disponibilidad, {});
  }

  async function setDisponibilidad(fecha, data) {
    if (firebaseReady) {
      return db.collection("disponibilidad").doc(fecha).set(data);
    }
    const all = lsGet(LS_KEYS.disponibilidad, {});
    all[fecha] = data;
    lsSet(LS_KEYS.disponibilidad, all);
  }

  async function borrarDisponibilidad(fecha) {
    if (firebaseReady) {
      return db.collection("disponibilidad").doc(fecha).delete();
    }
    const all = lsGet(LS_KEYS.disponibilidad, {});
    delete all[fecha];
    lsSet(LS_KEYS.disponibilidad, all);
  }

  return {
    getCitasPorFecha,
    getTodasCitas,
    crearCita,
    getDisponibilidad,
    getTodasDisponibilidades,
    setDisponibilidad,
    borrarDisponibilidad
  };
})();
