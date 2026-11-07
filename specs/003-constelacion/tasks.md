# Tareas: 003-constelacion

**Plan:** [plan.md](./plan.md) · **Spec:** [spec.md](./spec.md) · **Modelo:** [data-model.md](./data-model.md)
**Estado:** Completada (2026-11-07)

> Formato: `- [ ] T### [P] descripción (archivos)`.
> `[P]` = se puede hacer en paralelo con las otras `[P]` de la misma fase (tocan archivos distintos).
> Ciclo TDD: la tarea de test deja los tests en **rojo** a propósito; la siguiente los pone en **verde**. Fuera de ese ciclo, `npm test` y `npm run build` deben quedar en verde al terminar cada tarea.
> Las tareas de `tools/bust/` no afectan a `npm test` ni a `npm run build`. Se verifican con lo que indica cada una.
> **Las fotos y el vídeo nunca se copian al repositorio.** Los scripts los leen desde su carpeta y escriben los archivos intermedios en la carpeta de trabajo (por defecto, `%TEMP%\bust-work`).
> Marca `[x]` al terminar cada tarea.

## Fase 1: Punto de partida

- [x] T001 Ejecutar `npm test` y `npm run build` antes de tocar nada y confirmar que pasan.
- [x] T002 Añadir a `.gitignore` las líneas `tools/bust/.venv/`, `tools/bust/work/` y `__pycache__/`. (`.gitignore`)

## Fase 2: Generación del busto (`tools/bust/`, offline)

Esta fase va primero porque es la de más riesgo: si la silueta no se reconoce, hay que saberlo antes de construir la app.

- [x] T003 Crear el proyecto de Python:
  - `pyproject.toml` con Python 3.12 y las dependencias `opencv-contrib-python` (la variante que ya exige MediaPipe), `mediapipe`, `numpy` y `pycolmap`;
  - `uv.lock` generado con `uv lock`;
  - `build.py` con los argumentos `--photos`, `--video`, `--work` (por defecto `%TEMP%\bust-work`), `--out` y `--from-stage` (para repetir desde una etapa sin rehacer las anteriores);
  - el paquete `bust/` vacío.

  **Comprobación:** `uv run build.py --help` muestra los argumentos. (`tools/bust/pyproject.toml`, `tools/bust/uv.lock`, `tools/bust/build.py`, `tools/bust/bust/__init__.py`)
- [x] T004 Etapa 1, fotogramas: un fotograma cada ~0,25 s del vídeo, quedándose con el más nítido de cada tramo (varianza del laplaciano). Se guardan en `work/frames/`. **Comprobación:** salen ~240 fotogramas y una hoja de miniaturas sin fotogramas borrosos. (`tools/bust/bust/frames.py`)
- [x] T005 Etapa 2, segmentación con MediaPipe *Image Segmenter* (modelo *selfie multiclass*, descargado a `work/models/`):
  - en las 8 fotos, máscara de la persona entera;
  - en los fotogramas, máscara solo de la cabeza (pelo + piel de la cara).

  Se guardan en `work/masks/`. **Comprobación:** una hoja con las máscaras superpuestas: no entra el fondo y, en los fotogramas, tampoco la ropa ni el brazo. (`tools/bust/bust/segment.py`)
- [x] T006 Etapa 3, silueta 3D desde las fotos (*visual hull*):
  - ángulos iniciales en pasos de 45°, con la foto `…150843.jpg` de frente a 0° y las demás en el orden en que se hicieron;
  - alinear las siluetas por la parte de arriba de la cabeza y el eje del cuello;
  - tallar una rejilla de vóxeles en proyección ortográfica;
  - afinar cada ángulo ±10°;
  - cortar justo por debajo de la línea de los hombros.

  Se guarda en `work/hull_photos.npz`. **Comprobación:** al reproyectar el volumen sobre cada foto, la coincidencia con su silueta (IoU) es ≥ 0,85 en todas. (`tools/bust/bust/hull.py`)
- [x] T007 Etapa 4, cabeza desde el vídeo:
  - `pycolmap` sobre los fotogramas con la máscara de cabeza;
  - si registra ≥ 60 % de los fotogramas, se talla la cabeza con esas vistas y sustituye a la de las fotos, escalada y alineada por la altura de la cabeza y el cuello;
  - si no, se escribe en la consola el motivo y se usa la cabeza de las fotos.

  Se guarda en `work/hull.npz`. **Comprobación:** la consola indica qué cabeza se ha usado y el porcentaje de fotogramas registrados. (`tools/bust/bust/video_head.py`)
