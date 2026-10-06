# Spec: 001-under-construction

**Estado:** Aprobada
**Fecha:** 2026-10-06

## Resumen

Página temporal que se muestra a cualquier persona que visite la web mientras el sitio se construye. Su único objetivo es comunicar con claridad que la web de Rodrigo Holme está en construcción, en lugar de mostrar una página vacía o por defecto.

## Usuarios

- **Visitante:** cualquier persona que entra en la web, sin necesidad de registrarse. Puede hablar inglés o español.

## Historias de usuario

### HU-1: Ver que la web está en construcción

**Como** visitante **quiero** ver un aviso claro de que la web está en construcción **para** saber que el sitio existe pero todavía no está terminado.

**Criterios de aceptación:**

- **Dado** que un visitante entra en la web, **cuando** la página termina de cargar, **entonces** ve como título el nombre "Rodrigo Holme Web".
- **Dado** que un visitante entra en la web, **cuando** la página termina de cargar, **entonces** ve debajo del título el aviso en inglés "Page under construction" y, debajo de este, en español "Página en construcción".
- **Dado** que un visitante está en la página, **cuando** la mira, **entonces** el fondo es negro, el texto es blanco y todo el contenido aparece centrado horizontal y verticalmente en la pantalla.
- **Dado** que un visitante abre la web en un móvil (desde 360 px de ancho), **cuando** la página carga, **entonces** el texto se ve completo, sin desbordarse ni obligar a hacer scroll horizontal.
- **Dado** que un visitante tiene la web abierta, **cuando** mira la pestaña del navegador, **entonces** ve el título "Rodrigo Holme Web".
- **Dado** que un visitante entra por cualquier dirección de la web, **cuando** la página carga, **entonces** ve esta misma página.

## Fuera de alcance

- Menú de navegación, enlaces o pie de página.
- Formulario de contacto o suscripción.
- Cuenta atrás, fecha de lanzamiento o animaciones.
- Selector de idioma (los dos idiomas se muestran a la vez).
- Cualquier otro contenido de la web.

## Clarificaciones

### Sesión 2026-10-06

- **P:** ¿En qué idioma está la página? → **R:** En ambos: el aviso se muestra en inglés y en español a la vez.
- **P:** ¿Qué aspecto tiene el texto? → **R:** Blanco, grande y centrado horizontal y verticalmente.
- **P:** ¿Se muestra algo más aparte del aviso? → **R:** Sí, el nombre "Rodrigo Holme Web" como título, encima del aviso.
- **P:** ¿Qué título se ve en la pestaña del navegador? → **R:** El nombre del sitio, "Rodrigo Holme Web".
- **P:** ¿En qué orden van los idiomas? → **R:** Sin respuesta explícita; se asume inglés primero y español debajo. Confirmar al aprobar.
