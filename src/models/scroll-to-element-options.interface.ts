/**
 * ### Scroll to element options
 */
export interface ScrollToElementOptions {
  /**
   * Set `false` to disable smooth scrolling
   * @default true
   */
  animate?: boolean;

  /**
   * Space between the window top and the element will be scrolled into
   * @default 0
   */
	offset?: number;
}