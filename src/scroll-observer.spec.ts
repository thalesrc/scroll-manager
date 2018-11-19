import { interval, Subscription, Observable } from "rxjs";
import { take, takeUntil, first, tap, debounceTime, switchMap, delay } from "rxjs/operators";
import { ScrollObserver } from "./scroll-observer";
import { ScrollDirection, ScrollPhase } from "./models";

let testContainer: HTMLDivElement;
const subscriptions: {[key: string]: Subscription} = {};

describe("Scroll Observer", () => {
  beforeAll(() => {
    document.body.style.minHeight = "500vh";

    testContainer = document.createElement("div");
    testContainer.style.height = "50px";
    testContainer.style.overflow = "scroll";
    testContainer.style.boxSizing = "border-box";

    document.body.appendChild(testContainer);
  });

  beforeEach(done => {
    Object.keys(subscriptions).forEach(sub => subscriptions[sub].unsubscribe());
    window.scrollTo(0, 0);
    testContainer.innerHTML = "<div style=\"height: 1000vh;\"></div>";
    setTimeout(() => {
      done();
    }, 100);
  });

  it("should initialize properly", () => {
    expect(new ScrollObserver(document.createElement("div"))).toBeTruthy();
  });

  it("should able to accept element or document target", () => {
    expect(new ScrollObserver(document)).toBeTruthy();
    expect(new ScrollObserver(document.createElement("div"))).toBeTruthy();
  });

  it("should track scroll events to fire properly", done => {
    const docObserver = new ScrollObserver(document);
    const divObserver = new ScrollObserver(testContainer);
    let docFireCount = 0;
    let divFireCount = 0;

    interval(10)
      .pipe(take(20))
      .subscribe(
        i => {
          window.scrollTo(0, i * 10);
          testContainer.scrollTo(0, i * 10);
        },
        () => fail(),
        () => {
          expect(docFireCount).toBeGreaterThan(0);
          expect(divFireCount).toBeGreaterThan(0);
          done();
        }
      );

    subscriptions["doc"] = docObserver.scroll.subscribe(() => {
      docFireCount++;
      divFireCount++;
    });
  });

  it("should throttle scroll events", done => {
    const docObserver = new ScrollObserver(document);
    const twoHundredsMs = new ScrollObserver(document, 200);
    let docObserverEvents = 0;
    let twoHundredsMsEvents = 0;

    subscriptions["default"] = docObserver.scroll.subscribe(() => {
      docObserverEvents++;
    });


    subscriptions["200"] = twoHundredsMs.scroll.subscribe(() => {
      twoHundredsMsEvents++;
    });

    setTimeout(() => {
      interval(20)
      .pipe(takeUntil(interval(500).pipe(first())))
      .subscribe(
        i => {
          window.scrollTo(0, (i + 1) * 10);
        },
        () => fail(),
        () => {
          setTimeout(() => {
            expect(docObserverEvents).toBe(6); // Should throttle by 90ms by default
            expect(twoHundredsMsEvents).toBe(3);
            done();
          }, 500);
        }
      );
    }, 100);
  });

  it("should not throttle when listen gets 0 as argument", done => {
    const docObserver = new ScrollObserver(document);
    let windowCount = 0;
    let observerCount = 0;

    interval(10)
      .pipe(take(50))
      .subscribe(
        i => {
          window.scrollTo(0, i * 10);
        },
        () => fail(),
        () => {
          setTimeout(() => {
            expect(windowCount).toBe(observerCount - 1); // One event will fire on initialize
            done();
          }, 100);
        }
      );

    subscriptions["obs"] = new Observable(subs => {
        window.addEventListener("scroll", () => subs.next());
      })
      .subscribe(() => {
        windowCount++;
      });

    subscriptions["def"] = docObserver.listen(0).subscribe(() => {
      observerCount++;
    });
  });

  it("should fire scrollStart event 3 times", done => {
    const observer = new ScrollObserver(document);
    let scrollStartFired = 0;

    observer.scrollStart.subscribe(() => {
      scrollStartFired++;
    });

    interval(10).pipe(
      take(20),
      tap(i => window.scrollTo(0, i * 10)),
      debounceTime(200),
      delay(200),
      first(),
      switchMap(() => interval(10)),
      take(20),
      tap(i => window.scrollTo(0, (i + 20) * 10)),
      debounceTime(200),
      delay(200),
      first(),
      switchMap(() => interval(10)),
      take(20),
      tap(i => window.scrollTo(0, (i + 40) * 10)),
    )
      .toPromise()
      .then(() => {
        expect(scrollStartFired).toBe(3);
        done();
      })
      .catch(err => fail());
  });

  it("should fire scrollEnd event 3 times", done => {
    const observer = new ScrollObserver(document);
    let scrollStartFired = 0;

    observer.scrollEnd.subscribe(() => {
      scrollStartFired++;
    });

    interval(10).pipe(
      take(20),
      tap(i => window.scrollTo(0, i * 10)),
      debounceTime(200),
      delay(200),
      first(),
      switchMap(() => interval(10)),
      take(20),
      tap(i => window.scrollTo(0, (i + 20) * 10)),
      debounceTime(200),
      delay(200),
      first(),
      switchMap(() => interval(10)),
      take(20),
      tap(i => window.scrollTo(0, (i + 40) * 10)),
      debounceTime(200),
      first(),
      delay(200)
    )
      .toPromise()
      .then(() => {
        expect(scrollStartFired).toBe(3);
        done();
      })
      .catch(err => fail());
  });

  it("should fire scroll direction changes", done => {
    const observer = new ScrollObserver(document);
    let directionChangedFired = 0;
    let upDirectionFired = 0;
    let downDirectionFired = 0;

    observer.scrollYDirectionChange.subscribe(dir => {
      directionChangedFired++;

      if (dir === ScrollDirection.TOP) {
        upDirectionFired++;
      } else {
        downDirectionFired++;
      }
    });

    interval(10).pipe(
      take(20),
      tap(i => window.scrollTo(0, i * 10)),
      debounceTime(200),
      delay(200),
      first(),
      switchMap(() => interval(10)),
      take(20),
      tap(i => window.scrollTo(0, (20 - i) * 10)),
      debounceTime(200),
      delay(200),
      first(),
      switchMap(() => interval(10)),
      take(20),
      tap(i => window.scrollTo(0, i * 10)),
      debounceTime(200),
      first(),
      delay(200)
    )
      .toPromise()
      .then(() => {
        expect(directionChangedFired).toBe(3);
        expect(upDirectionFired).toBe(1);
        expect(downDirectionFired).toBe(2);
        done();
      })
      .catch(err => fail());
  });

  it("should fire only scrolling down event while scrolling down", done => {
    const observer = new ScrollObserver(document);
    let scrollDown = 0;
    let scrollUp = 0;

    observer.scrollingDown.subscribe(() => {
      scrollDown++;
    });

    observer.scrollingUp.subscribe(() => {
      scrollUp++;
    });

    interval(10).pipe(
      takeUntil(interval(500).pipe(first())),
      tap(i => window.scrollTo(0, i * 10)),
      debounceTime(200),
      delay(200),
      first(),
      delay(200)
    )
      .toPromise()
      .then(() => {
        expect(scrollDown).toBeGreaterThan(0);
        expect(scrollUp).toBe(0);
        done();
      })
      .catch(err => fail());
  });

  it("should fire only scrolling up event while scrolling upwards", done => {
    window.scrollTo(0, 1000);

    const observer = new ScrollObserver(document);
    let scrollDown = 0;
    let scrollUp = 0;

    observer.scrollingDown.subscribe(() => {
      scrollDown++;
    });

    observer.scrollingUp.subscribe(() => {
      scrollUp++;
    });

    interval(10).pipe(
      takeUntil(interval(500).pipe(first())),
      tap(i => window.scrollTo(0, (100 - i) * 10)),
      debounceTime(200),
      delay(200),
      first(),
      delay(200)
    )
      .toPromise()
      .then(() => {
        expect(scrollUp).toBeGreaterThan(0);
        expect(scrollDown).toBe(0);
        done();
      })
      .catch(err => fail());
  });

  it("should phases properly", done => {
    const observer = new ScrollObserver(document);
    let phase: ScrollPhase;

    observer.scrollYPhase.subscribe(p => {
      phase = p;
    });

    window.scrollTo(0, 0);

    setTimeout(() => {
      expect(phase).toBe(ScrollPhase.START);
    }, 100);

    setTimeout(() => {
      window.scrollTo(0, 500);

      setTimeout(() => {
        expect(phase).toBe(ScrollPhase.MID);
      }, 100);
    }, 200);

    setTimeout(() => {
      window.scrollTo(0, 1000000);

      setTimeout(() => {
        expect(phase).toBe(ScrollPhase.END);
        done();
      }, 100);
    }, 400);
  });

  it("should fire remaining scroll position properly", done => {
    // Testcontainer Height = 50px

    (<HTMLElement>testContainer.children[0]).style.height = "1000px";

    const observer = new ScrollObserver(testContainer);
    let lastScroll = 0;

    observer.remainingY.subscribe(pos => {
      lastScroll = pos;
    });

    testContainer.scrollTo(0, 500);

    setTimeout(() => {
      expect(lastScroll).toBe(450);

      testContainer.scrollTo(0, 750);

      setTimeout(() => {
        expect(lastScroll).toBe(200);
        done();
      }, 100);

    }, 100);
  });
});