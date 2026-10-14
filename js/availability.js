/**
 * LÓGICA DE DISPONIBILIDAD
 * -------------------------------------------------
 * Para cada fecha, la disponibilidad real sale de UNA de estas dos fuentes:
 *
 * 1) Si el administrador definió un horario especial para esa fecha exacta
 *    (documento en disponibilidad/{fecha}), se usa ESE, completo, ignorando
 *    el horario base — permite bloquear el día entero, abrir fuera de
 *    horario normal, o definir varios bloques distintos (ej. 09:30-13:00
 *    disponible, 13:00-16:00 bloqueado, 16:00-20:30 disponible).
 *
 * 2) Si no hay nada especial para esa fecha, se usa el horario base de ese
 *    día de la semana (BUSINESS_CONFIG.horarioDefault), para no obligar al
 *    administrador a configurar manualmente cada fecha del año.
 *
 * Ningún horario queda fijo e inmutable: todo es editable por fecha.
 */

function hmToMinutes(hm) {
  if (hm === "24:00") return 24 * 60;
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function generarSlotsDeBloque(inicio, fin, duracionMin) {
  const slots = [];
  const ini = hmToMinutes(inicio);
  const end = hmToMinutes(fin);
  for (let t = ini; t + duracionMin <= end; t += duracionMin) {
    slots.push(minutesToHM(t));
  }
  return slots;
}

/**
 * Devuelve [{hora, ocupado}] para una fecha dada.
 */
async function obtenerHorariosDisponibles(fecha) {
  const override = await DataStore.getDisponibilidad(fecha);

  let bloquesDisponibles;
  if (override) {
    bloquesDisponibles = (override.bloques || [])
      .filter(b => b.disponible)
      .map(b => [b.inicio, b.fin]);
  } else {
    const diaSemana = new Date(fecha + "T12:00:00").getDay();
    bloquesDisponibles = BUSINESS_CONFIG.horarioDefault[diaSemana] || [];
  }

  let slots = [];
  bloquesDisponibles.forEach(([inicio, fin]) => {
    slots = slots.concat(generarSlotsDeBloque(inicio, fin, BUSINESS_CONFIG.duracionCitaMin));
  });
  slots = [...new Set(slots)].sort();

  const citas = await DataStore.getCitasPorFecha(fecha);
  const ocupados = new Set(citas.map(c => c.hora));

  return slots.map(hora => ({ hora, ocupado: ocupados.has(hora) }));
}

/** Texto legible de un override, para mostrarlo en el panel de admin. */
function describirOverride(override) {
  if (!override || !override.bloques || override.bloques.length === 0) {
    return "Horario normal (sin cambios)";
  }
  const totalBloqueado =
    override.bloques.length === 1 &&
    !override.bloques[0].disponible &&
    override.bloques[0].inicio === "00:00" &&
    override.bloques[0].fin === "24:00";
  if (totalBloqueado) return "Cerrado todo el día";

  const totalAbierto =
    override.bloques.length === 1 &&
    override.bloques[0].disponible &&
    override.bloques[0].inicio === "00:00" &&
    override.bloques[0].fin === "24:00";
  if (totalAbierto) return "Abierto todo el día (24h)";

  return override.bloques
    .map(b => `${b.inicio}–${b.fin} ${b.disponible ? "disponible" : "bloqueado"}`)
    .join(" · ");
}
