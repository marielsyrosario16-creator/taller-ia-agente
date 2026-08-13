const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

// Genera los movimientos permitidos (avanzar o retroceder a casillas vacías sin saltar al oponente)
function obtenerMovimientosValidos(tablero, esNegra) {
    let movimientos = [];

    for (let i = 0; i < 4; i++) {
        let colNegra = tablero[i].indexOf('N');
        let colBlanca = tablero[i].indexOf('B');

        if (esNegra) {
            // La negra puede moverse a cualquier casilla vacía entre el inicio (0) y la blanca
            for (let c = 0; c < colBlanca; c++) {
                if (tablero[i][c] === 0) {
                    movimientos.push({ fila: i, origen: colNegra, destino: c });
                }
            }
        } else {
            // La blanca puede moverse a cualquier casilla vacía entre la negra y el final (7)
            for (let c = colNegra + 1; c < 8; c++) {
                if (tablero[i][c] === 0) {
                    movimientos.push({ fila: i, origen: colBlanca, destino: c });
                }
            }
        }
    }
    return movimientos;
}

// FUNCIÓN HEURÍSTICA: Aquí aplicamos tu lógica de persecución y bloqueo
function evaluarTablero(tablero) {
    let puntajeTotal = 0;

    for (let i = 0; i < 4; i++) {
        let colNegra = tablero[i].indexOf('N');
        let colBlanca = tablero[i].indexOf('B');
        let espaciosVacios = colBlanca - colNegra - 1;

        // 1. Si los espacios vacíos son 0, la ficha negra está pegada a la blanca (¡Bloqueo total!)
        if (espaciosVacios === 0) {
            puntajeTotal += 100; // Gran recompensa por presionar cara a cara
        } else {
            // 2. Entre menos espacios queden, mejor para la negra (impulsa a avanzar y cerrar el cerco)
            puntajeTotal -= espaciosVacios * 10;
        }

        // 3. Premiamos que la negra tenga una columna más alta (avanzando hacia la derecha)
        puntajeTotal += colNegra * 5;
    }

    return puntajeTotal;
}

// Algoritmo Minimax guiado por tu heurística
function minimax(tablero, profundidad, esMaximizador) {
    // Si llegamos al límite de profundidad o el juego se traba, evaluamos el tablero
    if (profundidad === 3) {
        return evaluarTablero(tablero);
    }

    let movimientos = obtenerMovimientosValidos(tablero, esMaximizador);

    // Si el jugador en turno no tiene movimientos, pierde
    if (movimientos.length === 0) {
        return esMaximizador ? -9999 : 9999;
    }

    if (esMaximizador) {
        let mejorValor = -Infinity;
        for (let m of movimientos) {
            let copia = tablero.map(f => [...f]);
            copia[m.fila][m.origen] = 0;
            copia[m.fila][m.destino] = 'N';

            let valor = minimax(copia, profundidad + 1, false);
            mejorValor = Math.max(mejorValor, valor);
        }
        return mejorValor;
    } else {
        let mejorValor = Infinity;
        for (let m of movimientos) {
            let copia = tablero.map(f => [...f]);
            copia[m.fila][m.origen] = 0;
            copia[m.fila][m.destino] = 'B';

            let valor = minimax(copia, profundidad + 1, true);
            mejorValor = Math.min(mejorValor, valor);
        }
        return mejorValor;
    }
}

// Turno de la IA con mentalidad cazadora
function jugarTurnoIA(tablero) {
    let movimientos = obtenerMovimientosValidos(tablero, true);
    if (movimientos.length === 0) return tablero;

    let mejorMovimiento = movimientos[0];
    let mejorValor = -Infinity;

    for (let m of movimientos) {
        let copia = tablero.map(f => [...f]);
        copia[m.fila][m.origen] = 0;
        copia[m.fila][m.destino] = 'N';

        // Evaluamos este movimiento con Minimax
        let valor = minimax(copia, 0, false);

        // Si este movimiento nos deja en un mejor escenario de presión, lo elegimos
        if (valor > mejorValor) {
            mejorValor = valor;
            mejorMovimiento = m;
        }
    }

    // Ejecutamos la jugada elegida
    tablero[mejorMovimiento.fila][mejorMovimiento.origen] = 0;
    tablero[mejorMovimiento.fila][mejorMovimiento.destino] = 'N';

    return tablero;
}

app.post('/jugar', (req, res) => {
    const tablero = req.body.tablero;
    if (!tablero) return res.json({ error: "Falta el tablero." });

    // 1. Ejecutamos el turno de la IA
    const tableroActualizado = jugarTurnoIA(tablero);

    // 2. Verificamos si al usuario (fichas blancas) le quedan movimientos válidos
    const movimientosUsuario = obtenerMovimientosValidos(tableroActualizado, false);
    
    let ganador = null;
    if (movimientosUsuario.length === 0) {
        ganador = "¡TE GANÓ EL AGENTE XD!";
    }

    // Devolvemos el tablero y el estado de la partida
    res.json({ 
        tableroNuevo: tableroActualizado, 
        ganador: ganador 
    });
});

app.listen(PORT, () => {
    console.log(`Servidor del Agente IA corriendo en http://localhost:${PORT}`);
});