- [x] T008 Etapa 5, rasgos de la cara:
  - MediaPipe *Face Landmarker* sobre los fotogramas frontales más nítidos, promediando los 478 puntos;
  - ajustarlos al frente de la cabeza (ojos, punta de la nariz y barbilla);
  - dar forma a la zona de la cara;
  - marcar ojos, cejas, nariz, labios y mandíbula como zonas densas.

  Se guarda en `work/face.npz`. **Comprobación:** una vista previa de perfil muestra la nariz y la barbilla en su sitio. (`tools/bust/bust/face.py`)
- [x] T009 Etapa 6, muestreo y exportación:
  - suavizar la superficie;
  - repartir ~8.000 nodos con más densidad en los contornos y rasgos de `data-model.md`;
  - normalizar (centro en el origen, lado mayor = 2);
  - barajar;
  - escribir `bust.bin` con el formato de `data-model.md` (cabecera `BUST`, versión 1, `count` y `int16` *little-endian*).

  **Comprobación:** al releer el archivo, los valores coinciden y el tamaño es `12 + count × 6`. (`tools/bust/bust/sample.py`, `tools/bust/bust/export.py`, `public/constellation/bust.bin`)
- [x] T010 Vistas previas: imágenes PNG del busto de frente, ±45°, ±90° y de espaldas, cada una junto a la foto correspondiente, en `work/previews/`. (`tools/bust/bust/preview.py`)
- [x] T011 Escribir `tools/bust/README.md`: instalar `uv`, ejecutar `build.py` con las rutas de las fotos y el vídeo, repetir desde una etapa con `--from-stage` y dónde mirar las vistas previas. Recordar que las fotos y el vídeo no se copian al repo. (`tools/bust/README.md`)
- [x] T012 **Revisión con Rodrigo (puerta de calidad):** comparar las vistas previas con las fotos. Si no se reconoce la silueta (cabeza, pelo, perfil y hombros), ajustar la densidad o el tamaño de los nodos, o la etapa que falle, y regenerar. Cuando se apruebe, marcar en `spec.md` el contenido "Forma 3D del busto". (`specs/003-constelacion/spec.md`)

## Fase 3: Lógica de la constelación (TDD)

- [x] T013 [P] Tests de `decodeBust`:
  - un búfer válido (1.000 nodos, el mínimo) da las coordenadas esperadas en sus 3 primeros nodos (`valor / 32767`);
  - se rechazan un `magic` distinto de `BUST`, la versión 2, un `count` fuera de 1.000–20.000 y un tamaño que no cuadra con `count`.

  **Resultado esperado: rojo.** (`src/app/constellation/bust-format.spec.ts`)
- [x] T014 Implementar `decodeBust(buffer): Float32Array`, que lanza un error descriptivo si el archivo no es válido. **Resultado esperado: verde.** (`src/app/constellation/bust-format.ts`)
- [x] T015 [P] Tests de `motion`:
  - `scrollProgress`: 0 arriba, 0,5 a mitad, 1 al final, limitado fuera de rango y 0 si la página no tiene scroll.
  - `pointerToYaw`: 0 en el centro, +90° y −90° en los bordes, limitado fuera de la ventana.
  - `autoYaw`: 360° a los 20 s.
  - `damp`: se acerca sin pasarse; un paso de 32 ms da lo mismo que dos de 16 ms.
  - `motionMode`: `still` con reducir movimiento aunque haya ratón, `mouse` con ratón y `auto` sin él.

  **Resultado esperado: rojo.** (`src/app/constellation/motion.spec.ts`)
- [x] T016 Implementar `motion.ts` con el tipo `MotionMode`, las funciones de T015 y sus constantes (`MAX_YAW`, `AUTO_TURN_SECONDS`, `DAMP_FOLLOW_TAU` y `DAMP_RETURN_TAU`). **Resultado esperado: verde.** (`src/app/constellation/motion.ts`)
- [x] T017 [P] Tests de `bustLayout`:
  - a 1280×800, `centerX` 0,75, `heightFraction` 0,75, opacidad 1 y `nodeStride` 1;
  - a 360×640, `centerX` 0,5, opacidad 0,5 y `nodeStride` 2, y el busto no pasa del 90 % del ancho;
  - a 1024 px de ancho se usa la colocación de ordenador.

  **Resultado esperado: rojo.** (`src/app/constellation/layout.spec.ts`)
