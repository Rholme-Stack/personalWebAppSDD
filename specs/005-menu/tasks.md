# Tareas: 005-menu

**Plan:** [plan.md](./plan.md) · **Spec:** [spec.md](./spec.md)
**Estado:** Completada (2026-11-23) <!-- Borrador | Aprobada | Completada (AAAA-MM-DD) -->

> Formato: `- [ ] T### [P] descripción (archivos)`.
> `[P]` = se puede hacer en paralelo con otras `[P]` de la misma fase (tocan archivos distintos).
> Ciclo TDD: la tarea de test deja los tests en **rojo** a propósito; la siguiente los pone en **verde**.
> Fuera de ese ciclo, `npm test` y `npm run build` deben quedar en verde al terminar cada tarea.
> Marca `[x]` al terminar cada tarea.

## Fase 1: Punto de partida

- [x] T001 Ejecutar `npm test` y `npm run build` en la rama `005-menu` antes de tocar nada y confirmar que pasan.

## Fase 2: Logo sin nombre y scroll (TDD)

- [x] T002 Tests: el logo tiene `alt="Rodrigo Holme"` y su enlace no tiene texto; al pulsarlo se llama a `ViewportScroller.scrollToPosition([0, 0])`; `ViewportScroller.setOffset` recibe una función que devuelve el alto de la cabecera. **Resultado esperado: rojo.** (`src/app/landing/site-header/site-header.spec.ts`)
- [x] T003 Quitar el nombre visible, volver arriba al pulsar el logo y registrar el desplazamiento. **Resultado esperado: verde.** (`src/app/landing/site-header/site-header.{html,ts,css}`)

## Fase 3: Selector de idioma compacto (TDD)

- [x] T004 Tests: se ve EN, ES o PT según el idioma, dentro de un elemento con `aria-hidden="true"`; las opciones siguen siendo los nombres completos y la etiqueta oculta se mantiene. **Resultado esperado: rojo.** (`src/app/landing/site-header/site-header.spec.ts`)
- [x] T005 Añadir `code` a `LANGS` y poner el `<select>` transparente sobre el código, con ancho fijo y anillo de foco en el contenedor. **Resultado esperado: verde.** (`src/app/i18n/translations.ts`, `src/app/landing/site-header/site-header.{html,ts,css}`)

## Fase 4: Logo de LinkedIn en el contacto (TDD)

- [x] T006 Tests: el botón contiene `img[src="icons/linkedin.svg"][alt=""]` después del texto y conserva texto, `href` y `aria-label`. **Resultado esperado: rojo.** (`src/app/landing/site-header/site-header.spec.ts`)
- [x] T007 Añadir el icono de 16 px, en blanco, a la derecha del texto. **Resultado esperado: verde.** (`src/app/landing/site-header/site-header.{html,css}`)

## Fase 5: Menú a pantalla completa (TDD)

- [x] T008 Tests de `SiteHeader`, que sustituyen al de los enlaces de la cabecera. **Resultado esperado: rojo.** (`src/app/landing/site-header/site-header.spec.ts`)
  1. Cerrado: `aria-expanded="false"` y ningún enlace a secciones.
  2. Abierto: `aria-expanded="true"` y enlaces `/#about`, `/#stack`, `/#photos`, en ese orden y en los tres idiomas.
  3. Se cierra con el botón, con Escape (el foco queda en el botón), al elegir una opción y con el logo.
  4. Cambiar de idioma no lo cierra y traduce las opciones.
  5. El botón se llama "Menu" (en), "Menú" (es) y "Menu" (pt-BR).
