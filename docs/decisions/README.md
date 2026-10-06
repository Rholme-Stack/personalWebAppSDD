# Decisiones de arquitectura (ADR)

Un **ADR** (*Architecture Decision Record*) deja por escrito una decisión técnica importante y **por qué** se tomó.

## Cuándo escribir uno

- Añadir una dependencia nueva (lo exige el Artículo IV de la constitución).
- Elegir un patrón, servicio o tecnología con alternativas reales.
- Enmendar la constitución.

No hace falta para decisiones pequeñas (nombres, estilos, detalles locales).

## Reglas

- Se numeran de forma secuencial: `0001-titulo-corto.md`, `0002-...`.
- Se crean copiando [0000-template.md](./0000-template.md).
- **No se editan** una vez aceptados. Si cambias de opinión, escribe un ADR nuevo y marca el antiguo como "Reemplazado por NNNN".

## Índice

| ADR | Título | Estado |
| --- | ------ | ------ |
| [0001](./0001-usar-angular-standalone.md) | Usar Angular standalone con Vitest | Aceptado |
