/** Format of public/constellation/bust.bin (see specs/003-constelacion/data-model.md). */
const MAGIC = 'BUST';
const VERSION = 1;
const HEADER_BYTES = 12;
const MIN_NODES = 1000;
const MAX_NODES = 20000;
const INT16_MAX = 32767;

/** Reads the bust file into x, y, z positions in the range -1..1. Throws if the file is not valid. */
export function decodeBust(buffer: ArrayBuffer): Float32Array {
  if (buffer.byteLength < HEADER_BYTES) {
    throw new Error(`bust.bin: size ${buffer.byteLength} is smaller than the header`);
  }
  const view = new DataView(buffer);
  const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
  if (magic !== MAGIC) {
    throw new Error(`bust.bin: does not start with ${MAGIC}`);
  }
  const version = view.getUint32(4, true);
  if (version !== VERSION) {
    throw new Error(`bust.bin: unknown version ${version}`);
  }
  const count = view.getUint32(8, true);
  if (count < MIN_NODES || count > MAX_NODES) {
    throw new Error(`bust.bin: node count ${count} is outside ${MIN_NODES}..${MAX_NODES}`);
  }
  if (buffer.byteLength !== HEADER_BYTES + count * 6) {
    throw new Error(`bust.bin: size ${buffer.byteLength} does not match ${count} nodes`);
  }

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < positions.length; i++) {
    positions[i] = view.getInt16(HEADER_BYTES + i * 2, true) / INT16_MAX;
  }
  return positions;
}
