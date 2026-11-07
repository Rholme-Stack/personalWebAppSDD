# Spec: 003-constelacion

**Estado:** Aprobada
**Fecha:** 2026-11-07

## Resumen

Imagen principal de la web: una constelación de partículas de colores que forma, en 3D, el busto de Rodrigo Holme (cabeza, cuello y hombros), obtenido a partir de sus fotos y de un vídeo. Está fija detrás de toda la página: en ordenador gira siguiendo el ratón y, a medida que el visitante baja, explota y se expande poco a poco hasta deshacerse al final de la página. Da a la web una identidad visual propia y una primera impresión memorable sin estorbar la lectura.

## Usuarios

- **Visitante:** cualquier persona que entra en la web, sin registrarse, desde ordenador o móvil.

## Historias de usuario

### HU-1: Ver el busto de Rodrigo en 3D

**Como** visitante **quiero** ver al entrar una figura de partículas que reconozco como el busto de Rodrigo **para** tener una primera impresión visual de él y de la web.

**Criterios de aceptación:**

- **Dado** que un visitante entra en la web, **cuando** la página carga y está arriba del todo, **entonces** ve detrás del contenido una constelación de partículas de colores que forma un busto humano: cabeza, cuello y hombros, sin brazos ni cuerpo por debajo del pecho.
- **Dado** que el visitante mira el busto, **cuando** lo ve de frente o de perfil, **entonces** reconoce la silueta de Rodrigo: la forma de su cabeza, su pelo, su perfil y sus hombros. No hace falta reconocer los rasgos finos de la cara.
- **Dado** que el busto gira, **cuando** el visitante lo mira, **entonces** percibe que es una figura con volumen y no una imagen plana: las partes cercanas se distinguen de las lejanas.
- **Dado** que el busto está compuesto, **cuando** el visitante lo mira sin mover nada, **entonces** las partículas titilan y se mueven ligeramente sin deshacer la forma, y alrededor flotan algunas partículas sueltas.
- **Dado** que el busto se genera a partir de las fotos y el vídeo de Rodrigo, **cuando** el visitante usa la web, **entonces** solo ve la constelación: el fondo de las fotos y del vídeo no forma parte del busto, y las fotos y el vídeo originales no se muestran ni pueden descargarse desde la web.
- **Dado** que un visitante está en un ordenador, **cuando** ve la portada, **entonces** el busto aparece en la mitad derecha, junto al nombre y el rol; **dado** que está en un móvil, **entonces** aparece centrado detrás del texto y más tenue, de forma que el texto se lee bien.

### HU-2: Girar el busto con el ratón

**Como** visitante en un ordenador **quiero** que el busto gire cuando muevo el ratón en horizontal **para** verlo desde distintos ángulos y apreciar que es 3D.

**Criterios de aceptación:**

- **Dado** que el ratón está en el centro horizontal de la ventana, **cuando** el visitante mira el busto, **entonces** lo ve de frente.
- **Dado** que el visitante mueve el ratón hacia un lado, sin hacer clic, **cuando** lo desplaza, **entonces** la cara del busto gira hacia ese lado de forma progresiva, hasta verse de perfil cuando el ratón llega al borde de la ventana.
- **Dado** que el visitante mueve el ratón, **cuando** el busto gira, **entonces** el giro es suave, sin saltos, aunque el ratón se mueva de golpe.
- **Dado** que el visitante mueve el ratón solo en vertical, **cuando** lo desplaza, **entonces** el busto no gira.
- **Dado** que el ratón sale de la ventana, **cuando** pasa un momento, **entonces** el busto vuelve suavemente a verse de frente.
- **Dado** que el busto está parcialmente explotado por el scroll, **cuando** el visitante mueve el ratón, **entonces** la nube de partículas gira igual, como un todo.
- **Dado** que el busto está detrás del contenido, **cuando** el visitante pulsa un enlace, un botón, un campo del formulario o selecciona texto que está encima, **entonces** funciona igual que si el busto no estuviera.

### HU-3: Ver el busto girar en el móvil

**Como** visitante en un móvil o tableta sin ratón **quiero** ver el busto girar solo **para** apreciar que es 3D aunque no tenga ratón.

**Criterios de aceptación:**

- **Dado** que un visitante usa un dispositivo sin ratón, **cuando** ve el busto, **entonces** el busto gira solo sobre sí mismo, despacio y sin parar, dando vueltas completas.
- **Dado** que un visitante usa un dispositivo sin ratón, **cuando** toca o desliza el dedo por la página, **entonces** el scroll funciona con normalidad y el giro del busto no cambia.

### HU-4: Ver la constelación explotar con el scroll

**Como** visitante **quiero** que, al bajar por la página, la constelación explote y se expanda poco a poco **para** sentir que la web reacciona a mi recorrido y que la figura no tape el contenido que voy leyendo.

**Criterios de aceptación:**

