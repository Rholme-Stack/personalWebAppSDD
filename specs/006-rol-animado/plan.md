# Plan técnico: 006-rol-animado

**Spec:** [spec.md](./spec.md)
**Estado:** Aprobado <!-- Borrador | Aprobado -->
**Fecha:** 2026-11-24

## Resumen técnico

Un componente nuevo, `TypedRole`, recibe la frase y la escribe y la borra en bucle. Las reglas del ciclo (qué viene después y cuánto tarda) son funciones puras en `typing.ts`; el componente solo las ejecuta con un temporizador. La portada usa un texto nuevo, `heroRole`, y "About Me" sigue con `role`.

## Contexto técnico

- **Framework:** Angular 22 (standalone, sin zone.js)
- **Lenguaje:** TypeScript 6
- **Tests:** Vitest
- **Dependencias nuevas:** ninguna.
- **Backend / APIs:** no aplica.

### Estado actual del código

- `landing.html`: `<p class="hero-role">{{ t().role }}</p>`, en menta, 14 px, mayúsculas, centrado en vertical junto al `h1` dentro de `.hero`.
- `translations.ts`: `role` se usa en la portada y también en `about-me.html`.
- `constellation.ts`: lee `prefers-reduced-motion` con `window.matchMedia?.()` y escucha sus cambios. En jsdom `matchMedia` no existe, de ahí el `?.`.
- `styles.css`: `.visually-hidden` ya existe y es global.
- Punto de partida (2026-11-24): 110 tests y build en verde.

## Check de constitución

- [x] **I. Spec primero:** `spec.md` aprobada el 2026-11-24; `tasks.md` antes del código.
- [x] **II. Calidad y tests:** las reglas del ciclo y el componente tienen tests con reloj simulado; lo visual se verifica en un navegador real.
- [x] **III. Arquitectura:** componente standalone en `src/app/landing/typed-role/`. Estado con signals, sin RxJS.
- [x] **IV. Simplicidad:** sin dependencias. La lectura de `prefers-reduced-motion` se repite (unas líneas) en vez de crear una utilidad compartida y tocar la constelación.
- [x] **V. Seguridad:** sin entradas de usuario ni datos guardados.
- [x] **VI. Accesibilidad y UX:** frase completa para lectores de pantalla, texto fijo con "reducir movimiento" y una sola línea a 360 px.

## Arquitectura

```
Landing
└── main > section.hero
    ├── h1
    └── p.hero-role
        └── app-typed-role [text]="t().heroRole"
            ├── con "reducir movimiento": {{ text() }}
            └── si no:
                ├── span.visually-hidden            ← frase completa
                └── span[aria-hidden="true"]        ← letras visibles + span.cursor
```

- **Ciclo** (`typing.ts`): el estado es `{ length, deleting }`. `nextStep` da el siguiente y `stepDelay` cuánto se espera antes de pasar a él:

  | Momento            | Espera                                                                       |
  | ------------------ | ---------------------------------------------------------------------------- |
  | Vacío              | 700 ms                                                                       |
  | Escribir una letra | Al azar, de 70 a 190 ms; 150 ms más al empezar una palabra (tras un espacio) |
  | Completo           | 3000 ms                                                                      |
  | Borrar una letra   | 45 ms                                                                        |

  El azar entra como parámetro (`random: number`), para que los tests sean exactos.

- **Temporizador:** un `effect` programa un único `setTimeout` por paso y lo cancela en su `onCleanup`. Al destruir el componente o cambiar de idioma no queda ninguno vivo.
- **Cambio de idioma y de preferencia:** el estado es un `linkedSignal` que depende de `text()` y `reducedMotion()`: si cambia cualquiera, vuelve a vacío y el `effect` empieza de nuevo.
- **Cursor:** `<span class="cursor">` de 2 px, en menta (`currentColor`). Parpadea por CSS solo con la clase `blink`, que se pone cuando el rol está vacío o completo.
- **Nada se mueve:** el cursor es más bajo que la línea y está siempre presente, así que la línea existe también con el texto vacío y mide siempre lo mismo.
- **Lectores de pantalla:** la frase completa, oculta a la vista, no cambia durante el ciclo. La parte animada lleva `aria-hidden` y no hay región viva, así que no se anuncia nada.
- **Se descarta hacerlo solo con CSS** (`steps()` sobre el ancho): necesita letra monoespaciada y un ritmo uniforme, y la spec pide lo contrario.

