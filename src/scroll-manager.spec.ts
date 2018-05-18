import "jasmine";
import { Subscription } from "rxjs";

import { ScrollManager } from "./scroll-manager";

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
  });
});
