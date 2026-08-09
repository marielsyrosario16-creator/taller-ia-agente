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
  const [mensajeGanador, setMensajeGanador] = useState(null); // Estado para el aviso de victoria

  const manejarClic = (fila, col) => {
    // Si ya hay un ganador, bloqueamos el tablero para que no se pueda seguir jugando
    if (mensajeGanador) return;

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

      // Validamos que la blanca no salte a una casilla ocupada incorrectamente
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
        if (datos.tableroNuevo) {
            setTimeout(() => {
                setTablero(datos.tableroNuevo);
                
                // Si el servidor detectó que alguien ganó, lo mostramos en pantalla
                if (datos.ganador) {
                    setMensajeGanador(datos.ganador);
                }
            }, 500); 
        } else {
            alert("El servidor no devolvió la jugada.");
        }
      })
      .catch(error => {
        console.error("Error al conectar con el servidor:", error);
      });
    } 
  }; 

  const reiniciarJuego = () => {
    setTablero(estadoInicial);
    setSeleccionada(null);
    setMensajeGanador(null);
  };

  return (
    <div className="juego-contenedor">
      <h1>Taller de IA - Agente vs Usuario</h1>
      
      {/* Banner de victoria dinámico */}
      {mensajeGanador && (
        <div className="banner-ganador" style={{ background: '#22c55e', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          <h2>{mensajeGanador}</h2>
          <button onClick={reiniciarJuego} style={{ marginTop: '10px', padding: '8px 16px', background: 'white', color: '#16a34a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Jugar de nuevo
          </button>
        </div>
      )}

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