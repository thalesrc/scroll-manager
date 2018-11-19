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

    this.scrollDirectionChange = this.scroll
      .pipe(
        pairwise(),
        map(([prev, next]) => prev < next ? ScrollDirection.DOWN : ScrollDirection.UP),
        distinctUntilChanged((prevDirection, nextDirection) => prevDirection === nextDirection)
      );

    this.scrollingDown = this.scrollDirectionChange
      .pipe(switchMap(direction => direction === ScrollDirection.DOWN ? this.scroll : empty()));

    this.scrollingUp = this.scrollDirectionChange
      .pipe(switchMap(direction => direction === ScrollDirection.UP ? this.scroll : empty()));

    this.scrollPhase = this._scrollBase
      .pipe(
        map(scroll => scroll === 0
          ? ScrollPhase.START
          : scroll >= this.scrollableHeight - this.targetHeight
          ? ScrollPhase.END
          : ScrollPhase.MID
        ),
        distinctUntilChanged()
      );

    this.remaining = this._scrollBase
      .pipe(map(scrollPosition => this.scrollableHeight - scrollPosition - this.targetHeight));
  }

  /**
   * Returns the height of the target
   */
  private get targetHeight(): number {
    return this._targetHeightGetter();
  }

  /**
   * Returns the width of the target
   */
  private get targetWidth(): number {
    return this._targetWidthGetter();
  }

  /**
   * Returns the scrollable height of the target
   */
  private get scrollableHeight(): number {
    return this._scrollableHeightGetter();
  }

  /**
   * Returns the scrollable width of the target
   */
  private get scrollableWidth(): number {
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
  get scroll(): Observable<number> {
    return this.throttleBy(this.throttleTime);
  }

  /**
   * Returns throttled scroll events by given time
   *
   * Set `time` argument to `0` if want to catch all events
   *
   * @param time Time to throttle events
   */
  public throttleBy(time: number): Observable<number> {
    if (time <= 0) {
      return this._scrollBase;
    }

    if (!(time in this._buffer)) {
      this._buffer[time] = this._scrollBase.pipe(throttleTime(time));
    }

    return this._buffer[time];
  }
}
