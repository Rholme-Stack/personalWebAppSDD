# Plan técnico: 003-constelacion

**Spec:** [spec.md](./spec.md)
**Estado:** Aprobado
**Fecha:** 2026-11-07

## Resumen técnico

La constelación es un componente standalone, `Constellation`, que dibuja un `<canvas>` fijo detrás de toda la página. Usa **WebGL2 directamente, sin librería 3D** ([ADR 0003](../../docs/decisions/0003-constelacion-webgl2-sin-libreria.md)).

Los nodos del busto (~8.000) se cargan de un archivo binario pequeño, `public/constellation/bust.bin`, de unos 48 kB. Ese archivo se genera **una sola vez y en local**, en el PC de Rodrigo, con scripts de Python en `tools/bust/` ([ADR 0004](../../docs/decisions/0004-generar-busto-en-local-con-python.md)). Los scripts hacen tres cosas:

- sacan la silueta 3D de los hombros a partir de las 8 fotos;
- mejoran la cabeza con el vídeo;
- marcan los rasgos de la cara con detección de puntos faciales.

Las fotos y el vídeo nunca entran en el repositorio.

En la app, el giro, la explosión, el tamaño según la profundidad y el titileo se calculan en la GPU, en un único *draw call*. Todo lo que decide qué se dibuja va en funciones puras con tests en Vitest: progreso del scroll, ángulo según el ratón, modo de animación, colocación, destinos de la explosión y lectura del binario.

## Contexto técnico

- **Framework:** Angular 22 (standalone, sin zone.js, sin SSR)
- **Lenguaje:** TypeScript 6. Shaders en GLSL ES 3.00 (WebGL2).
- **Tests:** Vitest con `TestBed` (jsdom, que no tiene WebGL)
- **Dependencias nuevas:**
  - **npm:** ninguna.
  - **Herramientas offline** (solo en `tools/bust/`, fuera de la app y del build), en Python 3.12 ejecutado con `uv`: `opencv-contrib-python` (la variante que ya exige MediaPipe), `mediapipe`, `numpy` y `pycolmap`. Ver ADR 0004.
- **Backend / APIs:** ninguno. `bust.bin` es un archivo estático de `public/`.

### Estado actual del código

- `src/app/landing/landing.html`: `SiteHeader` y, dentro de `<main>`, la sección hero (`<h1>` con el nombre y el rol), `AboutMe`, `Stack`, `Photos` y `ContactForm`.
- `src/app/landing/landing.css`: el `.hero` ocupa la primera pantalla (`min-height: calc(100dvh - var(--header-height))`), con el texto a la izquierda.
- `src/styles.css`:
  - `body` con fondo `--color-void` (negro) y los tokens de `DESIGN.md`;
  - `scroll-behavior: smooth` solo sin `prefers-reduced-motion`.
- `src/app/app.config.ts`: router con `anchorScrolling`. No hay `HttpClient`.
- `angular.json`:
  - build `@angular/build:application` solo navegador;
  - presupuesto inicial de 500 kB de aviso;
  - tests con `@angular/build:unit-test`.
- **Constelación:** no hay código. Su diseño se ha actualizado en esta feature, en `DESIGN.md` → *Hero Constellation Visualization*.
- **`.gitignore`:** no cubre carpetas de Python (`.venv`, `__pycache__`).

## Check de constitución

- [x] **I. Spec primero:** la spec está aprobada (2026-11-07). No se escribe código hasta que `tasks.md` esté aprobada.
- [x] **II. Calidad y tests:**
  - Toda la lógica de la app tiene tests en Vitest: lectura del binario, generación de nodos, progreso del scroll, giro, modo de animación, colocación y carga.
  - El renderer WebGL solo traslada esos valores a la GPU. jsdom no tiene WebGL, así que se verifica a mano.
  - Los criterios visuales (reconocer la silueta, el volumen, la fluidez) son manuales.
  - Los scripts de `tools/bust/` no son código del producto: se verifican con las vistas previas que generan, comparadas con las fotos.
