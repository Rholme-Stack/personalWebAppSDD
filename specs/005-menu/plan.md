# Plan técnico: 005-menu

**Spec:** [spec.md](./spec.md)
**Estado:** Aprobado <!-- Borrador | Aprobado -->
**Fecha:** 2026-11-23

## Resumen técnico

Todo el cambio visible vive en `SiteHeader`: el menú es un `<nav>` fijo a pantalla completa que se pinta detrás de la barra y delante de la página. `SiteHeader` guarda si está abierto en un signal (`model`), y `Landing` lo usa para dejar `<main>` inerte. El selector sigue siendo el `<select>` nativo, transparente, encima de una etiqueta con el código del idioma. De paso se corrigen tres fallos de scroll que ya existen y que impedirían cumplir la spec.

## Contexto técnico

- **Framework:** Angular 22 (standalone)
- **Lenguaje:** TypeScript 6
- **Tests:** Vitest
- **Dependencias nuevas:** ninguna. La animación usa `animate.enter` / `animate.leave`, que ya están en `@angular/core` 22.
- **Backend / APIs:** no aplica.

### Estado actual del código

- `site-header.html`: `.wordmark` (logo decorativo + nombre), `<nav>` con dos enlaces, `<select>` con los nombres completos y botón de contacto sin icono.
- `site-header.css`: la cabecera es `sticky` con `z-index: 10` y fondo negro opaco. Por debajo de 640 px se parte en dos filas.
- `styles.css`: `--header-height` vale 80 px y 112 px en móvil.
- `translations.ts`: `LANGS` tiene `value` y `label`; `nav` no tiene textos para "Photos" ni para el menú.
- `public/icons/linkedin.svg`: gris `#9a9a9a`, pensado para fondo negro.
- `Photos` ya es `section#photos`, así que el enlace del menú no necesita cambios allí.

**Medido en Chrome headless sobre el build actual (2026-11-23):**

| Qué                              | 1280 px                                                    | 360 px                                           |
| -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| Ancho del selector               | 203 px                                                     | 203 px                                           |
| Alto real de la cabecera         | 80 px                                                      | 123 px (`--header-height` dice 112)              |
| **Fallo 1:** pulsar el logo      | No se mueve (de 900 a 900)                                 | No se mueve (de 900 a 900)                       |
| **Fallo 2:** saltar a "About Me" | Título de 60 a 113 px: la cabecera tapa los primeros 20 px | Título de 60 a 99 px: la cabecera lo tapa entero |

- **Fallo 3 (encontrado al verificar):** al llevar el foco a la cabecera con el teclado, la página sube sola (de 700 a 300 px con un solo Tab), también con el menú abierto.
- **Causa del fallo 1:** `routerLink="/"` cambia la URL, pero el router no hace scroll si no hay fragmento y `scrollPositionRestoration` está desactivado. Incumple la HU-1 (criterio 2) de la [004](../004-cabecera/spec.md), que todavía no se había verificado.
- **Causa del fallo 2:** el router salta con `window.scrollTo`, que no tiene en cuenta el `scroll-padding-top` de `styles.css`.

## Cambios en la spec

La spec aprobada dice que el logo vuelve arriba "igual que ahora", y hoy no lo hace. Dos retoques, aprobados con este plan el 2026-11-23 y ya aplicados:

1. **HU-2, criterio 2:** quitar "igual que ahora". El comportamiento pedido (volver al principio) no cambia.
2. **HU-1, "Elegir", criterio 1:** añadir "y su título se ve entero por debajo de la cabecera".

## Check de constitución

- [x] **I. Spec primero:** `spec.md` aprobada el 2026-11-23; `tasks.md` antes del código. Los dos retoques de la spec se aplicaron antes de programar.
- [x] **II. Calidad y tests:** los criterios comprobables en el DOM tienen tests en `site-header.spec.ts` y `landing.spec.ts`; lo visual se verifica a mano (ver Estrategia de tests). `npm test` y `npm run build` en verde al cerrar cada tarea.
- [x] **III. Arquitectura:** solo componentes standalone existentes. Estado con signals (`model`), sin RxJS ni servicio nuevo.
- [x] **IV. Simplicidad:** sin dependencias ni componentes nuevos: el menú son tres enlaces y solo lo usa la cabecera.
- [x] **V. Seguridad:** sin entradas de usuario nuevas. El enlace a LinkedIn conserva `rel="noopener noreferrer"`.
- [x] **VI. Accesibilidad y UX:** botón real con `aria-expanded`, Escape, `<main>` inerte, foco devuelto al botón, zona de pulsación de 44 px y una sola fila a 360 px.

