const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

// Genera los movimientos permitidos avanzar o retroceder a casillas vacías sin saltar al oponente
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

// FUNCIÓN HEURÍSTICA
function evaluarTablero(tablero) {
    let puntajeTotal = 0;

    for (let i = 0; i < 4; i++) {
        let colNegra = tablero[i].indexOf('N');
        let colBlanca = tablero[i].indexOf('B');
        let espaciosVacios = colBlanca - colNegra - 1;

        if (espaciosVacios === 0) {
            puntajeTotal += 100; 
        } else {
            puntajeTotal -= espaciosVacios * 10;
        }
        puntajeTotal += colNegra * 5;
    }

    return puntajeTotal;
}

// Algoritmo Minimax guiado por la heurística y optimizado con Poda Alfa-Beta
function minimax(tablero, profundidad, esMaximizador, alpha = -Infinity, beta = Infinity) {
    // Profundidad 5 para garantizar la estrategia ganadora absoluta
    if (profundidad === 5) {
        return evaluarTablero(tablero);
    }

    let movimientos = obtenerMovimientosValidos(tablero, esMaximizador);

    if (movimientos.length === 0) {
        return esMaximizador ? -9999 : 9999;
    }

    if (esMaximizador) {
        let mejorValor = -Infinity;
        for (let m of movimientos) {
            let copia = tablero.map(f => [...f]);
            copia[m.fila][m.origen] = 0;
            copia[m.fila][m.destino] = 'N';

            let valor = minimax(copia, profundidad + 1, false, alpha, beta);
            mejorValor = Math.max(mejorValor, valor);
            
            // Poda Alfa-Beta
            alpha = Math.max(alpha, mejorValor);
            if (beta <= alpha) break; // Cortamos esta rama, no vale la pena seguir calculando
        }
        return mejorValor;
    } else {
        let mejorValor = Infinity;
        for (let m of movimientos) {
            let copia = tablero.map(f => [...f]);
            copia[m.fila][m.origen] = 0;
            copia[m.fila][m.destino] = 'B';

            let valor = minimax(copia, profundidad + 1, true, alpha, beta);
            mejorValor = Math.min(mejorValor, valor);
            
            // Poda Alfa-Beta
            beta = Math.min(beta, mejorValor);
            if (beta <= alpha) break; // Cortamos esta rama
        }
        return mejorValor;
    }
}

// Turno de la IA adaptado para iniciar la Poda Alfa-Beta
function jugarTurnoIA(tablero) {
    let movimientos = obtenerMovimientosValidos(tablero, true);
    if (movimientos.length === 0) return tablero;

    let mejorMovimiento = movimientos[0];
    let mejorValor = -Infinity;
    
    // Variables iniciales para la poda
    let alpha = -Infinity;
    let beta = Infinity;

    for (let m of movimientos) {
        let copia = tablero.map(f => [...f]);
        copia[m.fila][m.origen] = 0;
        copia[m.fila][m.destino] = 'N';

        let valor = minimax(copia, 0, false, alpha, beta);

        if (valor > mejorValor) {
            mejorValor = valor;
            mejorMovimiento = m;
        }
        // Actualizamos el alpha en la raíz
        alpha = Math.max(alpha, mejorValor);
    }

    tablero[mejorMovimiento.fila][mejorMovimiento.origen] = 0;
    tablero[mejorMovimiento.fila][mejorMovimiento.destino] = 'N';

    return tablero;
}

app.post('/jugar', (req, res) => {
    const tablero = req.body.tablero;
    if (!tablero) return res.json({ error: "Falta el tablero." });

    // 1. Evaluamos si el movimiento que acaba de hacer el usuario dejó a la IA sin opciones
    const movimientosIA = obtenerMovimientosValidos(tablero, true);
    
    if (movimientosIA.length === 0) {
        // El usuario ganó, devolvemos el mensaje de victoria inmediatamente sin que la IA juegue
        return res.json({ 
            tableroNuevo: tablero, 
            ganador: "Felicidades... ¡Venciste al agente!" 
        });
    }

    // 2. Si la IA aún tiene movimientos, ejecuta su turno
    const tableroActualizado = jugarTurnoIA(tablero);

    // 3. Verificamos si la IA, con su nuevo movimiento, acorraló al usuario
    const movimientosUsuario = obtenerMovimientosValidos(tableroActualizado, false);
    let ganador = null;
    
    if (movimientosUsuario.length === 0) {
        ganador = "Te ganó el agente XD";
    }

    res.json({ 
        tableroNuevo: tableroActualizado, 
        ganador: ganador 
    });
});

app.listen(PORT, () => {
    console.log(`Servidor del Agente IA corriendo en http://localhost:${PORT}`);
});