- [x] **III. Arquitectura:**
  - `Constellation` es standalone, en su carpeta de feature `src/app/constellation/`.
  - El estado de la constelación va en signals: si está lista para mostrarse y el modo de animación. El estado por fotograma (ángulo actual, tiempo) son variables del bucle de animación, no signals, para no provocar detección de cambios 60 veces por segundo.
  - No se usa RxJS.
  - La carga de `bust.bin` la hace `BustService`, no el componente.
- [x] **IV. Simplicidad:**
  - Ninguna dependencia npm: se escribe WebGL2 directamente (ADR 0003).
  - Las herramientas de Python tienen su ADR (0004).
  - Un solo renderer para este caso, sin "motor 3D" genérico.
  - Un solo formato binario mínimo: solo posiciones.
  - Colores, fases y destinos de la explosión se generan en el navegador con una semilla fija, así que no ocupan espacio en el archivo.
- [x] **V. Seguridad:**
  - No hay secretos.
  - Las fotos y el vídeo no se suben al repositorio: los scripts los leen desde la ruta que se les pasa y escriben los archivos intermedios en una carpeta de trabajo fuera del repo (por defecto, en `%TEMP%`).
  - `.gitignore` excluye `tools/bust/.venv/`, `tools/bust/work/` y `__pycache__/` por si acaso.
  - `bust.bin` solo contiene coordenadas.
  - No hay entrada del usuario. El binario se valida al leerlo (cabecera, versión y tamaño) antes de usarlo.
- [x] **VI. Accesibilidad y UX:**
  - El canvas lleva `aria-hidden="true"`, no recibe el foco y tiene `pointer-events: none`: los clics y la selección de texto pasan a través.
  - Se respeta `prefers-reduced-motion`.
  - A 360 px el canvas mide exactamente lo mismo que la ventana (`position: fixed; inset: 0`), así que no provoca scroll horizontal.
  - La legibilidad del texto encima de partículas brillantes se comprueba a mano (ver "Riesgos").

## Arquitectura

```
Landing
 ├─ @defer (on idle) { Constellation }   <canvas> fijo detrás de toda la página
 ├─ SiteHeader
 └─ <main> … (sin cambios)

Constellation (componente)
 ├─ BustService.load() ──fetch──> /constellation/bust.bin ──decodeBust()──> posiciones (Float32Array)
 ├─ buildNodes(posiciones, semilla) ──> atributos por nodo: color, fase, ritmo y destino de la explosión
 │                                      + ~300 nodos de ambiente sueltos alrededor del busto
 ├─ ConstellationRenderer   (WebGL2: shaders, buffers, un draw call de puntos)
 └─ bucle requestAnimationFrame, en cada fotograma:
      p       = scrollProgress(scrollY, scrollHeight, innerHeight)      0 arriba … 1 al final
      modo    = motionMode(tieneRatón, reducirMovimiento)               'mouse' | 'auto' | 'still'
      objetivo= pointerToYaw(x, ancho) | autoYaw(t) | 0                 ±90° · vuelta cada 20 s · de frente
      giro    = damp(giro, objetivo, dt)                                suavizado, sin saltos
      layout  = bustLayout(ancho, alto)                                 centro, escala y opacidad
      renderer.draw({ giro, p, t, layout, reducirMovimiento })
```

### Carga y aparición

- `landing.html` coloca `<app-constellation />` dentro de un bloque `@defer (on idle)`. Así, el código de la constelación va en un *chunk* aparte y se descarga cuando el navegador queda libre: el contenido aparece primero.
- El canvas empieza con `opacity: 0`. Tras el primer fotograma dibujado, el signal `ready` pasa a `true` y una transición CSS de 600 ms lo muestra.
- **Si algo falla, el canvas se queda oculto, sin mensajes para el visitante.** Los casos son:
  - no hay WebGL2 (`getContext('webgl2')` devuelve `null`);
  - un shader no compila;
  - `bust.bin` no carga o no es válido;
  - se pierde el contexto (`webglcontextlost`).

  En todos ellos queda solo un `console.warn` para el desarrollador.
- Al destruirse el componente se cancela el `requestAnimationFrame`, se quitan los listeners y se liberan los buffers.

### Modo de animación (`motionMode`)

