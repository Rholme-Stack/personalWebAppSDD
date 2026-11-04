# Spec: 002-landing-personal

**Estado:** Aprobada
**Fecha:** 2026-10-31

## Resumen

Página principal de la web personal de Rodrigo Holme, que sustituye a la página "en construcción" (001). Presenta quién es, su stack tecnológico y un formulario de contacto que, de momento, valida lo que escribe el visitante pero todavía no envía mensajes. Está disponible en inglés, español de España y portugués de Brasil.

## Usuarios

- **Visitante:** cualquier persona que entra en la web (por ejemplo, reclutadores o posibles clientes), sin registrarse. Puede hablar inglés, español o portugués.

## Historias de usuario

### HU-1: Saber quién es Rodrigo

**Como** visitante **quiero** ver quién es Rodrigo y a qué se dedica **para** saber de quién es la web.

**Criterios de aceptación:**

- **Dado** que un visitante entra en la web, **cuando** la página termina de cargar, **entonces** ve el nombre "Rodrigo Holme" y el rol traducido al idioma activo: "Developer" (inglés), "Desarrollador" (español) o "Desenvolvedor" (portugués).
- **Dado** que un visitante está en la página, **cuando** llega a la sección "About Me", **entonces** ve una foto de Rodrigo, su nombre, su rol y un texto corto de presentación en el idioma activo.
- **Dado** que la foto se muestra, **cuando** un lector de pantalla la anuncia, **entonces** tiene una descripción textual (por ejemplo, "Ilustración de Rodrigo Holme") en el idioma activo.
- **Dado** que un visitante está en la sección "About Me", **cuando** pulsa el icono de LinkedIn, GitHub o Instagram, **entonces** se abre el perfil correspondiente de Rodrigo en una pestaña nueva.
- **Dado** que un visitante tiene la web abierta, **cuando** mira la pestaña del navegador, **entonces** ve el título "Rodrigo Holme".

### HU-2: Conocer su stack

**Como** visitante **quiero** ver con qué tecnologías trabaja Rodrigo **para** saber si encaja con lo que busco.

**Criterios de aceptación:**

- **Dado** que un visitante está en la página, **cuando** llega a la sección "Stack", **entonces** ve .NET, Angular y SQL, cada uno con su nombre y su logo.

### HU-3: Contactar con Rodrigo

**Como** visitante **quiero** enviar un mensaje a Rodrigo desde la web **para** contactarle sin buscar su email.

> En esta feature el formulario todavía no envía mensajes: valida los datos y avisa de que aún no está activo. El envío real se hará en una feature posterior.

**Criterios de aceptación:**

- **Dado** que un visitante está en la página, **cuando** llega a la sección de contacto, **entonces** ve un formulario con los campos nombre, email y mensaje, todos obligatorios.
- **Dado** que un visitante deja un campo vacío, **cuando** intenta enviar, **entonces** el formulario no se envía y ve un mensaje de error junto a ese campo.
- **Dado** que un visitante escribe un email con formato no válido, **cuando** intenta enviar, **entonces** el formulario no se envía y ve un mensaje de error junto al campo email.
- **Dado** que un visitante escribe un nombre de más de 100 caracteres, un email de más de 254 caracteres o un mensaje de menos de 10 o más de 2000 caracteres, **cuando** intenta enviar, **entonces** el formulario no se envía y ve un mensaje de error junto a ese campo indicando el límite.
- **Dado** que un visitante ha rellenado bien el formulario, **cuando** pulsa enviar, **entonces** ve, en el idioma activo, un aviso de que el formulario aún no está activo y una invitación a contactar por LinkedIn, con un enlace a su perfil.
- **Dado** que un visitante ve ese aviso, **cuando** lo lee, **entonces** lo que había escrito en el formulario sigue ahí, sin borrarse.
- **Dado** que un visitante pulsa "Contact" en la parte superior, **cuando** lo hace, **entonces** la página le lleva a la sección del formulario.

### HU-4: Ver la web en su idioma

**Como** visitante **quiero** elegir entre inglés, español y portugués **para** leer la web en el idioma que mejor entiendo.

**Criterios de aceptación:**

- **Dado** que un visitante está en la página, **cuando** mira la parte superior, **entonces** ve un selector con tres idiomas: English, Español y Português (Brasil).
- **Dado** que un visitante elige un idioma en el selector, **cuando** lo selecciona, **entonces** todos los textos de la página (incluidos los mensajes del formulario) se muestran en ese idioma.
- **Dado** que un visitante entra por primera vez, **cuando** la página carga, **entonces** se muestra en el idioma de su navegador si es uno de los tres; si no, en inglés.
- **Dado** que un visitante eligió un idioma, **cuando** vuelve a la web más tarde desde el mismo navegador, **entonces** la ve en el idioma que eligió, aunque su navegador esté en otro idioma.

