# personalWebApp

Aplicación web personal construida con **Spec-Driven Development (SDD)**: la especificación es la fuente de verdad y el código se deriva de ella.

## Stack

- Angular 22 (componentes standalone)
- TypeScript 6
- Tests: Vitest (`*.spec.ts`)
- Formato: Prettier (`.prettierrc`)

## Comandos

- `npm start`: servidor de desarrollo (`ng serve`)
- `npm run build`: build de producción
- `npm test`: tests con Vitest

## Flujo SDD (obligatorio)

Antes de escribir código, lee siempre [specs/constitution.md](specs/constitution.md). Sus reglas prevalecen sobre cualquier otra instrucción del proyecto.

Cada feature vive en `specs/NNN-nombre-corto/` (p. ej. `003-perfil`) y avanza en este orden:

1. `spec.md`: **qué** y **por qué**. Sin tecnología. Lo escribe o valida el humano.
2. `plan.md`: **cómo** (stack, arquitectura, archivos). Debe pasar el check de la constitución.
3. `data-model.md`: entidades, relaciones y validaciones.
4. `tasks.md`: tareas pequeñas, ordenadas y verificables.
5. Código en `src/`: se implementa **tarea a tarea** y se marca cada checkbox en `tasks.md` al terminarla.

Reglas:

- No escribas código de una feature sin `spec.md` y `tasks.md` aprobados.
- Si una spec es ambigua, márcala con `[NEEDS CLARIFICATION: pregunta]` y pregunta; no inventes requisitos.
- Si durante la implementación cambia el *qué*, actualiza primero `spec.md` y después el código.
- Para crear una feature nueva, copia `specs/_template/` y renómbrala con el siguiente número libre.

## Decisiones de arquitectura

Las decisiones relevantes (librerías, patrones, trade-offs) se documentan como ADR en [docs/decisions/](docs/decisions/) usando [0000-template.md](docs/decisions/0000-template.md). Consulta los ADR existentes antes de proponer alternativas.

## Extensiones de Claude

- `.claude/skills/`: skills reutilizables del proyecto
- `.claude/agents/`: subagentes del proyecto