## Arquitectura

```
Landing
├── app-constellation                     ← sin cambios (se sigue moviendo)
├── app-site-header  [(menuOpen)]
│   ├── header
│   │   ├── a.home (routerLink "/")       ← logo, alt = "Rodrigo Holme"; cierra y vuelve arriba
│   │   ├── .language                     ← código visible + select nativo transparente encima
│   │   ├── a.button-primary.contact      ← texto + icono de LinkedIn
│   │   └── button.menu-button            ← tres líneas / X, aria-expanded
│   └── @if (menuOpen()) nav.menu         ← fijo, 100 %, negro translúcido
│       └── ul: About Me · Stack · Photos
└── main [inert]="menuOpen()"
```

- **Menú con `<nav>` y no con `<dialog>`:** `showModal()` dejaría inerte todo lo que hay fuera, también la cabecera, y la spec pide que se pueda usar. Con `<main inert>` la página de detrás no recibe foco, clics ni lector de pantalla, y la cabecera sí.
- **Capas:** la cabecera ya crea su propio contexto de apilado (`sticky` + `z-index: 10`). El menú, dentro de ella con `position: fixed; inset: 0; z-index: -1`, queda detrás de la barra y delante de la página. Con el menú abierto, el fondo opaco de la cabecera pasa a transparente para que el velo sea uniforme en toda la pantalla.
- **Velo:** token nuevo `--color-overlay: rgb(0 0 0 / 60%)`, y `main[inert]` con opacidad 0,4. Se planificó un 80 % uniforme, pero al verificarlo la constelación casi no se veía y el nombre de la portada competía con las opciones. Así la constelación se ve al 40 % y el texto de detrás al 16 %: en el peor caso (texto blanco) el fondo queda en `#292929`, con un contraste de unos 14:1 para las opciones en blanco.
- **Opciones:** alineadas a la izquierda y centradas en vertical, peso 400, `clamp(3rem, 8vw, 4.875rem)`. `overflow-y: auto` en el menú para móviles en horizontal.
- **Bloqueo del scroll:** solo CSS, `html:has(app-site-header.menu-open) { overflow: hidden }`. Con `scrollbar-gutter: stable` en `html`, al desaparecer la barra de scroll nada se mueve y la X queda en el mismo sitio que el icono.
- **Estado:** `menuOpen = model(false)` en `SiteHeader`, y clase `menu-open` en el host. El botón alterna; las opciones y el logo cierran; `document:keydown.escape` cierra y devuelve el foco al botón.
- **Nombre del botón:** fijo ("Menu" / "Menú" / "Menu"); el estado lo da `aria-expanded`. Cambiar las dos cosas a la vez haría que se anunciara "Cerrar menú, expandido".
- **Animación:** fundido de 200 ms con `animate.enter` / `animate.leave`, definido solo dentro de `@media (prefers-reduced-motion: no-preference)`. El `@if` saca las opciones del DOM al cerrar, así que no reciben foco ni se anuncian.
- **Selector compacto:** `LANGS` gana `code`. Un `<span aria-hidden="true">` de ancho fijo muestra el código y una flecha, y el `<select>` nativo lo cubre con `opacity: 0`. Se conservan el desplegable del sistema, el teclado, la etiqueta oculta y el anuncio del nombre completo. El anillo de foco se pinta en el contenedor.
  - Se descarta `appearance: base-select` porque no está en todos los navegadores de la 004, y un desplegable propio porque obliga a rehacer teclado y accesibilidad.
