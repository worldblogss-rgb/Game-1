const tablero = document.getElementById("tablero");
const size = 8;

// PIEZAS INICIALES
const piezas = [
    // Negras
    { tipo: 'torre', color: 'negro', x: 0, y: 0 },
    { tipo: 'caballo', color: 'negro', x: 1, y: 0 },
    { tipo: 'alfil', color: 'negro', x: 2, y: 0 },
    { tipo: 'reina', color: 'negro', x: 3, y: 0 },
    { tipo: 'rey', color: 'negro', x: 4, y: 0 },
    { tipo: 'alfil', color: 'negro', x: 5, y: 0 },
    { tipo: 'caballo', color: 'negro', x: 6, y: 0 },
    { tipo: 'torre', color: 'negro', x: 7, y: 0 },

    // Peones negros
    ...Array.from({length: 8}, (_, i) => ({
        tipo: 'peon',
        color: 'negro',
        x: i,
        y: 1
    })),

    // Peones blancos
    ...Array.from({length: 8}, (_, i) => ({
        tipo: 'peon',
        color: 'blanco',
        x: i,
        y: 6
    })),

    // Blancas
    { tipo: 'torre', color: 'blanco', x: 0, y: 7 },
    { tipo: 'caballo', color: 'blanco', x: 1, y: 7 },
    { tipo: 'alfil', color: 'blanco', x: 2, y: 7 },
    { tipo: 'reina', color: 'blanco', x: 3, y: 7 },
    { tipo: 'rey', color: 'blanco', x: 4, y: 7 },
    { tipo: 'alfil', color: 'blanco', x: 5, y: 7 },
    { tipo: 'caballo', color: 'blanco', x: 6, y: 7 },
    { tipo: 'torre', color: 'blanco', x: 7, y: 7 },
];

// CREAR TABLERO
for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

        const casilla = document.createElement("div");
        casilla.classList.add("casilla");

        // color ajedrez
        if ((x + y) % 2 === 0) {
            casilla.classList.add("blanco");
        } else {
            casilla.classList.add("negro");
        }

        // buscar pieza en esa posición
        const pieza = piezas.find(p => p.x === x && p.y === y);

        if (pieza) {
            casilla.textContent = obtenerEmoji(pieza);
        }

        tablero.appendChild(casilla);
    }
}

// EMOJIS PIEZAS
function obtenerEmoji(p) {
    const mapa = {
        torre:   { blanco: "♖", negro: "♜" },
        caballo: { blanco: "♘", negro: "♞" },
        alfil:   { blanco: "♗", negro: "♝" },
        reina:   { blanco: "♕", negro: "♛" },
        rey:     { blanco: "♔", negro: "♚" },
        peon:    { blanco: "♙", negro: "♟" },
    };

    return mapa[p.tipo][p.color];
}