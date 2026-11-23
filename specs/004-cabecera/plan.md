# Plan técnico: 004-cabecera

**Spec:** [spec.md](./spec.md)
**Estado:** Aprobado <!-- Borrador | Aprobado -->
**Fecha:** 2026-11-22

## Resumen técnico

El logo vive en un único archivo, `public/logo-rh.svg`, que se usa en dos sitios: como `<img>` decorativo dentro del enlace "Rodrigo Holme" de la cabecera y como icono vectorial de la pestaña. Para los navegadores que no aceptan iconos SVG se regenera `public/favicon.ico` a partir del mismo logo. La sección de contacto se borra entera (componente, textos y color de error) y el botón de la cabecera pasa a ser un enlace a LinkedIn que se abre en una pestaña nueva.

## Contexto técnico

- **Framework:** Angular 22 (standalone)
- **Lenguaje:** TypeScript 6
- **Tests:** Vitest
- **Dependencias nuevas:** ninguna. El `favicon.ico` se genera una sola vez en local con Chrome headless y Pillow (`uv run --with pillow`), igual que en el ADR 0004; ni el script ni Pillow entran en el proyecto.
- **Backend / APIs:** no aplica.

### Estado actual del código

- `site-header.html`: el nombre es un enlace `.wordmark` a `/` sin logo. El botón `.button-primary.contact` usa `routerLink="/" fragment="contact"`.
- `site-header.spec.ts`: comprueba que los enlaces con fragmento son `/#about`, `/#stack` y `/#contact`.
- `landing.html` / `landing.ts`: incluyen `<app-contact-form />` al final de `<main>`. `landing.spec.ts` espera `app-contact-form`.
- `src/app/contact/contact-form/`: formulario reactivo con validación y aviso con enlace a LinkedIn. Es el único que usa `@angular/forms`, el diccionario `contact` de `translations.ts` y el token `--color-error`.
- `profile.ts` ya exporta `LINKEDIN` (lo usaba el aviso del formulario).
- `index.html`: `<link rel="icon" type="image/x-icon" href="favicon.ico">`. El `favicon.ico` actual es el genérico (16, 32 y 48 px).
- `docs/design/logo-rh.svg`: el logo elegido, cuadrado (`viewBox="0 -7 107 107"`), con `role="img"` y `<title>`.

## Check de constitución

- [x] **I. Spec primero:** `spec.md` aprobada el 2026-11-22; `tasks.md` antes del código.
- [x] **II. Calidad y tests:** no hay lógica de negocio nueva (servicios, guards ni utilidades). Los criterios comprobables en el DOM tienen tests en `site-header.spec.ts` y `landing.spec.ts`; el resto se verifica a mano (ver Estrategia de tests). `npm test` y `npm run build` en verde al cerrar cada tarea.
- [x] **III. Arquitectura:** solo se modifican componentes standalone existentes y se borra uno. Sin estado nuevo: el texto del botón sale del `computed` de traducciones que ya existe.
- [x] **IV. Simplicidad:** sin dependencias nuevas. Se borra el código que queda sin uso (formulario, textos `contact`, `--color-error`) en vez de dejarlo "por si acaso"; si se retoma, está en el historial de git. `@angular/forms` queda en `package.json` sin uso (ver Riesgos).
- [x] **V. Seguridad:** el enlace externo lleva `rel="noopener noreferrer"`. Desaparece la única entrada de usuario de la web.
- [x] **VI. Accesibilidad y UX:** el logo es decorativo (`alt=""`) y el enlace conserva el nombre "Rodrigo Holme"; el botón tiene `aria-label` traducido que empieza por el texto visible y avisa de la pestaña nueva. Se comprueba la cabecera a 360 px.

## Arquitectura

```
SiteHeader
├── a.wordmark (routerLink "/")      ← img logo-rh.svg (alt="") + nombre
├── nav: About Me · Stack            ← sin cambios
├── select de idioma                 ← sin cambios
└── a.button-primary.contact         ← href = LINKEDIN.url, target _blank, aria-label = t().nav.contactLabel

Landing <main>: hero · AboutMe · Stack · Photos      (ContactForm eliminado)

index.html: icon SVG (logo-rh.svg) + icon ICO (favicon.ico, alternativa)
```

- **Logo en la cabecera:** `<img src="logo-rh.svg" alt="" width="28" height="28">` dentro de `.wordmark`, que pasa a `inline-flex` con `gap` de 12 px. Se usa `<img>` y no SVG en línea: el navegador lo guarda en caché junto al favicon y los `id` del degradado no pueden chocar con nada de la página. Con `alt=""` el lector de pantalla ignora la imagen y el enlace se anuncia solo como "Rodrigo Holme".
- **Icono de pestaña:** dos `<link rel="icon">`: `favicon.ico` con `sizes="32x32"` y `logo-rh.svg` con `type="image/svg+xml"`. Los navegadores que entienden SVG eligen el vectorial; el resto (y las peticiones automáticas a `/favicon.ico` de los favoritos) usan el ICO.
- **`favicon.ico`:** se renderiza el SVG a 256 px con fondo transparente en Chrome headless y Pillow lo guarda como ICO con tamaños 16, 32 y 48.
- **Botón de contacto:** pasa de `routerLink` a `href` externo con `LINKEDIN.url`. Nueva clave `nav.contactLabel` en los tres idiomas. El nombre accesible empieza por la palabra visible ("Contact", "Contacto", "Contato") para cumplir _label in name_ (WCAG 2.5.3).
- **Enlaces antiguos a `/#contact`:** ya no existe el elemento `#contact`; `anchorScrolling` no encuentra el ancla y no hace nada, así que la página carga desde arriba. No hace falta código.

## Archivos afectados

