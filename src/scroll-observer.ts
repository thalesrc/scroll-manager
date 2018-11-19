import { Observable, merge, empty } from "rxjs";
import { share, map, debounceTime, distinctUntilChanged, filter, throttleTime, pairwise, switchMap } from 'rxjs/operators';
import { name as browser } from "platform";
import { ScrollableContent, ScrollDirection, ScrollPhase, ScrollPosition, HorizontalScrollDirection, VerticalScrollDirection, RemainingScrollPosition, Buffer } from './models';

/**
 * #### Scroll Observer
 */
export class ScrollObserver {
  /**
   * Get window scroll x position in pixels
   */
  private static _getWindowXPosition(): number {
    return window.scrollX;
  }

  /**
   * Get window scroll y position in pixels
   */
  private static _getWindowYPosition(): number {
    return window.scrollY;
  }

  /**
   * Get document scroll left position in pixels
   */
  private static _getDocumentScrollLeft(): number {
    return document.documentElement.scrollLeft;
  }

  /**
   * Get document scroll top position in pixels
   */
  private static _getDocumentScrollTop(): number {
    return document.documentElement.scrollTop;
  }

  /**
   * Get window width
   */
  private static _getWindowWidth(): number {
    return window.innerWidth;
  }

  /**
   * Get window height
   */
  private static _getWindowHeight(): number {
    return window.innerHeight;
  }

  /**
   * Get document width
   */
  private static _getDocumentWidth(): number {
    return document.body.clientWidth;
  }

  /**
   * Get document height
   */
  private static _getDocumentHeight(): number {
    return document.body.clientHeight;
  }

  /**
   * A function which always returns false
   * @param argument doesn't matter what is passed, it will always return false
   */
  private static _returnFalse(argument: any): false {
    return false;
  }

  /**
   * Checks the both arguments are false or not
   * @param x First argument
   * @param y Second argument
   */
  private static _areNotFalse(x: any, y: any): boolean {
    return x !== false && y !== false;
  }

  /**
   * Checks the argument is `false` or not
   * @param argument argument to check if it is false
   */
  private static _isNotFalse(argument: any): boolean {
    return argument !== false;
  }

  /**
   * Get horizontal scroll direction
   * TODO: add parameter description when jsdoc supports array destructuring
   */
  private static _getHorizontalScrollDirection([prev, next]: [number, number]): HorizontalScrollDirection {
    return prev < next ? ScrollDirection.RIGHT : ScrollDirection.LEFT;
  }

  /**
   * Get vertical scroll direction
   * TODO: add parameter description when jsdoc supports array destructuring
   */
  private static _getVerticalScrollDirection([prev, next]: [number, number]): VerticalScrollDirection {
    return prev < next ? ScrollDirection.BOTTOM : ScrollDirection.TOP;
  }

  /**
   * Return `top` value
   * @param position
   * @param position.top
   */
  private static _getTop({top}: {top: number}): number {
    return top;
  }

  /**
   * Return `bottom` value
   * @param position
   * @param position.bottom
   */
  private static _getBottom({bottom}: {bottom: number}): number {
    return bottom;
  }

  /**
   * Return `left` value
   * @param position
   * @param position.left
   */
  private static _getLeft({left}: {left: number}): number {
    return left;
  }

  /**
   * Return `right` value
   * @param position
   * @param position.right
   */
  private static _getRight({right}: {right: number}): number {
    return right;
  }

  /**
   * The Base Scroll Observable
   * All the other events are derived from this
   * Fires the scroll position in pixels
   */
  private _scrollBase: Observable<ScrollPosition>;

  /**
   * The buffer for the observables which are throttled by the same time
   */
  private _buffer: Buffer = {
    both: {},
    x: {},
    y: {}
  };

  /**
   * Scroll X position getter
   *
   * Will be defined according to the target type
   */
  private _scrollPositionXGetter: () => number;

  /**
   * Scroll Y position getter
   *
   * Will be defined according to the target type
   */
  private _scrollPositionYGetter: () => number;

  /**
   * Target Height Getter
   *
   * Will be defined according to the target type
   */
  private _targetHeightGetter: () => number;

  /**
   * Target Width Getter
   *
   * Will be defined according to the target type
   */
  private _targetWidthGetter: () => number;

  /**
   * Scrollable Height Getter
   *
   * Will be defined according to the target type
   */
  private _scrollableHeightGetter: () => number;

  /**
   * Scrollable Width Getter
   *
   * Will be defined according to the target type
   */
  private _scrollableWidthGetter: () => number;

  /**
   * Fires the scroll position when scroll has been started
   */
  public scrollStart: Observable<ScrollPosition>;

  /**
   * Fires the scroll position when scroll has been ended
   */
  public scrollEnd: Observable<ScrollPosition>;

  /**
   * Fires the `ScrollDirection` when the scrolling direction has been changed
   */
  public scrollDirectionChange: Observable<HorizontalScrollDirection | VerticalScrollDirection>;

