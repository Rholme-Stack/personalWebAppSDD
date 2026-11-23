# Tareas: 004-cabecera

**Plan:** [plan.md](./plan.md) · **Spec:** [spec.md](./spec.md)
**Estado:** Completada (2026-11-23), con dos criterios que pasan a la [005-menu](../005-menu/spec.md): ver T013 <!-- Borrador | Aprobada | Completada (AAAA-MM-DD) -->

> Formato: `- [ ] T### [P] descripción (archivos)`.
> `[P]` = se puede hacer en paralelo con otras `[P]` de la misma fase (tocan archivos distintos).
> Ciclo TDD: la tarea de test deja los tests en **rojo** a propósito; la siguiente los pone en **verde**.
> Fuera de ese ciclo, `npm test` y `npm run build` deben quedar en verde al terminar cada tarea.
> Marca `[x]` al terminar cada tarea.

## Fase 1: Punto de partida

- [x] T001 Ejecutar `npm test` y `npm run build` antes de tocar nada y confirmar que pasan.

## Fase 2: Recursos del logo

- [x] T002 Mover el logo a `public/logo-rh.svg` y actualizar su ruta en las Clarificaciones de la spec. (`docs/design/logo-rh.svg` → `public/logo-rh.svg`, `specs/004-cabecera/spec.md`)
- [x] T003 Regenerar `favicon.ico` (16, 32 y 48 px) a partir del logo: render a 256 px con fondo transparente en Chrome headless y conversión con Pillow. (`public/favicon.ico`)
- [x] T004 Declarar el icono SVG y el ICO de alternativa en `index.html`; el título sigue siendo "Rodrigo Holme". (`src/index.html`)

## Fase 3: Cabecera (TDD)

- [x] T005 Tests de `SiteHeader`: el enlace a `/` contiene `img[src="logo-rh.svg"][alt=""]` y su texto es "Rodrigo Holme"; el menú solo enlaza `/#about` y `/#stack`; el botón de contacto apunta a LinkedIn con `target="_blank"` y `rel` con `noopener`; texto y `aria-label` en `en`, `es` y `pt-BR`. **Resultado esperado: rojo.** (`src/app/landing/site-header/site-header.spec.ts`)
- [x] T006 Añadir `nav.contactLabel` a `Translations` en los tres idiomas e implementar la cabecera: logo dentro de `.wordmark` (28 px, `gap` 12 px) y botón con `href` de `LINKEDIN`. **Resultado esperado: verde.** (`src/app/i18n/translations.ts`, `src/app/landing/site-header/site-header.{html,ts,css}`)

## Fase 4: Quitar la sección de contacto (TDD)

- [x] T007 Tests de `Landing`: en `main` están `app-about-me`, `app-stack` y `app-photos`, y no existen `app-contact-form`, `#contact` ni `form`. **Resultado esperado: rojo.** (`src/app/landing/landing.spec.ts`)
- [x] T008 Quitar `ContactForm` de `Landing`, borrar `src/app/contact/`, el diccionario `contact` de `translations.ts` y el token `--color-error`. **Resultado esperado: verde.** (`src/app/landing/landing.{html,ts}`, `src/app/contact/`, `src/app/i18n/translations.ts`, `src/styles.css`)

## Fase 5: Documentación

- [x] T009 [P] Actualizar `DESIGN.md`: Logo Lockup con el monograma RH y su archivo, Navigation Bar con logo y botón a LinkedIn, ejemplo de cabecera del Agent Prompt Guide; borrar Contact Form, Coral Alert y `--color-error` del Quick Start. (`docs/design/DESIGN.md`)
- [x] T010 [P] Marcar la HU-3 de la 002 como retirada por la 004. (`specs/002-landing-personal/spec.md`)

## Fase 6: Verificación

- [x] T011 Ejecutar `npm test` y `npm run build`: los dos en verde y sin avisos de presupuesto. Formatear con Prettier los archivos tocados.
- [x] T012 Verificación manual en Chrome headless sobre el build:
  1. Cabecera a 1280 px y a 360 px: logo, nombre e idioma en la primera fila, sin desbordamiento horizontal.
  2. `index.html` servido declara el icono SVG y el ICO, y los dos archivos responden.
  3. Abrir `/#contact`: la página queda arriba y no hay errores en la consola.
  4. La constelación sigue explotando con el scroll hasta el final de la página.

  **Resultado (2026-11-23):** 2, 3 y 4 bien. El 1 está bien a 1280 px y **falla a 360 px**: el nombre se parte en dos líneas y el selector llega al borde de la pantalla (en inglés sobresale 3 px).

- [x] T013 Repasar uno a uno los criterios de aceptación de `spec.md`.

  **Resultado (2026-11-23):** se cumplen todos menos dos de la HU-1, que no se corrigen aquí porque la 005 rehace esa parte de la cabecera:
  - **Criterio 2 (el logo vuelve al principio):** al pulsarlo cambia la URL, pero la página no se mueve. Ya pasaba antes de la 004. Lo corrige la 005 (HU-2, criterio 2).
  - **Criterio 4 (una fila a 360 px):** lo descrito en T012. Lo sustituye la 005 (HU-2, criterio 4), que quita el nombre y reduce el selector.

  Sin comprobar a la vista: el icono en la pestaña y en favoritos de cada navegador (HU-2). Chrome headless no los muestra; se comprobó que el SVG y el ICO (16, 32 y 48 px) se declaran y se sirven bien.

## Dependencias

- T003 y T004 dependen de T002 (necesitan `public/logo-rh.svg`).
- T006 depende de T005 y de T002. T008 depende de T007.
- T009 depende de T002 (enlaza la ruta final del logo).
- T011–T013 dependen de todas las anteriores.