### HU-5: Ver la sección de fotos

**Como** visitante **quiero** ver que habrá una sección de fotos **para** saber que la web seguirá creciendo.

**Criterios de aceptación:**

- **Dado** que un visitante está en la página, **cuando** llega a la sección de fotos, **entonces** ve el mensaje "Coming soon" en el idioma activo.

### Criterios generales

- **Dado** que un visitante está en la página, **cuando** pulsa "About Me" o "Stack" en el menú superior, **entonces** la página se desplaza hasta esa sección (toda la web es una sola página).
- **Dado** que un visitante abre la web en un móvil (desde 360 px de ancho), **cuando** la página carga, **entonces** todo el contenido se ve completo, sin scroll horizontal.
- **Dado** que un visitante usa solo el teclado, **cuando** navega por la página, **entonces** puede llegar a los enlaces, al selector de idioma y a todos los campos y el botón del formulario.

## Fuera de alcance

- Carrusel con imágenes de Instagram (se hará en una feature posterior).
- Proyectos, blog, CV descargable o login.
- Envío y almacenamiento real de los mensajes del formulario, con su confirmación, error de envío, estado "Enviando..." y protección anti-spam (se hará en una feature posterior).
- Respuesta automática por email al visitante.
- Idiomas distintos de los tres indicados.

## Clarificaciones

### Sesión 2026-10-31

- **P:** ¿Qué campos tiene el formulario? → **R:** Nombre, email y mensaje, todos obligatorios.
- **P:** ¿En qué idioma está la web? → **R:** Inglés, español de España y portugués de Brasil, con un selector arriba.
- **P:** ¿Sustituye a la página en construcción (001)? → **R:** Sí, la reemplaza.
- **P:** ¿Qué ve el visitante tras enviar? → **R:** Confirmación si funciona; error si falla, sin perder lo escrito.
- **P:** ¿Cómo se ve la sección de fotos? → **R:** Con el mensaje "Coming soon" hasta que se añadan las imágenes.
- **P:** ¿En qué idioma arranca la web y se recuerda la elección? → **R:** En el idioma del navegador si es uno de los tres; si no, en inglés. La elección del visitante se recuerda al volver.
- **P:** ¿Qué muestra la sección About Me? → **R:** Foto, nombre, rol y un texto corto de presentación.
- **P:** ¿Hay enlaces a redes? → **R:** Sí: LinkedIn, GitHub e Instagram, en pestaña nueva.
- **P:** ¿Qué límites y protección tiene el formulario? → **R:** Nombre máx. 100, email máx. 254, mensaje entre 10 y 2000 caracteres; anti-spam invisible, sin captcha.
- **P:** ¿El rol se traduce? → **R:** Sí: Developer / Desarrollador / Desenvolvedor.
- **P:** ¿Qué hacen los enlaces del menú? → **R:** Desplazan a su sección; la web es una sola página.
- **P:** ¿Qué pasa mientras se envía el formulario? → **R:** El botón se bloquea y muestra "Enviando...".
- **P:** ¿Cómo se muestra el stack? → **R:** Nombre y logo de cada tecnología.

### Sesión 2026-10-31 (revisión)

- **P:** ¿El formulario envía los mensajes en esta feature? → **R:** No. De momento no envía nada; el envío real llegará en una feature posterior. Sustituye a las respuestas anteriores sobre confirmación, error de envío, "Enviando..." y anti-spam.
- **P:** ¿Qué ve el visitante al enviar un formulario válido? → **R:** Un aviso de que el formulario aún no está activo, con una invitación y un enlace a LinkedIn. Lo escrito no se borra.
- **P:** ¿Cómo se describe la imagen para lectores de pantalla? → **R:** Es una ilustración, no una foto: "Ilustración de Rodrigo Holme" (traducido al idioma activo).

### Contenido (no bloquea el plan; sí la publicación)

- [x] Imagen de Rodrigo: ilustración entregada el 2026-10-31.
- [x] Texto de presentación en inglés, español y portugués de Brasil: ver `about.bio` en [data-model.md](./data-model.md).
- [x] LinkedIn: https://www.linkedin.com/in/rodrigo-holme
- [x] GitHub: https://github.com/Rholme-Stack
- [ ] Instagram: falta la URL del perfil (la recibida, `https://www.instagram.com/p/CPoOGHKsu8z/`, es de una publicación, no del perfil).
