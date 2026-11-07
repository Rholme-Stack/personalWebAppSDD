import { decodeBust } from './bust-format';

function bustBuffer(
  count: number,
  first: number[][] = [],
  header: { magic?: string; version?: number; count?: number; extraBytes?: number } = {},
): ArrayBuffer {
  const buffer = new ArrayBuffer(12 + count * 6 + (header.extraBytes ?? 0));
  const view = new DataView(buffer);
  const magic = header.magic ?? 'BUST';
  for (let i = 0; i < 4; i++) {
    view.setUint8(i, magic.charCodeAt(i));
  }
  view.setUint32(4, header.version ?? 1, true);
  view.setUint32(8, header.count ?? count, true);
  first.flat().forEach((value, i) => view.setInt16(12 + i * 2, value, true));
  return buffer;
}

describe('decodeBust', () => {
  it('should convert every coordinate to the range -1..1', () => {
    const positions = decodeBust(
      bustBuffer(1000, [
        [32767, -32767, 0],
        [16384, 0, -16384],
        [0, 3277, 32767],
      ]),
    );

    expect(positions.length).toBe(3000);
    expect(positions[0]).toBeCloseTo(1, 5);
    expect(positions[1]).toBeCloseTo(-1, 5);
    expect(positions[2]).toBe(0);
    expect(positions[3]).toBeCloseTo(0.5, 4);
    expect(positions[5]).toBeCloseTo(-0.5, 4);
    expect(positions[7]).toBeCloseTo(0.1, 4);
    expect(positions[8]).toBeCloseTo(1, 5);
  });

  it('should reject a file that does not start with BUST', () => {
    expect(() => decodeBust(bustBuffer(1000, [], { magic: 'PNG ' }))).toThrow(/BUST/);
  });

  it('should reject an unknown version', () => {
    expect(() => decodeBust(bustBuffer(1000, [], { version: 2 }))).toThrow(/version/);
  });

  it('should reject a node count outside 1000..20000', () => {
    expect(() => decodeBust(bustBuffer(999))).toThrow(/count/);
    expect(() => decodeBust(bustBuffer(20001))).toThrow(/count/);
  });

  it('should reject a size that does not match the node count', () => {
    expect(() => decodeBust(bustBuffer(1000, [], { count: 1001 }))).toThrow(/size/);
    expect(() => decodeBust(bustBuffer(1000, [], { extraBytes: 2 }))).toThrow(/size/);
  });

  it('should reject a file shorter than the header', () => {
    expect(() => decodeBust(new ArrayBuffer(8))).toThrow(/size/);
  });
});
