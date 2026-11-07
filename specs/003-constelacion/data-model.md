# Modelo de datos: 003-constelacion

**Spec:** [spec.md](./spec.md) · **Plan:** [plan.md](./plan.md)

> Esta feature no tiene base de datos ni API, y no guarda nada del visitante. Sus datos son tres:
>
> - **El archivo `bust.bin`:** el contrato entre `tools/bust/` y la app.
> - **Los atributos de cada nodo:** se generan en el navegador con una semilla fija.
> - **Las constantes de diseño.**
>
> Las fotos y el vídeo de partida **no** forman parte del modelo: nunca salen del equipo de Rodrigo.

## Sistema de coordenadas

Lo usan igual el archivo, los nodos y los shaders.

- **Unidades del busto:** el centro de la caja que envuelve el busto está en el origen, y su lado mayor mide 2 unidades. Así todo el busto cabe en el cubo [−1, 1]³.
- **Ejes**, con el busto visto de frente:
  - `x` hacia la derecha del visitante;
  - `y` hacia arriba;
  - `z` hacia el visitante: la cara mira hacia `+z`.
- **Giro:** alrededor del eje `y` que pasa por el origen. Con un giro positivo, la cara se vuelve hacia la derecha del visitante (`+x`).
- **Cámara:** en `(0, 0, D)` en el espacio de la nube, mirando hacia el origen, con perspectiva.

## Entidades

### BustFile (`public/constellation/bust.bin`)

Posiciones de los nodos del busto (HU-1). Lo escribe `tools/bust/export.py` y lo lee `decodeBust()`. Es binario y *little-endian*.

| Desplazamiento | Campo   | Tipo                 | Reglas / validación |
| -------------- | ------- | -------------------- | ------------------- |
| 0              | `magic` | 4 bytes ASCII        | Exactamente `BUST`. |
| 4              | `version` | `uint32`           | `1`. Cualquier otra versión se rechaza. |
| 8              | `count` | `uint32`             | Número de nodos, entre 1.000 y 20.000 (objetivo: ~8.000). |
| 12             | `positions` | `count × 3 × int16` | `x, y, z` de cada nodo, en orden. Coordenada = `valor / 32767`, en [−1, 1]. |

- **Tamaño exacto:** `12 + count × 6` bytes, unos 48 kB con 8.000 nodos. Si no cuadra, el archivo se rechaza.
- **Orden aleatorio:** los nodos van barajados. Así, tomar uno de cada dos (móvil, ver `BustLayout.nodeStride`) da un busto completo y uniforme, no medio busto.
- **Qué contiene:** solo la superficie del busto: cabeza, cuello y hombros, cortado por debajo de la línea de los hombros. Nada del fondo de las fotos ni puntos dentro del volumen.
- **Densidad:** es mayor en el contorno del pelo, las orejas, el perfil, la mandíbula, el cuello, los hombros y los rasgos de la cara (ojos, cejas, nariz y labios). La densidad es la única forma de marcar los rasgos: no hay un campo de "tipo de nodo".

### Node (en memoria)

Un nodo de la constelación, listo para la GPU (HU-1, HU-2 y HU-4). `buildNodes(positions, rng)` crea todos los nodos en un único `Float32Array` intercalado, con 11 `float` por nodo.

| Campo      | Tipo    | Floats | Reglas / validación |
| ---------- | ------- | ------ | ------------------- |
| `position` | `vec3`  | 3      | Del archivo. En los nodos de ambiente, al azar en una capa esférica de radio 1,2–2 alrededor del origen. |
| `target`   | `vec3`  | 3      | Destino de la explosión en un **cilindro unidad**: radio en [0,15; 1], `y` en [−1, 1]. El shader lo escala a la ventana (ver "Reglas"). |
| `color`    | `vec3`  | 3      | RGB en [0, 1], tomado de `PALETTE` según sus pesos. |
| `phase`    | `float` | 1      | En [0, 2π). Desfasa el titileo y la deriva, y gira el triángulo. |
| `pace`     | `float` | 1      | En [0,6; 1,6]. Exponente del ritmo de la explosión: menor que 1, sale antes; mayor que 1, sale después. |

- **Total:** los nodos del archivo más `AMBIENT_COUNT` nodos de ambiente, barajados también entre sí.
- **Determinismo:** con la misma semilla (`SEED`) y el mismo archivo, `buildNodes` da siempre exactamente los mismos nodos. Lo exige la spec: una misma posición del scroll muestra siempre el mismo estado.

### PALETTE

Colores de los nodos (HU-1, `DESIGN.md`). Cada nodo recibe uno al azar según su peso.

