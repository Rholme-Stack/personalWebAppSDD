# Spec: 004-cabecera

**Estado:** Aprobada <!-- Borrador | En revisión | Aprobada -->
**Fecha:** 2026-11-22

## Resumen

La web estrena marca propia: el monograma **RH**, en el que la R y la H comparten el trazo central, con un degradado de violeta a verde y una esquina menta que se desprende de la H, igual que el busto de la constelación se rompe en partículas. El logo aparece en la cabecera junto al nombre y como icono de la pestaña del navegador, para que la web se reconozca de un vistazo.

Además, se quita la sección de contacto: su formulario todavía no enviaba mensajes y solo remitía a LinkedIn. El botón "Contact" de la cabecera pasa a abrir directamente el perfil de LinkedIn de Rodrigo.

## Usuarios

- **Visitante:** cualquier persona que entra en la web, sin registrarse.

## Historias de usuario

### HU-1: Reconocer la web por su logo

**Como** visitante **quiero** ver el logo de Rodrigo en la cabecera **para** identificar la web como su marca personal.

> **Verificación del 2026-11-23:** los criterios 2 y 4 no se cumplen; los resuelve la [005-menu](../005-menu/spec.md) (HU-2). El detalle está en [tasks.md](./tasks.md) (T013).
>
> **Cambiado el 2026-11-23 por la 005 (HU-2):** el nombre ya no se ve junto al logo (criterios 1, 3 y 4); el lector de pantalla sigue diciendo "Rodrigo Holme".

**Criterios de aceptación:**

- **Dado** que un visitante entra en la web, **cuando** mira la cabecera, **entonces** ve el logo RH a la izquierda del nombre "Rodrigo Holme".
- **Dado** que el visitante está en cualquier punto de la página, **cuando** pulsa el logo o el nombre, **entonces** vuelve al principio de la página, igual que ahora al pulsar el nombre.
- **Dado** que un lector de pantalla recorre la cabecera, **cuando** llega al logo y al nombre, **entonces** los anuncia una sola vez como "Rodrigo Holme", sin repetir el nombre.
- **Dado** que el visitante usa un móvil de 360 px de ancho, **cuando** mira la cabecera, **entonces** el logo, el nombre y el selector de idioma caben en la primera fila sin salto de línea ni desbordamiento.

### HU-2: Reconocer la pestaña del navegador

**Como** visitante **quiero** ver el logo en la pestaña del navegador **para** encontrar la web rápidamente entre otras pestañas y en mis favoritos.

**Criterios de aceptación:**

- **Dado** que un visitante tiene la web abierta, **cuando** mira la pestaña del navegador, **entonces** ve el logo RH como icono, en lugar del icono actual, y el título sigue siendo "Rodrigo Holme".
- **Dado** que el visitante usa Chrome, Firefox, Edge o Safari en su versión actual, **cuando** abre la web, **entonces** ve el logo RH como icono de la pestaña.
- **Dado** que el visitante guarda la web en favoritos, **cuando** mira la lista de favoritos, **entonces** la web aparece con el logo RH.

### HU-3: Contactar con Rodrigo por LinkedIn

**Como** visitante **quiero** un acceso directo para contactar con Rodrigo **para** escribirle sin pasar por un formulario que todavía no envía mensajes.

> **Cambiado el 2026-11-23 por la [005-menu](../005-menu/spec.md) (HU-4):** el botón lleva además el logo de LinkedIn a la derecha del texto (criterio 3).

**Criterios de aceptación:**

- **Dado** que un visitante recorre la página, **cuando** llega al final, **entonces** ya no hay sección de contacto ni formulario: las secciones son "About Me", "Stack" y "Photos", en ese orden.
- **Dado** que el visitante está en cualquier punto de la página, **cuando** pulsa el botón de contacto de la cabecera, **entonces** se abre el perfil de LinkedIn de Rodrigo (https://www.linkedin.com/in/rodrigo-holme) en una pestaña nueva y la web sigue abierta en la suya.
- **Dado** que el visitante cambia de idioma, **cuando** mira el botón de contacto, **entonces** sigue diciendo "Contact" (inglés), "Contacto" (español) o "Contato" (portugués), con el mismo aspecto que ahora.
- **Dado** que un lector de pantalla llega al botón de contacto, **cuando** lo anuncia, **entonces** dice en el idioma activo que abre LinkedIn en una pestaña nueva (por ejemplo, "Contact Rodrigo Holme on LinkedIn (opens in a new tab)").
- **Dado** que alguien entra con un enlace antiguo que apuntaba a la sección de contacto, **cuando** se abre la web, **entonces** ve la página normal desde el principio, sin errores.

## Fuera de alcance

- Animar el logo (por ejemplo, que la esquina menta se mueva con el scroll).
- Imagen para compartir en redes (vista previa de enlaces) e icono para "añadir a la pantalla de inicio" del móvil.
- Las variantes del logo "Facetas" y "Constelación", que se descartaron.
- Un formulario de contacto que envíe mensajes de verdad: si se retoma, será otra feature.
- Cambiar el nombre, la tipografía, el menú o el selector de idioma de la cabecera, y los iconos de redes de "About Me".

## Clarificaciones

### Sesión 2026-11-22

- **P:** ¿Qué logo se usa? → **R:** La variante "Sólido + fragmento" (opción 2 de cuatro): monograma RH con degradado violeta → verde y la esquina de la H en menta. El archivo es `public/logo-rh.svg` (al principio estaba en `docs/design/`; se movió durante la implementación para tener una sola copia).
- **P:** ¿Dónde aparece el logo? → **R:** En la cabecera, a la izquierda del nombre "Rodrigo Holme", y como icono de la pestaña del navegador.
- **P:** ¿Se documenta como cambio de la 002 o como feature nueva? → **R:** Feature nueva; la 002 queda cerrada tal cual.
- **P:** ¿Se quita la sección de contacto y dónde se documenta? → **R:** Sí, entera (formulario y aviso). Va en esta misma feature como HU-3, y la feature pasa de llamarse `004-logo` a `004-cabecera` porque los dos cambios afectan a la cabecera. Sustituye a la HU-3 de la 002.
- **P:** ¿Qué hace el botón "Contact" sin sección de contacto? → **R:** Abre el perfil de LinkedIn en una pestaña nueva, con el mismo texto y aspecto.
- **Suposición:** el botón se anuncia a los lectores de pantalla como los iconos de redes de la 002, diciendo que es LinkedIn y que se abre en una pestaña nueva, para que no sorprenda que se abra otra pestaña.
