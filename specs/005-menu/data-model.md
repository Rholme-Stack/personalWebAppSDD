# Modelo de datos: 005-menu

**Spec:** [spec.md](./spec.md) · **Plan:** [plan.md](./plan.md)

> Esta feature no crea entidades ni guarda datos nuevos. Cambia los textos y los idiomas definidos en la [002](../002-landing-personal/data-model.md) y la [004](../004-cabecera/data-model.md), y añade el estado del menú, que vive solo en memoria.

## Entidades

### LANGS (cambios)

Idiomas que ofrece el selector.

**Se añade:**

| Campo  | Tipo     | Obligatorio | en   | es   | pt-BR | Requisito                                       |
| ------ | -------- | ----------- | ---- | ---- | ----- | ----------------------------------------------- |
| `code` | `string` | Sí          | `EN` | `ES` | `PT`  | HU-3: con el selector cerrado se ve solo código |

**Se mantiene:** `value` y `label` (el nombre completo de las opciones).

### Translations (cambios)

Textos visibles, uno por idioma.

**Se añade:**

| Clave        | en     | es    | pt-BR | Requisito                        |
| ------------ | ------ | ----- | ----- | -------------------------------- |
| `nav.photos` | Photos | Fotos | Fotos | HU-1: tercera opción del menú    |
| `nav.menu`   | Menu   | Menú  | Menu  | HU-1: nombre accesible del icono |

**Se mantiene:** el resto de `nav`, incluido `nav.contactLabel` (HU-4: el botón se anuncia igual).

## Estados y transiciones

**Menú** (`menuOpen`, no se guarda: al cargar la web siempre está cerrado):

| De      | Acción                                 | A       | Además                                       |
| ------- | -------------------------------------- | ------- | -------------------------------------------- |
| Cerrado | Pulsar el icono                        | Abierto | La página de detrás queda bloqueada e inerte |
| Abierto | Pulsar la X                            | Cerrado | El foco sigue en el icono                    |
| Abierto | Escape                                 | Cerrado | El foco vuelve al icono                      |
| Abierto | Elegir una opción                      | Cerrado | La página se desplaza a la sección           |
| Abierto | Pulsar el logo                         | Cerrado | La página vuelve al principio                |
| Abierto | Cambiar de idioma o pulsar el contacto | Abierto | —                                            |

## Reglas de validación

- `code` tiene siempre dos letras, para que el selector no cambie de ancho.

## Interfaces TypeScript (referencia)

```ts
// src/app/i18n/translations.ts
export const LANGS: readonly { value: Lang; label: string; code: string }[];

export interface Translations {
  nav: {
    about: string;
    stack: string;
    photos: string;
    contact: string;
    contactLabel: string;
    languageLabel: string;
    menu: string;
  };
  // role, about, stack y photos: sin cambios
}

// src/app/landing/site-header/site-header.ts
readonly menuOpen = model(false);
```
