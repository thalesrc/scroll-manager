import { Subscription } from "rxjs";

import { ScrollManager } from "./scroll-manager";
import { ScrollObserver } from "./scroll-observer";

let testContainer: HTMLDivElement;
const subscriptions: {[key: string]: Subscription} = {};

describe("Scroll Manager", () => {
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
    expect(new ScrollManager()).toBeTruthy();
    expect(new ScrollManager(200)).toBeTruthy();
  });

  it("should be able to create scroll observers", () => {
    const manager = new ScrollManager();
    const docObserver = manager.observe(document);
    const divObserver = manager.observe(testContainer);

    expect(docObserver instanceof ScrollObserver).toBe(true);
    expect(divObserver instanceof ScrollObserver).toBe(true);
  });

  it("should cache observers of same targets", () => {
    const manager = new ScrollManager();
    const docObserver1 = manager.observe(document);
    const docObserver2 = manager.observe(document);
    const divObserver1 = manager.observe(testContainer);
    const divObserver2 = manager.observe(testContainer);

    expect(docObserver1).toBe(docObserver2);
    expect(divObserver1).toBe(divObserver2);
  });

  it("should return document observer when root getter run", () => {
    const manager = new ScrollManager();
    const root = manager.root;
    const docObserver = manager.observe(document);

    expect(root).toBe(docObserver);
  });

  it("should scroll to element", done => {
    const manager = new ScrollManager();

    manager
      .scrollToElement(testContainer)
      .then(() => {
        expect(testContainer.getBoundingClientRect().top).toBe(0);
        done();
      });
  });

  it("should scroll to element with given offset", done => {
    const manager = new ScrollManager();

    manager
      .scrollToElement(testContainer, {offsetTop: 50})
      .then(() => {
        expect(testContainer.getBoundingClientRect().top).toBe(-50);
        done();
      });
  });

  it("should be able to scroll to top", done => {
    const manager = new ScrollManager();

    window.scrollTo(0, 500);

    setTimeout(() => { // Wait for scroll end event
      manager
        .scrollTop()
        .then(() => {
          expect(window.scrollY).toBe(0);
          done();
        });
    }, 100);
  });
});
