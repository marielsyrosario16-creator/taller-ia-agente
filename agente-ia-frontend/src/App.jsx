import { useState } from 'react';
import './App.css';

function App() {
  const estadoInicial = [
    ['N', 0, 0, 0, 0, 0, 0, 'B'],
    ['N', 0, 0, 0, 0, 0, 0, 'B'],
    ['N', 0, 0, 0, 0, 0, 0, 'B'],
    ['N', 0, 0, 0, 0, 0, 0, 'B']
  ];

  const [tablero, setTablero] = useState(estadoInicial);
  const [seleccionada, setSeleccionada] = useState(null); 

  const manejarClic = (fila, col) => {
    const casilla = tablero[fila][col];

    if (casilla === 'B') {
      setSeleccionada({ fila, col });
      return;
    }

    if (seleccionada && casilla === 0) {
      
      if (fila !== seleccionada.fila) {
        alert("¡Un movimiento consiste en desplazar una ficha a lo largo de su fila!");
        return;
      }

      const colNegra = tablero[fila].indexOf('N');
      if (col <= colNegra) {
        alert("¡La ficha desplazada no puede saltar por encima de la del jugador oponente!");
        return;
      }

      const nuevoTablero = tablero.map(f => [...f]);
      nuevoTablero[seleccionada.fila][seleccionada.col] = 0; 
      nuevoTablero[fila][col] = 'B'; 

      setTablero(nuevoTablero); 
      setSeleccionada(null); 

      // --- CONEXIÓN AL BACKEND ---
      fetch('http://localhost:3000/jugar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tablero: nuevoTablero }) 
      })
      .then(respuesta => respuesta.json())
      .then(datos => {
        // Imprimimos en la consola exactamente qué nos respondió el servidor
        console.log("Respuesta del servidor:", datos); 

        // PARACAÍDAS
        if (datos.tableroNuevo) {
            setTimeout(() => {
                setTablero(datos.tableroNuevo);
            }, 500); 
        } else {
            alert("El servidor no devolvió la jugada. Revisa la consola (F12) para ver el error real.");
        }
      })
      .catch(error => {
        console.error("Error al conectar con el servidor:", error);
      });
    } // <-- Aquí faltaba esta llave para cerrar el if
  }; // <-- Y aquí faltaba esta para cerrar la función manejarClic

  return (
    <div className="juego-contenedor">
      <h1>Taller de IA - Agente vs Usuario</h1>
      <div className="tablero">
        {tablero.map((fila, indiceFila) => (
          fila.map((casilla, indiceColumna) => (
            <div 
              key={`${indiceFila}-${indiceColumna}`} 
              className="casilla"
              onClick={() => manejarClic(indiceFila, indiceColumna)} 
            >
              {casilla === 'N' && <div className="ficha ficha-negra"></div>}
              
              {casilla === 'B' && (
                <div className={`ficha ficha-blanca ${seleccionada?.fila === indiceFila && seleccionada?.col === indiceColumna ? 'ficha-seleccionada' : ''}`}></div>
              )}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}

export default App;