- **Dado** que el visitante está arriba del todo, **cuando** mira la constelación, **entonces** el busto está completo.
- **Dado** que el visitante baja por la página, **cuando** hace scroll, **entonces** las partículas se separan del busto y se alejan en todas direcciones, también hacia él y hacia el fondo, en proporción a lo que ha recorrido de la página: a mitad de la página la explosión va por la mitad.
- **Dado** que el visitante llega al final de la página, **cuando** ya no puede bajar más, **entonces** la explosión está completa: las partículas están repartidas por toda la pantalla con todo su brillo y ya no se reconoce el busto.
- **Dado** que el visitante sube, **cuando** hace scroll hacia arriba, **entonces** la constelación se recompone en la misma medida: una misma posición en la página muestra siempre el mismo estado de la explosión.
- **Dado** que el visitante salta a otra sección (por ejemplo, pulsando "Contact" en el menú), **cuando** la página llega a esa posición, **entonces** la constelación muestra el estado que corresponde a esa posición.
- **Dado** que cambia la altura de la página o el tamaño de la ventana (por ejemplo, al cambiar de idioma o girar el móvil), **cuando** el visitante sigue haciendo scroll, **entonces** la explosión se sigue repartiendo entre el principio y el final de la página.
- **Dado** cualquier posición del scroll, **cuando** el visitante lee la página, **entonces** la constelación queda siempre detrás del contenido y el texto se lee sin dificultad.

### Criterios generales

- **Dado** que el visitante tiene activada la preferencia de "reducir movimiento" en su sistema, **cuando** entra en la web, **entonces** ve el busto completo, quieto y de frente: no titila, no gira (ni con el ratón ni solo) y, al bajar, se desvanece poco a poco en lugar de explotar.
- **Dado** que un visitante usa un lector de pantalla o el teclado, **cuando** recorre la página, **entonces** la constelación no se anuncia ni recibe el foco, porque es decorativa.
- **Dado** que el navegador del visitante no puede mostrar la constelación, **cuando** entra en la web, **entonces** ve la página completa sobre fondo negro, sin la constelación y sin mensajes de error.
- **Dado** que un visitante entra en la web, **cuando** la página carga, **entonces** el contenido aparece sin esperar a la constelación, y la constelación aparece después de forma suave.
- **Dado** que un visitante usa un móvil de gama media, **cuando** hace scroll o el busto gira, **entonces** la página y la animación se mueven con fluidez, sin tirones visibles.
- **Dado** que un visitante abre la web en un móvil (desde 360 px de ancho), **cuando** la página carga, **entonces** la constelación no provoca scroll horizontal.

## Fuera de alcance

- Otras figuras (como el corredor que describía antes `DESIGN.md`) o poder cambiar de figura.
- Que se reconozcan los rasgos finos de la cara de Rodrigo.
- Girar el busto arrastrando, con el dedo, con el teclado o inclinando el móvil.
- Que el movimiento vertical del ratón gire o incline el busto.
- Cambios en los textos o en las secciones de la página.
- Una sesión de fotos nueva o más completa.

## Clarificaciones

### Sesión 2026-11-07

- **P:** ¿Qué figura forma la constelación? → **R:** El busto de Rodrigo (cabeza, cuello y hombros) en 3D, generado a partir de sus fotos y de un vídeo. Sustituye al corredor que describía `DESIGN.md`.
- **P:** ¿Cómo gira en ordenador? → **R:** Sigue la posición horizontal del ratón, sin clic: con el ratón en el centro se ve de frente y en los bordes de perfil (±90°).
- **P:** ¿Qué hace en el móvil, donde no hay ratón? → **R:** Gira solo, despacio y sin parar.
- **P:** ¿Cuánto se tiene que parecer a Rodrigo? → **R:** Su silueta: forma de la cabeza, pelo, perfil y hombros. La cara se intuye, sin detalle fino.
- **P:** ¿De qué color son las partículas? → **R:** Paleta multicolor de la marca (violeta, menta, verde azulado, magenta y azul); las cercanas brillan más que las lejanas.
- **P:** ¿Cómo explota con el scroll? → **R:** Poco a poco, en proporción al recorrido total de la página, y completa al llegar al final. Sigue el scroll en los dos sentidos.
- **P:** ¿Se puede cambiar el tamaño de las partículas respecto a `DESIGN.md`? → **R:** Sí, si hace falta para que se note el 3D y se reconozca el busto.
- **P:** ¿Cómo quedan las partículas al final de la explosión? → **R:** Repartidas por toda la pantalla con todo su brillo, no tenues. El texto tiene que seguir leyéndose bien encima de ellas.
- **P:** ¿El giro en el móvil es de vuelta completa? → **R:** Sí, 360° sin parar, así que a ratos se ve de espaldas.
- **P:** ¿Qué hace el busto cuando el ratón sale de la ventana? → **R:** Vuelve suavemente a verse de frente.
- **P:** ¿Dónde se coloca el busto? → **R:** En ordenador, en la mitad derecha de la portada; en el móvil, centrado detrás del texto y más tenue.
- **P:** ¿Qué ve quien tiene activado "reducir movimiento"? → **R:** El busto completo, quieto y de frente, que se desvanece con el scroll en lugar de explotar.

### Contenido (no bloquea el plan; sí la publicación)

- [x] Fotos de Rodrigo: 8 fotos de cintura para arriba, dando una vuelta completa (unos 45° entre cada una), entregadas el 2026-11-07. Sirven sobre todo para la forma de los hombros.
- [x] Vídeo selfie de Rodrigo: 60 s, cabeza y cuello vistos desde todos los lados (frente, perfiles, nuca, arriba y barbilla), entregado el 2026-11-07. Sirve sobre todo para la forma de la cabeza. Los hombros casi no aparecen.
- Las fotos y el vídeo son solo material de partida: no se suben al repositorio ni se publican.
- [x] Forma 3D del busto obtenida a partir de las fotos y el vídeo con `tools/bust/` (8.142 nodos), aprobada por Rodrigo el 2026-11-07.
