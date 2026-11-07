# Busto de la constelación (`tools/bust`)

Genera `public/constellation/bust.bin`, los ~8.000 nodos del busto 3D de la constelación (feature [003](../../specs/003-constelacion/spec.md)), a partir de las fotos y el vídeo de Rodrigo. Se ejecuta **en local y una sola vez**: la web solo usa el archivo resultante. El porqué está en el [ADR 0004](../../docs/decisions/0004-generar-busto-en-local-con-python.md).

> **Las fotos y el vídeo nunca se copian al repositorio ni se suben a ningún sitio.** El script los lee desde su carpeta y deja los archivos intermedios en una carpeta de trabajo fuera del repo. Lo único que se publica es `bust.bin`, que solo contiene coordenadas.

## Qué necesitas

- [`uv`](https://docs.astral.sh/uv/). Él mismo descarga Python 3.12 y las dependencias de `uv.lock`.
- **Las 8 fotos**: de cintura para arriba, cámara quieta y tú girando unos 45° entre foto y foto. La última foto, por orden de nombre, es la de frente.
- **El vídeo selfie** de la cabeza, vista desde todos los lados.

No hace falta tarjeta gráfica: todo funciona en la CPU.

## Cómo se ejecuta

Desde esta carpeta (`tools/bust`):

```bash
uv run build.py --photos "C:\Users\r9lon\OneDrive\Fotos\Project" --video "C:\Users\r9lon\OneDrive\Fotos\Project\20261107_160824.mp4"
```

| Argumento | Para qué | Por defecto |
| --------- | -------- | ----------- |
| `--photos` | Carpeta con las 8 fotos (`.jpg`). | (obligatorio) |
| `--video` | Vídeo selfie (`.mp4`). | (obligatorio) |
| `--work` | Carpeta de trabajo para los archivos intermedios. | `%TEMP%\bust-work` |
| `--out` | Archivo de salida. | `public/constellation/bust.bin` |
| `--from-stage` | Empieza en esta etapa y reutiliza lo que dejaron las anteriores. | `frames` |

La primera vez, MediaPipe descarga sus modelos (solo los modelos: las imágenes no salen del equipo). En un portátil normal tarda unos 30 minutos; la mitad es la etapa `video_head`.

## Etapas

| Etapa | Qué hace | Deja en `--work` |
| ----- | -------- | ---------------- |
| `frames` | Un fotograma nítido cada 0,25 s del vídeo. | `frames/` |
| `segment` | Recorta la persona en las fotos y la cabeza en los fotogramas (MediaPipe). | `masks/`, `checks/segment.jpg` |
| `hull` | Talla la silueta 3D a partir de las 8 fotos y calcula el ángulo real de cada una. | `hull_photos.npz`, `checks/hull.png` |
| `video_head` | Sitúa la cámara de cada fotograma (`pycolmap`), talla la cabeza con más de 200 vistas y la encaja en la de las fotos. Si registra menos del 60 % de los fotogramas, se queda con la cabeza de las fotos. | `sfm/`, `hull.npz`, `checks/video_head.png` |
| `face` | Ojos, cejas, nariz, labios y mandíbula a partir de los puntos faciales. | `face.npz` |
| `sample` | Reparte los nodos por la superficie (más densos en contornos y rasgos) y escribe `bust.bin`. | `nodes.npz` |
| `preview` | Dibuja el busto como la web, junto a la foto del mismo ángulo. | `previews/` |

Para cambiar solo el reparto de nodos (por ejemplo, la densidad de los rasgos en `bust/sample.py`), no hace falta repetir todo:

```bash
uv run build.py --photos "…" --video "…" --from-stage sample
```

## Cómo revisar el resultado

1. Abre `%TEMP%\bust-work\previews\sheet.png`: cada foto aparece junto al busto visto desde el mismo ángulo.
2. Se tiene que reconocer tu silueta: forma de la cabeza, pelo, perfil (nariz y barbilla) y hombros.
3. Si algo falla, mira la hoja de la etapa correspondiente en `checks/`:
   - `segment.jpg`: el recorte no debe incluir el fondo;
   - `hull.png`: el blanco es donde coinciden el volumen y la foto;
   - `video_head.png`: fila de arriba, las fotos; en medio, el vídeo; abajo, la fusión.
4. Para ver el resultado en la web: `npm start` desde la raíz del proyecto.
