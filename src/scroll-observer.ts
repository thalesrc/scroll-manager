import { Observable, merge, empty } from "rxjs";
import { share, map, debounceTime, distinctUntilChanged, filter, throttleTime, pairwise, switchMap } from 'rxjs/operators';
import { name as browser } from "platform";
import { ScrollableContent, ScrollDirection, ScrollPhase, ScrollPosition, HorizontalScrollDirection, VerticalScrollDirection, RemainingScrollPosition } from './models';

/**
 * #### Scroll Observer
 */
export class ScrollObserver {
  /**
   * The Base Scroll Observable
   * All the other events are derived from this
   * Fires the scroll position in pixels
   */
  private _scrollBase: Observable<ScrollPosition>;

  /**
   * The buffer for the observables which are throttled by the same time
   */
  private _buffer: {[key: number]: Observable<ScrollPosition>} = {};

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
  public scrollDirectionChange: Observable<ScrollDirection>;

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
      this._scrollPositionXGetter = () => window.scrollX;
      this._scrollPositionYGetter = () => window.scrollY;
    } else {
      this._scrollPositionXGetter = () => (<Document>target).documentElement.scrollLeft;
      this._scrollPositionYGetter = () => (<Document>target).documentElement.scrollTop;
    }

    // Set up target size & scrollable content getters
    if (target instanceof Document) {
      this._targetHeightGetter = () => window.innerHeight;
      this._targetWidthGetter = () => window.innerWidth;
      this._scrollableHeightGetter = () => document.body.clientHeight;
      this._scrollableWidthGetter = () => document.body.clientWidth;
    } else {
      this._targetHeightGetter = () => target.offsetHeight;
      this._targetWidthGetter = () => target.offsetWidth;
      this._scrollableHeightGetter = () => target.scrollHeight;
      this._scrollableWidthGetter = () => target.scrollWidth;
    }

    // Set up base scroll observable
    this._scrollBase = new Observable<ScrollPosition>(subscriber => {
        const _target: EventTarget = target instanceof Document ? window : target;
        const handler = () => subscriber.next(this.scrollPosition);

        _target.addEventListener("scroll", handler);
        subscriber.next();

        return () => _target.removeEventListener("scroll", handler);
      })
      .pipe(share());

    // Set up scroll end
    this.scrollEnd = this._scrollBase.pipe(debounceTime(throttleTime));

    // Set up scroll start
    this.scrollStart = <Observable<ScrollPosition>>merge(this._scrollBase, this.scrollEnd.pipe(map(e => false)))
      .pipe(
        distinctUntilChanged((x, y) => x !== false && y !== false),
        filter(val => val !== false)
      );

    // Set up direction X change
    this.scrollXDirectionChange = this.scrollX.pipe(
      pairwise(),
      map(([prev, next]) => prev < next ? ScrollDirection.LEFT : ScrollDirection.RIGHT),
      distinctUntilChanged()
    );

    // Set up direction Y change
    this.scrollYDirectionChange = this.scrollY.pipe(
      pairwise(),
      map(([prev, next]) => prev < next ? ScrollDirection.TOP : ScrollDirection.BOTTOM),
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

    this.scrollXPhase = this._scrollBase
      .pipe(
        map(scroll => scroll === 0
          ? ScrollPhase.START
          : scroll >= this._scrollableHeight - this._targetHeight
          ? ScrollPhase.END
          : ScrollPhase.MID
        ),
        distinctUntilChanged()
      );

    this.remaining = this._scrollBase
      .pipe(map(scrollPosition => this._scrollableHeight - scrollPosition - this._targetHeight));
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
    return this._scrollableHeightGetter();
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
   * Fires the scroll position on every scroll event
   *
   * _By default, throttles events for every [90ms]{@link ScrollObserver#throttleTime}, use [throttleBy]{@link ScrollObserver#throttled} if need something else_
   */
  public get scroll(): Observable<ScrollPosition> {
    return this.throttleBy(this.throttleTime);
  }

  public get scrollX(): Observable<number> {
    return this.scroll.pipe(
      map(({left}) => left),
      distinctUntilChanged()
    );
  }

  public get scrollY(): Observable<number> {
    return this.scroll.pipe(
      map(({top}) => top),
      distinctUntilChanged()
    );
  }

  /**
   * Returns throttled scroll events by given time
   *
   * Set `time` argument to `0` if want to catch all events
   *
   * @param time Time to throttle events
   */
  public throttleBy(time: number): Observable<ScrollPosition> {
    if (time <= 0) {
      return this._scrollBase;
    }

    if (!(time in this._buffer)) {
      this._buffer[time] = this._scrollBase.pipe(throttleTime(time));
    }

    return this._buffer[time];
  }
}