| Nombre        | Valor     | Peso | Origen |
| ------------- | --------- | ---- | ------ |
| Electric Iris | `#8052ff` | 0,30 | Token `--color-electric-iris` |
| Mint Signal   | `#4fe3c1` | 0,25 | Token `--color-mint-signal` |
| Pulse Blue    | `#4f7bff` | 0,20 | Solo para la constelación |
| Spark Magenta | `#e04bf0` | 0,15 | Solo para la constelación |
| Deep Verdant  | `#15846e` | 0,10 | Token `--color-deep-verdant` |

Los pesos suman 1. El azul y el magenta no son tokens de la interfaz: solo existen en la constelación, como dice `DESIGN.md` ("violet, mint, teal, magenta, blue").

### BustLayout

Dónde y a qué tamaño se dibuja el busto (HU-1). La calcula `bustLayout(width, height, bustRadius)`.

| Campo            | Tipo     | Reglas / validación |
| ---------------- | -------- | ------------------- |
| `centerX`        | `number` | Fracción del ancho, en [0, 1]. Ancho ≥ 1024 px: `0.75`; si no, `0.5`. |
| `centerY`        | `number` | Fracción del alto: `0.5`. |
| `heightFraction` | `number` | Alto del busto respecto al de la ventana. Ancho ≥ 1024 px: `0.75`. Si no: `min(0.6, 0.9 × width / (height × bustRadius))`, para que el busto, al girar, no pase del 90 % del ancho. |
| `opacity`        | `number` | Ancho ≥ 1024 px: `1`; si no, `0.5`. |
| `nodeStride`     | `1 \| 2` | Ancho ≥ 1024 px: `1` (todos los nodos); si no, `2` (uno de cada dos). |

`bustRadius` es la mayor distancia de un nodo del archivo al eje `y`, `max(√(x² + z²))`. Se calcula una vez al cargar.

### MotionMode

Cómo se mueve el busto (HU-2, HU-3 y "reducir movimiento").

| Valor   | Cuándo | Giro |
| ------- | ------ | ---- |
| `still` | `prefers-reduced-motion: reduce`, aunque haya ratón. | 0° fijo. Sin titileo ni deriva. Sin explosión: se desvanece con el scroll. |
| `mouse` | `(hover: hover) and (pointer: fine)`, o tras un `pointermove` con `pointerType === 'mouse'`. | Sigue al ratón, ±90°. |
| `auto`  | Cualquier otro caso. | Vuelta completa cada `AUTO_TURN_SECONDS`. |

## Estados y transiciones

Ciclo de vida del componente `Constellation`:

```
loading ──(binario válido y WebGL2 listo)──> running ──(primer fotograma)──> visible
   │                                            │
   └──(sin WebGL2, shader falla, 404,           └──(webglcontextlost)──> failed
       binario inválido)──> failed
```

- **`loading`** y **`failed`:** el canvas no se ve (`opacity: 0`) y no hay bucle de animación. En `failed` solo se escribe un `console.warn`.
- **`visible`:** el signal `ready` pasa a `true` y el canvas aparece con un fundido de `FADE_IN_MS`.
- **Destrucción** (desde cualquier estado): se cancela el bucle, se quitan los listeners y se liberan los buffers.

## Reglas

Reglas que comprueban los tests.

- **Progreso del scroll** (HU-4): `p = clamp(scrollY / (scrollHeight − innerHeight), 0, 1)`. Si `scrollHeight − innerHeight ≤ 0`, entonces `p = 0`.
- **Avance de la explosión de un nodo:** `e = smoothstep(0, 1, p) ^ pace`.
  - `e = 0` con `p = 0` y `e = 1` con `p = 1`, sea cual sea `pace`: todos los nodos empiezan en el busto y todos llegan a su destino al final.
  - En `still`, `e = 0` siempre.
- **Destino de un nodo:**
  - El ángulo alrededor de `y` es el del nodo, `atan2(x, z)`, ± π/4 al azar: el nodo sale por su lado.
  - El radio es `√U(0,0225; 1)`, es decir, en [0,15; 1] y repartido de forma uniforme por el área.
  - La `y` va hacia el mismo lado del nodo: `sign(y) × U(0; 1)`. Si `y = 0`, cualquier signo.
- **Escala del cilindro** en el shader:
  - Radio `R = min(1,1 × D × tan(FOV_Y / 2) × aspect, D − 0,8)`. Así cubre todo el ancho y queda por delante de la cámara.
  - Media altura `H = 1,1 × D × tan(FOV_Y / 2)`.
