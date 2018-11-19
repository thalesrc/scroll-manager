import "smoothscroll-polyfill";

import { first } from "rxjs/operators";
import { ScrollObserver } from "./scroll-observer";
import { ScrollToElementOptions, ScrollableContent, ScrollPosition } from './models';

/**
 * ### Scroll Manager
 * Manages whole scroll operations
 */
export class ScrollManager {

	/**
   * Keeps ScrollObserver instances of the scrollable targets
   */
  private _buffer = new WeakMap<ScrollableContent, ScrollObserver>();

  /**
   * Scroll Manager Constructor
   * @param observerThrottleTime Throttling time for scroll-observers
   */
  constructor(
    private observerThrottleTime?: number
  ) {
  }

	/**
   * ### Observe a scrollable target
   *
   * * * *
   * Example:
   * ```typescript
   * const element = document.getElementById("#content");
   * const contentScrollObserver = manager.observe(element);
   *
   * contentScrollObserver.scroll.subscribe(position => console.log(position));
   *
   * contentScrollObserver.scrollDirectionChange.subscribe(direction => console.log(direction));
   * ```
   * * * *
	 * @param target Scroll target
   * @param throttleTime Time to throttle the scroll events
	 */
	public observe(target: ScrollableContent, throttleTime = this.observerThrottleTime): ScrollObserver {
		if (!this._buffer.has(target)) {
			this._buffer.set(target, new ScrollObserver(target, throttleTime));
		}
		return this._buffer.get(target);
	}

	/**
	 * ### Window Scroll Observer
   *
   * * * *
   * Example:
   * ```typescript
   * manager.root.scroll.subscribe(position => console.log(position));
   * manager.root.scrollDirectionChange.subscribe(direction => console.log(direction));
   * ```
   * * * *
	 */
	public get root(): ScrollObserver {
		return this.observe(document);
	}

	/**
	 * ### Scroll to Element
   * Scroll the window into an element
   * * * *
   * Example:
   * ```typescript
   * manager.scrollToElement(document.getElementById("#next-content"))
   * ```
   * * * *
	 * @param element Element to scroll into
	 * @param options Scrolling options
	 * @param options.animate Set `false` to disable smooth scrolling
	 * @param options.offset Space between the window top and the element will be scrolled into
   * @returns A promise which will be resolved right after the scrolling completed
	 */
	public scrollToElement(
		element: HTMLElement,
		{animate = true, offsetTop = 0, offsetLeft = 0 }: ScrollToElementOptions = {animate: true, offsetTop: 0, offsetLeft: 0}
	): Promise<ScrollPosition> {
    const { top, left } = element.getBoundingClientRect();

    window.scrollBy({top: top + offsetTop, left: left + offsetLeft, behavior: animate ? "smooth" : "instant"});

		return this.root.scrollEnd.pipe(first()).toPromise();
	}

	/**
	 * Scrolls to the top smoothly
   * @returns A promise which resolves when the scrolling is completed
	 */
	public scrollTop(): Promise<ScrollPosition> {
    window.scrollTo({top: 0, behavior: "smooth"});

		return this.root.scrollEnd.pipe(first()).toPromise();
	}
}