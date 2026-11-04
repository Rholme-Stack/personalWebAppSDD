# Plan técnico: 002-landing-personal

**Spec:** [spec.md](./spec.md)
**Estado:** Aprobado
**Fecha:** 2026-10-31

## Resumen técnico

Se sustituye la página "en construcción" por una landing de una sola página con cinco bloques: cabecera, presentación (hero + About Me), Stack, fotos ("Coming soon") y contacto. Los tres idiomas se resuelven con un servicio propio basado en signals y diccionarios TypeScript tipados ([ADR 0002](../../docs/decisions/0002-i18n-servicio-propio-con-signals.md)). El formulario usa Reactive Forms solo para validar: con datos válidos muestra un aviso de "aún no activo", sin HTTP. El diseño sigue [DESIGN.md](../../docs/design/DESIGN.md), con Inter alojada en el proyecto en lugar de PPNeueMontreal (decisión documentada en la sección de tipografía de `DESIGN.md`). No se añade ninguna dependencia npm.

## Contexto técnico

- **Framework:** Angular 22 (standalone, sin zone.js)
- **Lenguaje:** TypeScript 6
- **Tests:** Vitest con `TestBed` y `RouterTestingHarness`
- **Dependencias nuevas:** ninguna en npm. `@angular/forms` ya está instalado. Se añaden archivos estáticos: la fuente Inter (licencia OFL) y SVGs de logos.
- **Backend / APIs:** ninguno. El envío con Firebase será una feature posterior.

### Estado actual del código

- `src/app/app.ts` y `app.html`: componente raíz con solo `<router-outlet />`.
- `src/app/app.routes.ts`: una única ruta `**` hacia `UnderConstruction`.
- `src/app/app.config.ts`: `provideRouter(routes)` sin opciones de scroll.
- `src/app/app.spec.ts`: comprueba que `/` y cualquier URL muestran `app-under-construction`.
- `src/app/under-construction/`: componente de la feature 001 (4 archivos).
- `src/index.html`: `lang="en"`, `<title>Rodrigo Holme Web</title>`.
- `src/styles.css`: `body` con margen 0, fondo negro y texto blanco.
- `public/`: solo `favicon.ico`.

## Check de constitución

- [x] **I. Spec primero:** la spec tiene todas sus clarificaciones registradas. Hay que volver a aprobarla, porque cambió el comportamiento del formulario.
- [x] **II. Calidad y tests:** `LanguageService` y la validación del formulario tienen tests en Vitest. Cada criterio de aceptación tiene al menos un test, salvo los visuales, que se comprueban a mano (ver "Estrategia de tests").
- [x] **III. Arquitectura:**
  - Todos los componentes son standalone.
  - El idioma activo y el aviso del formulario se guardan en signals. No hay RxJS propio: Reactive Forms se usa sin suscripciones manuales.
  - Organización por feature: `i18n/`, `landing/` y `contact/`.
  - No hay HTTP. Cuando llegue Firebase, el envío irá en un servicio de `contact/`, no en el componente.
- [x] **IV. Simplicidad:**
  - No hay dependencias npm nuevas. La decisión de i18n tiene su ADR (0002). La fuente no es una dependencia: su elección queda documentada en `DESIGN.md`.
  - No se crea un servicio de envío vacío "por si acaso".
  - No se implementa la constelación animada de `DESIGN.md`, porque la spec no la pide.
- [x] **V. Seguridad:**
  - Los tres campos se validan en el cliente. El servidor validará cuando exista el envío.
  - No hay secretos.
  - `localStorage` solo guarda el idioma elegido, nunca tokens.
  - Los enlaces externos llevan `rel="noopener noreferrer"`.
  - No se usa `innerHTML`.
- [x] **VI. Accesibilidad y UX:**
  - El selector de idioma es un `<select>` nativo con `<label>`.
  - Los campos tienen `<label>`, `aria-invalid` y `aria-describedby` hacia su error.
  - El aviso de "aún no activo" usa `role="status"`.
  - Los iconos de redes tienen `aria-label`.
  - El foco es visible.
  - `<html lang>` cambia con el idioma activo.
  - Contrastes sobre negro: violeta 4,6:1 y gris ceniza 7,4:1.
  - El texto se adapta a 360 px con `clamp()`.

## Arquitectura