- **Centro de la nube:** pasa del centro del layout al centro de la pantalla a medida que avanza la explosión, `mix(centerX, 0.5, smoothstep(0, 1, p))`. Así, al final, las partículas cubren toda la pantalla y no solo la mitad derecha.
- **Giro con ratón** (HU-2): `yaw = clamp((x / width − 0,5) × 2, −1, 1) × MAX_YAW`. La `y` del ratón no interviene.
- **Suavizado:** `damp(a, b, dt, τ) = b + (a − b) × e^(−dt / τ)`.
  - `τ = DAMP_FOLLOW_TAU` siguiendo al ratón.
  - `τ = DAMP_RETURN_TAU` volviendo de frente.
  - No depende de los fps: un paso de 32 ms da lo mismo que dos de 16 ms.
- **Giro automático** (HU-3): `yaw = (t / AUTO_TURN_SECONDS) × 360°`, sin parar.
- **Profundidad** (HU-1): `k = clamp((z′ + 1) / 2, 0, 1)`, donde `z′` es la `z` del nodo tras el giro y la escala.
  - Tamaño = `mix(NODE_SIZE_MIN, NODE_SIZE_MAX, k) × dpr`, en píxeles.
  - Opacidad = `mix(FAR_OPACITY, 1, k)`.
  - Los nodos que salen hacia el visitante se quedan en el tamaño máximo.
- **Opacidad final de un nodo:**
  - normal: `opacidad por profundidad × titileo × layout.opacity`;
  - en `still`: además `× (1 − p)`.

  No hay otro fundido: al final de la explosión los nodos conservan todo su brillo (clarificación de la spec).
- **Titileo:** `0,75 + 0,25 × sin(t × ω + phase)`, con `ω` entre 1,5 y 3 rad/s según el nodo. En `still` vale 1.
- **Deriva:** desplazamiento sinusoidal de amplitud `DRIFT_AMPLITUDE` por eje. En `still` vale 0.

## Constantes

Viven en `src/app/constellation/` (y `D`, `FOV_Y` también en los shaders).

| Constante            | Valor       | Para qué |
| -------------------- | ----------- | -------- |
| `SEED`               | `20261107`  | Semilla de `buildNodes`. |
| `AMBIENT_COUNT`      | `300`       | Nodos sueltos alrededor del busto. |
| `D` (distancia de cámara) | `4.2`  | Con `FOV_Y`, el busto (alto 2) ocupa el 75 % del alto con escala 1. |
| `FOV_Y`              | `35°`       | Campo de visión vertical. |
| `MAX_YAW`            | `90°`       | Giro máximo con el ratón. |
| `AUTO_TURN_SECONDS`  | `20`        | Duración de una vuelta en modo `auto`. |
| `DAMP_FOLLOW_TAU`    | `0.12 s`    | Suavizado siguiendo al ratón (se asienta en ~0,4 s). |
| `DAMP_RETURN_TAU`    | `0.3 s`     | Suavizado volviendo de frente (~1 s). |
| `NODE_SIZE_MIN`      | `1.5 px`    | Nodo más lejano. |
| `NODE_SIZE_MAX`      | `4 px`      | Nodo más cercano. |
| `FAR_OPACITY`        | `0.35`      | Opacidad del nodo más lejano. |
| `DRIFT_AMPLITUDE`    | `0.01`      | Deriva en unidades del busto (unos px). |
| `DPR_MAX`            | `2`         | Límite de `devicePixelRatio` del canvas. |
| `DESKTOP_MIN_WIDTH`  | `1024 px`   | A partir de aquí, colocación de ordenador. |
| `FADE_IN_MS`         | `600`       | Fundido de entrada del canvas. |

## Interfaces TypeScript (referencia)

```ts
// src/app/constellation/motion.ts
export type MotionMode = 'mouse' | 'auto' | 'still';

// src/app/constellation/layout.ts
export interface BustLayout {
  centerX: number;
  centerY: number;
  heightFraction: number;
  opacity: number;
  nodeStride: 1 | 2;
}

// src/app/constellation/nodes.ts
/** Floats por nodo: position(3) + target(3) + color(3) + phase(1) + pace(1). */
export const NODE_STRIDE = 11;

export interface ConstellationNodes {
  count: number;
  /** count × NODE_STRIDE floats, intercalados y barajados. */
  data: Float32Array;
}

// src/app/constellation/renderer.ts
export interface FrameState {
  yaw: number; // radianes
  progress: number; // p en [0, 1]
  time: number; // segundos desde el inicio
  layout: BustLayout;
  mode: MotionMode;
}
```
