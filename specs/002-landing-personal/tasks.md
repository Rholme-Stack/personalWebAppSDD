# Tareas: 002-landing-personal

**Plan:** [plan.md](./plan.md) · **Spec:** [spec.md](./spec.md) · **Modelo:** [data-model.md](./data-model.md)
**Estado:** Aprobado

> Formato: `- [ ] T### [P] descripción (archivos)`.
> `[P]` = se puede hacer en paralelo con las otras `[P]` de la misma fase (tocan archivos distintos).
> Ciclo TDD: la tarea de test deja los tests en **rojo** a propósito; la siguiente los pone en **verde**. Fuera de ese ciclo, `npm test` y `npm run build` deben quedar en verde al terminar cada tarea.
> Marca `[x]` al terminar cada tarea.

## Fase 1: Punto de partida

- [x] T001 Ejecutar `npm test` y `npm run build` antes de tocar nada y confirmar que pasan.

## Fase 2: Recursos estáticos y estilos base

- [x] T002 [P] Descargar Inter desde su repositorio oficial (`rsms/inter`, release más reciente) y copiar `InterVariable.woff2` y `LICENSE.txt`. (`public/fonts/`)
- [x] T003 [P] Añadir los SVG de los logos, sin modificarlos: `dotnet`, `angular`, `linkedin`, `github` e `instagram`. Para `sql`, un icono genérico de base de datos. (`public/icons/*.svg`)
- [x] T004 [P] Añadir la imagen de Rodrigo. Es apaisada (1792×1024): en la tarjeta se recorta centrada con `object-fit: cover`. (`public/images/rodrigo.webp`)
- [x] T005 [P] Completar `DESIGN.md` con lo que le falta a esta feature:
  - selector de idioma: `<select>` con el estilo de los enlaces del menú;
  - campos del formulario: borde de 1px `#9a9a9a`, radio de 12px y foco violeta;
  - color de error `--color-error: #ff6b6b`;
  - aviso del formulario;
  - lista del stack.

  (`docs/design/DESIGN.md`)
- [x] T006 Estilos globales:
  - `@font-face` de Inter (pesos 100–900, `font-display: swap`);
  - tokens de `DESIGN.md` en `:root`, sin los valores no válidos, y añadiendo `--color-error`;
  - `body` con Inter, peso 200 y 18px;
  - foco visible (`:focus-visible` con contorno violeta);
  - `scroll-behavior: smooth` solo con `prefers-reduced-motion: no-preference`;
  - clase `.visually-hidden`.

  **Resultado esperado: tests y build en verde.** (`src/styles.css`)
- [x] T007 Cambiar el título a `<title>Rodrigo Holme</title>` y añadir `<link rel="preload">` de la fuente. (`src/index.html`)

## Fase 3: Idiomas (TDD)

- [x] T008 Crear el tipo `Lang`, la constante `LANGS` (valor y etiqueta) y la interfaz `Translations`, y los diccionarios `en`, `es` y `ptBR` con los textos de `data-model.md`. `about.bio` lleva un texto provisional marcado con `TODO`. **Resultado esperado: build en verde.** (`src/app/i18n/translations.ts`)
- [x] T009 Escribir los tests de `LanguageService`:
  - arranca con el idioma guardado en `localStorage`;
  - sin valor guardado, `es-MX` da `es`, `pt-PT` da `pt-BR` y `fr-FR` da `en`;
  - ignora un valor guardado no válido;
  - `setLang` guarda el valor y cambia `<html lang>`;
  - `t()` devuelve el diccionario del idioma activo;
  - funciona aunque `localStorage` lance un error.

  **Resultado esperado: rojo.** (`src/app/i18n/language.service.spec.ts`)
- [x] T010 Implementar `LanguageService`: signal `lang`, `computed` `t` y `setLang`, con detección inicial y `try/catch` en `localStorage`. **Resultado esperado: tests de T009 en verde.** (`src/app/i18n/language.service.ts`)

## Fase 4: Datos del perfil

- [x] T011 Crear las interfaces `Profile`, `SocialLink` y `StackItem` y las constantes `PROFILE` y `STACK`. Las URLs de las redes llevan un valor provisional marcado con `TODO` si todavía no están. (`src/app/landing/profile.ts`)

## Fase 5: Secciones (TDD)

- [x] T012 [P] Tests de `Photos`: muestra "Coming soon" en `en`, "Próximamente" en `es` y "Em breve" en `pt-BR`. **Resultado esperado: rojo.** (`src/app/landing/photos/photos.spec.ts`)
- [x] T013 Implementar `Photos` (`app-photos`): `<section id="photos">` con título y mensaje, en gris `#9a9a9a`, mayúsculas y 14px, centrado. **Resultado esperado: verde.** (`src/app/landing/photos/photos.{ts,html,css}`)
- [x] T014 [P] Tests de `Stack`: hay tres elementos (.NET, Angular, SQL), cada uno con una imagen con `alt=""`. **Resultado esperado: rojo.** (`src/app/landing/stack/stack.spec.ts`)
- [x] T015 Implementar `Stack` (`app-stack`): `<section id="stack">` con título y una lista `<ul>` a partir de `STACK`. **Resultado esperado: verde.** (`src/app/landing/stack/stack.{ts,html,css}`)
- [x] T016 [P] Tests de `AboutMe`:
  - muestra el nombre y el rol según el idioma;
  - la foto tiene el `alt` traducido;
  - hay tres enlaces de redes con `target="_blank"`, `rel="noopener noreferrer"` y `aria-label` traducido.

  **Resultado esperado: rojo.** (`src/app/landing/about-me/about-me.spec.ts`)
