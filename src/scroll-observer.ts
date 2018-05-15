import { Observable, fromEvent, merge, empty } from "rxjs";
import { share, startWith, map, debounceTime, distinctUntilChanged, filter, throttleTime, pairwise, switchMap } from 'rxjs/operators';
import { name as browser } from "platform";

export type TScrollableContent = Document | HTMLElement;

/**
 * Scroll Direction
 */
export enum ScrollDirection {
  UP,
  DOWN
}

/**
 * Scrolling Phase
 */
export enum ScrollPhase {
  /**
   * Indicates the scroll content is at starting point
   */
  START,
  /**
   * Indicates the scroll content is at middle point
   */
  MID,
  /**
   * Indicates the scroll content has been reached to the end
   */
  END
}

/**
 * #### Scroll Observer
 */
export class ScrollObserver {
  /**
   * The Base Scroll Observable
   * All the other events are derived from this
   * Fires the scroll position in pixels
   */
  private _scrollBase: Observable<number>;

  /**
   * The buffer for the observables which are throttled by the same time
   */
  private _buffer: {[key: number]: Observable<number>} = {};

  /**
   * Scroll position getter
   *
   * Will be defined according to the target type
   */
  private scrollPositionGetter: () => number;

  /**
   * Fires the scroll position when scroll has been started
   */
  public scrollStart: Observable<number>;

  /**
   * Fires the scroll position when scroll has been ended
   */
  public scrollEnd: Observable<number>;

  /**
   * Fires the `ScrollDirection` when the scrolling direction has been changed
   */
  public scrollDirectionChange: Observable<ScrollDirection>;

  /**
   * Fires the scroll position only while scrolling down
   */
  public scrollingDown: Observable<number>;

  /**
   * Fires the scroll position only while scrolling up
   */
  public scrollingUp: Observable<number>;

  /**
   * Fires when scrolling phases has been changed {@link ScrollPhase}
   */
  public scrollPhase: Observable<ScrollPhase>;

  /**
   * Fires the remaining scrollable content in pixels
   */
  public remaining: Observable<number>;

  /**
   * @param target Scrolling Content
   * @param throttleTime Time interval to throttle scroll events
   * > The throttle time under 90ms will not work well because of performance prospects.
   * > It will fire much less event than expected.
   * > Use in caution!
   */
  constructor(
    public target: TScrollableContent,
    private throttleTime = 90
  ) {
    this.scrollPositionGetter = !(target instanceof Document)
      ? () => (<HTMLElement>target).scrollTop
      : browser === "Microsoft Edge" || browser === "Safari"
      ? () => window.scrollY
      : () => (<Document>target).documentElement.scrollTop;

    this._scrollBase = new Observable(subscriber => {
        let _target: EventTarget = target instanceof Document ? window : target;

        const handler = () => subscriber.next();

        _target.addEventListener("scroll", handler);

        return () => {
          _target.removeEventListener("scroll", handler);
        };
      })
      .pipe(startWith(null))
      .pipe(map(e => this.scrollPosition))
      .pipe(share());

    this.scrollEnd = this._scrollBase.pipe(debounceTime(throttleTime));

    this.scrollStart = <Observable<number>>merge(this._scrollBase, this.scrollEnd.pipe(map(e => false)))
      .pipe(distinctUntilChanged((x, y) => x !== false && y !== false))
      .pipe(filter(val => val !== false));

    this.scrollDirectionChange = this.scroll
      .pipe(pairwise())
      .pipe(map(([prev, next]) => prev < next ? ScrollDirection.DOWN : ScrollDirection.UP))
      .pipe(distinctUntilChanged((prevDirection, nextDirection) => prevDirection === nextDirection));

    this.scrollingDown = this.scrollDirectionChange
      .pipe(switchMap(direction => direction === ScrollDirection.DOWN ? this.scroll : empty()));

    this.scrollingUp = this.scrollDirectionChange
      .pipe(switchMap(direction => direction === ScrollDirection.UP ? this.scroll : empty()));

    this.scrollPhase = this._scrollBase
      .pipe(map(e => {
        if (e === 0) {
          return ScrollPhase.START;
        }
        if (e >= this.scrollableHeight - this.targetHeight) {
          return ScrollPhase.END;
        }
        return ScrollPhase.MID;
      }))
      .pipe(distinctUntilChanged());

    this.remaining = this._scrollBase
      .pipe(map(scrollPosition => this.scrollableHeight - scrollPosition - this.targetHeight));
  }

  /**
   * Returns the height of the target
   */
  private get targetHeight(): number {
    if (this.target instanceof Document) {
      return window.innerHeight;
    }
    return this.target.clientHeight;
  }

  /**
   * Returns the scrollable height of the target
   */
  private get scrollableHeight(): number {
    if (this.target instanceof Document) {
      return document.body.clientHeight;
    }

    return this.target.scrollHeight;
  }

  /**
   * Returns the scroll position
   */
  private get scrollPosition(): number {
    return this.scrollPositionGetter();
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
