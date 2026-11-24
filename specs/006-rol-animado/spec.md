# Spec: 006-rol-animado

**Estado:** Aprobada <!-- Borrador | En revisión | Aprobada -->
**Fecha:** 2026-11-24

## Resumen

El rol que aparece en la portada, debajo del nombre, pasa a decir "full stack" en los tres idiomas y cobra movimiento: un cursor lo escribe letra a letra como si lo tecleara una persona, lo deja tres segundos, lo borra letra a letra y vuelve a empezar. Da vida a la portada y hace que el visitante se fije en a qué se dedica Rodrigo.

## Usuarios

- **Visitante:** cualquier persona que entra en la web, sin registrarse, desde ordenador o móvil.

## Historias de usuario

### HU-1: Leer el nuevo rol en la portada

**Como** visitante **quiero** leer en la portada que Rodrigo es full stack **para** saber qué tipo de desarrollador es.

**Criterios de aceptación:**

- **Dado** que un visitante está en la portada, **cuando** lee el rol completo, **entonces** pone "Full-stack developer" (inglés), "Desarrollador full stack" (español) o "Programador full stack" (portugués), con el mismo aspecto que ahora (menta, en mayúsculas).
- **Dado** que un visitante llega a "About Me", **cuando** lee la etiqueta del rol y la biografía, **entonces** dicen lo mismo que antes de esta feature y no se mueven.

### HU-2: Ver cómo se escribe el rol

**Como** visitante **quiero** ver el rol escribirse como si lo tecleara una persona **para** que la portada se sienta viva.

**Criterios de aceptación:**

Ciclo:

- **Dado** que un visitante entra en la web, **cuando** aparece la portada, **entonces** ve un cursor y el rol se va escribiendo letra a letra delante de él.
- **Dado** que el rol se está escribiendo, **cuando** el visitante se fija en el ritmo, **entonces** no es uniforme: unas letras tardan más que otras, como al teclear a mano.
- **Dado** que el rol se ha terminado de escribir, **cuando** pasan 3 segundos, **entonces** se empieza a borrar letra a letra, desde la última hasta la primera.
- **Dado** que el rol se ha borrado entero, **cuando** pasa un instante (menos de 1 segundo), **entonces** se vuelve a escribir, y así sin parar.

Cursor:

- **Dado** que el rol se está escribiendo o borrando, **cuando** el visitante mira el cursor, **entonces** está siempre justo detrás de la última letra, sin parpadear.
- **Dado** que el rol está quieto (completo o vacío), **cuando** el visitante mira el cursor, **entonces** parpadea.

Resto de la página:

- **Dado** que el rol se escribe y se borra, **cuando** el visitante mira el resto de la página, **entonces** nada cambia de sitio.
- **Dado** que el visitante usa un móvil de 360 px de ancho, en cualquiera de los tres idiomas, **cuando** el rol está completo, **entonces** cabe con su cursor en una sola línea, sin desbordamiento.

Idioma:

- **Dado** que el rol está en cualquier punto del ciclo, **cuando** el visitante cambia de idioma, **entonces** el texto anterior desaparece y el nuevo se empieza a escribir desde la primera letra.

Accesibilidad:

- **Dado** que un lector de pantalla llega al rol, **cuando** lo lee, **entonces** dice siempre la frase completa en el idioma activo, sin cursor, y no anuncia nada mientras se escribe o se borra.
- **Dado** que el visitante tiene activada la preferencia de "reducir movimiento" en su sistema, **cuando** mira el rol, **entonces** ve la frase completa y quieta, sin cursor.
- **Dado** que el rol se está animando, **cuando** el visitante activa esa preferencia con la web abierta, **entonces** el rol pasa a verse completo y quieto sin recargar; si la desactiva, se vuelve a animar.

## Cambios sobre features anteriores

- **[002-landing-personal](../002-landing-personal/spec.md):** cambia el texto del rol de la portada (HU-1, criterio 1). El rol de "About Me" (HU-1, criterio 2) sigue siendo "Developer", "Desarrollador" o "Desenvolvedor".

## Fuera de alcance

- Cambiar el rol o la biografía de "About Me".
- Alternar entre varias frases: siempre se escribe la misma.
- Simular erratas y correcciones al teclear.
- Sonido de teclado.
- Un botón para pausar la animación: quien no quiera movimiento usa la preferencia de su sistema.

## Clarificaciones

### Sesión 2026-11-24

- **P:** ¿Dónde se anima el rol? → **R:** Solo en la portada, debajo del nombre en grande.
- **P:** ¿Cambia también el texto en "About Me"? → **R:** No. Solo cambia el rol de la portada; la biografía y la etiqueta de "About Me" se quedan igual.
- **P:** ¿Qué dice en cada idioma? → **R:** Lo indicado por Rodrigo: "Developer fullstack", "Desarrollador fullstack" y "Programador fullstack".
- **P:** ¿"Fullstack" se escribe junto o separado? → **R:** Separado ("full stack") en español y portugués, y con guion delante del nombre en inglés: "Full-stack developer". En portugués se mantiene "Programador". Sustituye a la respuesta anterior sobre los textos.
- **Suposición:** los 3 segundos cuentan desde que se escribe la última letra.
- **Suposición:** borrar es algo más rápido que escribir, como al mantener pulsada la tecla de borrar.
- **Suposición:** con "reducir movimiento" se ve la frase fija, igual que en la constelación (003) y el menú (005).
