# 0002 - i18n con servicio propio y signals

**Estado:** Aceptado
**Fecha:** 2026-10-31

## Contexto

La feature 002 necesita la web en inglés, español de España y portugués de Brasil. Los requisitos son:

- Un selector visible para elegir idioma.
- Al entrar, usar el idioma del navegador o, si no es uno de los tres, inglés.
- Recordar la elección del visitante.

Son unos 40 textos en una sola página, y la constitución pide no añadir dependencias sin justificarlo (Artículo IV).

## Decisión

Usar un **`LanguageService` propio** con un signal del idioma activo y **diccionarios TypeScript tipados**, uno por idioma, que implementan una misma interfaz. Los componentes leen los textos con `t()`, un `computed` del servicio.

## Alternativas consideradas

- **`@angular/localize` (i18n oficial):**
  - Ventajas: genera un build por idioma con URL propia y da el mejor SEO.
  - Se descarta porque cambiar de idioma recarga la página, detectar el idioma del navegador y recordarlo requiere lógica de redirección propia, y el hosting tiene que servir una carpeta por idioma. Es demasiado para el tamaño actual de la web.
- **Transloco:**
  - Ventajas: cambio de idioma en caliente, archivos JSON y es una librería madura.
  - Se descarta porque añade una dependencia externa para muy pocos textos, y las claves en JSON no las comprueba el compilador.

## Consecuencias

- **Positivas:**
  - Ninguna dependencia nueva.
  - El cambio de idioma es instantáneo.
  - El compilador detecta si falta una traducción en algún idioma.
  - El servicio es fácil de testear.
- **Negativas / costes:**
  - Google solo indexa el HTML inicial, que está en inglés.
  - No hay pluralización ni formato de fechas automático; habría que añadirlo si hiciera falta.
  - Si la web crece mucho o el SEO multilingüe se vuelve importante, habrá que migrar a `@angular/localize` con un ADR nuevo.
