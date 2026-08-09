// Importamos las librerías
const express = require('express');
const cors = require('cors');

// Inicializamos la aplicación
const app = express();
const PORT = 3000;

// Configuramos los permisos y el formato JSON
app.use(cors());
app.use(express.json());

// --- AQUÍ IRÁ LA LÓGICA DE TU AGENTE ---

// Creamos una "Ruta" de prueba para escuchar a React
app.post('/jugar', (req, res) => {
    // req.body contendrá el tablero que envíe React
    const estadoTablero = req.body.tablero;

    console.log("¡He recibido el tablero desde React!");

    // Aquí llamaremos a tu algoritmo Minimax en el futuro
    // Por ahora, solo respondemos un mensaje de confirmación
    res.json({
        mensaje: "El agente está analizando la jugada...",
        movimientoAgente: "Fila 1, mover 2 casillas" // Dato simulado
    });
});

// Encendemos el servidor
app.listen(PORT, () => {
    console.log(`Servidor del Agente IA corriendo en http://localhost:${PORT}`);
});