## Archivos afectados

| Acción    | Archivo                                                       | Cambio                                               |
| --------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| Crear     | `src/app/landing/typed-role/typing.{ts,spec.ts}`              | Reglas del ciclo.                                    |
| Crear     | `src/app/landing/typed-role/typed-role.{ts,html,css,spec.ts}` | Componente.                                          |
| Modificar | `src/app/i18n/translations.ts`                                | `heroRole` en los tres idiomas.                      |
| Modificar | `src/app/landing/landing.{html,ts,spec.ts}`                   | Usa `app-typed-role` y ajusta los dos tests del rol. |
| Modificar | `docs/design/DESIGN.md`                                       | Sección nueva "Hero Role".                           |
| Modificar | `specs/002-landing-personal/spec.md`                          | Nota en HU-1: el rol de la portada cambia en la 006. |

## Mapeo spec → implementación

| Criterio de aceptación                          | Dónde se implementa                                      |
| ----------------------------------------------- | -------------------------------------------------------- |
| HU-1: textos en los tres idiomas, mismo aspecto | `translations.ts` (`heroRole`); `.hero-role` sin cambios |
| HU-1: "About Me" no cambia                      | `role` y `about.bio` sin cambios                         |
| HU-2: se escribe, espera 3 s, se borra, repite  | `typing.ts` + `effect` de `typed-role.ts`                |
| HU-2: ritmo irregular                           | `typing.ts` (`stepDelay`)                                |
| HU-2: cursor tras la última letra; parpadeo     | `typed-role.html` + `typed-role.css` (`.blink`)          |
| HU-2: nada se mueve; una línea a 360 px         | `typed-role.css`                                         |
| HU-2: cambiar de idioma empieza de nuevo        | `typed-role.ts` (`linkedSignal`)                         |
| HU-2: lector de pantalla                        | `typed-role.html` (`.visually-hidden`, `aria-hidden`)    |
| HU-2: "reducir movimiento", también en caliente | `typed-role.ts` (`reducedMotion`) + `typed-role.html`    |

## Estrategia de tests

**Automáticos (Vitest):**

- `typing.spec.ts`: ciclo completo; 3000 ms con la frase completa; menos de 1 s vacía; la espera depende del azar y siempre está entre sus límites; borrar es más rápido que la letra más rápida al escribir.
- `typed-role.spec.ts` (reloj simulado): empieza vacío con cursor; crece letra a letra; se queda 3 s; se borra y vuelve a escribirse; cursor con `blink` solo quieto; la frase completa siempre está para lectores de pantalla; cambiar el texto reinicia; con "reducir movimiento" se ve fijo y sin cursor, y reacciona al cambio; al destruirlo no queda ningún temporizador.
- `landing.spec.ts`: el rol de la portada en los tres idiomas. `about-me.spec.ts` no se toca y debe seguir en verde.

**Manuales (Chrome headless sobre el build, 1280 y 360 px, tres idiomas):** una sola línea; `h1` y `.hero-role` no cambian de posición ni de tamaño durante un ciclo entero; cursor pegado a la última letra; ritmo y 3 s medidos; cambio de idioma a mitad; "reducir movimiento".

## Riesgos y mitigaciones

- **Movimiento sin fin:** las pautas WCAG (2.2.2) piden poder pausar lo que se mueve solo más de 5 s. La spec deja fuera el botón de pausa; "reducir movimiento" lo cubre en parte.
- **Pestaña en segundo plano:** el navegador frena los temporizadores; el ciclo va más lento mientras no se ve y sigue bien al volver.

## ADRs relacionados

- [0002](../../docs/decisions/0002-i18n-servicio-propio-con-signals.md): el texto nuevo sigue el servicio propio con signals.
- Ninguno nuevo.
