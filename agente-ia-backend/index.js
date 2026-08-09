const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

// --- LÓGICA DE LA IA (MINIMAX) ---
// Usamos un objeto como memoria caché para no calcular la misma jugada dos veces (Memoization)
let memo = {};

// Abstraemos el tablero: Solo nos importan los espacios vacíos entre las fichas Blanca y Negra
function obtenerDistancias(tablero) {
    let distancias = [];
    for (let i = 0; i < 4; i++) {
        let colNegra = tablero[i].indexOf('N');
        let colBlanca = tablero[i].indexOf('B');
        distancias.push(colBlanca - colNegra - 1); 
    }
    return distancias;
}

// Algoritmo Minimax puro
function minimax(estado, esMaximizador) {
    let clave = estado.join(',');
    if (memo[clave] !== undefined) return memo[clave];

    // Condición de cierre: Si ya no hay espacios vacíos, el jugador que le toca mover pierde
    let sumaEspacios = estado.reduce((a, b) => a + b, 0);
    if (sumaEspacios === 0) {
        return esMaximizador ? -1 : 1; 
    }

    if (esMaximizador) {
        let mejorValor = -Infinity;
        // Simulamos todas las jugadas posibles avanzando en cada fila
        for (let i = 0; i < 4; i++) {
            for (let mov = 1; mov <= estado[i]; mov++) {
                let nuevoEstado = [...estado];
                nuevoEstado[i] -= mov;
                mejorValor = Math.max(mejorValor, minimax(nuevoEstado, false));
            }
        }
        memo[clave] = mejorValor;
        return mejorValor;
    } else {
        let mejorValor = Infinity;
        for (let i = 0; i < 4; i++) {
            for (let mov = 1; mov <= estado[i]; mov++) {
                let nuevoEstado = [...estado];
                nuevoEstado[i] -= mov;
                mejorValor = Math.min(mejorValor, minimax(nuevoEstado, true));
            }
        }
        memo[clave] = mejorValor;
        return mejorValor;
    }
}

// Función principal que el Agente usa en su turno
function jugarTurnoIA(tablero) {
    let estado = obtenerDistancias(tablero);
    let mejorMovimiento = null;
    let mejorValor = -Infinity;
    memo = {}; // Limpiamos la mente del Agente en cada nuevo turno

    // El Agente prueba sus jugadas y elige la que retorne un 1 (Victoria garantizada)
    for (let i = 0; i < 4; i++) {
        for (let mov = 1; mov <= estado[i]; mov++) {
            let nuevoEstado = [...estado];
            nuevoEstado[i] -= mov;
            
            let valor = minimax(nuevoEstado, false);
            
            if (valor > mejorValor) {
                mejorValor = valor;
                mejorMovimiento = { fila: i, casillas: mov };
            }
        }
    }

    // Si el usuario jugó perfecto y la IA sabe que va a perder, mueve 1 casilla por defecto
    if (!mejorMovimiento) {
        for (let i = 0; i < 4; i++) {
            if (estado[i] > 0) {
                mejorMovimiento = { fila: i, casillas: 1 };
                break;
            }
        }
    }

    // Traducimos la decisión matemática de vuelta a la matriz visual
    if (mejorMovimiento) {
        let colNegra = tablero[mejorMovimiento.fila].indexOf('N');
        tablero[mejorMovimiento.fila][colNegra] = 0;
        tablero[mejorMovimiento.fila][colNegra + mejorMovimiento.casillas] = 'N';
    }

    return tablero;
}
// ---------------------------------

app.post('/jugar', (req, res) => {
    const tablero = req.body.tablero;
    
    if (!tablero) {
        return res.json({ error: "Falta el tablero." });
    }

    const tableroActualizado = jugarTurnoIA(tablero);
    res.json({ tableroNuevo: tableroActualizado });
});

app.listen(PORT, () => {
    console.log(`Servidor del Agente IA corriendo en http://localhost:${PORT}`);
});