```
App
 └─ <router-outlet>
     └─ Landing  (ruta '', y '**' redirige a '')
         ├─ SiteHeader    wordmark · About Me · Stack · selector idioma · botón Contact
         ├─ <section> hero        h1 "Rodrigo Holme" + rol
         ├─ AboutMe       #about   foto, nombre, rol, texto, LinkedIn/GitHub/Instagram
         ├─ Stack         #stack   .NET, Angular, SQL con logo
         ├─ Photos        #photos  "Coming soon"
         └─ ContactForm   #contact nombre, email, mensaje → aviso "aún no activo"

LanguageService (root) ──signal lang──> computed t ──> todos los componentes leen textos
```

- **`LanguageService`** (`providedIn: 'root'`):
  - `lang`: signal de solo lectura con `'en' | 'es' | 'pt-BR'`.
  - `t`: `computed` que devuelve el diccionario del idioma activo.
  - `setLang(lang)`: guarda el idioma en `localStorage` (clave `lang`) y actualiza `document.documentElement.lang`.
  - **Idioma inicial:** primero el valor de `localStorage` si es válido. Si no hay, el primer idioma de `navigator.languages` que case:
    - cualquier `es-*` da `es`;
    - cualquier `pt-*` da `pt-BR`;
    - cualquier `en-*` da `en`.

    Si no casa ninguno, se usa `en`. Los accesos a `localStorage` van en `try/catch`, para que la web funcione aunque esté bloqueado.
- **Diccionarios** (`translations.ts`): una interfaz `Translations` y tres objetos `en`, `es` y `ptBR` que la implementan. TypeScript obliga a que los tres tengan todas las claves. Los mensajes con límites son funciones, por ejemplo `maxLength: (n: number) => string`.
- **`ContactForm`:**
  - Un `FormGroup` con tres controles:
    - `name`: obligatorio, no vacío, máx. 100;
    - `email`: obligatorio, con formato de email, máx. 254;
    - `message`: obligatorio, no vacío, entre 10 y 2000.

    "No vacío" usa `Validators.pattern(/\S/)`, para que un campo con solo espacios no pase.
  - Al enviar con datos inválidos: `markAllAsTouched()` y foco en el primer campo con error.
  - Al enviar con datos válidos: se activa `noticeVisible = signal(true)` y no se resetea el formulario.
- **Navegación por anclas:** el menú usa `routerLink="/"` con `fragment="about"`, `"stack"` o `"contact"`. `app.config.ts` activa `withInMemoryScrolling({ anchorScrolling: 'enabled' })`. Las secciones llevan `scroll-margin-top` para que la cabecera no tape el título. `scroll-behavior: smooth` solo se aplica si el visitante no tiene `prefers-reduced-motion`.
- **Datos fijos** (`landing/profile.ts`): nombre, URLs de redes y lista del stack (nombre y ruta del logo). Ver `data-model.md`.
- **Estilos:**
  - Los tokens de `DESIGN.md` (colores, escala tipográfica, pesos, espaciado, radios) se pasan a `:root` en `styles.css`.
  - Se descartan los valores no válidos como `--section-gap: 60-120px`.
  - Se añade `--color-error: #ff6b6b`, porque el diseño no tiene color de error.
  - Los tamaños grandes (78–113px) usan `clamp()` para caber en 360 px.
- **Cabecera en móvil:** por debajo de 640 px pasa a dos filas: wordmark y selector arriba, enlaces y botón Contact abajo. No hay menú hamburguesa.

## Archivos afectados