- **`still`:** si `prefers-reduced-motion: reduce`.
- **`mouse`:** si `matchMedia('(hover: hover) and (pointer: fine)')` es cierto, o si llega un `pointermove` con `pointerType === 'mouse'`. Lo segundo cubre los portátiles táctiles con ratón.
- **`auto`:** en cualquier otro caso (móviles y tabletas).
- Si el visitante cambia `prefers-reduced-motion` con la página abierta, el modo se actualiza al momento.

### Giro

- **Ratón:**
  - `pointerToYaw(x, ancho)` = `(x / ancho − 0,5) · 2 · 90°`, limitado a ±90°. La cara mira hacia el ratón.
  - El movimiento vertical no se usa.
  - Al salir de la ventana (`pointerout` con `relatedTarget === null`), el objetivo pasa a 0°, es decir, de frente.
- **Automático:** `autoYaw(t)` da una vuelta de 360° cada 20 s, sin parar.
- **Suavizado:** `damp(actual, objetivo, dt, τ)` sigue al objetivo con suavizado exponencial, que no depende de los fps:
  - τ ≈ 0,12 s siguiendo al ratón (se asienta en ~0,4 s);
  - τ ≈ 0,3 s al volver de frente (~1 s).
- **El giro se aplica a toda la nube, explote o no**, alrededor del eje vertical del busto.

### Explosión con el scroll

- **Progreso:** `scrollProgress` = `scrollY / (scrollHeight − innerHeight)`, limitado entre 0 y 1.
  - Si la página no tiene scroll, vale 0.
  - Se lee en cada fotograma. Así se adapta solo a cambios de altura (idioma), de ventana y de orientación, y a los saltos del menú.
- **Destinos:** cada nodo tiene un destino de explosión, calculado una vez en `buildNodes` con una semilla fija. Se elige al azar dentro de un cilindro alrededor del eje vertical, en el mismo sector de ángulo y la misma mitad (arriba o abajo) que el nodo. Así los nodos salen hacia fuera desde su lado, también hacia el visitante y hacia el fondo.
  - El cilindro se escala en el shader según la proporción de la ventana, para cubrir toda la pantalla con cualquier ángulo de giro y en vertical u horizontal.
  - Su radio queda por delante de la cámara: ningún nodo la atraviesa.
- **Ritmo:** cada nodo avanza con su propio ritmo, una curva suavizada con un exponente propio, pero **todos llegan a su destino en p = 1**. Así parece que estalla, no que se escala, y una misma `p` da siempre el mismo estado.
- **Brillo:** los nodos mantienen todo su brillo durante la explosión (spec, clarificación).

### Dibujo (`ConstellationRenderer`, WebGL2)

- **Canvas:** tamaño CSS de la ventana × `min(devicePixelRatio, 2)`. Se redimensiona con `resize`.
- **Un único `drawArrays(POINTS)`:**
  - atributos por nodo: posición, destino, color, fase y ritmo;
  - *uniforms*: `p`, giro, tiempo, layout, proporción de la ventana, `dpr` y `reducirMovimiento`.
- **Vertex shader:**
  1. Mezcla la posición del busto con el destino según `p` y el ritmo del nodo.
  2. Añade una pequeña deriva sinusoidal: el "vivo" de `DESIGN.md`. Se desactiva en `still`.
  3. Gira según el ángulo.
  4. Proyecta con perspectiva real, con un campo de visión de ~35°.
  5. Desplaza el resultado al centro que indica el layout.
- **Tamaño según la profundidad:** el tamaño del punto depende de la profundidad, limitado a 1,5–4 px × `dpr`. La opacidad también: va del 100 % al 35 % (`DESIGN.md`).
- **Fragment shader:** recorta cada punto en forma de triángulo, girado según la fase del nodo, y aplica el titileo (0 en `still`) y la opacidad del layout.
- **Mezcla aditiva sobre negro, sin *depth test*:** los nodos superpuestos brillan más, como luz.
- **Número de nodos:** en pantallas de menos de 1024 px solo se dibuja la mitad (un nodo de cada dos), por rendimiento.

### Colocación (`bustLayout`)