- [x] T017 Implementar `AboutMe` (`app-about-me`): `<section id="about">` con la tarjeta de `DESIGN.md` (foto con radio de 24px, rol en violeta y mayúsculas, nombre, bio e iconos de redes). **Resultado esperado: verde.** (`src/app/landing/about-me/about-me.{ts,html,css}`)
- [x] T018 [P] Tests de `SiteHeader`:
  - el selector tiene tres opciones con las etiquetas de `LANGS` y un `<label>`;
  - cambiar la opción llama a `setLang`;
  - la opción seleccionada coincide con el idioma activo;
  - los enlaces llevan a `#about`, `#stack` y `#contact`.

  **Resultado esperado: rojo.** (`src/app/landing/site-header/site-header.spec.ts`)
- [x] T019 Implementar `SiteHeader` (`app-site-header`):
  - `<header>` con el wordmark;
  - `<nav>` con enlaces `routerLink` y `fragment`;
  - el `<select>` de idioma;
  - el botón Contact como enlace con estilo de píldora violeta;
  - en menos de 640 px, dos filas.

  **Resultado esperado: verde.** (`src/app/landing/site-header/site-header.{ts,html,css}`)
- [x] T020 [P] Tests de `ContactForm`:
  - hay tres campos con `<label>`;
  - enviar vacío muestra tres errores y no muestra el aviso;
  - un email no válido muestra su error;
  - nombre de 101, email de 255 y mensaje de 9 o 2001 caracteres muestran el error de límite;
  - un nombre de solo espacios da error;
  - un envío válido muestra el aviso con el enlace a LinkedIn y los valores se conservan;
  - un envío con errores después del aviso lo oculta;
  - al cambiar a `es`, los errores visibles salen en español;
  - los campos con error tienen `aria-invalid="true"` y `aria-describedby`.

  **Resultado esperado: rojo.** (`src/app/contact/contact-form/contact-form.spec.ts`)
- [x] T021 Implementar `ContactForm` (`app-contact-form`):
  - `<section id="contact">` con un `FormGroup` y `CONTACT_LIMITS`;
  - un solo error por campo, por prioridad;
  - al enviar con errores, `markAllAsTouched()` y foco en el primer campo con error;
  - el signal `noticeVisible` y el aviso con `role="status"`.

  **Resultado esperado: verde.** (`src/app/contact/contact-form/contact-form.{ts,html,css}`)

## Fase 6: Integración (TDD)

- [x] T022 Tests de `Landing`: el `<h1>` dice "Rodrigo Holme", el rol cambia con el idioma y aparecen las cinco secciones (`app-site-header`, `app-about-me`, `app-stack`, `app-photos` y `app-contact-form`). **Resultado esperado: rojo.** (`src/app/landing/landing.spec.ts`)
- [x] T023 Implementar `Landing` (`app-landing`): la cabecera, el hero con `<h1>` y el rol en tamaño display con `clamp()`, dentro de `<main>`, y las secciones con `scroll-margin-top`. **Resultado esperado: verde.** (`src/app/landing/landing.{ts,html,css}`)
- [x] T024 En `app.spec.ts`, cambiar los tests de rutas: `/` muestra `app-landing` y `/cualquier/cosa` redirige a `/` y muestra `app-landing`. **Resultado esperado: rojo.** (`src/app/app.spec.ts`)
- [x] T025 Rutas: `{ path: '', component: Landing }` y `{ path: '**', redirectTo: '' }`. En `app.config.ts`, `withInMemoryScrolling({ anchorScrolling: 'enabled' })`. **Resultado esperado: verde.** (`src/app/app.routes.ts`, `src/app/app.config.ts`)
- [x] T026 Borrar la carpeta de la feature 001. **Resultado esperado: tests y build en verde.** (`src/app/under-construction/`)
- [x] T027 Cambiar el estado de la spec 001 a "Reemplazada por 002". (`specs/001-under-construction/spec.md`)

## Fase 7: Verificación

- [x] T028 Ejecutar `npm test` y `npm run build`: los dos en verde y sin avisos de presupuesto.
- [ ] T029 Verificación manual con `npm start`:
  1. El aspecto coincide con `DESIGN.md`: fondo negro, Inter cargada, botón violeta y títulos grandes.
  2. About Me, Stack y Contact desplazan la página hasta su sección y la cabecera no tapa el título.
  3. Cambiar de idioma y recargar: se mantiene. Borrar `localStorage` con el navegador en español: arranca en español.
  4. A 360 px en DevTools: no hay scroll horizontal y la cabecera aparece en dos filas.
  5. Solo con teclado se llega a todo y el foco siempre es visible.
  6. Con Narrador: se anuncian los errores, el aviso y el idioma de la página.
- [ ] T030 Repasar uno a uno los criterios de aceptación de `spec.md`. Si alguno no se cumple, volver a la tarea correspondiente.
- [ ] T031 Antes de publicar, sustituir el contenido pendiente: la foto real, `about.bio` en los tres idiomas y las URLs de las redes. Buscar `TODO` en `src/`.

## Dependencias

- T001 va primero.
- T002–T005 son independientes entre sí. T006 depende de T002, por la fuente. T007 depende de T002, por el `preload`.
- T008 → T009 → T010 (TDD). T009 necesita los tipos de T008.
- T011 puede hacerse en cualquier momento después de T001.
- **Fase 5:** todas las tareas dependen de T010 (usan `LanguageService`). Además, T014–T017 dependen de T011 y T003; T017 depende también de T004; y T020–T021 dependen de T011, por el enlace a LinkedIn. Cada par test → implementación es TDD. Los pares son independientes entre sí.
- T022 depende de T013, T015, T017, T019 y T021. T023 depende de T022.
- T024 depende de T023. T025 depende de T024. T026 depende de T025. T027 va después de T026.
- T028, T029 y T030 van al final, en ese orden. T031 va antes de publicar.