- **Icono de LinkedIn:** el mismo `icons/linkedin.svg` de 16 px con `alt=""`, en blanco con `filter: brightness(0) invert(1)`. El `aria-label` del botón no cambia.
- **Logo:** pierde el nombre visible y su `alt` pasa de vacío a "Rodrigo Holme", que es ahora el nombre del enlace.
- **Fallo 1 (volver arriba):** el logo conserva `routerLink="/"` (limpia el fragmento) y además llama a `ViewportScroller.scrollToPosition([0, 0])`. Se descarta activar `scrollPositionRestoration` porque también cambiaría qué pasa al recargar y al ir atrás.
- **Fallo 2 (título tapado):** `SiteHeader` registra `ViewportScroller.setOffset(() => [0, alto de la cabecera])`. Mide el alto real, así que no depende de `--header-height`.
- **Fallo 3 (la página sube al enfocar la cabecera):** lo causa `scroll-padding-top` en `html`, que el navegador aplica también a lo que está dentro de la cabecera. Se sustituye por `scroll-margin-top` en los enlaces de `main`, los únicos que la cabecera puede tapar; además, Escape devuelve el foco con `preventScroll`.
- **Ancho a 360 px:** quedan 324 px útiles. Logo 28 + idioma 60 + contacto 140 ("Contacto", el más largo) + menú 44 + tres huecos de 12 = 308 px.

## Archivos afectados

| Acción    | Archivo                                                 | Cambio                                                                                                                                   |
| --------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Modificar | `specs/005-menu/spec.md`                                | Los dos retoques propuestos.                                                                                                             |
| Modificar | `src/app/i18n/translations.ts`                          | `code` en `LANGS`; `nav.photos` y `nav.menu`.                                                                                            |
| Modificar | `src/app/landing/site-header/site-header.{html,ts,css}` | Menú, botón, selector compacto, icono de LinkedIn, logo sin nombre, arreglos de scroll, una fila en móvil.                               |
| Modificar | `src/app/landing/site-header/site-header.spec.ts`       | Tests nuevos y ajuste de los del logo y los enlaces.                                                                                     |
| Modificar | `src/app/landing/landing.{html,ts,css,spec.ts}`         | `menuOpen` enlazado y `<main>` inerte y atenuado.                                                                                        |
| Modificar | `src/styles.css`                                        | `--color-overlay`, bloqueo del scroll, `scrollbar-gutter`, `scroll-margin-top` en `main a`; `--header-height` de 80 px también en móvil. |
| Modificar | `docs/design/DESIGN.md`                                 | Logo Lockup, Navigation Bar, selector, móvil (hoy dice "No hamburger menu") y menú a pantalla completa.                                  |
| Modificar | `specs/002-landing-personal/spec.md`                    | Nota en los criterios generales: los enlaces pasan al menú (005).                                                                        |
| Modificar | `specs/004-cabecera/spec.md`                            | Nota en HU-1 y HU-3: qué sustituye la 005.                                                                                               |

## Mapeo spec → implementación

| Criterio de aceptación                           | Dónde se implementa                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| HU-1: icono a la derecha, sin enlaces            | `site-header.html` (`.menu-button`) + `site-header.css`                  |
| HU-1: menú al 100 % con tres opciones traducidas | `site-header.html` (`@if`, `nav.menu`) + `translations.ts`               |
| HU-1: negro translúcido, constelación en marcha  | `styles.css` (`--color-overlay`) + `site-header.css`                     |
| HU-1: opciones legibles                          | `site-header.css` (blanco sobre el velo)                                 |
| HU-1: cabecera usable y X en el mismo sitio      | `site-header.css` (capas) + `styles.css` (`scrollbar-gutter`)            |
| HU-1: la página de detrás no hace scroll         | `styles.css` (`html:has(...)`)                                           |
| HU-1: elegir cierra y se desplaza a la sección   | `site-header.html` + `site-header.ts` (`setOffset`)                      |
| HU-1: cambiar de idioma no cierra el menú        | `site-header.ts` (`onLangChange` no toca `menuOpen`)                     |
| HU-1: X, Escape y logo cierran                   | `site-header.ts`                                                         |
| HU-1: nombre y estado del icono                  | `site-header.html` (`aria-label`, `aria-expanded`)                       |
| HU-1: el teclado no llega a la página de detrás  | `landing.html` (`main [inert]`)                                          |
| HU-1: menú cerrado, opciones inexistentes        | `site-header.html` (`@if`)                                               |
| HU-1: el foco vuelve al icono                    | `site-header.ts` (foco al botón tras Escape; con la X ya está en él)     |
| HU-1: sin animación con "reducir movimiento"     | `site-header.css` (media query)                                          |
| HU-2: cuatro elementos en orden, sin nombre      | `site-header.html`                                                       |
| HU-2: el logo vuelve arriba                      | `site-header.ts` (`scrollToPosition`)                                    |
| HU-2: se anuncia "Rodrigo Holme"                 | `site-header.html` (`alt`)                                               |
| HU-2: una fila a 360 px                          | `site-header.css`                                                        |
| HU-3: código cerrado, ancho fijo                 | `translations.ts` (`code`) + `site-header.{html,css}`                    |
| HU-3: nombres completos, elegir y recordar       | `<select>` nativo y `LanguageService`, sin cambios                       |
| HU-3: anuncio del nombre completo                | `site-header.html` (código con `aria-hidden`; el `<select>` se conserva) |
| HU-4: texto + logo, en blanco, dentro del botón  | `site-header.{html,css}`                                                 |
| HU-4: abre LinkedIn y se anuncia igual           | `site-header.html` (`href` y `aria-label` sin cambios; icono `alt=""`)   |

