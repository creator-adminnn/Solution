/* =====================================================
   LOTOPREDICT V1.0
   Motor experimental de análisis estadístico
===================================================== */

const STORAGE_SORTEOS = "lotopredict_sorteos";

let sorteos = cargarSorteos();


// =====================================================
// ELEMENTOS
// =====================================================

const fechaSorteo = document.getElementById("fechaSorteo");
const primerPremio = document.getElementById("primerPremio");
const segundoPremio = document.getElementById("segundoPremio");
const tercerPremio = document.getElementById("tercerPremio");

const btnReset = document.getElementById("btnReset");

const btnGuardarSorteo = document.getElementById("btnGuardarSorteo");
const btnAnalizar = document.getElementById("btnAnalizar");

const historialBody = document.getElementById("historialBody");

const totalSorteos = document.getElementById("totalSorteos");
const totalCandidatos = document.getElementById("totalCandidatos");
const candidateNumbers = document.getElementById("candidateNumbers");
const coverageValue = document.getElementById("coverageValue");


// =====================================================
// FECHA DE HOY
// =====================================================

function establecerFechaActual() {

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);


    // Fecha máxima = hoy
    const fechaMaxima = new Date(hoy);


    // Fecha mínima = últimos 90 días incluyendo hoy
    const fechaMinima = new Date(hoy);

    fechaMinima.setDate(
        fechaMinima.getDate() - 89
    );


    function convertirFechaInput(fecha) {

        const year = fecha.getFullYear();

        const month = String(
            fecha.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            fecha.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    fechaSorteo.min =
        convertirFechaInput(fechaMinima);


    fechaSorteo.max =
        convertirFechaInput(fechaMaxima);


    if (!fechaSorteo.value) {

        fechaSorteo.value =
            convertirFechaInput(hoy);

    }
}


// =====================================================
// CARGAR DATOS
// =====================================================

function cargarSorteos() {

    try {

        const datos =
            localStorage.getItem(STORAGE_SORTEOS);

        if (!datos) {
            return [];
        }

        const resultado = JSON.parse(datos);

        return Array.isArray(resultado)
            ? resultado
            : [];

    } catch (error) {

        console.error(
            "Error cargando sorteos:",
            error
        );

        return [];
    }
}


// =====================================================
// GUARDAR EN LOCALSTORAGE
// =====================================================

function guardarEnStorage() {

    localStorage.setItem(
        STORAGE_SORTEOS,
        JSON.stringify(sorteos)
    );
}


// =====================================================
// NORMALIZAR NÚMERO
// 1 -> 01
// 9 -> 09
// 25 -> 25
// =====================================================

function normalizarNumero(valor) {

    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    const numero = Number(valor);

    if (
        !Number.isInteger(numero) ||
        numero < 0 ||
        numero > 99
    ) {
        return null;
    }

    return String(numero).padStart(2, "0");
}


// =====================================================
// REGISTRAR SORTEO
// =====================================================

function registrarSorteo() {

    const fecha = fechaSorteo.value;

    const primera =
        normalizarNumero(primerPremio.value);

    const segunda =
        normalizarNumero(segundoPremio.value);

    const tercera =
        normalizarNumero(tercerPremio.value);


    if (!fecha) {

        alert("Selecciona la fecha del sorteo.");

        return;
    }


    if (
        primera === null ||
        segunda === null ||
        tercera === null
    ) {

        alert(
            "Los premios deben ser números entre 00 y 99."
        );

        return;
    }


    // Evitar registrar la misma fecha dos veces

    const fechaExiste = sorteos.some(
        sorteo => sorteo.fecha === fecha
    );


    if (fechaExiste) {

        alert(
            "Ya existe un sorteo registrado con esa fecha."
        );

        return;
    }


    const nuevoSorteo = {

        id: Date.now(),

        fecha,

        primera,

        segunda,

        tercera

    };


    sorteos.push(nuevoSorteo);


    // Ordenar del más reciente al más antiguo

    sorteos.sort(
        (a, b) =>
            new Date(b.fecha) -
            new Date(a.fecha)
    );


    guardarEnStorage();

    limpiarPremios();

    renderizarHistorial();

    actualizarResumen();


}


// =====================================================
// LIMPIAR CAMPOS
// =====================================================

function limpiarPremios() {

    primerPremio.value = "";
    segundoPremio.value = "";
    tercerPremio.value = "";

    primerPremio.focus();
}


// =====================================================
// MOSTRAR HISTORIAL
// =====================================================

function renderizarHistorial() {

    historialBody.innerHTML = "";


    if (sorteos.length === 0) {

        historialBody.innerHTML = `

            <tr class="empty-row">

                <td colspan="5">
                    Todavía no hay sorteos registrados.
                </td>

            </tr>

        `;

        return;
    }


    sorteos.forEach(sorteo => {

        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${formatearFecha(sorteo.fecha)}
            </td>

            <td>
                <strong>${sorteo.primera}</strong>
            </td>

            <td>
                <strong>${sorteo.segunda}</strong>
            </td>

            <td>
                <strong>${sorteo.tercera}</strong>
            </td>

            <td>
                <button
                    class="btn-eliminar"
                    onclick="eliminarSorteo(${sorteo.id})"
                >
                    Eliminar
                </button>
            </td>

        `;


        historialBody.appendChild(fila);

    });
}


// =====================================================
// ELIMINAR SORTEO
// =====================================================

function eliminarSorteo(id) {

    sorteos = sorteos.filter(
        sorteo => sorteo.id !== id
    );

    guardarEnStorage();

    renderizarHistorial();

    actualizarResumen();
}


// =====================================================
// FORMATEAR FECHA
// =====================================================

function formatearFecha(fecha) {

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// =====================================================
// ACTUALIZAR DASHBOARD
// =====================================================

function actualizarResumen() {

    totalSorteos.textContent =
        sorteos.length;
}


// =====================================================
// CREAR UNIVERSO 00 - 99
// =====================================================

function crearUniverso() {

    return Array.from(
        { length: 100 },
        (_, i) =>
            String(i).padStart(2, "0")
    );
}


// =====================================================
// MOTOR DE ANÁLISIS V1
// =====================================================

function analizarNumeros() {

    if (sorteos.length === 0) {

        alert(
            "Primero debes registrar resultados históricos."
        );

        return;
    }


    // =============================================
    // CALCULAR FECHA LÍMITE DE 90 DÍAS
    // =============================================

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);


    const fechaLimite = new Date(hoy);

    fechaLimite.setDate(
        fechaLimite.getDate() - 89
    );


    // =============================================
    // TOMAR SOLO LOS SORTEOS DE LOS ÚLTIMOS 90 DÍAS
    // =============================================

    const sorteos90Dias =
        sorteos.filter(sorteo => {

            const fecha =
                new Date(
                    `${sorteo.fecha}T00:00:00`
                );


            return (
                fecha >= fechaLimite &&
                fecha <= hoy
            );

        });


    if (sorteos90Dias.length === 0) {

        alert(
            "No hay sorteos dentro de los últimos 90 días."
        );

        return;
    }


    const universo = crearUniverso();


    // =============================================
    // FILTRO 1
    // DESCARTAR NÚMEROS VISTOS EN 1RA Y 2DA
    // DURANTE LOS ÚLTIMOS 90 DÍAS
    // =============================================

    const vistosPrimeraSegunda =
        new Set();


    sorteos90Dias.forEach(sorteo => {

        vistosPrimeraSegunda.add(
            sorteo.primera
        );

        vistosPrimeraSegunda.add(
            sorteo.segunda
        );

    });


    const filtro1 =
        universo.filter(numero =>

            !vistosPrimeraSegunda.has(numero)

        );


// =============================================
// FILTRO 2
// TOMAR LAS 3RAS DE LOS ÚLTIMOS 7 SORTEOS
// DEL BLOQUE HISTÓRICO ANALIZADO
// =============================================


// Ordenamos los sorteos del más reciente al más antiguo
const sorteosOrdenados =
    [...sorteos90Dias].sort(
        (a, b) =>
            new Date(b.fecha) -
            new Date(a.fecha)
    );


// Tomamos únicamente los 7 sorteos más recientes
const ultimos7Sorteos =
    sorteosOrdenados.slice(0, 7);


// Sacamos solamente sus terceras
const vistosTercera =
    new Set(
        ultimos7Sorteos.map(
            sorteo => sorteo.tercera
        )
    );


// De los números que sobrevivieron a 1ra y 2da,
// quitamos únicamente los que aparecieron
// como 3ra en esos últimos 7 sorteos
const filtro2 =
    filtro1.filter(numero =>

        !vistosTercera.has(numero)

    );


    console.clear();

    console.log(
        "===================================="
    );

    console.log(
        "LOTOPREDICT - VENTANA MÓVIL 90 DÍAS"
    );

    console.log(
        "===================================="
    );

    console.log(
        "Desde:",
        fechaLimite.toLocaleDateString()
    );

    console.log(
        "Hasta:",
        hoy.toLocaleDateString()
    );

    console.log(
        "Sorteos usados:",
        sorteos90Dias.length
    );

    console.log(
        "Vistos en 1ra/2da:",
        vistosPrimeraSegunda.size
    );

    console.log(
        "Después del filtro 1:",
        filtro1.length,
        filtro1
    );

    console.log(
        "Últimos 7 sorteos usados para 3ra:",
        ultimos7Sorteos.length
    );

    console.log(
        "3ras analizadas:",
        ultimos7Sorteos.map(
            sorteo => sorteo.tercera
        )
    );

    console.log(
        "Números distintos vistos en 3ra:",
        vistosTercera.size
    );

    console.log(
        "Candidatos finales:",
        filtro2.length,
        filtro2
    );


    mostrarCandidatos(filtro2);
}


// =====================================================
// MOSTRAR RESULTADOS
// =====================================================

function mostrarCandidatos(candidatos) {

    candidateNumbers.innerHTML = "";


    totalCandidatos.textContent =
        candidatos.length;


    coverageValue.textContent =
        `${candidatos.length}%`;


    if (candidatos.length === 0) {

        candidateNumbers.innerHTML = `

            <div
                class="number-card empty"
                style="grid-column:1/-1;"
            >
                Sin candidatos
            </div>

        `;

        return;
    }


    candidatos.forEach(numero => {

        const tarjeta =
            document.createElement("div");


        tarjeta.className =
            "number-card";


        tarjeta.textContent =
            numero;


        candidateNumbers.appendChild(
            tarjeta
        );

    });
}

function resetearSistema() {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar todos los sorteos registrados?"
    );

    if (!confirmar) {
        return;
    }

    // Vaciar memoria
    sorteos = [];

    // Eliminar almacenamiento
    localStorage.removeItem(STORAGE_SORTEOS);

    // Actualizar interfaz
    renderizarHistorial();
    actualizarResumen();

    // Limpiar candidatos
    candidateNumbers.innerHTML = `
        <div class="number-card empty">--</div>
        <div class="number-card empty">--</div>
        <div class="number-card empty">--</div>
        <div class="number-card empty">--</div>
    `;

    totalCandidatos.textContent = "0";
    coverageValue.textContent = "0%";

    limpiarPremios();

}

// =====================================================
// EVENTOS
// =====================================================

btnGuardarSorteo.addEventListener(
    "click",
    registrarSorteo
);


btnAnalizar.addEventListener(
    "click",
    analizarNumeros
);

btnReset.addEventListener(
    "click",
    resetearSistema
);

// =====================================================
// INICIO
// =====================================================

establecerFechaActual();

renderizarHistorial();

actualizarResumen();