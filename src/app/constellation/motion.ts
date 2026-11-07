/** How the bust moves: following the mouse, turning by itself, or still (reduced motion). */
export type MotionMode = 'mouse' | 'auto' | 'still';

export const MAX_YAW = Math.PI / 2;
export const AUTO_TURN_SECONDS = 20;
/** Smoothing while following the mouse (settles in ~0.4 s). */
export const DAMP_FOLLOW_TAU = 0.12;
/** Smoothing while going back to the front view (~1 s). */
export const DAMP_RETURN_TAU = 0.3;

/** 0 at the top of the page, 1 at the end. */
export function scrollProgress(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number,
): number {
  const scrollable = scrollHeight - viewportHeight;
  if (scrollable <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, scrollY / scrollable));
}

/** Front view with the pointer in the middle, a profile facing the pointer at each edge. */
export function pointerToYaw(x: number, width: number): number {
  const offset = Math.min(1, Math.max(-1, (x / width - 0.5) * 2));
  return offset * MAX_YAW;
}

/** One full turn every AUTO_TURN_SECONDS, never stopping. */
export function autoYaw(seconds: number): number {
  return (seconds / AUTO_TURN_SECONDS) * 2 * Math.PI;
}

/** Exponential smoothing toward a target that does not depend on the frame rate. */
export function damp(current: number, target: number, dt: number, tau: number): number {
  return target + (current - target) * Math.exp(-dt / tau);
}

export function motionMode(env: { reducedMotion: boolean; hasMouse: boolean }): MotionMode {
  if (env.reducedMotion) {
    return 'still';
  }
  return env.hasMouse ? 'mouse' : 'auto';
}
