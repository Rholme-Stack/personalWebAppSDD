# Plan técnico: 001-under-construction

**Spec:** [spec.md](./spec.md)
**Estado:** Aprobado
**Fecha:** 2026-10-06

## Resumen técnico

Se crea un componente standalone `UnderConstruction` que muestra el nombre y el aviso bilingüe, y una ruta comodín (`**`) que lo carga para cualquier dirección. Se elimina la página de ejemplo que genera Angular, se ponen el fondo negro y el texto blanco con CSS, y se cambia el título de la pestaña en `index.html`. No se añade ninguna dependencia.

## Contexto técnico

- **Framework:** Angular 22 (standalone)
- **Lenguaje:** TypeScript 6
- **Tests:** Vitest con `TestBed` y `RouterTestingHarness`
- **Dependencias nuevas:** ninguna
- **Backend / APIs:** ninguno

### Estado actual del código

- `src/app/app.html`: contiene la página de ejemplo de Angular (logo, enlaces, estilos) y un `<router-outlet />`.
- `src/app/app.ts`: tiene un signal `title` que solo usa la página de ejemplo.
- `src/app/app.routes.ts`: sin rutas.
- `src/app/app.spec.ts`: comprueba el texto "Hello, personal-web-app" de la página de ejemplo.
- `src/index.html`: `lang="en"` y `<title>PersonalWebApp</title>`.
- `src/styles.css`: vacío.

## Check de constitución

- [x] **I. Spec primero:** la spec está aprobada y las clarificaciones están registradas.
- [x] **II. Calidad y tests:** los criterios que se pueden comprobar en tests (texto, idiomas, rutas) se cubren con Vitest. Los visuales (colores, centrado, móvil) se comprueban a mano; ver "Estrategia de tests".
- [x] **III. Arquitectura:** componente standalone en su propia carpeta de feature (`src/app/under-construction/`). No hay estado, así que no hacen falta signals; se elimina el signal `title`, que ya no se usa. No hay HTTP.
- [x] **IV. Simplicidad:** sin dependencias nuevas ni ADR. Contenido estático sin servicios ni modelos. Sin lazy loading: es la única página y no aporta nada.
- [x] **V. Seguridad:** no hay entrada de usuario, secretos ni sesión.
- [x] **VI. Accesibilidad y UX:**
  - Blanco sobre negro da un contraste de 21:1, el máximo posible.
  - El nombre va en un `<h1>`.
  - El texto en español lleva `lang="es"` para que los lectores de pantalla lo pronuncien bien.
  - El tamaño de letra se adapta al ancho de la pantalla, con un mínimo pensado para 360 px.

## Arquitectura

```
Cualquier URL ──> Router (ruta '**') ──> <router-outlet> en App ──> UnderConstruction
```

- **`App`** (raíz): solo contiene `<router-outlet />`.
- **`UnderConstruction`**: plantilla estática con el título y los dos avisos. Sus propios estilos lo centran.
- **Estilos globales** (`styles.css`): fondo negro, texto blanco y `margin: 0` en `body`, para que el negro cubra toda la ventana y no quede ningún borde blanco.

Estructura HTML del componente:

```html
<main>
  <h1>Rodrigo Holme Web</h1>
  <p>Page under construction</p>
  <p lang="es">Página en construcción</p>
</main>
```

## Archivos afectados

| Acción    | Archivo                                                  | Cambio |
| --------- | -------------------------------------------------------- | ------ |
| Crear     | `src/app/under-construction/under-construction.ts`      | Componente standalone `UnderConstruction` (selector `app-under-construction`). |
| Crear     | `src/app/under-construction/under-construction.html`    | Plantilla con `<main>`, `<h1>` y los dos `<p>`. |
| Crear     | `src/app/under-construction/under-construction.css`     | `:host` con altura mínima de toda la pantalla (`100dvh`), flexbox centrado, `text-align: center`, `padding`, tamaños de letra con `clamp()` y `overflow-wrap: anywhere`. |
| Crear     | `src/app/under-construction/under-construction.spec.ts` | Tests del componente. |
| Modificar | `src/app/app.routes.ts`                                  | Ruta `{ path: '**', component: UnderConstruction }`. |
| Modificar | `src/app/app.html`                                       | Borrar la página de ejemplo y dejar solo `<router-outlet />`. |
| Modificar | `src/app/app.ts`                                         | Quitar el signal `title` y el import de `signal`. |
| Modificar | `src/app/app.spec.ts`                                    | Borrar el test "should render title" y añadir tests de rutas. |
| Modificar | `src/styles.css`                                         | `body { margin: 0; background: #000; color: #fff; }` |
| Modificar | `src/index.html`                                         | `<title>Rodrigo Holme Web</title>`. `lang="en"` se mantiene, porque el texto principal va primero en inglés. |

## Mapeo spec → implementación

| Criterio de aceptación (HU-1)                      | Dónde se implementa |
| -------------------------------------------------- | ------------------- |
| Título "Rodrigo Holme Web"                          | `under-construction.html` (`<h1>`) |
| Aviso en inglés y debajo en español                 | `under-construction.html` (dos `<p>`, en ese orden) |
| Fondo negro, texto blanco, centrado                 | `styles.css` (colores) y `under-construction.css` (centrado) |
| Se ve bien en móvil desde 360 px                    | `under-construction.css` (`clamp()`, `overflow-wrap`, `padding`). El `meta viewport` ya existe en `index.html`. |
| Título de la pestaña "Rodrigo Holme Web"            | `index.html` (`<title>`) |
| Cualquier dirección muestra esta página             | `app.routes.ts` (ruta `**`) |

## Estrategia de tests

**Automáticos (Vitest)**

- `under-construction.spec.ts`:
  - El `<h1>` contiene "Rodrigo Holme Web".
  - Hay un párrafo con "Page under construction" y otro con "Página en construcción", en ese orden.
  - El párrafo en español tiene `lang="es"`.
- `app.spec.ts` (con `RouterTestingHarness`):
  - Al navegar a `/` se muestra `app-under-construction`.
  - Al navegar a una ruta inventada (`/cualquier/cosa`) también se muestra `app-under-construction`.

**Manuales** (jsdom, el entorno de los tests, no calcula colores ni posiciones)

1. `npm start` y abrir `http://localhost:4200`: fondo negro, texto blanco centrado y la pestaña dice "Rodrigo Holme Web".
2. Abrir `http://localhost:4200/lo-que-sea`: se ve la misma página.
3. DevTools en modo móvil a 360 px de ancho: no hay scroll horizontal y el texto se ve completo.

**Al terminar:** `npm test` y `npm run build` en verde (Artículo II).

## Riesgos y mitigaciones

- **El presupuesto de estilos por componente** (4 kB de aviso en `angular.json`) no corre riesgo: el CSS del componente ocupará muy poco.
- **Al borrar la página de ejemplo, falla el test actual** "should render title". Se sustituye en la misma tarea, para que `npm test` no quede en rojo entre tareas.
- **La ruta `**` capturará cualquier dirección.** Cuando se añadan más páginas, habrá que ponerlas *antes* de la ruta comodín o quitarla. Se anota para la siguiente feature.

## ADRs relacionados

Ninguno: no hay dependencias nuevas ni decisiones de arquitectura que justificar.
