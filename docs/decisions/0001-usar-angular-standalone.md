# 0001 - Usar Angular standalone con Vitest

**Estado:** Aceptado
**Fecha:** 2026-10-06

## Contexto

`personalWebApp` es hoy una página estática, pero está pensada para ir creciendo
con nuevas features (navegación, varias páginas, datos...). También sirve para
practicar Spec-Driven Development. Se parte de la restricción de que el stack
tiene que ser Angular. El motivo es por aprendizaje de SDD

## Decisión

Usar **Angular 22** con **componentes standalone** (sin `NgModule`),
**TypeScript 6** y **Vitest**, tal como los genera `ng new`.

## Alternativas consideradas

- **HTML puro:** no disponible por restricción del proyecto. Además, no escala
  bien para una web que va a crecer.
- **Vue:** no disponible por restricción del proyecto.

## Consecuencias

- **Positivas:** enrutado, tests y build incluidos, y una forma recomendada
  de estructurar el crecimiento de la app.
- **Negativas / costes:** para una página estática el framework es más pesado
  que HTML puro (el build inicial pesa unos 190 kB)