## Estrategia de tests

**Automáticos (Vitest):**

- `site-header.spec.ts`:
  - el logo tiene `alt="Rodrigo Holme"`, el enlace no tiene texto y al pulsarlo se llama a `scrollToPosition([0, 0])`;
  - cerrado: `aria-expanded="false"` y ningún enlace a secciones en el DOM;
  - abierto: `aria-expanded="true"` y enlaces `/#about`, `/#stack`, `/#photos`, en ese orden y en los tres idiomas;
  - se cierra con el botón, con Escape (el foco queda en el botón), al elegir una opción y con el logo;
  - cambiar de idioma no lo cierra y traduce las opciones;
  - el nombre del botón es "Menu", "Menú" o "Menu";
  - el código visible es EN, ES o PT y está oculto a lectores de pantalla; las opciones siguen siendo los nombres completos;
  - el botón de contacto contiene `icons/linkedin.svg` con `alt=""` después del texto, y conserva `href` y `aria-label`;
  - el desplazamiento registrado en `ViewportScroller` es el alto de la cabecera.
- `landing.spec.ts`: `<main>` está inerte solo con el menú abierto.

**Manuales (Chrome headless sobre el build, 1280 y 360 px, tres idiomas):**

- Una sola fila sin desbordamiento; ancho del selector igual en los tres idiomas.
- Menú al 100 %, velo, legibilidad arriba y a media página, X en el mismo sitio que el icono.
- La rueda, las flechas y la barra espaciadora no mueven la página con el menú abierto; al cerrarlo sigue en el mismo punto.
- Cada opción deja el título de su sección por debajo de la cabecera; el logo vuelve arriba desde `/` y desde `/#stack`.
- Tab recorre solo la cabecera y las opciones.
- Con `prefers-reduced-motion`, sin animación.

## Riesgos y mitigaciones

- **Escape con el desplegable de idioma abierto:** en Chrome no llega a la página. En Firefox 150 automatizado sí llega, pero ahí las teclas simuladas no alcanzan el desplegable nativo, así que no demuestra qué pasa con un teclado real. **Mitigación aplicada:** se ignora el Escape si el `<select>` está desplegado (`:open`).
- **"Photos" está al final de la página:** al elegirla, el título se verá, pero puede no quedar pegado a la cabecera si no hay más recorrido. Es correcto según la spec.
- **iOS y `overflow: hidden`:** versiones antiguas de Safari lo ignoran al arrastrar con el dedo. **Mitigación:** `overscroll-behavior: contain` en el menú. Necesita un iPhone real para comprobarse.
- **`scrollbar-gutter` en Windows:** con el menú abierto queda libre la franja de la barra de scroll (unos 15 px, negra). Es el precio de que nada se mueva.
- **Aviso para futuras features:** tras elegir una opción con el teclado, el foco no se mueve a la sección. La spec no lo pide; si se quiere, basta con `tabindex="-1"` en las secciones.

## ADRs relacionados

- [0002](../../docs/decisions/0002-i18n-servicio-propio-con-signals.md): los textos nuevos siguen el servicio propio con signals.
- Ninguno nuevo: no hay dependencias ni patrones que afecten a otras features.