| Acción    | Archivo | Cambio |
| --------- | ------- | ------ |
| Crear     | `src/app/i18n/translations.ts` | Tipo `Lang`, interfaz `Translations` y diccionarios `en`, `es`, `ptBR`. |
| Crear     | `src/app/i18n/language.service.ts` | `LanguageService` (detección, persistencia, `lang`, `t`, `setLang`). |
| Crear     | `src/app/i18n/language.service.spec.ts` | Tests del servicio. |
| Crear     | `src/app/landing/profile.ts` | Datos fijos: nombre, redes y stack. |
| Crear     | `src/app/landing/landing.{ts,html,css,spec.ts}` | Página: compone las secciones y el hero. |
| Crear     | `src/app/landing/site-header/site-header.{ts,html,css,spec.ts}` | Cabecera, menú y selector de idioma. |
| Crear     | `src/app/landing/about-me/about-me.{ts,html,css,spec.ts}` | Tarjeta About Me y redes. |
| Crear     | `src/app/landing/stack/stack.{ts,html,css,spec.ts}` | Lista del stack con logos. |
| Crear     | `src/app/landing/photos/photos.{ts,html,css,spec.ts}` | Sección con "Coming soon". |
| Crear     | `src/app/contact/contact-form/contact-form.{ts,html,css,spec.ts}` | Formulario, validación y aviso. |
| Crear     | `public/fonts/InterVariable.woff2`, `public/fonts/LICENSE.txt` | Fuente Inter variable (pesos 100–900) y su licencia OFL. |
| Crear     | `public/icons/{dotnet,angular,sql,linkedin,github,instagram}.svg` | Logos. SQL usa un icono genérico de base de datos. |
| Crear     | `public/images/rodrigo.webp` | Imagen de Rodrigo (ilustración apaisada 1792×1024; se recorta con `object-fit: cover`). |
| Crear     | `docs/decisions/0002-i18n-servicio-propio-con-signals.md` | ADR del i18n. |
| Modificar | `docs/decisions/README.md` | Añadir 0002 al índice. |
| Modificar | `docs/design/DESIGN.md` | Añadir selector de idioma, campos de formulario, color de error y sección de fotos. La tipografía Inter ya está documentada. |
| Modificar | `src/app/app.routes.ts` | `''` va a `Landing` y `'**'` redirige a `''`. |
| Modificar | `src/app/app.config.ts` | `withInMemoryScrolling({ anchorScrolling: 'enabled' })`. |
| Modificar | `src/app/app.spec.ts` | Tests de rutas con `app-landing`. |
| Modificar | `src/styles.css` | `@font-face` de Inter, tokens en `:root`, estilos base y foco visible. |
| Modificar | `src/index.html` | `<title>Rodrigo Holme</title>` y `preload` de la fuente. |
| Borrar    | `src/app/under-construction/` | La feature 001 queda reemplazada. |
| Modificar | `specs/001-under-construction/spec.md` | Estado: "Reemplazada por 002". |

## Mapeo spec → implementación

| Criterio de aceptación | Dónde se implementa |
| ---------------------- | ------------------- |
| HU-1: nombre y rol traducido al cargar | `landing.html` (hero, `<h1>`) + `t().role` |
| HU-1: About Me con foto, nombre, rol y texto | `about-me.html` |
| HU-1: descripción de la foto traducida | `about-me.html` (`[alt]="t().photoAlt"`) |
| HU-1: redes en pestaña nueva | `about-me.html` (`target="_blank"`, `rel`, `aria-label`) + `profile.ts` |
| HU-1: título de pestaña "Rodrigo Holme" | `index.html` |
| HU-2: .NET, Angular y SQL con logo | `stack.html` + `profile.ts` |
| HU-3: formulario con 3 campos obligatorios | `contact-form.ts/html` |
| HU-3: error por campo vacío, email no válido o fuera de límites | `contact-form.ts` (validadores) + `contact-form.html` (mensajes traducidos) |
| HU-3: aviso "aún no activo" con enlace a LinkedIn | `contact-form.ts` (`noticeVisible`) + `contact-form.html` |
| HU-3: lo escrito no se borra | `contact-form.ts` (no hay `reset()`) |
| HU-3: "Contact" lleva al formulario | `site-header.html` (`fragment="contact"`) + `app.config.ts` |
| HU-4: selector con 3 idiomas | `site-header.html` (`<select>`) |
| HU-4: todo cambia de idioma | `LanguageService.t` usado en todas las plantillas |
| HU-4: idioma del navegador o inglés | `LanguageService` (detección inicial) |
| HU-4: se recuerda la elección | `LanguageService` (`localStorage`) |
| HU-5: "Coming soon" traducido | `photos.html` |
| General: menú desplaza a su sección | `site-header.html` + `app.config.ts` + `scroll-margin-top` |
| General: móvil desde 360 px | CSS de cada componente + `clamp()` en `styles.css` |
| General: todo accesible por teclado | Elementos nativos (`a`, `select`, `input`, `textarea`, `button`) + foco visible en `styles.css` |

## Estrategia de tests

**Automáticos (Vitest)**

