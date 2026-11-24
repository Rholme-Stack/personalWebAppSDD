# Modelo de datos: 006-rol-animado

**Spec:** [spec.md](./spec.md) · **Plan:** [plan.md](./plan.md)

> Esta feature no guarda datos. Añade un texto a los definidos en la [002](../002-landing-personal/data-model.md) y el estado de la animación, que vive solo en memoria.

## Entidades

### Translations (cambios)

**Se añade:**

| Clave      | en                   | es                       | pt-BR                  | Requisito                  |
| ---------- | -------------------- | ------------------------ | ---------------------- | -------------------------- |
| `heroRole` | Full-stack developer | Desarrollador full stack | Programador full stack | HU-1: el rol de la portada |

**Se mantiene:** `role` y `about.bio`, que ahora solo usa "About Me" (HU-1, criterio 2).

### TypingState

Punto del ciclo en el que está el rol.

| Campo      | Tipo      | Obligatorio | Reglas / validación                        |
| ---------- | --------- | ----------- | ------------------------------------------ |
| `length`   | `number`  | Sí          | Letras visibles: entre 0 y las de la frase |
| `deleting` | `boolean` | Sí          | `true` si se está borrando                 |

## Estados y transiciones

| De          | Espera                | A                                  |
| ----------- | --------------------- | ---------------------------------- |
| Vacío       | Menos de 1 s          | Una letra, escribiendo             |
| Escribiendo | Irregular             | Una letra más                      |
| Completo    | 3 s                   | Una letra menos, borrando          |
| Borrando    | Corta                 | Una letra menos (o vacío)          |
| Cualquiera  | Al cambiar de idioma  | Vacío, con la frase nueva          |
| Cualquiera  | Al reducir movimiento | Completo y quieto, fuera del ciclo |

## Reglas de validación

- `length` nunca es menor que 0 ni mayor que el número de letras de la frase.

## Interfaces TypeScript (referencia)

```ts
// src/app/landing/typed-role/typing.ts
export interface TypingState {
  readonly length: number;
  readonly deleting: boolean;
}

// src/app/i18n/translations.ts
export interface Translations {
  heroRole: string;
  // el resto, sin cambios
}
```
