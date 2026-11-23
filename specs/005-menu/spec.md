# Spec: 005-menu

**Estado:** Aprobada <!-- Borrador | En revisión | Aprobada -->
**Fecha:** 2026-11-23

## Resumen

La cabecera se simplifica: se queda con el logo, un selector de idioma compacto, el botón de contacto con el logo de LinkedIn y un icono de menú. Los enlaces a las secciones ("About Me" y "Stack", más "Photos") pasan a un menú que ocupa toda la pantalla y deja ver la página, con la constelación, por detrás. Así la cabecera ocupa menos, cabe en una sola fila en el móvil y deja protagonismo al contenido.

## Usuarios

- **Visitante:** cualquier persona que entra en la web, sin registrarse, desde ordenador o móvil.

## Historias de usuario

### HU-1: Navegar desde un menú a pantalla completa

**Como** visitante **quiero** abrir un menú con las secciones de la web **para** ir directamente a la que me interesa sin que los enlaces ocupen sitio en la cabecera.

**Criterios de aceptación:**

Abrir:

- **Dado** que un visitante está en la web, en ordenador o en móvil, **cuando** mira la cabecera, **entonces** ve un icono de menú en el extremo derecho y ya no ve los enlaces "About Me" y "Stack".
- **Dado** que el menú está cerrado, **cuando** el visitante pulsa el icono, **entonces** se abre un menú que ocupa el 100 % del ancho y del alto de la pantalla, con las opciones "About Me", "Stack" y "Photos", en ese orden y en el idioma activo.
- **Dado** que el menú está abierto, **cuando** el visitante mira detrás de las opciones, **entonces** ve la página oscurecida por un fondo negro translúcido, sin desenfoque, y la constelación se sigue moviendo.
- **Dado** que el menú está abierto, en cualquier punto de la página, **cuando** el visitante lee las opciones, **entonces** se leen sin dificultad, haya lo que haya detrás.
- **Dado** que el menú está abierto, **cuando** el visitante mira la cabecera, **entonces** sigue visible y se puede usar, y el icono de menú es ahora una X en el mismo sitio.
- **Dado** que el menú está abierto, **cuando** el visitante intenta hacer scroll, **entonces** la página de detrás no se mueve.

Elegir:

- **Dado** que el menú está abierto, **cuando** el visitante elige una opción, **entonces** el menú se cierra y la página se desplaza hasta esa sección, con su título entero visible por debajo de la cabecera.
- **Dado** que el menú está abierto, **cuando** el visitante cambia de idioma en la cabecera, **entonces** el menú sigue abierto y sus opciones se muestran en el idioma elegido.

Cerrar:

- **Dado** que el menú está abierto, **cuando** el visitante pulsa la X o la tecla Escape, **entonces** el menú se cierra y la página sigue en el mismo punto en que estaba.
- **Dado** que el menú está abierto, **cuando** el visitante pulsa el logo, **entonces** el menú se cierra y vuelve al principio de la página.

Accesibilidad:

- **Dado** que un lector de pantalla llega al icono de menú, **cuando** lo anuncia, **entonces** dice en el idioma activo qué es y si el menú está abierto o cerrado.
- **Dado** que el menú está abierto, **cuando** el visitante usa solo el teclado, **entonces** puede llegar a las opciones y a los elementos de la cabecera, pero no a la página de detrás.
- **Dado** que el menú está cerrado, **cuando** el visitante recorre la página con el teclado o con un lector de pantalla, **entonces** no encuentra las opciones del menú.
- **Dado** que el visitante ha abierto el menú con el teclado, **cuando** lo cierra con la X o con Escape, **entonces** el foco queda en el icono de menú.
- **Dado** que el visitante tiene activada la preferencia de "reducir movimiento" en su sistema, **cuando** abre o cierra el menú, **entonces** aparece y desaparece sin animación.

### HU-2: Ver una cabecera más limpia

**Como** visitante **quiero** una cabecera con lo imprescindible **para** fijarme en el contenido.

**Criterios de aceptación:**

- **Dado** que un visitante está en la web, **cuando** mira la cabecera, **entonces** ve, de izquierda a derecha, el logo RH, el selector de idioma, el botón de contacto y el icono de menú; el nombre "Rodrigo Holme" ya no aparece junto al logo.
- **Dado** que el visitante está en cualquier punto de la página, **cuando** pulsa el logo, **entonces** vuelve al principio de la página.
- **Dado** que un lector de pantalla llega al logo, **cuando** lo anuncia, **entonces** dice "Rodrigo Holme", aunque el nombre ya no se vea.
- **Dado** que el visitante usa un móvil de 360 px de ancho, en cualquiera de los tres idiomas, **cuando** mira la cabecera, **entonces** los cuatro elementos caben en una sola fila, sin desbordamiento.

