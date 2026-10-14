/**
 * PANEL DE ADMINISTRACIÓN
 * -------------------------------------------------
 * Todo lo que ve y hace el barbero dentro de /admin: ver citas próximas,
 * y definir la disponibilidad de cualquier fecha con bloques personalizados.
 */

const fechaInput = document.getElementById("admin-fecha");
const bloquesWrap = document.getElementById("bloques-editor");
const btnAgregarBloque = document.getElementById("btn-agregar-bloque");
const btnBloquearDia = document.getElementById("btn-bloquear-dia");
const btnAbrirDia = document.getElementById("btn-abrir-dia");
const btnGuardarDia = document.getElementById("btn-guardar-dia");
const btnQuitarOverride = document.getElementById("btn-quitar-override");
const resumenOverrides = document.getElementById("resumen-overrides");
const citasLista = document.getElementById("citas-lista");

let bloquesActuales = [];

function hoyISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function render() {
  fechaInput.min = hoyISO();
  if (!fechaInput.value) fechaInput.value = hoyISO();

  bloquesWrap.innerHTML = "";
  bloquesActuales.forEach((b, i) => {
    const row = document.createElement("div");
    row.className = "bloque-row";
    row.innerHTML = `
      <input type="time" value="${b.inicio}" data-field="inicio" data-i="${i}">
      <span>a</span>
      <input type="time" value="${b.fin === "24:00" ? "23:59" : b.fin}" data-field="fin" data-i="${i}">
      <label class="chk">
        <input type="checkbox" ${b.disponible ? "checked" : ""} data-field="disponible" data-i="${i}">
        Disponible
      </label>
      <button type="button" class="quitar-bloque" data-i="${i}" aria-label="Quitar bloque">✕</button>
    `;
    bloquesWrap.appendChild(row);
  });

  bloquesWrap.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("change", e => {
      const i = Number(e.target.dataset.i);
      const field = e.target.dataset.field;
      bloquesActuales[i][field] = field === "disponible" ? e.target.checked : e.target.value;
    });
  });
  bloquesWrap.querySelectorAll(".quitar-bloque").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = Number(e.target.dataset.i);
      bloquesActuales.splice(i, 1);
      render();
    });
  });
}

async function cargarFecha() {
  if (!fechaInput.value) {
    fechaInput.value = hoyISO();
  }

  const fecha = fechaInput.value;

  if (!fecha) {
    console.error("[Forny Style] No se pudo determinar la fecha.");
    return;
  }

  const override = await DataStore.getDisponibilidad(fecha);

  bloquesActuales = override
    ? JSON.parse(JSON.stringify(override.bloques || []))
    : [];

  resumenOverrides.textContent = describirOverride(override);
  render();
}


fechaInput.addEventListener("change", cargarFecha);

btnAgregarBloque.addEventListener("click", () => {
  bloquesActuales.push({ inicio: "09:00", fin: "19:00", disponible: true });
  render();
});

btnBloquearDia.addEventListener("click", () => {
  bloquesActuales = [{ inicio: "00:00", fin: "24:00", disponible: false }];
  render();
});

btnAbrirDia.addEventListener("click", () => {
  bloquesActuales = [{ inicio: "00:00", fin: "24:00", disponible: true }];
  render();
});

btnGuardarDia.addEventListener("click", async () => {
  const fecha = fechaInput.value;
  if (!fecha) return;
  await DataStore.setDisponibilidad(fecha, { bloques: bloquesActuales });
  await cargarFecha();
  btnGuardarDia.textContent = "Guardado ✓";
  setTimeout(() => (btnGuardarDia.textContent = "Guardar para esta fecha"), 1500);
});

btnQuitarOverride.addEventListener("click", async () => {
  const fecha = fechaInput.value;
  if (!fecha) return;
  await DataStore.borrarDisponibilidad(fecha);
  await cargarFecha();
});

async function renderCitas() {
  const citas = await DataStore.getTodasCitas();
  const ahora = new Date();

  // Conservar solo las citas cuyo horario todavía no ha pasado.
  const citasFuturas = citas.filter(c => {
    if (!c.fecha || !c.hora) return false;

    const fechaHoraCita = new Date(`${c.fecha}T${c.hora}:00`);
    return !Number.isNaN(fechaHoraCita.getTime()) &&
           fechaHoraCita > ahora;
  });

  citasLista.innerHTML = "";

  if (citasFuturas.length === 0) {
    citasLista.innerHTML = '<p class="vacio">No hay citas pendientes.</p>';
    return;
  }

  citasFuturas.sort((a, b) =>
    (a.fecha + a.hora).localeCompare(b.fecha + b.hora)
  );

    citasFuturas.forEach(c => {
    const row = document.createElement("div");
    row.className = "cita-row";
    row.innerHTML = `
      <span class="cita-fecha">${c.fecha} · ${c.hora}</span>
      <span class="cita-nombre">${c.nombre}</span>
      <span class="cita-servicio">${c.servicio}</span>
      <span class="cita-telefono">${c.telefono}</span>
    `;
    citasLista.appendChild(row);
  });
}

function iniciarPanelAdmin() {
  cargarFecha();
  renderCitas();
}