- **Ancho ≥ 1024 px:** el centro del busto está en el 75 % del ancho (la mitad derecha) y a media altura de la primera pantalla. El busto mide el 75 % del alto de la ventana y tiene opacidad 1.
- **Ancho < 1024 px:** el busto está centrado y mide el 60 % del alto, sin pasar del 90 % del ancho. Tiene opacidad 0,5 para que el texto se lea.

### Reducir movimiento (`still`)

El busto aparece completo, quieto y de frente: no titila, no deriva y no gira. La explosión se desactiva y, en su lugar, la opacidad baja con `p` (`1 − p`): se desvanece con el scroll.

### Generación del busto (`tools/bust/`, offline, una sola vez)

Se ejecuta con `uv run build.py --photos <carpeta> --video <mp4> --work <carpeta> --out public/constellation/bust.bin`. Tiene seis etapas:

1. **Fotogramas:** saca un fotograma cada ~0,25 s del vídeo y se queda con el más nítido de cada tramo (varianza del laplaciano).
2. **Segmentación:** usa MediaPipe *Image Segmenter* con el modelo *selfie multiclass*: pelo, piel de la cara, piel del cuerpo, ropa y fondo.
   - En las fotos se recorta la persona entera.
   - En el vídeo solo la cabeza (pelo + piel de la cara), porque el cuerpo se mueve con el brazo del selfie.
3. **Silueta 3D desde las fotos** (*visual hull*):
   - Rodrigo gira unos 45° entre foto y foto, con la cámara quieta.
   - Se alinean las 8 siluetas por la parte de arriba de la cabeza y el eje del cuello.
   - Se "talla" una rejilla de vóxeles quedándose con lo que cae dentro de las 8 siluetas, en proyección ortográfica, porque la cámara está a ~2 m.
   - Los ángulos se afinan ±10° para que las siluetas encajen mejor.
   - Se corta justo por debajo de la línea de los hombros.
4. **Cabeza desde el vídeo** (mejora):
   - `pycolmap` calcula la posición de la cámara respecto a la cabeza, con los fotogramas enmascarados (solo la cabeza, el fondo fuera).
   - Con más de 100 vistas se talla una cabeza más precisa, incluida la parte de arriba, que sustituye a la de las fotos, escalada y alineada por la altura de la cabeza y la posición del cuello.
   - **Si se registran menos del 60 % de los fotogramas, este paso se descarta** y se mantiene la cabeza de las fotos, que ya cumple la spec.
5. **Rasgos de la cara:**
   - MediaPipe *Face Landmarker* sobre los fotogramas frontales más nítidos del vídeo da 478 puntos 3D de la cara, promediados entre varios fotogramas.
   - Se ajustan al frente de la cabeza (ojos, punta de la nariz y barbilla).
   - Dan la forma de la zona de la cara (cuencas de los ojos, nariz, labios) y más densidad de nodos en ojos, cejas, nariz, labios y mandíbula.
6. **Muestreo y exportación:**
   - Se suaviza la superficie y se reparten ~8.000 nodos por ella, más densos en el contorno del pelo, las orejas, el perfil, la mandíbula, el cuello y los hombros (`DESIGN.md`).
   - Se normaliza (centro del busto en el origen, alto de 2 unidades) y se escribe `bust.bin` con el formato de `data-model.md`.
   - Además se generan **vistas previas en PNG** (frente, ±45°, ±90° y espalda) junto a la foto correspondiente, en la carpeta de trabajo, para la comprobación manual.

Las etapas guardan sus resultados en la carpeta de trabajo, de modo que se puede repetir una sola etapa (por ejemplo, el muestreo) sin rehacer las anteriores.

## Archivos afectados

