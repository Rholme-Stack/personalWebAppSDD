# Modelo de datos: NNN-nombre-feature

**Spec:** [spec.md](./spec.md) · **Plan:** [plan.md](./plan.md)

> Solo si la feature maneja datos. Si no los hay (como una página estática), crea el archivo con una línea: "Esta feature no maneja datos."
> Cada campo debe justificarse por algún requisito de la spec.

## Entidades

### NombreEntidad

<!-- Qué representa, en una frase. -->

| Campo | Tipo   | Obligatorio | Reglas / validación |
| ----- | ------ | ----------- | ------------------- |
| id    | string | Sí          | Único               |

## Relaciones

<!-- Ejemplo: "Un Usuario tiene muchas Sesiones (1:N)". -->

## Estados y transiciones

<!-- Solo si una entidad tiene ciclo de vida. Ejemplo: Borrador → Publicado → Archivado. -->

## Reglas de validación

- <!-- Ejemplo: "email con formato válido y único". -->

## Interfaces TypeScript (referencia)

```ts
// Se crearán en src/app/<feature>/models/
export interface NombreEntidad {
  id: string;
}
```
