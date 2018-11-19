/**
 * ### Vertical Scroll Direction
 */
export enum VerticalScrollDirection {
  TOP = 1 << 0,
  BOTTOM = 1 << 1
}

/**
 * ### Horizontal Scroll Direction
 */
export enum HorizontalScrollDirection {
  LEFT = 1 << 2,
  RIGHT = 1 << 3
}

/**
 * ### Scroll Direction
 */
export const ScrollDirection = {
  ...VerticalScrollDirection,
  ...HorizontalScrollDirection
}
