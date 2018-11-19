import { ScrollManager } from "./scroll-manager";

export { ScrollManager } from "./scroll-manager";
export { ScrollObserver } from "./scroll-observer";

export {
  ScrollToElementOptions,
  ScrollableContent,
  ScrollDirection,
  ScrollPhase,
  ScrollPosition,
  HorizontalScrollDirection,
  VerticalScrollDirection,
  RemainingScrollPosition
} from "./models";

/**
 * ### Scroll Manager
 *
 * Default Scroll Manager Instance
 */
export default new ScrollManager();
