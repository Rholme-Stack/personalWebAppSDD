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
| [0002](./0002-i18n-servicio-propio-con-signals.md) | i18n con servicio propio y signals | Aceptado |
| [0003](./0003-constelacion-webgl2-sin-libreria.md) | Constelación con WebGL2, sin librería 3D | Aceptado |
| [0004](./0004-generar-busto-en-local-con-python.md) | Generar el busto en local con Python | Aceptado |