- [x] T018 Implementar `bustLayout(width, height, bustRadius)` y la interfaz `BustLayout`. **Resultado esperado: verde.** (`src/app/constellation/layout.ts`)
- [x] T019 [P] Tests de `buildNodes`:
  - la misma semilla da exactamente los mismos datos;
  - hay `count + AMBIENT_COUNT` nodos con `NODE_STRIDE` floats cada uno;
  - todos los colores están en `PALETTE`;
  - `phase` en [0, 2π) y `pace` en [0,6; 1,6];
  - cada destino está en el cilindro unidad (radio 0,15–1, `y` en [−1, 1]), en el sector de ±45° del nodo y en su misma mitad;
  - los nodos de ambiente están a una distancia de 1,2–2 del origen;
  - con cualquier `pace`, el avance de la explosión vale 0 en p = 0 y 1 en p = 1.

  **Resultado esperado: rojo.** (`src/app/constellation/nodes.spec.ts`)
- [x] T020 Implementar `nodes.ts`:
  - el generador con semilla (`mulberry32`);
  - las constantes `PALETTE`, `SEED`, `AMBIENT_COUNT` y `NODE_STRIDE`;
  - la función de avance `explosionAmount(p, pace)`;
  - `bustRadius(positions)`;
  - `buildNodes(positions, rng)`.

  **Resultado esperado: verde.** (`src/app/constellation/nodes.ts`)
- [x] T021 [P] Tests de `BustService` con `fetch` simulado: una respuesta correcta da las posiciones; un 404, un error de red y un binario inválido dan `null` sin lanzar errores. **Resultado esperado: rojo.** (`src/app/constellation/bust.service.spec.ts`)
- [x] T022 Implementar `BustService.load(): Promise<Float32Array | null>`, que hace `fetch('constellation/bust.bin')`, luego `decodeBust` y `console.warn` si falla. **Resultado esperado: verde.** (`src/app/constellation/bust.service.ts`)

## Fase 4: Dibujo (WebGL2)

- [x] T023 Escribir los shaders (GLSL ES 3.00):
  - **vertex:**
    1. explosión con `explosionAmount`;
    2. centro de la nube de `centerX` a 0,5;
    3. deriva;
    4. giro en `y`;
    5. perspectiva con `D` y `FOV_Y`;
    6. tamaño y opacidad según la profundidad;
  - **fragment:** triángulo girado según `phase`, titileo y opacidad final.

  Todo con las reglas y constantes de `data-model.md`, incluido el modo `still`. **Resultado esperado: build en verde.** (`src/app/constellation/shaders.ts`)
- [x] T024 Implementar `ConstellationRenderer`:
  - `create(canvas)` devuelve `null` si no hay WebGL2 o si un shader no compila;
  - `setNodes(nodes)`;
  - `resize(width, height, dpr)`, con `dpr` limitado a 2;
  - `draw(frame: FrameState)`, con mezcla aditiva, sin *depth test* y un solo `drawArrays(POINTS)` que respeta `nodeStride`;
  - `dispose()`;
  - aviso cuando se pierde el contexto.

  **Resultado esperado: build en verde.** (`src/app/constellation/renderer.ts`)

## Fase 5: Componente e integración (TDD)

- [x] T025 Tests de `Constellation`:
  - hay un `<canvas>` con `aria-hidden="true"` y sin `tabindex`;
  - en jsdom (sin WebGL) no lanza errores y `ready` sigue en `false`, así que el canvas queda oculto;
  - al destruirse quita los listeners de `window`.

  **Resultado esperado: rojo.** (`src/app/constellation/constellation.spec.ts`)
- [x] T026 Implementar `Constellation` (`app-constellation`):
  - **CSS:** `position: fixed; inset: 0; z-index: -1; pointer-events: none`, `opacity` 0 que pasa a 1 con una transición de 600 ms cuando `ready`.
  - **Arranque:** en `afterNextRender`, cargar con `BustService`, crear el renderer y llamar a `buildNodes` y `bustRadius`.
  - **Bucle:** `requestAnimationFrame` con `scrollProgress`, `motionMode`, `pointerToYaw` o `autoYaw`, `damp` y `bustLayout`.
  - **Listeners:** `pointermove`, `pointerout`, `resize` y cambios de `matchMedia`.
  - **Estado:** signals `ready` y `mode`.
  - **Fallo:** si algo falla, el canvas sigue oculto.
  - **Limpieza** con `DestroyRef`.

  **Resultado esperado: verde.** (`src/app/constellation/constellation.{ts,html,css}`)
- [x] T027 Ampliar los tests de `Landing`: la página incluye `app-constellation` dentro de un bloque `@defer`, comprobado con `fixture.getDeferBlocks()`, y el resto de secciones sigue igual. **Resultado esperado: rojo.** (`src/app/landing/landing.spec.ts`)
- [x] T028 Añadir `@defer (on idle) { <app-constellation /> }` al principio de `landing.html` e importar `Constellation`. **Resultado esperado: verde.** (`src/app/landing/landing.html`, `src/app/landing/landing.ts`)

