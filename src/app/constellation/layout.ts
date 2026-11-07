/** Where and how big the bust is drawn (fractions of the viewport). */
export interface BustLayout {
  centerX: number;
  centerY: number;
  heightFraction: number;
  opacity: number;
  /** 1 draws every node; 2 draws every other node. */
  nodeStride: 1 | 2;
}

export const DESKTOP_MIN_WIDTH = 1024;

/**
 * Desktop: right half, next to the name. Narrower screens: centered behind the text and dimmer,
 * never wider than 90% of the screen while it turns.
 * @param bustRadius largest distance of a node to the vertical axis, in bust units (height = 2)
 */
export function bustLayout(width: number, height: number, bustRadius: number): BustLayout {
  if (width >= DESKTOP_MIN_WIDTH) {
    return { centerX: 0.75, centerY: 0.5, heightFraction: 0.75, opacity: 1, nodeStride: 1 };
  }
  return {
    centerX: 0.5,
    centerY: 0.5,
    heightFraction: Math.min(0.6, (0.9 * width) / (height * bustRadius)),
    opacity: 0.5,
    nodeStride: 2,
  };
}
