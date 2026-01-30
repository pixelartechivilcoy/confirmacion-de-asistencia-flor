const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0FIBsssQ3WPH8FjhHD05f7tek_0C7F-RYrPqE4lP26XbiUvlbK7S455So61ZA2-a2vHeU7Dkf63hF/pub?output=csv";

const lista = document.querySelector(".panel-lista");

let todasLasConfirmaciones = [];

fetch(SHEET_URL)
  .then(r => r.text())
  .then(texto => {

    const filas = texto
      .trim()
      .split("\n")
      .slice(1); // sin encabezados

    filas.forEach(fila => {

      if (!fila.trim()) return;

      const columnas = fila.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        .map(c => c.replace(/^"|"$/g, ""));

      const estado = columnas[1];
      const cantidad = columnas[2];
      const textoPersonas = columnas[3] || "";
      const mensaje = columnas[4] || "";

      const personas = textoPersonas
        .split(/\r?\n/)
        .map(linea =>
          linea.replace(/^Invitado\s*\d+:\s*/i, "").trim()
        )
        .filter(l => l.length);

      const bloque = document.createElement("div");
      bloque.className = "confirmacion";

      bloque.dataset.estado = estado.toLowerCase();
      bloque.dataset.cantidad = cantidad;


      bloque.innerHTML = `
        <div class="confirmacion-header">
          <div class="estado">${estado}</div>
          <div class="cantidad">${cantidad} personas</div>
        </div>

        <div class="personas">
          ${personas.map(p => {
            const partes = p.split("–");
            const nombre = partes[0]?.trim() || "";
            const dieta = partes[1]?.trim() || "";
            return `
              <div class="persona">
                <div class="persona-nombre">${nombre}</div>
                <div class="persona-dieta">${dieta}</div>
              </div>
            `;
          }).join("")}
        </div>

        ${
          mensaje
            ? `
            <div class="mensaje">
              <strong>Mensaje</strong>
              ${mensaje}
            </div>
            `
            : ""
        }
      `;

      lista.appendChild(bloque);
      todasLasConfirmaciones.push(bloque);
 

    });

  })
  .catch(err => {
    console.error("Error leyendo la planilla", err);
  });

  const botones = document.querySelectorAll(".filtro");

botones.forEach(boton => {
  boton.addEventListener("click", () => {

    botones.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");

    const texto = boton.textContent.trim().toLowerCase();

    todasLasConfirmaciones.forEach(bloque => {

      let mostrar = true;

      const estado = bloque.dataset.estado;
      const cantidad = parseInt(bloque.dataset.cantidad, 10);

      if (texto === "confirmados") {
        mostrar = estado.includes("confirmo");
      }

      if (texto === "no confirmados") {
        mostrar = !estado.includes("confirmo");
      }

      if (texto === "1–2 personas") {
        mostrar = cantidad <= 2;
      }

      if (texto === "3+ personas") {
        mostrar = cantidad >= 3;
      }

      if (texto === "todos") {
        mostrar = true;
      }

      bloque.style.display = mostrar ? "" : "none";

    });

  });
});
