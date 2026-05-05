const tablero = document.getElementById("tablero");
const size = 8;

let piezaSeleccionada = null;
let casillasPosibles = [];

const tiposTerreno = ["agua", "llanura", "montaña"];

let mapa = [];
let piezas = [];
let ciudad = { x: 2, y: 6 };

// ===== GUARDAR =====
function guardarJuego() {
    const data = {
        mapa,
        piezas,
        ciudad
    };
    localStorage.setItem("juego", JSON.stringify(data));
}

// ===== CARGAR =====
function cargarJuego() {
    const data = localStorage.getItem("juego");

    if (data) {
        const parsed = JSON.parse(data);
        mapa = parsed.mapa;
        piezas = parsed.piezas;
        ciudad = parsed.ciudad;
    } else {
        nuevoJuego();
    }
}

// ===== NUEVO JUEGO =====
function nuevoJuego() {
    generarMapa();

    ciudad = { x: 2, y: 6 };

    piezas = [
        // rey siempre cerca de la ciudad
        { tipo: 'rey', color: 'blanco', x: ciudad.x + 1, y: ciudad.y },
        { tipo: 'rey', color: 'negro', x: 6, y: 1 },
    ];

    guardarJuego();
}

// ===== REINICIAR =====
function reiniciarJuego() {
    localStorage.removeItem("juego");
    nuevoJuego();
    dibujarTablero();
}

// ===== MAPA =====
function generarMapa() {
    mapa = [];

    for (let y = 0; y < size; y++) {
        let fila = [];
        for (let x = 0; x < size; x++) {

            let tipo = tiposTerreno[Math.floor(Math.random() * tiposTerreno.length)];
            fila.push(tipo);
        }
        mapa.push(fila);
    }
}

// ===== DIBUJAR =====
function dibujarTablero() {
    tablero.innerHTML = "";

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {

            const casilla = document.createElement("div");
            casilla.classList.add("casilla");

            const terreno = mapa[y][x];
            casilla.classList.add(terreno);

            // ciudad (no se mueve)
            if (x === ciudad.x && y === ciudad.y) {
                casilla.textContent = "🏰";
            }

            // movimientos posibles
            if (casillasPosibles.some(c => c.x === x && c.y === y)) {
                casilla.classList.add("posible");
            }

            // pieza
            const pieza = piezas.find(p => p.x == x && p.y == y);
            if (pieza) {
                casilla.textContent = obtenerEmoji(pieza);
            }

            casilla.addEventListener("click", () => manejarClick(x, y));

            tablero.appendChild(casilla);
        }
    }
}

// ===== CLICK =====
function manejarClick(x, y) {
    const pieza = piezas.find(p => p.x == x && p.y == y);

    if (piezaSeleccionada && esMovimientoValido(x, y)) {

        // evitar moverse a la ciudad
        if (x === ciudad.x && y === ciudad.y) return;

        piezaSeleccionada.x = x;
        piezaSeleccionada.y = y;

        piezaSeleccionada = null;
        casillasPosibles = [];

        guardarJuego();
    }
    else if (pieza) {
        piezaSeleccionada = pieza;
        casillasPosibles = calcularMovimientos(pieza);
    }
    else {
        piezaSeleccionada = null;
        casillasPosibles = [];
    }

    dibujarTablero();
}

// ===== VALIDAR =====
function esMovimientoValido(x, y) {
    return casillasPosibles.some(c => c.x === x && c.y === y);
}

// ===== MOVIMIENTO =====
function calcularMovimientos(pieza) {
    const movimientos = [];

    const dirs = [
        {x: 1, y: 0},
        {x: -1, y: 0},
        {x: 0, y: 1},
        {x: 0, y: -1},
    ];

    dirs.forEach(d => {
        const nx = pieza.x + d.x;
        const ny = pieza.y + d.y;

        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {

            if (mapa[ny][nx] !== "agua") {
                movimientos.push({ x: nx, y: ny });
            }
        }
    });

    return movimientos;
}

// ===== EMOJIS =====
function obtenerEmoji(p) {
    return p.color === "blanco" ? "♔" : "♚";
}

// ===== INICIO =====
cargarJuego();
dibujarTablero();