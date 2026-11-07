import { bustLayout } from './layout';

describe('bustLayout', () => {
  it('should put the bust on the right half on a desktop screen', () => {
    expect(bustLayout(1280, 800, 0.9)).toEqual({
      centerX: 0.75,
      centerY: 0.5,
      heightFraction: 0.75,
      opacity: 1,
      nodeStride: 1,
    });
  });

  it('should center a dimmer bust with half of the nodes on a phone', () => {
    const layout = bustLayout(360, 640, 0.9);
    expect(layout.centerX).toBe(0.5);
    expect(layout.centerY).toBe(0.5);
    expect(layout.opacity).toBe(0.5);
    expect(layout.nodeStride).toBe(2);
    expect(layout.heightFraction).toBeLessThanOrEqual(0.6);
  });

  it('should keep the turning bust within 90% of a narrow screen', () => {
    const layout = bustLayout(360, 640, 0.9);
    const bustWidth = layout.heightFraction * 640 * 0.9;
    expect(bustWidth).toBeLessThanOrEqual(0.9 * 360 + 1e-9);
  });

  it('should use 60% of the height when the screen is wide enough', () => {
    expect(bustLayout(800, 600, 0.5).heightFraction).toBe(0.6);
  });

  it('should switch to the desktop layout at 1024 px', () => {
    expect(bustLayout(1024, 768, 0.9).centerX).toBe(0.75);
    expect(bustLayout(1023, 768, 0.9).centerX).toBe(0.5);
  });
});