## Fase 6: Documentación

- [x] T029 [P] En el `README.md` del proyecto, explicar para qué sirve `tools/bust/` y enlazar su README para regenerar el busto. (`README.md`)

## Fase 7: Verificación

- [x] T030 Ejecutar `npm test` y `npm run build`: los dos en verde, sin avisos de presupuesto, y la constelación sale como *chunk* diferido en la salida del build.
- [x] T031 Verificación manual con `npm start` (la lista del plan):
  1. **Silueta:** se reconoce la de Rodrigo.
  2. **Volumen:** al girar, la cara y la nuca se mueven a distinto ritmo y los nodos cercanos son más grandes y brillantes.
  3. **Ratón:**
     - de frente en el centro;
     - de perfil en los bordes, mirando hacia el ratón;
     - sin saltos;
     - sin giro al moverlo en vertical;
     - vuelve de frente al salir de la ventana.
  4. **Clics a través:** se pueden pulsar enlaces, el selector de idioma y el formulario, y seleccionar texto, encima del busto.
  5. **Scroll:**
     - la explosión avanza poco a poco y está completa al final;
     - al subir se recompone;
     - "Contact" salta al estado correcto;
     - sigue cuadrando al cambiar de idioma y girar el móvil.
  6. **Legibilidad:** con la explosión a mitad y completa, el texto de About Me y del formulario se lee bien a 1280 px y a 360 px.
  7. **Móvil** (DevTools a 360 px y un móvil real): gira solo, el busto queda centrado y tenue, no hay scroll horizontal y no hay tirones (CPU ralentizada ×4).
  8. **Reducir movimiento** (activado en Windows): busto quieto de frente que se desvanece con el scroll.
  9. **Sin WebGL:** la página se ve completa, sin errores visibles.
  10. **Carga** con la red en "Fast 4G": el texto aparece antes que la constelación y esta entra con un fundido.

  **Resultado (2026-11-07):**
  - **Rodrigo:** aprobó la silueta (punto 1) con las vistas previas de `tools/bust`.
  - **Chrome sin ventana (build de producción, WebGL por software):** se comprobaron los puntos 2–10 con capturas y lecturas del DOM:
    - el busto gira a cada perfil hacia el ratón;
    - un clic sobre el busto llega a las secciones, nunca al canvas;
    - el selector de idioma responde y el texto se puede seleccionar;
    - la explosión avanza al 25 %, 50 % y 100 % y se recompone al volver arriba;
    - el formulario se lee con la explosión completa;
    - a 360 px el busto gira solo, centrado y tenue, sin scroll horizontal;
    - con "reducir movimiento", el busto está quieto y se desvanece;
    - sin WebGL, la página está completa y solo aparece un `console.warn`;
    - con Fast 4G, el texto aparece a los 0,8 s y la constelación a los 1,4 s.
  - **Sin comprobar:** la fluidez en un móvil real y el anuncio con un lector de pantalla. El canvas lleva `aria-hidden="true"` y lo cubre un test. Quedan como comprobación recomendada antes de publicar.
- [x] T032 Repasar uno a uno los criterios de aceptación de `spec.md`. Si alguno no se cumple, volver a la tarea correspondiente.
  - **Resultado:** todos los criterios tienen una implementación en `plan.md` → "Mapeo spec → implementación".
    - Los de lógica están cubiertos por los 95 tests en verde.
    - Los visuales, por T012 y T031.
    - No se ha encontrado ninguno sin cumplir.

## Dependencias

- T001 y T002 van primero.
- **Fase 2** (en orden, cada etapa usa la anterior): T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010. T011 puede hacerse en cualquier momento después de T003. T012 va al final de la fase.
- **Fase 3:** cada par test → implementación es TDD (T013→T014, T015→T016, T017→T018, T019→T020, T021→T022). Los pares son independientes entre sí, salvo T021–T022, que dependen de T014 (`decodeBust`). La fase 3 no depende de la fase 2: se puede adelantar si la generación del busto se atasca.
- **Fase 4:** T023 depende de T016, T018 y T020 (usa sus constantes y reglas). T024 depende de T023.
- **Fase 5:** T025 → T026, que depende de T022 y T024. T027 → T028, que depende de T026.
- **Fase 6:** T029 depende de T011.
- **Fase 7:** T030 → T031 → T032, al final. T031 necesita el `bust.bin` aprobado en T012.