| Acción    | Archivo | Cambio |
| --------- | ------- | ------ |
| Crear     | `src/app/constellation/constellation.{ts,html,css,spec.ts}` | Componente: canvas, bucle de animación, listeners, fallback y aparición. |
| Crear     | `src/app/constellation/bust.service.ts` + `.spec.ts` | Descarga `bust.bin` con `fetch` y lo decodifica; devuelve `null` si falla. |
| Crear     | `src/app/constellation/bust-format.ts` + `.spec.ts` | `decodeBust()`: valida la cabecera y convierte a `Float32Array`. |
| Crear     | `src/app/constellation/nodes.ts` + `.spec.ts` | Generador con semilla, paleta y `buildNodes()` (color, fase, ritmo, destino). |
| Crear     | `src/app/constellation/motion.ts` + `.spec.ts` | `scrollProgress`, `motionMode`, `pointerToYaw`, `autoYaw`, `damp`. |
| Crear     | `src/app/constellation/layout.ts` + `.spec.ts` | `bustLayout()`: centro, escala y opacidad según la ventana. |
| Crear     | `src/app/constellation/renderer.ts` | `ConstellationRenderer`: contexto WebGL2, buffers, uniforms y dibujo. |
| Crear     | `src/app/constellation/shaders.ts` | Código GLSL del vertex y el fragment shader. |
| Crear     | `public/constellation/bust.bin` | Nodos del busto (~48 kB), generado con `tools/bust/`. |
| Crear     | `tools/bust/pyproject.toml`, `tools/bust/uv.lock` | Proyecto de Python con dependencias fijadas. |
| Crear     | `tools/bust/build.py` | Punto de entrada: encadena las etapas. |
| Crear     | `tools/bust/bust/{frames,segment,hull,video_head,face,sample,export,preview}.py` | Una etapa por archivo. |
| Crear     | `tools/bust/README.md` | Cómo instalar `uv`, ejecutar el script y revisar las vistas previas. |
| Crear     | `docs/decisions/0003-constelacion-webgl2-sin-libreria.md` | ADR del dibujo 3D. |
| Crear     | `docs/decisions/0004-generar-busto-en-local-con-python.md` | ADR de la generación del busto. |
| Modificar | `docs/decisions/README.md` | Añadir 0003 y 0004 al índice. |
| Modificar | `src/app/landing/landing.html` | `@defer (on idle) { <app-constellation /> }` antes de la cabecera. |
| Modificar | `src/app/landing/landing.ts` | Importar `Constellation`. |
| Modificar | `src/app/landing/landing.spec.ts` | La landing incluye la constelación. |
| Modificar | `.gitignore` | `tools/bust/.venv/`, `tools/bust/work/` y `__pycache__/`. |
| Modificar | `README.md` | Mencionar `tools/bust/` y cómo regenerar el busto. |
| Ya hecho  | `docs/design/DESIGN.md` | Constelación del busto (actualizado durante la spec). |

## Mapeo spec → implementación