- [x] T009 Añadir `nav.photos` y `nav.menu` en los tres idiomas e implementar el menú: botón con tres líneas / X, `menuOpen`, `nav.menu` con `@if`, Escape y foco. Se quitan los enlaces de la barra. **Resultado esperado: verde.** (`src/app/i18n/translations.ts`, `src/app/landing/site-header/site-header.{html,ts}`)
- [x] T010 Test de `Landing`: `<main>` está inerte solo con el menú abierto. **Resultado esperado: rojo.** (`src/app/landing/landing.spec.ts`)
- [x] T011 Enlazar `menuOpen` en `Landing` y dejar `<main>` inerte. **Resultado esperado: verde.** (`src/app/landing/landing.{html,ts}`)
- [x] T012 Estilos del menú: capa fija al 100 %, `--color-overlay`, cabecera transparente con el menú abierto, opciones grandes, fundido de 200 ms solo sin "reducir movimiento", bloqueo del scroll y `scrollbar-gutter`. (`src/app/landing/site-header/site-header.css`, `src/styles.css`)
- [x] T013 Cabecera en una sola fila en móvil: rejilla sin segunda fila, hueco de 12 px y `--header-height` de 80 px en todos los anchos. (`src/app/landing/site-header/site-header.css`, `src/styles.css`)
- [x] T020 (añadida al verificar) Corregir el fallo 3 del plan, sustituyendo `scroll-padding-top` por `scroll-margin-top` en `main a`, y ajustar el velo para que se vea la constelación. (`src/styles.css`, `src/app/landing/landing.css`, `src/app/landing/site-header/site-header.ts`)
- [x] T021 (añadida al verificar) No cerrar el menú con un Escape que llegue a la página mientras el desplegable de idioma está abierto (visto en Firefox automatizado): test en rojo y arreglo. (`src/app/landing/site-header/site-header.{ts,spec.ts}`)

## Fase 6: Documentación

- [x] T014 [P] Actualizar `DESIGN.md`: Logo Lockup, Navigation Bar, selector de idioma, botón de contacto, móvil, menú a pantalla completa, token `--color-overlay` y ejemplo de cabecera del Agent Prompt Guide. (`docs/design/DESIGN.md`)
- [x] T015 [P] Nota en los criterios generales y en la HU-4 de la 002: los enlaces pasan al menú y el selector se ve compacto. (`specs/002-landing-personal/spec.md`)
- [x] T016 [P] Nota en la HU-1 y la HU-3 de la 004: qué sustituye la 005. (`specs/004-cabecera/spec.md`)

## Fase 7: Verificación

- [x] T017 Ejecutar `npm test` y `npm run build`: los dos en verde y sin avisos de presupuesto. Formatear con Prettier los archivos tocados, salvo los que ya venían sin formatear (`DESIGN.md`).
- [x] T018 Verificación manual en Chrome headless sobre el build, a 1280 y 360 px y en los tres idiomas:
  1. Cabecera en una sola fila; ningún elemento pasa del borde. Medir contra 360 px fijos, no contra `innerWidth`, que en emulación móvil crece con el contenido.
  2. El selector tiene el mismo ancho en los tres idiomas y, desplegado, muestra los nombres completos.
  3. Menú: ocupa toda la pantalla, se ve la constelación moverse detrás y las opciones se leen bien arriba y a media página. La X está en el mismo sitio que el icono.
  4. Con el menú abierto, la rueda, las flechas y la barra espaciadora no mueven la página; al cerrarlo sigue en el mismo punto.
  5. Cada opción cierra el menú y deja el título de su sección entero por debajo de la cabecera.
  6. El logo vuelve arriba desde `/` y desde `/#stack`, con el menú abierto y cerrado.
  7. Tab recorre solo la cabecera y las opciones; el foco siempre se ve.
  8. Escape con el desplegable de idioma abierto no cierra el menú.
  9. Con `prefers-reduced-motion`, sin animación.

  **Resultado (2026-11-23):** los nueve puntos bien en Chrome. En Firefox 150 se comprobaron también la fila a 360 px, la X en su sitio, el bloqueo del scroll (rueda y Fin), Tab, Escape, las tres opciones y el logo. Además, en Chrome: arrastre con el dedo bloqueado, uso completo con Enter y Espacio, y móvil en horizontal (740×360 y 640×320). En el camino salieron T020 y T021.

- [x] T019 Repasar uno a uno los criterios de aceptación de `spec.md`.

  **Resultado (2026-11-23):** se cumplen todos los que se pueden comprobar aquí. **Pendiente de probar con dispositivos reales:**
  - iPhone (Safari): que la página de detrás no se mueva al arrastrar con el menú abierto.
  - Firefox con teclado real: abrir el desplegable de idioma con el menú abierto y pulsar Escape; solo debe cerrarse el desplegable.
  - Lector de pantalla: el nombre y el estado del icono de menú y el anuncio del idioma. En Chrome se comprobó el árbol de accesibilidad ("Menu", contraído; "Language", valor "English").

## Dependencias

- T003 depende de T002, T005 de T004, T007 de T006, T009 de T008 y T011 de T010.
- T010 depende de T009 (necesita `menuOpen`). T012 depende de T009 y T011.
- T013 depende de T003, T005, T007 y T009 (los cuatro elementos definitivos de la barra).
- T014–T016 dependen de T013.
- T017–T019 dependen de todas las anteriores, en ese orden.
