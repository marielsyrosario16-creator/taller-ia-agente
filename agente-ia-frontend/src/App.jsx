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
  const [mensajeGanador, setMensajeGanador] = useState(null); 
  
  // NUEVA VARIABLE: Para saber si el juego ya empezó
  const [juegoIniciado, setJuegoIniciado] = useState(false); 

  // Función para el primer turno de la IA
  const turnoInicialIA = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/jugar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tablero: estadoInicial }) 
    })
    .then(respuesta => respuesta.json())
    .then(datos => {
      if (datos.tableroNuevo) {
        setTablero(datos.tableroNuevo);
      }
    })
    .catch(error => {
      console.error("Error al conectar con el servidor:", error);
    });
  };

  // Función que se ejecuta al presionar el nuevo botón
  const iniciarPartida = () => {
    setJuegoIniciado(true); // 1. Desaparece el botón y desbloquea el tablero al instante
    
    // 2. El "contador invisible": Espera 800 milisegundos antes de mover la ficha
    setTimeout(() => {
      turnoInicialIA();       
    }, 800); 
  };

  const manejarClic = (fila, col) => {
    // Si el juego no ha empezado, no dejamos que toque las fichas
    if (!juegoIniciado) {
        alert("¡Haz clic en 'Iniciar Partida' para comenzar!");
        return;
    }
    
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

      const nuevoTablero = tablero.map(f => [...f]);
      nuevoTablero[seleccionada.fila][seleccionada.col] = 0; 
      nuevoTablero[fila][col] = 'B'; 

      setTablero(nuevoTablero); 
      setSeleccionada(null); 

      // CONEXIÓN AL BACKEND (Turnos regulares)
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/jugar`, {
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
    setJuegoIniciado(false); // Volvemos a pedir que presione el botón
  };

  return (
    <div className="juego-contenedor">
      <h1>Taller de IA - Agente vs Usuario</h1>
      
      {/* --- NUEVO BOTÓN DE INICIO --- */}
      {!juegoIniciado && !mensajeGanador && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button 
            onClick={iniciarPartida} 
            style={{ padding: '12px 24px', fontSize: '16px', background: '#304A43', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            ▶ Iniciar Partida
          </button>
        </div>
      )}

      {/* Banner de victoria */}
      {mensajeGanador && (
        <div className="banner-ganador" style={{ background: '#BCE8DB', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          <h2>{mensajeGanador}</h2>
          <button onClick={reiniciarJuego} style={{ marginTop: '10px', padding: '8px 16px', background: 'white', color: 'rgb(14, 23, 21)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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