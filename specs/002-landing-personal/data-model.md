# Modelo de datos: 002-landing-personal

**Spec:** [spec.md](./spec.md) · **Plan:** [plan.md](./plan.md)

> Esta feature no tiene base de datos ni API. Sus datos son fijos (perfil, stack, textos) o viven solo en el navegador (idioma elegido, campos del formulario). Los mensajes del formulario **no se guardan ni se envían** en esta feature.

## Entidades

### Lang

Idioma en el que se muestra la web (HU-4).

| Valor   | Etiqueta en el selector | `lang` de `<html>` |
| ------- | ----------------------- | ------------------ |
| `en`    | English                 | `en`               |
| `es`    | Español                 | `es`               |
| `pt-BR` | Português (Brasil)      | `pt-BR`            |

Las etiquetas del selector se muestran siempre en su propio idioma, sea cual sea el idioma activo, para que cualquiera reconozca el suyo.

### Preferencia de idioma

El idioma elegido por el visitante, que se recuerda al volver (HU-4).

| Campo | Tipo   | Obligatorio | Reglas / validación |
| ----- | ------ | ----------- | ------------------- |
| `lang` (clave de `localStorage`) | `Lang` | No | Solo se acepta `en`, `es` o `pt-BR`. Cualquier otro valor se ignora, como si no existiera. |

### Profile

Datos fijos de Rodrigo (HU-1). Viven en `src/app/landing/profile.ts`.

| Campo         | Tipo           | Obligatorio | Reglas / validación |
| ------------- | -------------- | ----------- | ------------------- |
| `name`        | string         | Sí          | `"Rodrigo Holme"`. No se traduce. |
| `photo`       | string         | Sí          | Ruta dentro de `public/`, `images/rodrigo.webp`. |
| `socialLinks` | `SocialLink[]` | Sí          | Exactamente 3, en este orden: LinkedIn, GitHub, Instagram. |

El rol, el texto de presentación y la descripción de la foto **no** están aquí: dependen del idioma y van en `Translations`.

### SocialLink

Enlace a un perfil externo (HU-1 y aviso del formulario en HU-3).

| Campo     | Tipo                                       | Obligatorio | Reglas / validación |
| --------- | ------------------------------------------ | ----------- | ------------------- |
| `network` | `'linkedin' \| 'github' \| 'instagram'`    | Sí          | Único dentro de `socialLinks`. |
| `label`   | string                                     | Sí          | Nombre visible de la red: "LinkedIn", "GitHub" o "Instagram". |
| `url`     | string                                     | Sí          | URL absoluta `https://`. Se abre en pestaña nueva. |
| `icon`    | string                                     | Sí          | Ruta del SVG en `public/icons/`. |

### StackItem

Tecnología que usa Rodrigo (HU-2). La lista vive en `profile.ts`.

| Campo  | Tipo   | Obligatorio | Reglas / validación |
| ------ | ------ | ----------- | ------------------- |
| `name` | string | Sí          | `.NET`, `Angular` o `SQL`. No se traduce. |
| `logo` | string | Sí          | Ruta del SVG en `public/icons/`. La imagen es decorativa (`alt=""`), porque el nombre ya aparece al lado. |

### ContactFormValue

Lo que escribe el visitante en el formulario (HU-3). Solo existe en memoria mientras la página está abierta.

| Campo     | Tipo   | Obligatorio | Reglas / validación |
| --------- | ------ | ----------- | ------------------- |
| `name`    | string | Sí          | No vacío ni solo espacios. Máximo 100 caracteres. |
| `email`   | string | Sí          | No vacío. Formato de email. Máximo 254 caracteres. |
| `message` | string | Sí          | No vacío ni solo espacios. Entre 10 y 2000 caracteres. |

### Translations

Todos los textos visibles, uno por idioma (HU-4). Los tres diccionarios implementan la misma interfaz, así que el compilador avisa si falta alguno.

