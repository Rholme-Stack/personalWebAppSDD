import {
  AMBIENT_COUNT,
  NODE_STRIDE,
  PALETTE,
  SEED,
  buildNodes,
  bustRadius,
  explosionAmount,
  mulberry32,
} from './nodes';

/** 1000 points inside a sphere of radius 1, like the bust. */
function samplePositions(): Float32Array {
  const random = mulberry32(7);
  const positions = new Float32Array(3000);
  for (let i = 0; i < 1000; i++) {
    const r = Math.cbrt(random()) * 0.95;
    const theta = random() * 2 * Math.PI;
    const y = random() * 2 - 1;
    const ring = Math.sqrt(1 - y * y);
    positions.set([r * ring * Math.sin(theta), r * y, r * ring * Math.cos(theta)], i * 3);
  }
  return positions;
}

function node(data: Float32Array, i: number) {
  const n = data.subarray(i * NODE_STRIDE, (i + 1) * NODE_STRIDE);
  return {
    position: [n[0], n[1], n[2]],
    target: [n[3], n[4], n[5]],
    color: [n[6], n[7], n[8]],
    phase: n[9],
    pace: n[10],
  };
}

function angleBetween(a: number, b: number): number {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return d > Math.PI ? 2 * Math.PI - d : d;
}

describe('buildNodes', () => {
  const positions = samplePositions();
  const nodes = buildNodes(positions, mulberry32(SEED));
  const all = Array.from({ length: nodes.count }, (_, i) => node(nodes.data, i));

  it('should give exactly the same nodes for the same seed', () => {
    expect(buildNodes(positions, mulberry32(SEED)).data).toEqual(nodes.data);
  });

  it('should add the ambient nodes to the bust nodes', () => {
    expect(nodes.count).toBe(1000 + AMBIENT_COUNT);
    expect(nodes.data.length).toBe(nodes.count * NODE_STRIDE);
  });

  it('should only use palette colors', () => {
    for (const n of all) {
      const match = PALETTE.some((c) => c.rgb.every((v, k) => Math.abs(v - n.color[k]) < 1e-6));
      expect(match).toBe(true);
    }
  });

  it('should keep phase in 0..2π and pace in 0.6..1.6', () => {
    for (const n of all) {
      expect(n.phase).toBeGreaterThanOrEqual(0);
      expect(n.phase).toBeLessThan(2 * Math.PI);
      expect(n.pace).toBeGreaterThanOrEqual(0.6);
      expect(n.pace).toBeLessThanOrEqual(1.6);
    }
  });

  it('should send every node to the unit cylinder, out through its own side', () => {
    for (const {
      position: [x, y, z],
      target: [tx, ty, tz],
    } of all) {
      const radius = Math.hypot(tx, tz);
      expect(radius).toBeGreaterThanOrEqual(0.15 - 1e-6);
      expect(radius).toBeLessThanOrEqual(1 + 1e-6);
      expect(Math.abs(ty)).toBeLessThanOrEqual(1);
      expect(angleBetween(Math.atan2(tx, tz), Math.atan2(x, z))).toBeLessThanOrEqual(
        Math.PI / 4 + 1e-6,
      );
      if (y !== 0) {
        expect(Math.sign(ty)).toBe(Math.sign(y));
      }
    }
  });

  it('should place the ambient nodes 1.2 to 2 units around the bust', () => {
    const ambient = all.filter((n) => Math.hypot(...n.position) >= 1.2 - 1e-6);
    expect(ambient.length).toBe(AMBIENT_COUNT);
    for (const n of ambient) {
      expect(Math.hypot(...n.position)).toBeLessThanOrEqual(2 + 1e-6);
    }
  });

  it('should shuffle the nodes so that any half of them still covers the whole bust', () => {
    const points = Array.from({ length: 1000 }, (_, i) => positions.subarray(i * 3, i * 3 + 3));
    const sortedByHeight = new Float32Array(
      points.sort((a, b) => a[1] - b[1]).flatMap((p) => [...p]),
    );
    const shuffled = buildNodes(sortedByHeight, mulberry32(SEED));
    const half = Math.floor(shuffled.count / 2);
    const meanHeight = (from: number, to: number) => {
      let sum = 0;
      for (let i = from; i < to; i++) sum += shuffled.data[i * NODE_STRIDE + 1];
      return sum / (to - from);
    };
    expect(Math.abs(meanHeight(0, half) - meanHeight(half, shuffled.count))).toBeLessThan(0.1);
  });
});

describe('explosionAmount', () => {
  it('should start at 0 and end at 1 whatever the pace', () => {
    for (const pace of [0.6, 1, 1.6]) {
      expect(explosionAmount(0, pace)).toBe(0);
      expect(explosionAmount(1, pace)).toBe(1);
    }
  });

  it('should grow with the scroll', () => {
    let previous = 0;
    for (let p = 0.05; p <= 1; p += 0.05) {
      const value = explosionAmount(p, 1.3);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });

  it('should let a low pace leave earlier than a high pace', () => {
    expect(explosionAmount(0.5, 0.6)).toBeGreaterThan(explosionAmount(0.5, 1.6));
  });
});

describe('bustRadius', () => {
  it('should be the largest distance to the vertical axis', () => {
    expect(bustRadius(new Float32Array([0.3, 0.9, 0.4, -0.1, -1, 0, 0, 0, 0.2]))).toBeCloseTo(0.5);
  });
});
