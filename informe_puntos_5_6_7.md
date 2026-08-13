# Informe de Inteligencia Artificial - Puntos 5, 6 y 7

A continuación se detallan los puntos correspondientes al diseño del algoritmo del agente, las propiedades de su entorno y la estructura conceptual bajo la cual fue implementado.

---

## 5. Diseño del algoritmo del agente (Elementos funcionales)

El agente inteligente diseñado para jugar con las fichas Negras implementa una estrategia heurística y lógica de búsqueda adversarial. A nivel de código (referencia a `index.js`), los componentes funcionales que resuelven el problema son los siguientes:

### 1. Generador de Movimientos (`obtenerMovimientosValidos`)
Función encargada de descubrir el **espacio de acciones** legales dado un estado `S`. Evalúa cada fila de la matriz y determina hacia qué casillas vacías puede desplazarse una ficha sin sobrepasar a su oponente. Esta función materializa las reglas del juego.

### 2. Función de Evaluación Heurística (`evaluarTablero`)
Actúa como el núcleo táctico del agente evaluando la deseabilidad de un estado del tablero. 
- **Premio de Bloqueo (+100):** Se otorga una máxima bonificación si la distancia entre la ficha negra y blanca en una fila es de 0 espacios vacíos (bloqueo directo).
- **Penalización de Distancia (-10 por casilla):** Resta puntos por cada casilla vacía entre ambas fichas, forzando al agente a acortar distancias.
- **Premio de Avance (+5 por columna):** Incentiva el movimiento hacia el campo contrario.

### 3. Mecanismo de Decisión (`minimax` con Poda Alfa-Beta)
Implementa el algoritmo **Minimax**, proyectando un árbol de estados hasta una **profundidad de 5 niveles**.
- **Maximizador:** El agente busca maximizar su puntuación heurística.
- **Minimizador:** Asume que el oponente (fichas blancas) jugará de manera óptima para minimizar la puntuación del agente.
- **Poda Alfa-Beta:** Introduce las variables `alpha` (mejor opción asegurada para el maximizador) y `beta` (mejor opción asegurada para el minimizador) para "podar" o descartar ramas del árbol que no mejorarán el resultado actual, reduciendo drásticamente el tiempo de cálculo sin perder precisión.

### 4. Orquestador de Turno (`jugarTurnoIA` y API)
Es la interfaz que integra los componentes anteriores. Invoca el algoritmo Minimax para las acciones disponibles desde la raíz, selecciona la jugada de mayor utilidad (`mejorValor`), actualiza la matriz del entorno y devuelve la respuesta al usuario mediante la API REST en el endpoint `POST /jugar`.

---

## 6. Características (propiedades) presentes en el ambiente

Para fundamentar el comportamiento del agente en la cuadrícula de 4x8, se analizan las propiedades del entorno siguiendo la clasificación formal de Russell y Norvig:

1. **Totalmente observable:** El agente tiene acceso perceptivo completo e instantáneo al estado global del tablero en todo momento. Conoce con precisión matemática las coordenadas de sus fichas y las de su oponente.
2. **Determinista:** El entorno es estrictamente determinista porque el resultado de cada acción ejecutada está completamente definido por la regla de movimiento y el estado actual, sin la intervención de factores aleatorios, dados o probabilidades.
3. **Secuencial:** Las decisiones tomadas por el agente en un turno presente influyen directamente en la disposición espacial del tablero y condicionan el espacio de acciones posibles para los turnos futuros.
4. **Estático:** El entorno no experimenta cambios mientras el algoritmo de búsqueda (`Minimax`) calcula su próximo movimiento; las dinámicas de modificación solo ocurren de forma secuencial al ejecutarse una acción.
5. **Discreto:** El ambiente posee un número acotado y finito de estados matriciales posibles, así como un número limitado de acciones legales realizables (movimientos a casillas definidas).
6. **Multiagente (Adversarial / Suma Cero):** Participan dos entidades racionales con intereses contrapuestos (Agente vs. Usuario). El entorno es competitivo, de modo que la ventaja estratégica adquirida por un bando equivale a una desventaja directa para el bando opuesto.

---

## 7. Estructura del Agente diseñado según su tipología

De acuerdo a la literatura clásica de Inteligencia Artificial, el agente implementado se clasifica estructuralmente como un **Agente basado en utilidad** *(Utility-Based Agent)* operando bajo un entorno de **Búsqueda Adversarial**.

### Componentes de su Arquitectura:
- **Modelo Interno de Representación:** A diferencia de un agente reactivo simple que responde a un percepto inmediato usando reglas estáticas, nuestro agente mantiene un modelo explícito de su mundo (el tablero en memoria) y del mecanismo de evolución de dicho mundo (reglas de transición en `obtenerMovimientosValidos`).
- **Función Cuantitativa de Deseabilidad:** No se rige únicamente por un objetivo binario (ganar/perder), sino que utiliza la función heurística (`evaluarTablero`) para asignar un "grado de utilidad" o puntuación a cualquier configuración intermedia del juego.
- **Planificación Prospectiva:** No elige acciones basadas solo en el estado actual, sino que proyecta secuencias futuras de estados y acciones alternadas (mediante el árbol Minimax) antes de tomar su decisión real en el entorno.
- **Eficiencia en Búsqueda:** Debido a las limitaciones de tiempo y recursos computacionales, su estructura está optimizada mediante el algoritmo de *Poda Alfa-Beta*, lo cual es característico de agentes competitivos modernos diseñados para no colapsar la memoria durante la evaluación del árbol de juegos.