| Acción    | Archivo                                                 | Cambio                                                                                                      |
| --------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Mover     | `docs/design/logo-rh.svg` → `public/logo-rh.svg`        | Un único archivo para cabecera, pestaña y guía de estilo.                                                   |
| Modificar | `public/favicon.ico`                                    | Regenerado a partir del logo (16, 32 y 48 px).                                                              |
| Modificar | `src/index.html`                                        | Icono SVG + ICO de alternativa.                                                                             |
| Modificar | `src/app/landing/site-header/site-header.{html,ts,css}` | Logo en `.wordmark`; botón de contacto a LinkedIn.                                                          |
| Modificar | `src/app/landing/site-header/site-header.spec.ts`       | Tests del logo, del botón y de los enlaces del menú.                                                        |
| Modificar | `src/app/i18n/translations.ts`                          | Añadir `nav.contactLabel`; borrar el diccionario `contact`.                                                 |
| Modificar | `src/app/landing/landing.{html,ts,spec.ts}`             | Quitar `ContactForm` y comprobar que no queda sección de contacto.                                          |
| Borrar    | `src/app/contact/`                                      | Componente del formulario y sus tests.                                                                      |
| Modificar | `src/styles.css`                                        | Borrar `--color-error`.                                                                                     |
| Modificar | `docs/design/DESIGN.md`                                 | Logo Lockup con el monograma RH, Navigation Bar con el botón a LinkedIn, borrar Contact Form y Coral Alert. |
| Modificar | `specs/002-landing-personal/spec.md`                    | Nota en la HU-3: retirada por la 004.                                                                       |
| Modificar | `specs/004-cabecera/spec.md`                            | Ruta del logo en Clarificaciones (`public/logo-rh.svg`). No cambia el _qué_.                                |

## Mapeo spec → implementación

| Criterio de aceptación                        | Dónde se implementa                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| HU-1: logo a la izquierda del nombre          | `site-header.html` (`img` dentro de `.wordmark`) + `site-header.css`       |
| HU-1: pulsar logo o nombre vuelve arriba      | `site-header.html` (los dos dentro del mismo `routerLink="/"`)             |
| HU-1: se anuncia una vez "Rodrigo Holme"      | `site-header.html` (`alt=""`)                                              |
| HU-1: cabe en la primera fila a 360 px        | `site-header.css` (logo de 28 px; la rejilla móvil no cambia)              |
| HU-2: logo en la pestaña, título igual        | `index.html` + `public/logo-rh.svg`                                        |
| HU-2: Chrome, Firefox, Edge y Safari          | `index.html` (SVG + ICO de alternativa) + `public/favicon.ico`             |
| HU-2: logo en favoritos                       | `public/favicon.ico` + `index.html`                                        |
| HU-3: no hay sección de contacto              | `landing.html` / `landing.ts`; borrado de `src/app/contact/`               |
| HU-3: botón abre LinkedIn en pestaña nueva    | `site-header.html` (`href`, `target`, `rel`) + `profile.ts` (`LINKEDIN`)   |
| HU-3: texto del botón en los tres idiomas     | `translations.ts` (`nav.contact`, sin cambios)                             |
| HU-3: anuncio de LinkedIn y pestaña nueva     | `translations.ts` (`nav.contactLabel`) + `site-header.html` (`aria-label`) |
| HU-3: enlace antiguo a `#contact` sin errores | Sin código: `anchorScrolling` ignora el ancla que no existe                |

## Estrategia de tests

**Automáticos (Vitest):**

- `site-header.spec.ts`:
  - el enlace a `/` contiene una imagen `logo-rh.svg` con `alt=""` y su texto es "Rodrigo Holme";
  - el menú solo tiene los enlaces `/#about` y `/#stack`;
  - el botón de contacto apunta a la URL de LinkedIn, con `target="_blank"` y `rel` que incluye `noopener`;
  - el botón dice "Contact", "Contacto" o "Contato" y su `aria-label` cambia según el idioma.
- `landing.spec.ts`: dentro de `main` están `app-about-me`, `app-stack` y `app-photos`, y no existen `app-contact-form`, `#contact` ni ningún `form`.

**Manuales (Chrome headless sobre el build):**

- Cabecera a 1280 px y a 360 px: logo, nombre e idioma en la primera fila, sin desbordamiento.
- Icono de la pestaña: `index.html` declara SVG e ICO, y los dos archivos se sirven bien.
- Abrir `/#contact`: la página queda arriba y no hay errores en la consola.

## Riesgos y mitigaciones

- **Safari y los iconos SVG:** el soporte varía según la versión. **Mitigación:** el `favicon.ico` de alternativa con el mismo logo.
- **El logo a 16 px:** las piezas finas se empastan. **Mitigación:** ya se probó a 16 px al elegirlo; la esquina menta queda en un píxel y no estorba.
- **Página más corta:** la explosión de la constelación depende de la longitud de la página (progreso = scroll ÷ recorrido total). Sigue funcionando, pero la explosión será algo más rápida al haber menos recorrido. Se revisa en la verificación manual.
- **`@angular/forms` sin uso:** se queda instalado porque no entra en el bundle. Si no se retoma el formulario, se puede quitar con `npm uninstall @angular/forms` en otra tarea.
- **Aviso para futuras features:** si vuelve un formulario de contacto, habrá que recuperar el color de error (`#ff6b6b`) en `styles.css` y en `DESIGN.md`.

## ADRs relacionados

- [0002](../../docs/decisions/0002-i18n-servicio-propio-con-signals.md): las traducciones nuevas siguen el servicio propio con signals.
- [0004](../../docs/decisions/0004-generar-busto-en-local-con-python.md): misma forma de ejecutar Python en local (`uv`), aquí solo para generar el `favicon.ico`.