### HU-3: Cambiar de idioma con un selector compacto

**Como** visitante **quiero** un selector de idioma que ocupe poco **para** que no compita con el resto de la cabecera.

**Criterios de aceptación:**

- **Dado** que el selector está cerrado, **cuando** el visitante lo mira, **entonces** ve solo el código del idioma activo: "EN" (inglés), "ES" (español) o "PT" (portugués de Brasil).
- **Dado** que el visitante cambia de idioma, **cuando** mira el selector cerrado, **entonces** tiene el mismo ancho que antes de cambiar.
- **Dado** que el visitante abre el selector, **cuando** mira las opciones, **entonces** lee los nombres completos: "English", "Español" y "Português (Brasil)".
- **Dado** que el visitante elige un idioma, **cuando** lo selecciona, **entonces** la web cambia de idioma y lo recuerda, igual que ahora.
- **Dado** que un lector de pantalla llega al selector, **cuando** lo anuncia, **entonces** dice que es el selector de idioma y el nombre completo del idioma activo, no solo el código.

### HU-4: Reconocer que el contacto es por LinkedIn

**Como** visitante **quiero** ver el logo de LinkedIn en el botón de contacto **para** saber adónde me lleva antes de pulsarlo.

**Criterios de aceptación:**

- **Dado** que un visitante mira el botón de contacto, **cuando** lo lee, **entonces** ve el texto "Contact", "Contacto" o "Contato", según el idioma, y a su derecha, dentro del botón, el logo de LinkedIn.
- **Dado** que el visitante mira el logo de LinkedIn, **cuando** está sobre el fondo violeta del botón, **entonces** se distingue igual de bien que el texto.
- **Dado** que el visitante pulsa el texto o el logo, **cuando** lo hace, **entonces** se abre el perfil de LinkedIn de Rodrigo en una pestaña nueva, igual que ahora.
- **Dado** que un lector de pantalla llega al botón, **cuando** lo anuncia, **entonces** dice lo mismo que ahora, sin añadir nada por el logo.

## Cambios sobre features anteriores

- **[002-landing-personal](../002-landing-personal/spec.md):** "About Me" y "Stack" dejan de estar en la cabecera y pasan al menú (criterios generales); el selector de idioma se ve distinto, pero funciona igual (HU-4).
- **[004-cabecera](../004-cabecera/spec.md):** el logo ya no va acompañado del nombre (HU-1, criterios 1, 3 y 4) y el botón de contacto cambia de aspecto (HU-3, criterio 3). El icono de la pestaña (HU-2) y el enlace a LinkedIn no cambian.

## Fuera de alcance

- El contenido de la sección "Photos", que sigue mostrando "Coming soon".
- Mostrar imágenes dentro del menú.
- Marcar en el menú la sección en la que está el visitante.
- Incluir en el menú el selector de idioma, el contacto o las redes: siguen en su sitio.
- Añadir idiomas o cambiar cómo se elige el idioma inicial.
- Cambiar el logo, la constelación o los iconos de redes de "About Me".

## Clarificaciones

### Sesión 2026-11-23

- **P:** ¿Qué se ve en el selector de idioma cerrado? → **R:** Solo el código (EN, ES, PT). Al abrirlo se leen los nombres completos.
- **P:** ¿Dónde va el icono de menú? → **R:** En el extremo derecho de la cabecera, tanto en ordenador como en móvil, y se convierte en una X al abrir el menú.
- **P:** ¿Qué se ve detrás del menú? → **R:** La página y la constelación, oscurecidas con un negro translúcido y sin desenfoque.
- **P:** Al planificar se vio que hoy el logo no vuelve arriba y que la cabecera tapa el título de las secciones. ¿Se corrige aquí? → **R:** Sí. HU-1 y HU-2 lo dicen ahora de forma explícita.
- **Suposición:** "poner fotos" significa añadir al menú un enlace a la sección "Photos", no mostrar imágenes dentro del menú.
- **Suposición:** el logo de LinkedIn va dentro del botón de contacto, a la derecha del texto, y el texto se mantiene.
- **Suposición:** con el menú abierto, la cabecera sigue visible y usable por encima.
- **Suposición:** el menú se cierra al elegir una opción, con la X, con Escape o al pulsar el logo.
