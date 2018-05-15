import "jasmine";

import { interval, noop, Subscription, Observable } from "rxjs";
import { take } from "rxjs/operators";
import { ScrollObserver } from "./scroll-observer";

let testContainer: HTMLDivElement;
const subscriptions: {[key: string]: Subscription} = {};

describe("Scroll Observer", () => {
  beforeAll(() => {
    document.body.style.minHeight = "500vh";

    testContainer = document.createElement("div");
    testContainer.style.height = "50px";
    testContainer.style.overflow = "scroll";

    document.body.appendChild(testContainer);
  });

  beforeEach(() => {
    Object.keys(subscriptions).forEach(sub => subscriptions[sub].unsubscribe());
    window.scrollTo(0, 0);
    testContainer.innerHTML = "<div style=\"height: 1000vh;\"></div>";
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
    const aHundredMs = new ScrollObserver(document, 100);
    const twoHundredsMs = new ScrollObserver(document, 200);
    let docObserverEvents = 0;
    let aHundredMsEvents = 0;
    let twoHundredsMsEvents = 0;

    interval(10)
      .pipe(take(50))
      .subscribe(
        i => {
          window.scrollTo(0, i * 10);
        },
        () => fail(),
        () => {
          setTimeout(() => {
            expect(docObserverEvents).toBe(6); // Should throttle by 90ms by default
            expect(aHundredMsEvents).toBe(5);
            expect(twoHundredsMsEvents).toBe(3);
            done();
          }, 500);
        }
      );

    subscriptions["default"] = docObserver.scroll.subscribe(() => {
      docObserverEvents++;
    });

    subscriptions["100"] = aHundredMs.scroll.subscribe(() => {
      aHundredMsEvents++;
    });

    subscriptions["200"] = twoHundredsMs.scroll.subscribe(() => {
      twoHundredsMsEvents++;
    });
  });

  it("should not throttle when throttleBy gets 0 as argument", done => {
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

    subscriptions["def"] = docObserver.throttleBy(0).subscribe(() => {
      observerCount++;
    });
  });

  // it("should fire scrollStart events as expected", done => {
  //   const observer = new ScrollObserver(document);

  //   interval(10)
  //     .pipe(take(20))
  //     .subscribe(
  //       i => {
  //         window.scrollTo(0, i * 10);
  //       },
  //       () => fail(),
  //       () => {
  //         setTimeout(() => {
  //           expect(windowCount).toBe(observerCount - 1); // One event will fire on initialize
  //           done();
  //         }, 100);
  //       }
  //     );
  // });
});