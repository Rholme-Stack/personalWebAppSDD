# 0003 - Constelación con WebGL2, sin librería 3D

**Estado:** Aceptado
**Fecha:** 2026-11-07

## Contexto

La feature 003 dibuja un busto 3D hecho de ~8.000 partículas, fijo detrás de toda la página. Tiene que hacer cinco cosas:

- girar con el ratón;
- explotar en 3D según el scroll;
- cambiar el tamaño y el brillo de cada partícula según su profundidad;
- titilar;
- ir con fluidez en un móvil de gama media.

No hay mallas, luces, texturas ni sombras: solo puntos con perspectiva. La constitución pide no añadir dependencias sin justificarlo (Artículo IV).

## Decisión

Dibujar con **WebGL2 directamente**: un vertex shader y un fragment shader propios, y un único `drawArrays(POINTS)` por fotograma. La GPU calcula la explosión, el giro, la perspectiva, el tamaño, el brillo y la forma triangular de cada nodo. La lógica que decide los valores (scroll, ratón, colocación, destinos) vive en funciones TypeScript con tests.

## Alternativas consideradas

- **Three.js:**
  - Ventajas: es el estándar, está muy documentado, tiene cámara, matrices y `Points` listos, y crece bien si un día hay mallas o postprocesado.
  - Se descarta porque añade ~150 kB comprimidos y una dependencia que habría que actualizar. Además, para el tamaño y la forma por nodo habría que escribir igualmente un shader propio (`ShaderMaterial`). La parte que nos ahorra, la cámara y una matriz de giro, son unas pocas líneas.
- **Canvas 2D:**
  - Ventajas: API sencilla, sin shaders.
  - Se descarta porque la CPU tendría que proyectar y dibujar 8.000 triángulos en cada fotograma. En un móvil de gama media no llega a 60 fps.
- **CSS 3D (un elemento por partícula):**
  - Ventajas: no hace falta saber de gráficos.
  - Se descarta porque miles de elementos del DOM transformados en cada fotograma son mucho más lentos que la GPU y ensucian el árbol de accesibilidad.

## Consecuencias

- **Positivas:**
  - Ninguna dependencia nueva.
  - El *chunk* de la constelación ocupa pocos kB.
  - Hay control total del aspecto del nodo y del rendimiento (un *draw call*).
- **Negativas / costes:**
  - Código de bajo nivel: shaders en GLSL y matrices a mano, más difícil de leer y mantener.
  - jsdom no tiene WebGL, así que el renderer se verifica a mano. Para compensarlo se mantiene sin lógica propia.
  - Si en el futuro hacen falta mallas, luces o efectos, se valorará migrar a Three.js con un ADR nuevo.
