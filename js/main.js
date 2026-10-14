/**
 * SITIO PÚBLICO — index.html
 * -------------------------------------------------
 * Renderiza todo lo que viene de BUSINESS_CONFIG (servicios, galería, pagos,
 * redes, contacto) y maneja el flujo de reserva de citas para clientes
 * anónimos (sin cuenta, sin login).
 */

document.addEventListener("DOMContentLoaded", () => {
  aplicarDatosBasicos();
  renderServicios();
  renderGaleria();
  renderPagos();
  renderRedes();
  iniciarReserva();
});

function aplicarDatosBasicos() {
  document.querySelectorAll("[data-nombre-negocio]").forEach(el => (el.textContent = BUSINESS_CONFIG.nombre));
  document.querySelectorAll("[data-telefono]").forEach(el => (el.textContent = BUSINESS_CONFIG.telefono));
  document.querySelectorAll("[data-direccion]").forEach(el => (el.textContent = BUSINESS_CONFIG.direccion));
  document.querySelectorAll("[data-hero-frase]").forEach(el => (el.textContent = BUSINESS_CONFIG.textos.heroFrase));
  document.querySelectorAll("[data-footer-texto]").forEach(
    el => (el.textContent = `${BUSINESS_CONFIG.nombre} — ${BUSINESS_CONFIG.textos.footer}`)
  );

  // Logo: si no existe el archivo, el <img> simplemente no se muestra (sin inventar uno falso).
  const logoImg = document.getElementById("logo-img");
  if (logoImg) {
    logoImg.src = BUSINESS_CONFIG.logo;
    logoImg.addEventListener("error", () => (logoImg.style.display = "none"));
  }
}

function renderServicios() {
  const cont = document.getElementById("servicios-grid");
  const select = document.getElementById("f-servicio");
  if (!cont) return;

  cont.innerHTML = "";
  select.innerHTML = "";

  BUSINESS_CONFIG.servicios.forEach(s => {
    const card = document.createElement("div");
    card.className = "servicio-card";
    card.innerHTML = `
  <h3>${s.nombre}</h3>
  <div class="precio">$${s.precio}</div>
  ${s.id === "cumpleanos" ? '<p>Presentando INE o identificación oficial para comprobar que es tu cumpleaños.</p>' : ""}
`;
    cont.appendChild(card);

const opt = document.createElement("option");
opt.value = s.id;

const nombreVisible = s.nombre
.replaceAll("Corte de cabello", "Corte")
.replaceAll("pomada para peinar", "pomada");

opt.textContent = `${nombreVisible} — $${s.precio}`;
select.appendChild(opt);

  });
}

function renderGaleria() {
  const cont = document.getElementById("galeria-grid");
  if (!cont) return;
  cont.innerHTML = "";

  if (BUSINESS_CONFIG.galeria.length === 0) {
    for (let i = 0; i < 6; i++) {
      const ph = document.createElement("div");
      ph.className = "galeria-placeholder";
      ph.innerHTML = "<span>Foto próximamente</span>";
      cont.appendChild(ph);
    }
    return;
  }

  BUSINESS_CONFIG.galeria.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Trabajo realizado en " + BUSINESS_CONFIG.nombre;
    img.className = "galeria-img";
    img.addEventListener("click", () => abrirLightbox(src));
    cont.appendChild(img);
  });
}

function abrirLightbox(src) {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightbox-img");
  lbImg.src = src;
  lb.classList.add("open");
}
document.getElementById("lightbox")?.addEventListener("click", () => {
  document.getElementById("lightbox").classList.remove("open");
});

function renderPagos() {
  const b = BUSINESS_CONFIG.banco;
  const campos = [
    ["Banco", b.banco],
    ["Titular", b.titular],
    ["CLABE", b.clabe],
    ["Número de cuenta", b.cuenta],
    ["Concepto", b.concepto]
  ];
  const cont = document.getElementById("datos-bancarios");
  if (!cont) return;
  cont.innerHTML = campos
    .map(([label, val]) => `<p><strong>${label}:</strong> ${val ? val : '<span class="placeholder">[AGREGAR]</span>'}</p>`)
    .join("");
}