- `language.service.spec.ts`:
  - Si `localStorage` tiene `es`, arranca en `es`.
  - Si no hay valor guardado, con navegador `es-MX` arranca en `es`, con `pt-PT` en `pt-BR` y con `fr-FR` en `en`.
  - `setLang('pt-BR')` guarda el valor en `localStorage` y pone `<html lang="pt-BR">`.
  - Un valor guardado no válido (`de`) se ignora.
  - Si `localStorage` lanza un error, el servicio funciona igual.
- `contact-form.spec.ts`:
  - Hay tres campos con su `<label>`.
  - Enviar vacío muestra tres errores y no muestra el aviso.
  - Un email no válido muestra un error en el campo email.
  - Nombre de 101 caracteres, email de 255 y mensaje de 9 o de 2001 muestran el error de límite.
  - Un nombre con solo espacios da error.
  - Un envío válido muestra el aviso con el enlace a LinkedIn y los campos conservan su valor.
  - Al cambiar a `es`, los errores visibles aparecen en español.
- `site-header.spec.ts`: el selector tiene tres opciones (English, Español, Português (Brasil)), cambiarlo llama a `setLang` y los enlaces apuntan a `#about`, `#stack` y `#contact`.
- `about-me.spec.ts`: muestra nombre, rol por idioma y la foto con `alt` traducido. Hay tres enlaces de redes con `target="_blank"` y `rel="noopener noreferrer"`.
- `stack.spec.ts`: muestra tres elementos, .NET, Angular y SQL, cada uno con su imagen.
- `photos.spec.ts`: muestra "Coming soon" en `en`, "Próximamente" en `es` y "Em breve" en `pt-BR`.
- `landing.spec.ts`: el `<h1>` dice "Rodrigo Holme" y el rol cambia con el idioma.
- `app.spec.ts`: `/` muestra `app-landing` y `/cualquier/cosa` redirige a `/`.

**Manuales** (jsdom no calcula estilos, scroll ni fuentes)

1. Comprobar que el aspecto coincide con `DESIGN.md`: fondo negro, Inter cargada, botón violeta y tamaños de título.
2. Pulsar About Me, Stack y Contact: la página se desplaza y la cabecera no tapa el título.
3. Cambiar de idioma, recargar la página y comprobar que se mantiene. Borrar `localStorage` y probar con el navegador en español.
4. Abrir DevTools a 360 px: no hay scroll horizontal y la cabecera aparece en dos filas.
5. Recorrer la página solo con Tab, Enter y flechas: se llega a todo y el foco siempre es visible.
6. Probar con un lector de pantalla, por ejemplo Narrador en Windows: se anuncian los errores, el aviso y el idioma de la página.

**Al terminar:** `npm test` y `npm run build` en verde (Artículo II).

## Riesgos y mitigaciones

- **Contenido pendiente** (foto, textos de presentación y URLs de redes): se usan textos provisionales marcados con `TODO` y una foto de relleno. Así no se bloquea la implementación, pero hay que sustituirlos antes de publicar.
- **SEO de un solo idioma:** Google indexará el HTML inicial en inglés. Se acepta en el ADR 0002. Si en el futuro importa, se puede migrar a `@angular/localize`.
- **Presupuesto de estilos** (4 kB de aviso por componente): cada componente tiene poco CSS y los tokens van en `styles.css`, que es global y no cuenta en ese límite.
- **Logos de marca:** .NET, Angular, LinkedIn, GitHub e Instagram son marcas registradas. Se usan tal cual, sin modificarlos, solo para identificar la tecnología o el perfil, que es un uso permitido por sus guías de marca.
- **Fragmentos con router y `<base href>`:** con `routerLink` y `fragment`, los enlaces funcionan aunque la URL actual tenga otra ruta.
- **Feature de Firebase futura:** el aviso de "aún no activo" se reemplazará por el envío real. Esa feature tendrá que añadir un `ContactService` (Artículo III), los estados "Enviando...", confirmación y error, y el anti-spam que se sacaron de esta spec.

## ADRs relacionados

- [0002 - i18n con servicio propio y signals](../../docs/decisions/0002-i18n-servicio-propio-con-signals.md)
- La tipografía no tiene ADR: está documentada en [DESIGN.md](../../docs/design/DESIGN.md), en la sección "Tokens — Typography".