| Clave | en | es | pt-BR |
| ----- | -- | -- | ----- |
| `nav.about` | About Me | Sobre mí | Sobre mim |
| `nav.stack` | Stack | Stack | Stack |
| `nav.contact` | Contact | Contacto | Contato |
| `nav.languageLabel` | Language | Idioma | Idioma |
| `role` | Developer | Desarrollador | Desenvolvedor |
| `about.title` | About Me | Sobre mí | Sobre mim |
| `about.bio` | I'm a developer working with .NET, Angular and SQL. When I'm not coding, you'll find me doing sport: running and cycling are my thing. | Soy desarrollador y trabajo con .NET, Angular y SQL. Cuando no estoy programando, me encontrarás haciendo deporte: correr y montar en bici son lo mío. | Sou desenvolvedor e trabalho com .NET, Angular e SQL. Quando não estou programando, você vai me encontrar praticando esporte: corrida e ciclismo são a minha praia. |
| `about.photoAlt` | Illustration of Rodrigo Holme | Ilustración de Rodrigo Holme | Ilustração de Rodrigo Holme |
| `about.socialLabel(label)` | Rodrigo Holme on {label} (opens in a new tab) | Rodrigo Holme en {label} (se abre en una pestaña nueva) | Rodrigo Holme no {label} (abre em uma nova aba) |
| `stack.title` | Stack | Stack | Stack |
| `photos.title` | Photos | Fotos | Fotos |
| `photos.comingSoon` | Coming soon | Próximamente | Em breve |
| `contact.title` | Contact | Contacto | Contato |
| `contact.nameLabel` | Name | Nombre | Nome |
| `contact.emailLabel` | Email | Correo electrónico | E-mail |
| `contact.messageLabel` | Message | Mensaje | Mensagem |
| `contact.submit` | Send | Enviar | Enviar |
| `contact.errors.required` | This field is required | Este campo es obligatorio | Este campo é obrigatório |
| `contact.errors.email` | Enter a valid email | Introduce un email válido | Digite um e-mail válido |
| `contact.errors.maxLength(n)` | Maximum {n} characters | Máximo {n} caracteres | Máximo de {n} caracteres |
| `contact.errors.minLength(n)` | Minimum {n} characters | Mínimo {n} caracteres | Mínimo de {n} caracteres |
| `contact.notice` | The contact form is not active yet. You can reach me on | El formulario de contacto aún no está activo. Puedes escribirme por | O formulário de contato ainda não está ativo. Você pode me escrever pelo |

El enlace del aviso muestra el texto "LinkedIn" y usa la URL de `socialLinks`.

## Relaciones

- Un `Profile` tiene 3 `SocialLink` (1:N, fijo).
- Una lista de 3 `StackItem` (fija).
- Hay un `Translations` por cada `Lang` (1:1).
- El aviso del formulario usa el `SocialLink` con `network = 'linkedin'`.

## Estados y transiciones

**Idioma activo**

```
Inicio ──> ¿localStorage tiene un Lang válido? ──sí──> ese idioma
                       │ no
                       └──> ¿navigator.languages casa con es-* / pt-* / en-*? ──sí──> es / pt-BR / en
                                                │ no
                                                └──> en

Cualquier estado ──setLang(x)──> x  (se guarda en localStorage y se actualiza <html lang>)
```

**Formulario de contacto**

```
Editando ──enviar con errores──> Errores visibles (aviso oculto)
Editando ──enviar sin errores──> Aviso visible (los campos conservan su valor)
Errores visibles ──corregir y enviar sin errores──> Aviso visible
Aviso visible ──enviar con errores──> Errores visibles (aviso oculto)
```

Antes del primer envío, los errores solo se muestran en los campos que el visitante ya ha tocado y abandonado. Al enviar, se muestran en todos.

## Reglas de validación

- **Campo vacío o solo espacios** en `name` o `message`: mensaje `contact.errors.required`. Un `email` vacío también.
- **`email` con formato no válido:** mensaje `contact.errors.email`. Se usa el validador de email estándar de Angular.
- **Longitudes:** `name` como máximo 100, `email` como máximo 254 y `message` entre 10 y 2000. Mensajes `contact.errors.maxLength(n)` y `contact.errors.minLength(n)`.
- **Un error por campo:** si un campo tiene varios, se muestra uno solo, por prioridad: obligatorio, luego longitud, luego formato de email. La longitud va antes porque el validador de email de Angular también rechaza los emails de más de 254 caracteres, y así el visitante ve el mensaje más útil.
- **Preferencia de idioma:** si `localStorage` contiene un valor que no es un `Lang` válido, se ignora.

## Interfaces TypeScript (referencia)

```ts
// src/app/i18n/translations.ts
export type Lang = 'en' | 'es' | 'pt-BR';

export interface Translations {
  nav: { about: string; stack: string; contact: string; languageLabel: string };
  role: string;
  about: {
    title: string;
    bio: string;
    photoAlt: string;
    socialLabel: (label: string) => string;
  };
  stack: { title: string };
  photos: { title: string; comingSoon: string };
  contact: {
    title: string;
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submit: string;
    errors: {
      required: string;
      email: string;
      maxLength: (n: number) => string;
      minLength: (n: number) => string;
    };
    notice: string;
  };
}

// src/app/landing/profile.ts
export interface SocialLink {
  network: 'linkedin' | 'github' | 'instagram';
  label: string;
  url: string;
  icon: string;
}

export interface StackItem {
  name: string;
  logo: string;
}

export interface Profile {
  name: string;
  photo: string;
  socialLinks: SocialLink[];
}

// src/app/contact/contact-form/contact-form.ts
export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
} as const;
```
