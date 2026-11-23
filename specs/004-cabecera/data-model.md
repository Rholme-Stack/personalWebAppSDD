# Modelo de datos: 004-cabecera

**Spec:** [spec.md](./spec.md) · **Plan:** [plan.md](./plan.md)

> Esta feature no crea entidades. Solo cambia los textos traducidos (`Translations`, definido en la [002](../002-landing-personal/data-model.md)).

## Entidades

### Translations (cambios)

Textos visibles, uno por idioma.

**Se añade:**

| Clave              | en                                                     | es                                                                 | pt-BR                                                     | Requisito                                                       |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------- |
| `nav.contactLabel` | Contact Rodrigo Holme on LinkedIn (opens in a new tab) | Contacto: Rodrigo Holme en LinkedIn (se abre en una pestaña nueva) | Contato: Rodrigo Holme no LinkedIn (abre em uma nova aba) | HU-3: el lector de pantalla anuncia LinkedIn y la pestaña nueva |

**Se mantiene:** `nav.contact` ("Contact", "Contacto", "Contato") como texto visible del botón (HU-3).

**Se borra:** el diccionario `contact` entero (`title`, `nameLabel`, `emailLabel`, `messageLabel`, `submit`, `errors.*`, `notice`), porque desaparece el formulario (HU-3).

## Reglas de validación

- `nav.contactLabel` empieza por la misma palabra que el texto visible del botón en cada idioma (_label in name_, WCAG 2.5.3).

## Interfaces TypeScript (referencia)

```ts
// src/app/i18n/translations.ts
export interface Translations {
  nav: {
    about: string;
    stack: string;
    contact: string;
    contactLabel: string;
    languageLabel: string;
  };
  role: string;
  about: { title: string; bio: string; photoAlt: string; socialLabel: (label: string) => string };
  stack: { title: string };
  photos: { title: string; comingSoon: string };
}
```
