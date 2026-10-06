# Tareas: 001-under-construction

**Plan:** [plan.md](./plan.md) · **Spec:** [spec.md](./spec.md)
**Estado:** Completada (2026-10-06)

> Formato: `- [ ] T### [P] descripción (archivos)`.
> `[P]` = se puede hacer en paralelo con las otras `[P]` de la misma fase (tocan archivos distintos).
> Ciclo TDD: la tarea de test deja los tests en **rojo** a propósito; la siguiente los pone en **verde**. Fuera de ese ciclo, `npm test` y `npm run build` deben quedar en verde al terminar cada tarea.
> Marca `[x]` al terminar cada tarea.

## Fase 1: Punto de partida

- [x] T001 Ejecutar `npm test` y `npm run build` antes de tocar nada y confirmar que pasan. Así, si algo falla después, sabremos que lo hemos roto nosotros.

## Fase 2: Componente `UnderConstruction` (TDD)

- [x] T002 Escribir los tests del componente: el `<h1>` contiene "Rodrigo Holme Web"; hay un párrafo "Page under construction" seguido de otro "Página en construcción"; el párrafo en español tiene `lang="es"`. **Resultado esperado: rojo** (el componente aún no existe). (`src/app/under-construction/under-construction.spec.ts`)
- [x] T003 Crear el componente standalone `UnderConstruction` (selector `app-under-construction`) y su plantilla `<main>` + `<h1>` + dos `<p>`. **Resultado esperado: tests de T002 en verde.** (`src/app/under-construction/under-construction.ts`, `src/app/under-construction/under-construction.html`)
- [x] T004 Añadir los estilos del componente: `:host` con `min-height: 100dvh`, flexbox centrado en ambos ejes, `text-align: center`, `padding`, tamaños de letra con `clamp()` y `overflow-wrap: anywhere`, y enlazarlos con `styleUrl`. (`src/app/under-construction/under-construction.css`, `src/app/under-construction/under-construction.ts`)

## Fase 3: Rutas y limpieza de la página de ejemplo (TDD)

- [x] T005 En `app.spec.ts`, borrar el test "should render title" y añadir dos tests con `RouterTestingHarness`: al navegar a `/` y a `/cualquier/cosa` se muestra `app-under-construction`. **Resultado esperado: rojo** (todavía no hay ruta). (`src/app/app.spec.ts`)
- [x] T006 Añadir la ruta `{ path: '**', component: UnderConstruction }`. **Resultado esperado: tests de T005 en verde.** (`src/app/app.routes.ts`)
- [x] T007 Borrar la página de ejemplo de Angular de `app.html` (dejar solo `<router-outlet />`) y quitar el signal `title` y el import de `signal` de `app.ts`. **Resultado esperado: tests y build en verde.** (`src/app/app.html`, `src/app/app.ts`)

## Fase 4: Estilos globales y título de la pestaña

- [x] T008 [P] Añadir `body { margin: 0; background: #000; color: #fff; }`. (`src/styles.css`)
- [x] T009 [P] Cambiar `<title>PersonalWebApp</title>` por `<title>Rodrigo Holme Web</title>`. (`src/index.html`)

## Fase 5: Verificación

- [x] T010 Ejecutar `npm test` y `npm run build`: los dos en verde.
- [x] T011 Verificación manual con `npm start`:
  1. `http://localhost:4200`: fondo negro, texto blanco centrado, nombre arriba, inglés y debajo español; la pestaña dice "Rodrigo Holme Web".
  2. `http://localhost:4200/lo-que-sea`: se ve la misma página.
  3. DevTools en modo móvil a 360 px: sin scroll horizontal y el texto se ve completo.
- [x] T012 Repasar uno a uno los criterios de aceptación de `spec.md` y confirmar que todos se cumplen. Si alguno no, volver a la tarea correspondiente.

## Dependencias

- T001 va primero.
- T003 depende de T002 (TDD). T004 depende de T003 (el componente debe existir).
- T005 depende de T003 (el test usa el selector del componente). T006 depende de T005 (TDD). T007 depende de T006.
- T008 y T009 son independientes del resto y entre sí: se pueden hacer en cualquier momento después de T001.
- T010, T011 y T012 van al final, en ese orden.
