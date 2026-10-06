# Constitución del proyecto

> Reglas inmutables. Todo `plan.md` debe verificar que las cumple.
> Los ejemplos son un punto de partida: edítalos, bórralos o añade los tuyos.
> Una vez acordadas, solo se cambian mediante el proceso de enmienda (al final).

**Versión:** 1.0.0 · **Ratificada:** <!-- AAAA-MM-DD --> · **Última enmienda:** <!-- AAAA-MM-DD -->

---

## Artículo I: Spec primero

- Ninguna línea de código de producto sin una `spec.md` y una `tasks.md` aprobadas.
- La spec describe comportamiento observable por el usuario, nunca detalles de implementación.

## Artículo II: Calidad y tests

- Toda lógica de negocio (servicios, guards, utilidades) tiene tests en Vitest.
- Cada criterio de aceptación de la spec tiene al menos un test que lo cubre.
- `npm test` y `npm run build` deben pasar antes de dar una tarea por terminada.
<!-- Ejemplo opcional: cobertura mínima del 80 % en servicios. -->

## Artículo III: Arquitectura

- Solo componentes **standalone**; no se crean `NgModule`.
- Estado local y derivado con **signals**; RxJS solo para flujos asíncronos (HTTP, eventos).
- Organización por feature: `src/app/<feature>/` con sus componentes, servicios y modelos.
- Los componentes no llaman a HTTP directamente: lo hacen a través de servicios.
<!-- Añade aquí convenciones de nombres, routing lazy, etc. -->

## Artículo IV: Simplicidad

- No añadir dependencias nuevas sin un ADR en `docs/decisions/`.
- No crear abstracciones "por si acaso": se resuelve el problema de la spec actual.

## Artículo V: Seguridad

- Nunca guardar secretos (API keys, contraseñas) en el repositorio.
- Toda entrada del usuario se valida.
- Los tokens de sesión no se guardan en `localStorage`. <!-- ajusta según tu decisión de auth -->

## Artículo VI: Accesibilidad y UX

- Todo elemento interactivo es accesible por teclado y tiene nombre accesible.
- La interfaz funciona en móvil (desde 360 px de ancho).

---

## Proceso de enmienda

1. Proponer el cambio con un ADR en `docs/decisions/` explicando el motivo.
2. Actualizar este archivo y subir la versión (mayor: se elimina o cambia una regla; menor: se añade una regla; parche: redacción).
3. Revisar los `plan.md` de las features en curso por si quedan afectados.