| Criterio de aceptación | Dónde se implementa |
| ---------------------- | ------------------- |
| HU-1: busto de partículas detrás del contenido al cargar | `constellation.ts` + `renderer.ts` + `bust.bin` |
| HU-1: se reconoce la silueta de Rodrigo | `tools/bust/` (vistas previas) + densidad de nodos en el contorno |
| HU-1: se percibe el volumen | `shaders.ts` (perspectiva, tamaño y opacidad según la profundidad) |
| HU-1: titila y hay partículas sueltas | `shaders.ts` (deriva y titileo) + `nodes.ts` (nodos de ambiente) |
| HU-1: sin fondo de las fotos; fotos y vídeo no publicados | `tools/bust/segment.py` + carpeta de trabajo fuera del repo + `.gitignore` |
| HU-1: derecha en ordenador, centrado y tenue en móvil | `layout.ts` |
| HU-2: de frente con el ratón en el centro, de perfil en los bordes | `motion.ts` (`pointerToYaw`) |
| HU-2: giro suave | `motion.ts` (`damp`) |
| HU-2: el movimiento vertical no gira | `motion.ts` (`pointerToYaw` solo usa `x`) |
| HU-2: vuelve de frente al salir el ratón | `constellation.ts` (`pointerout`) + `damp` |
| HU-2: la nube explotada gira como un todo | `shaders.ts` (giro después de la explosión) |
| HU-2: clics y selección pasan a través | `constellation.css` (`pointer-events: none`) |
| HU-3: gira solo y sin parar en móvil | `motion.ts` (`motionMode`, `autoYaw`) |
| HU-3: el dedo no cambia el giro | `motion.ts` (en modo `auto` no se lee el puntero) |
| HU-4: completo arriba, proporcional al recorrido, completo al final | `motion.ts` (`scrollProgress`) + `nodes.ts` (ritmos que acaban en 1) + `shaders.ts` |
| HU-4: hacia todos lados, también hacia el visitante y al fondo | `nodes.ts` (destinos en el cilindro, mismo sector) |
| HU-4: al final, por toda la pantalla y con todo su brillo | `nodes.ts` + `shaders.ts` (cilindro escalado a la ventana, sin fundido) |
| HU-4: reversible; mismo scroll, mismo estado | `scrollProgress` leído en cada fotograma + semilla fija |
| HU-4: saltos del menú y cambios de altura o ventana | `scrollProgress` leído en cada fotograma |
| HU-4: siempre detrás del contenido | `constellation.css` (`position: fixed; z-index: -1`) |
| General: reducir movimiento | `motion.ts` (`still`) + `shaders.ts` (fundido `1 − p`) |
| General: decorativa para lectores y teclado | `constellation.html` (`aria-hidden`, sin `tabindex`) |
| General: sin WebGL, página igual y sin errores | `constellation.ts` (fallback oculto) |
| General: el contenido aparece primero | `landing.html` (`@defer (on idle)`) + fundido de entrada |
| General: fluidez en un móvil de gama media | Un draw call, mitad de nodos en móvil, `dpr` ≤ 2 |
| General: sin scroll horizontal a 360 px | `constellation.css` (`position: fixed; inset: 0`) |

## Estrategia de tests

**Automáticos (Vitest)**

- **`bust-format.spec.ts`:**
  - Un búfer válido de 3 nodos se convierte en las coordenadas esperadas.
  - Se rechazan una cabecera incorrecta, una versión desconocida y un tamaño que no cuadra con el número de nodos.
- **`bust.service.spec.ts`** (con `fetch` simulado):
  - Una respuesta correcta da las posiciones.
  - Un 404, un error de red o un binario inválido dan `null`, sin lanzar errores.
- **`nodes.spec.ts`:**
  - La misma semilla da los mismos nodos.
  - Los colores salen de la paleta.
  - Los destinos están dentro del cilindro, en el mismo sector y la misma mitad que su nodo, y por delante de la cámara.
  - Los ritmos hacen que todos los nodos lleguen a su destino exactamente en p = 1.
- **`motion.spec.ts`:**
  - `scrollProgress`: 0 arriba, 0,5 a mitad, 1 al final, limitado fuera de rango y 0 sin scroll.
  - `pointerToYaw`: 0° en el centro, +90° y −90° en los bordes, limitado fuera de la ventana.
  - `autoYaw`: 360° a los 20 s.
  - `damp`: se acerca al objetivo sin pasarse y da el mismo resultado con 1 paso de 32 ms que con 2 de 16 ms.
  - `motionMode`: `still` con reducir movimiento (aunque haya ratón), `mouse` con ratón y `auto` sin él.
- **`layout.spec.ts`:**
  - A 1280×800: centro en el 75 % del ancho y opacidad 1.
  - A 360×640: centrado, opacidad 0,5 y sin pasar del 90 % del ancho.
  - Justo en 1024 px se usa la colocación de ordenador.
- **`constellation.spec.ts`:**
  - El canvas tiene `aria-hidden="true"` y no tiene `tabindex`.
  - En jsdom (sin WebGL) no lanza errores, el canvas queda oculto y la página sigue renderizando.
  - Al destruirse quita sus listeners.
- **`landing.spec.ts`:** la landing incluye el bloque de la constelación y el resto de secciones sigue igual.

**Manuales** (jsdom no tiene WebGL, scroll real ni ratón)

1. **Silueta:** las vistas previas de `tools/bust/` (frente, ±45°, ±90°, espalda) se reconocen al compararlas con las fotos. En la web, una persona que conoce a Rodrigo reconoce la silueta.
2. **Volumen:** al mover el ratón, la cara y la nuca se desplazan a distinto ritmo y los nodos cercanos se ven más grandes y brillantes.
3. **Ratón:**
   - de frente en el centro;
   - de perfil en los bordes, mirando hacia el ratón;
   - sin saltos al mover el ratón de golpe;
   - sin giro al moverlo en vertical;
   - vuelve de frente al sacarlo de la ventana.
