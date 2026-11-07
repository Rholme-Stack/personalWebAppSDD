import { autoYaw, damp, motionMode, pointerToYaw, scrollProgress } from './motion';

describe('scrollProgress', () => {
  it('should be 0 at the top, 0.5 halfway and 1 at the end of the page', () => {
    expect(scrollProgress(0, 3000, 1000)).toBe(0);
    expect(scrollProgress(1000, 3000, 1000)).toBe(0.5);
    expect(scrollProgress(2000, 3000, 1000)).toBe(1);
  });

  it('should stay within 0..1 when the browser overscrolls', () => {
    expect(scrollProgress(-40, 3000, 1000)).toBe(0);
    expect(scrollProgress(2100, 3000, 1000)).toBe(1);
  });

  it('should be 0 when the page has no scroll', () => {
    expect(scrollProgress(0, 800, 1000)).toBe(0);
    expect(scrollProgress(0, 1000, 1000)).toBe(0);
  });
});

describe('pointerToYaw', () => {
  it('should face the front with the pointer in the middle', () => {
    expect(pointerToYaw(640, 1280)).toBe(0);
  });

  it('should turn to a profile at each edge, facing the pointer', () => {
    expect(pointerToYaw(1280, 1280)).toBeCloseTo(Math.PI / 2);
    expect(pointerToYaw(0, 1280)).toBeCloseTo(-Math.PI / 2);
  });

  it('should not go past a profile outside the window', () => {
    expect(pointerToYaw(1500, 1280)).toBeCloseTo(Math.PI / 2);
    expect(pointerToYaw(-200, 1280)).toBeCloseTo(-Math.PI / 2);
  });
});

describe('autoYaw', () => {
  it('should make a full turn every 20 seconds, without stopping', () => {
    expect(autoYaw(0)).toBe(0);
    expect(autoYaw(5)).toBeCloseTo(Math.PI / 2);
    expect(autoYaw(20)).toBeCloseTo(2 * Math.PI);
    expect(autoYaw(40)).toBeCloseTo(4 * Math.PI);
  });
});

describe('damp', () => {
  it('should move toward the target without passing it', () => {
    const next = damp(0, 1, 0.016, 0.12);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
    expect(damp(0, 1, 10, 0.12)).toBeCloseTo(1, 5);
  });

  it('should give the same result whatever the frame rate', () => {
    const twoSteps = damp(damp(0, 1, 0.016, 0.12), 1, 0.016, 0.12);
    expect(damp(0, 1, 0.032, 0.12)).toBeCloseTo(twoSteps, 10);
  });

  it('should stay still when already on the target', () => {
    expect(damp(0.5, 0.5, 0.016, 0.12)).toBe(0.5);
  });
});

describe('motionMode', () => {
  it('should be still with reduced motion, even with a mouse', () => {
    expect(motionMode({ reducedMotion: true, hasMouse: true })).toBe('still');
    expect(motionMode({ reducedMotion: true, hasMouse: false })).toBe('still');
  });

  it('should follow the mouse when there is one', () => {
    expect(motionMode({ reducedMotion: false, hasMouse: true })).toBe('mouse');
  });

  it('should turn by itself without a mouse', () => {
    expect(motionMode({ reducedMotion: false, hasMouse: false })).toBe('auto');
  });
});
