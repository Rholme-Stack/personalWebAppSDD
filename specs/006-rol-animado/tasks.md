# Tareas: 006-rol-animado

**Plan:** [plan.md](./plan.md) · **Spec:** [spec.md](./spec.md)
**Estado:** Completada (2026-11-24) <!-- Borrador | Aprobada | Completada (AAAA-MM-DD) -->

> Formato: `- [ ] T### [P] descripción (archivos)`.
> `[P]` = se puede hacer en paralelo con otras `[P]` de la misma fase (tocan archivos distintos).
> Ciclo TDD: la tarea de test deja los tests en **rojo** a propósito; la siguiente los pone en **verde**.
> Fuera de ese ciclo, `npm test` y `npm run build` deben quedar en verde al terminar cada tarea.
> Marca `[x]` al terminar cada tarea.

## Fase 1: Punto de partida

- [x] T001 Ejecutar `npm test` y `npm run build` antes de tocar nada y confirmar que pasan. **Resultado (2026-11-24):** 110 tests y build en verde.

## Fase 2: Reglas del ciclo (TDD)

- [x] T002 Tests de `nextStep` y `stepDelay`: ciclo completo, 3000 ms con la frase completa, menos de 1 s vacía, ritmo irregular dentro de sus límites y borrar más rápido que escribir. **Resultado esperado: rojo.** (`src/app/landing/typed-role/typing.spec.ts`)
- [x] T003 Implementar las reglas. **Resultado esperado: verde.** (`src/app/landing/typed-role/typing.ts`)

## Fase 3: Componente (TDD)

- [x] T004 Tests de `TypedRole` con reloj simulado. **Resultado esperado: rojo.** (`src/app/landing/typed-role/typed-role.spec.ts`)
  1. Empieza vacío, con cursor, y escribe letra a letra.
  2. Se queda completo 3 s, se borra letra a letra y vuelve a escribirse.
  3. El cursor va detrás de la última letra y parpadea solo cuando el rol está quieto.
  4. La frase completa está siempre para lectores de pantalla y la parte animada está oculta para ellos.
  5. Al cambiar la frase empieza de nuevo.
  6. Con "reducir movimiento": frase completa, sin cursor; reacciona si cambia la preferencia.
  7. Al destruirse no queda ningún temporizador.
- [x] T005 Implementar `TypedRole`. **Resultado esperado: verde.** (`src/app/landing/typed-role/typed-role.{ts,html,css}`)

## Fase 4: Portada (TDD)

- [x] T006 Tests de `Landing`: el rol de la portada dice "Developer fullstack", "Desarrollador fullstack" o "Programador fullstack", y cambia con el idioma. `about-me.spec.ts` no se toca. **Resultado esperado: rojo.** (`src/app/landing/landing.spec.ts`)
- [x] T007 Añadir `heroRole` y usar `app-typed-role` en la portada. **Resultado esperado: verde.** (`src/app/i18n/translations.ts`, `src/app/landing/landing.{html,ts}`)

## Fase 5: Documentación

- [x] T008 [P] Añadir "Hero Role" a `DESIGN.md`. (`docs/design/DESIGN.md`)
- [x] T009 [P] Nota en la HU-1 de la 002. (`specs/002-landing-personal/spec.md`)

## Fase 6: Verificación

- [x] T010 Ejecutar `npm test` y `npm run build`: los dos en verde y sin avisos. Formatear con Prettier los archivos de código tocados. **Resultado:** 131 tests y build en verde, sin avisos.
- [x] T011 Verificación en Chrome headless sobre el build, a 1280 y 360 px y en los tres idiomas:
  1. El rol completo cabe con su cursor en una sola línea, sin desbordamiento.
  2. Ni el `h1` ni el rol cambian de posición o de alto durante un ciclo entero.
  3. El cursor está pegado a la última letra, también tras el espacio.
  4. Tiempos reales: ritmo irregular, 3 s completo, menos de 1 s vacío.
  5. Cambiar de idioma a mitad empieza de nuevo.
  6. Con `prefers-reduced-motion`, fijo y sin cursor, también al cambiarla con la web abierta.
  7. El árbol de accesibilidad da la frase completa, sin cursor.

  **Resultado (2026-11-24):** los siete puntos bien. Durante 13 s por caso, el `h1`, el rol y "About Me" no se movieron. A 360 px, la frase más larga ("Desarrollador fullstack") acaba en 238 px. Completo: 3,0 s; vacío: 0,7 s; letras: casi todas de 70 a 240 ms. Al cargar, alguna letra tarda más (hasta 1 s con WebGL por software) porque coincide con el arranque de la constelación.

- [x] T012 Repasar uno a uno los criterios de aceptación de `spec.md`.

  **Resultado (2026-11-24):** se cumplen todos los que se pueden comprobar aquí. **Pendiente de probar:** un lector de pantalla real y un móvil real.

## Fase 7: Corrección de los textos

> Añadida el 2026-11-24, tras rectificar la spec: "full stack" separado, y "Full-stack developer" en inglés. Sustituye a los textos de T006.

- [x] T013 Tests de `Landing` con los textos nuevos. **Resultado esperado: rojo.** (`src/app/landing/landing.spec.ts`)
- [x] T014 Cambiar `heroRole` en los tres idiomas. **Resultado esperado: verde.** (`src/app/i18n/translations.ts`)
- [x] T015 [P] Actualizar los textos en `DESIGN.md` y en la nota de la 002. (`docs/design/DESIGN.md`, `specs/002-landing-personal/spec.md`)
- [x] T016 Ejecutar `npm test` y `npm run build`, y repetir T011 (una línea a 360 px, cursor, ciclo completo). **Resultado (2026-11-24):** tests y build en verde; todo bien en los tres idiomas. A 360 px, la frase más larga ("Desarrollador full stack") acaba en 241 px.

## Dependencias

- T003 depende de T002, T005 de T003 y T004, T007 de T005 y T006.
- T008 y T009 dependen de T007. T010–T012 dependen de todas las anteriores, en ese orden.
- T014 depende de T013, y T016 de T013–T015.