  /**
   * Fires the `HorizontalScrollDirection` when the horizontal scrolling direction has been changed
   */
  public scrollXDirectionChange: Observable<HorizontalScrollDirection>;

  /**
   * Fires the `VerticalScrollDirection` when the vertical scrolling direction has been changed
   */
  public scrollYDirectionChange: Observable<VerticalScrollDirection>;

  /**
   * Fires the scroll position only while scrolling down
   */
  public scrollingDown: Observable<number>;

  /**
   * Fires the scroll position only while scrolling up
   */
  public scrollingUp: Observable<number>;

  /**
   * Fires the scroll position only while scrolling left
   */
  public scrollingLeft: Observable<number>;

  /**
   * Fires the scroll position only while scrolling right
   */
  public scrollingRight: Observable<number>;

  /**
   * Fires when scrolling X phase has been changed {@link ScrollPhase}
   */
  public scrollXPhase: Observable<ScrollPhase>;

  /**
   * Fires when scrolling Y phase has been changed {@link ScrollPhase}
   */
  public scrollYPhase: Observable<ScrollPhase>;

  /**
   * Fires the remaining scrollable content in pixels
   */
  public remaining: Observable<RemainingScrollPosition>;

  /**
   * Fires the horizontal remaining scrollable content in pixels
   */
  public remainingX: Observable<number>;

  /**
   * Fires the vertical remaining scrollable content in pixels
   */
  public remainingY: Observable<number>;

  /**
   * @param target Scrolling Content
   * @param throttleTime Time interval to throttle scroll events
   * > The throttle time under 90ms will not work well because of performance prospects.
   * > It will fire much less event than expected.
   * > Use in caution!
   */
  constructor(
    public target: ScrollableContent,
    private throttleTime = 90
  ) {
    // Set up scroll position getters
    if (!(target instanceof Document)) {
      this._scrollPositionXGetter = () => (<HTMLElement>target).scrollLeft;
      this._scrollPositionYGetter = () => (<HTMLElement>target).scrollTop;
    } else if (browser === "Microsoft Edge" || browser === "Safari") {
      this._scrollPositionXGetter = ScrollObserver._getWindowXPosition;
      this._scrollPositionYGetter = ScrollObserver._getWindowYPosition;
    } else {
      this._scrollPositionXGetter = ScrollObserver._getDocumentScrollLeft;
      this._scrollPositionYGetter = ScrollObserver._getDocumentScrollTop;
    }

    // Set up target size & scrollable content getters
    if (target instanceof Document) {
      this._targetWidthGetter = ScrollObserver._getWindowWidth;
      this._targetHeightGetter = ScrollObserver._getWindowHeight;
      this._scrollableWidthGetter = ScrollObserver._getDocumentWidth;
      this._scrollableHeightGetter = ScrollObserver._getDocumentHeight;
    } else {
      this._targetWidthGetter = () => target.offsetWidth;
      this._targetHeightGetter = () => target.offsetHeight;
      this._scrollableWidthGetter = () => target.scrollWidth;
      this._scrollableHeightGetter = () => target.scrollHeight;
    }

    // Set up base scroll observable
    this._scrollBase = new Observable<ScrollPosition>(subscriber => {
        const _target: EventTarget = target instanceof Document ? window : target;
        const handler = () => subscriber.next(this.scrollPosition);

        _target.addEventListener("scroll", handler);
        subscriber.next(this.scrollPosition);

        return () => _target.removeEventListener("scroll", handler);
      })
      .pipe(share());

    // Set up scroll end
    this.scrollEnd = this._scrollBase.pipe(debounceTime(throttleTime));

    // Set up scroll start
    this.scrollStart = <Observable<ScrollPosition>>merge(this._scrollBase, this.scrollEnd.pipe(map(ScrollObserver._returnFalse)))
      .pipe(
        distinctUntilChanged(ScrollObserver._areNotFalse),
        filter(ScrollObserver._isNotFalse)
      );

    // Set up direction X change
    this.scrollXDirectionChange = this.scrollX.pipe(
      pairwise(),
      map(ScrollObserver._getHorizontalScrollDirection),
      distinctUntilChanged()
    );

    // Set up direction Y change
    this.scrollYDirectionChange = this.scrollY.pipe(
      pairwise(),
      map(ScrollObserver._getVerticalScrollDirection),
      distinctUntilChanged()
    );

    // Set up direction change
    this.scrollDirectionChange = merge(this.scrollXDirectionChange, this.scrollYDirectionChange);

    // Set up scrollingDown
    this.scrollingDown = this.scrollDirectionChange
      .pipe(switchMap(direction => direction === ScrollDirection.BOTTOM ? this.scrollY : empty()));

    // Set up scrollingUp
    this.scrollingUp = this.scrollDirectionChange
      .pipe(switchMap(direction => direction === ScrollDirection.TOP ? this.scrollY : empty()));

    // Set up scrollingLeft
    this.scrollingLeft = this.scrollDirectionChange
    .pipe(switchMap(direction => direction === ScrollDirection.LEFT ? this.scrollX : empty()));

    // Set up scrollingRight
    this.scrollingRight = this.scrollDirectionChange
      .pipe(switchMap(direction => direction === ScrollDirection.RIGHT ? this.scrollX : empty()));

    // Set up scrollXPhase
    this.scrollXPhase = this.listenX(0)
      .pipe(
        map(scroll => scroll === 0
          ? ScrollPhase.START
          : scroll >= this._scrollableWidth - this._targetWidth
          ? ScrollPhase.END
          : ScrollPhase.MID
        ),
        distinctUntilChanged()
      );

    // Set up scrollYPhase
    this.scrollYPhase = this.listenY(0)
      .pipe(
        map(scroll => scroll === 0
          ? ScrollPhase.START
          : scroll >= this._scrollableHeight - this._targetHeight
          ? ScrollPhase.END
          : ScrollPhase.MID
        ),
        distinctUntilChanged()
      );

    // Set up remaining
    this.remaining = this._scrollBase.pipe(map(({top, left}) => {
      return {
        bottom: this._scrollableHeight - top - this._targetHeight,
        right: this._scrollableWidth - left - this._targetWidth
      }
    }));

    this.remainingX = this.remaining.pipe(map(ScrollObserver._getRight));
    this.remainingY = this.remaining.pipe(map(ScrollObserver._getBottom));
  }

