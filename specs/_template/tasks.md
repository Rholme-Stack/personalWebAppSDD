# Tareas: NNN-nombre-feature

**Plan:** [plan.md](./plan.md) · **Spec:** [spec.md](./spec.md)
**Estado:** Borrador <!-- Borrador | Aprobada | Completada (AAAA-MM-DD) -->

> Formato: `- [ ] T### [P] descripción (archivos)`.
> `[P]` = se puede hacer en paralelo con otras `[P]` de la misma fase (tocan archivos distintos).
> Ciclo TDD: la tarea de test deja los tests en **rojo** a propósito; la siguiente los pone en **verde**.
> Fuera de ese ciclo, `npm test` y `npm run build` deben quedar en verde al terminar cada tarea.
> Marca `[x]` al terminar cada tarea.

## Fase 1: Punto de partida

- [ ] T001 Ejecutar `npm test` y `npm run build` antes de tocar nada y confirmar que pasan.

## Fase 2: Core (TDD)

- [ ] T002 Escribir los tests de … **Resultado esperado: rojo.** (`src/app/<feature>/....spec.ts`)
- [ ] T003 Implementar … **Resultado esperado: verde.** (`src/app/<feature>/....ts`)

## Fase 3: Integración

- [ ] T004 <!-- Rutas, guards, conexión con otras features -->

## Fase 4: Pulido

- [ ] T005 [P] <!-- Accesibilidad, estados de carga y error, estilos responsive -->

## Fase 5: Verificación

- [ ] T006 Ejecutar `npm test` y `npm run build`: los dos en verde.
- [ ] T007 Verificación manual de lo que los tests no cubren (navegador, vista móvil a 360 px).
- [ ] T008 Repasar uno a uno los criterios de aceptación de `spec.md`.

## Dependencias

<!-- Ejemplo: "T003 depende de T002". -->
