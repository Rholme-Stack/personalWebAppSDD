# 0004 - Generar el busto en local con Python

**Estado:** Aceptado
**Fecha:** 2026-11-07

## Contexto

La feature 003 necesita la forma 3D del busto de Rodrigo a partir de dos fuentes:

- **8 fotos:** una vuelta completa de cintura para arriba, con la cámara quieta y Rodrigo girando.
- **Un vídeo selfie de 60 s:** la cabeza vista desde todos los lados.

Las condiciones son estas:

- **Privacidad:** las fotos y el vídeo muestran su cara y su casa. No deben subirse a servicios de terceros ni al repositorio.
- **Equipo:** un portátil con i5-8250U, 8 GB de RAM y una NVIDIA MX130 de 2 GB. Los modelos de IA que generan 3D a partir de imágenes necesitan 16 GB de gráfica o más.
- **Requisito de la spec:** que se reconozca la silueta (cabeza, pelo, perfil y hombros), no los rasgos finos de la cara.
- **Frecuencia:** el resultado se genera una vez y se publica como archivo estático. No es parte del build ni de la app.

## Decisión

Generar el busto **en local, con scripts de Python en `tools/bust/`** ejecutados con `uv`, que crea un entorno aislado con versiones fijadas en `uv.lock`. Las dependencias son estas:

- **`opencv-contrib-python` (la variante que ya exige MediaPipe):** leer el vídeo, elegir fotogramas nítidos y procesar imágenes.
- **`mediapipe`:** recortar la persona y la cabeza (*Image Segmenter*) y sacar los puntos 3D de la cara (*Face Landmarker*). Modelos ligeros que funcionan en CPU.
- **`numpy`:** rejilla de vóxeles, tallado por siluetas (*visual hull*) y muestreo de la superficie.
- **`pycolmap`:** posición de la cámara respecto a la cabeza en el vídeo (*structure from motion*), en CPU.

**Método:**

1. **Hombros:** silueta 3D tallada a partir de las 8 fotos.
2. **Cabeza:** tallada a partir de los fotogramas del vídeo, si `pycolmap` los registra. Si no, se usa la de las fotos.
3. **Cara:** la forma de la zona y su densidad de nodos salen de los puntos faciales.

La salida es `public/constellation/bust.bin`, más unas vistas previas en PNG para revisarla. Las fotos, el vídeo y los archivos intermedios se quedan en una carpeta de trabajo fuera del repositorio.

## Alternativas consideradas

- **Servicio online (apps de escaneo 3D o IA de imagen a 3D):**
  - Ventajas: menos trabajo y, posiblemente, más detalle.
  - Se descarta porque la cara y la casa de Rodrigo quedarían en manos de un tercero, que puede guardarlas o usarlas según sus condiciones. Rodrigo eligió la opción local (2026-11-07).
- **IA de imagen a 3D en local** (TRELLIS, Hunyuan3D…):
  - Ventajas: buen resultado con pocas fotos.
  - Se descarta porque necesita una gráfica de 16 GB o más, y la del portátil tiene 2 GB.
- **Fotogrametría densa** (Meshroom, COLMAP MVS):
  - Ventajas: superficie detallada.
  - Se descarta porque la reconstrucción densa necesita CUDA y más memoria gráfica. Además, el vídeo es un selfie: el cuerpo se mueve con el brazo y la escena no es rígida.
- **Herramientas en Node.js**, el mismo lenguaje que el proyecto:
  - Ventajas: no habría que instalar Python.
  - Se descarta porque no hay librerías maduras de segmentación ni de *structure from motion* para Node.

## Consecuencias

- **Positivas:**
  - Nada sale del equipo de Rodrigo.
  - Funciona en CPU.
  - Las herramientas no afectan al build ni a la app.
  - El resultado se puede reproducir con `uv.lock` y regenerar si cambian las fotos.
- **Negativas / costes:**
  - Hay que tener `uv` (que ya está instalado) para regenerar el busto.
  - El tallado por siluetas da una "escultura suave". Las concavidades solo aparecen en la cara, gracias a los puntos faciales.
  - El paso del vídeo puede fallar por ser un selfie. En ese caso la cabeza sale de las 8 fotos, con menos detalle arriba.
  - MediaPipe descarga sus modelos de Google la primera vez, pero no envía las imágenes.
  - Las herramientas no tienen tests en Vitest. Se verifican con las vistas previas.