  /**
   * Returns the height of the target
   */
  private get _targetHeight(): number {
    return this._targetHeightGetter();
  }

  /**
   * Returns the width of the target
   */
  private get _targetWidth(): number {
    return this._targetWidthGetter();
  }

  /**
   * Returns the scrollable height of the target
   */
  private get _scrollableHeight(): number {
    return this._scrollableHeightGetter();
  }

  /**
   * Returns the scrollable width of the target
   */
  private get _scrollableWidth(): number {
    return this._scrollableWidthGetter();
  }

  /**
   * Returns the scroll position X of the target
   */
  public get scrollPositionX(): number {
    return this._scrollPositionXGetter();
  }

  /**
   * Returns the scroll position Y of the target
   */
  public get scrollPositionY(): number {
    return this._scrollPositionYGetter();
  }

  /**
   * Returns the scroll position of the target
   */
  public get scrollPosition(): ScrollPosition {
    return {
      top: this.scrollPositionY,
      left: this.scrollPositionX
    };
  }

  /**
   * Base Scrolling Observable
   *
   * Fires the scroll positions on every scroll event
   *
   * _By default, throttles events for every [90ms]{@link ScrollObserver#throttleTime}, use [throttleBy]{@link ScrollObserver#listen} if need something else_
   */
  public get scroll(): Observable<ScrollPosition> {
    return this.listen(this.throttleTime);
  }

  /**
   * Base Horizontal Scrolling Observable
   *
   * Fires the horizontal scroll position on every scroll event
   *
   * _By default, throttles events for every [90ms]{@link ScrollObserver#throttleTime}, use [throttleBy]{@link ScrollObserver#listenX} if need something else_
   */
  public get scrollX(): Observable<number> {
    return this.listenX(this.throttleTime);
  }

  /**
   * Base Vertical Scrolling Observable
   *
   * Fires the vertical scroll position on every scroll event
   *
   * _By default, throttles events for every [90ms]{@link ScrollObserver#throttleTime}, use [throttleBy]{@link ScrollObserver#listenY} if need something else_
   */
  public get scrollY(): Observable<number> {
    return this.listenY(this.throttleTime);
  }

  /**
   * Returns throttled scroll events by given time
   *
   * Set `time` argument to `0` if want to catch all events
   *
   * @param time Time to throttle events
   */
  public listen(time: number): Observable<ScrollPosition> {
    if (time <= 0) {
      return this._scrollBase;
    }

    if (!(time in this._buffer.both)) {
      this._buffer.both[time] = this._scrollBase.pipe(throttleTime(time), distinctUntilChanged());
    }

    return this._buffer.both[time];
  }

  /**
   * Returns throttled scrollX events by given time
   *
   * Set `time` argument to `0` if want to catch all events
   *
   * @param time Time to throttle events
   */
  public listenX(time: number): Observable<number> {
    if (!(time in this._buffer.x)) {
      this._buffer.x[time] = this.listen(time).pipe(map(ScrollObserver._getLeft), distinctUntilChanged());
    }

    return this._buffer.x[time];
  }

  /**
   * Returns throttled scrollY events by given time
   *
   * Set `time` argument to `0` if want to catch all events
   *
   * @param time Time to throttle events
   */
  public listenY(time: number): Observable<number> {
    if (!(time in this._buffer.y)) {
      this._buffer.y[time] = this.listen(time).pipe(map(ScrollObserver._getTop), distinctUntilChanged());
    }

    return this._buffer.y[time];
  }
}