function renderRedes() {
  const cont = document.getElementById("redes-sociales");
  if (!cont) return;
  const redes = BUSINESS_CONFIG.redes;
  const activas = Object.entries(redes).filter(([, url]) => url);
  if (activas.length === 0) {
    cont.style.display = "none";
    return;
  }
  cont.innerHTML = activas.map(([nombre, url]) => `<a href="${url}" target="_blank" rel="noopener">${nombre}</a>`).join("");
}

/* ---------------- Flujo de reserva ---------------- */

let horaSeleccionada = null;

function iniciarReserva() {
  const fechaInput = document.getElementById("f-fecha");
  const hoy = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })();
  fechaInput.min = hoy;
  fechaInput.value = hoy;
  fechaInput.addEventListener("change", cargarHorarios);
  cargarHorarios();

  document.getElementById("form-reserva").addEventListener("submit", confirmarReserva);
}

async function cargarHorarios() {
  const fecha = document.getElementById("f-fecha").value;
  const cont = document.getElementById("horarios-disponibles");

  horaSeleccionada = null;
  actualizarBotonSubmit();

  cont.innerHTML = '<p class="cargando">Cargando horarios…</p>';

  try {
    const lista = await obtenerHorariosDisponibles(fecha);

    // Obtener la fecha y hora locales actuales.
    const ahora = new Date();

    const fechaHoy = [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, "0"),
      String(ahora.getDate()).padStart(2, "0")
    ].join("-");

    const minutosActuales =
      ahora.getHours() * 60 + ahora.getMinutes();

    // Si se seleccionó hoy, ocultar los horarios que ya pasaron.
    const horariosFiltrados = lista.filter(({ hora }) => {
      if (fecha !== fechaHoy) {
        return true;
      }

      const [horas, minutos] = hora.split(":").map(Number);
      const minutosHorario = horas * 60 + minutos;

      return minutosHorario > minutosActuales;
    });

    cont.innerHTML = "";

    if (horariosFiltrados.length === 0) {
      cont.innerHTML =
        '<p class="sin-horarios">No hay horarios disponibles este día. Elige otra fecha.</p>';
      return;
    }

    horariosFiltrados.forEach(({ hora, ocupado }) => {
      const btn = document.createElement("button");

      btn.type = "button";
      btn.className = "slot";
      btn.textContent = hora;

      if (ocupado) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".slot").forEach(b => {
            b.classList.remove("selected");
          });

          btn.classList.add("selected");
          horaSeleccionada = hora;
          actualizarBotonSubmit();
        });
      }

      cont.appendChild(btn);
    });
  } catch (error) {
    console.error("Error al cargar los horarios:", error);

    cont.innerHTML =
      '<p class="sin-horarios">No se pudieron cargar los horarios. Intenta recargar la página.</p>';
  }
}

function actualizarBotonSubmit() {
  const btn = document.getElementById("btn-confirmar");
  btn.disabled = !horaSeleccionada;
  btn.textContent = horaSeleccionada ? `Confirmar ${horaSeleccionada}` : "Selecciona un horario";
}

async function confirmarReserva(e) {
  e.preventDefault();
  const mensaje = document.getElementById("reserva-mensaje");
  if (!horaSeleccionada) return;

  const nombre = document.getElementById("f-nombre").value.trim();
  const telefono = document.getElementById("f-telefono").value.trim();
  const servicioId = document.getElementById("f-servicio").value;
  const servicio = BUSINESS_CONFIG.servicios.find(s => s.id === servicioId);
  const fecha = document.getElementById("f-fecha").value;

  if (!nombre || !telefono) {
    mensaje.textContent = "Escribe tu nombre y teléfono para confirmar.";
    mensaje.className = "reserva-mensaje aviso";
    return;
  }

  const btn = document.getElementById("btn-confirmar");
  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    await DataStore.crearCita({
      fecha,
      hora: horaSeleccionada,
      nombre,
      telefono,
      servicioId,
      servicio: servicio.nombre,
      precio: servicio.precio
    });

    mensaje.textContent = `Cita confirmada para el ${fecha} a las ${horaSeleccionada}. ¡Te esperamos!`;
    mensaje.className = "reserva-mensaje ok";
    document.getElementById("f-nombre").value = "";
    document.getElementById("f-telefono").value = "";
    await cargarHorarios();
  } catch (err) {
    mensaje.textContent = "No se pudo guardar la cita, intenta de nuevo.";
    mensaje.className = "reserva-mensaje aviso";
  }
}
