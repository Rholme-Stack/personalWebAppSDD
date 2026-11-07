/** Floats per node: position(3) + target(3) + color(3) + phase(1) + pace(1). */
export const NODE_STRIDE = 11;
export const SEED = 20261107;
export const AMBIENT_COUNT = 300;

export interface ConstellationNodes {
  count: number;
  /** count × NODE_STRIDE floats, interleaved and shuffled. */
  data: Float32Array;
}

interface PaletteColor {
  hex: string;
  rgb: readonly [number, number, number];
  weight: number;
}

function color(hex: string, weight: number): PaletteColor {
  const value = parseInt(hex.slice(1), 16);
  const rgb = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => c / 255);
  return { hex, rgb: rgb as [number, number, number], weight };
}

/** Constellation colors from DESIGN.md; the weights add up to 1. */
export const PALETTE: readonly PaletteColor[] = [
  color('#8052ff', 0.3), // Electric Iris
  color('#4fe3c1', 0.25), // Mint Signal
  color('#4f7bff', 0.2), // Pulse Blue
  color('#e04bf0', 0.15), // Spark Magenta
  color('#15846e', 0.1), // Deep Verdant
];

/** Small seeded random generator: the same seed always gives the same sequence in 0..1. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(p: number): number {
  const x = Math.min(1, Math.max(0, p));
  return x * x * (3 - 2 * x);
}

/** How far a node has travelled to its target: 0 at the top of the page, 1 at the end. */
export function explosionAmount(progress: number, pace: number): number {
  return Math.pow(smoothstep(progress), pace);
}

/** Largest distance of a node to the vertical axis. */
export function bustRadius(positions: Float32Array): number {
  let radius = 0;
  for (let i = 0; i < positions.length; i += 3) {
    radius = Math.max(radius, Math.hypot(positions[i], positions[i + 2]));
  }
  return radius;
}

/** Bust nodes plus ambient nodes, each with its color, phase, pace and explosion target. */
export function buildNodes(positions: Float32Array, random: () => number): ConstellationNodes {
  const bustCount = positions.length / 3;
  const count = bustCount + AMBIENT_COUNT;
  const data = new Float32Array(count * NODE_STRIDE);

  for (let i = 0; i < count; i++) {
    const position = i < bustCount ? positions.subarray(i * 3, i * 3 + 3) : ambientPosition(random);
    data.set(position, i * NODE_STRIDE);
    data.set(explosionTarget(position, random), i * NODE_STRIDE + 3);
    data.set(pickColor(random()), i * NODE_STRIDE + 6);
    data[i * NODE_STRIDE + 9] = random() * 2 * Math.PI;
    data[i * NODE_STRIDE + 10] = 0.6 + random();
  }
  shuffle(data, count, random);
  return { count, data };
}

function ambientPosition(random: () => number): number[] {
  const distance = 1.2 + random() * 0.8;
  const y = random() * 2 - 1;
  const ring = Math.sqrt(1 - y * y);
  const theta = random() * 2 * Math.PI;
  return [distance * ring * Math.sin(theta), distance * y, distance * ring * Math.cos(theta)];
}

/** A point of the unit cylinder in the node's own sector (±45°) and half (up or down). */
function explosionTarget(position: ArrayLike<number>, random: () => number): number[] {
  const [x, y, z] = [position[0], position[1], position[2]];
  const angle = Math.atan2(x, z) + (random() - 0.5) * (Math.PI / 2);
  const radius = Math.sqrt(0.0225 + random() * (1 - 0.0225));
  const side = y > 0 ? 1 : y < 0 ? -1 : random() < 0.5 ? -1 : 1;
  return [radius * Math.sin(angle), side * random(), radius * Math.cos(angle)];
}

function pickColor(value: number): readonly number[] {
  let sum = 0;
  for (const c of PALETTE) {
    sum += c.weight;
    if (value < sum) {
      return c.rgb;
    }
  }
  return PALETTE[PALETTE.length - 1].rgb;
}

/** Fisher–Yates over whole nodes. */
function shuffle(data: Float32Array, count: number, random: () => number): void {
  const swap = new Float32Array(NODE_STRIDE);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = i * NODE_STRIDE;
    const b = j * NODE_STRIDE;
    swap.set(data.subarray(a, a + NODE_STRIDE));
    data.copyWithin(a, b, b + NODE_STRIDE);
    data.set(swap, b);
  }
}
