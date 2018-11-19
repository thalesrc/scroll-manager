import "smoothscroll-polyfill";

import { first } from "rxjs/operators";
import { ScrollObserver } from "./scroll-observer";
import { ScrollToElementOptions, ScrollableContent } from './models';

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
	 */
	public observe(target: ScrollableContent): ScrollObserver {
		if (!this._buffer.has(target)) {
			this._buffer.set(target, new ScrollObserver(target, this.observerThrottleTime));
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
		{animate = true, offset = 0 }: ScrollToElementOptions = {animate: true, offset: 0}
	): Promise<number> {
		window.scrollBy({top: element.getBoundingClientRect().top + offset, behavior: animate ? "smooth" : "instant"});
		return this.root.scrollEnd.pipe(first()).toPromise();
	}

	/**
	 * Scrolls to the top smoothly
   * @returns A promise which resolves when the scrolling is completed
	 */
	public scrollTop(): Promise<number> {
		window.scrollTo({top: 0, behavior: "smooth"});
		return this.root.scrollEnd.pipe(first()).toPromise();
	}
}