4. **Clics a través:** se pueden pulsar enlaces, el selector de idioma y el formulario, y seleccionar texto, encima del busto.
5. **Scroll:**
   - la explosión avanza poco a poco y está completa al final;
   - al subir se recompone;
   - "Contact" salta al estado correcto;
   - al cambiar de idioma y girar el móvil sigue cuadrando.
6. **Legibilidad:** con la explosión a mitad y completa, el texto de About Me y del formulario se lee bien a 1280 px y a 360 px.
7. **Móvil** (DevTools a 360 px y un móvil real): gira solo, el busto queda centrado y tenue, no hay scroll horizontal y no hay tirones (DevTools con la CPU ralentizada ×4).
8. **Reducir movimiento** (activado en Windows): busto quieto de frente que se desvanece con el scroll.
9. **Sin WebGL** (desactivado en `chrome://flags` o en un navegador sin soporte): la página se ve completa, sin errores visibles.
10. **Carga:** con la red en "Fast 4G", el texto aparece antes que la constelación y esta entra con un fundido.

**Al terminar:** `npm test` y `npm run build` en verde (Artículo II). El *chunk* diferido de la constelación no cuenta en el presupuesto inicial.

## Riesgos y mitigaciones

- **Silueta poco precisa con 8 fotos tomadas a mano** (ángulos aproximados, brazos pegados al cuerpo):
  - se afinan los ángulos ±10°;
  - se corta por debajo de los hombros, así que los brazos apenas entran;
  - se revisan las vistas previas antes de usar el resultado.

  Si no se reconoce, se ajustan la densidad y el tamaño de los nodos (la spec lo permite) o se repiten las fotos.
- **El vídeo es un selfie** (la cabeza se mueve respecto al fondo y el gran angular deforma un poco):
  - se enmascara todo menos la cabeza;
  - la etapa 4 se descarta sola si `pycolmap` no registra bastantes fotogramas;
  - los puntos faciales solo aportan forma relativa, escalada a la cabeza tallada.
- **Legibilidad con partículas a pleno brillo:**
  - los nodos son pequeños (≤ 4 px);
  - al final están repartidos por toda la pantalla (~8.000 en 1920×1080, la mitad en móvil);
  - en móvil se usa opacidad 0,5.

  Si la comprobación manual 6 falla, se reduce el número de nodos visibles durante la explosión, sin tocar la spec.
- **Rendimiento en móvil:**
  - un solo *draw call*;
  - mitad de nodos;
  - `dpr` limitado a 2;
  - sin lecturas de layout costosas: solo `scrollY`, `scrollHeight` e `innerHeight`, sin escribir en el DOM dentro del bucle.

  `requestAnimationFrame` se pausa solo con la pestaña oculta.
- **WebGL2 no disponible** (navegadores antiguos, menos del 5 %): la página se ve igual sin la constelación.
- **jsdom sin WebGL:** el renderer no tiene tests automáticos. Por eso está aislado y sin lógica propia: todas sus decisiones vienen de funciones con test.
- **Privacidad:**
  - las fotos y el vídeo no salen del PC ni entran en el repo;
  - MediaPipe descarga sus modelos de Google la primera vez que se ejecuta la herramienta, pero no envía las imágenes.
- **Mantenimiento de WebGL "a mano":** si en el futuro hacen falta mallas, luces o postprocesado, se valora Three.js con un ADR nuevo (ver ADR 0003).

## ADRs relacionados

- [0003 - Constelación con WebGL2, sin librería 3D](../../docs/decisions/0003-constelacion-webgl2-sin-libreria.md)
- [0004 - Generar el busto en local con Python](../../docs/decisions/0004-generar-busto-en-local-con-python.md)
- [0001 - Usar Angular standalone con Vitest](../../docs/decisions/0001-usar-angular-standalone.md)
