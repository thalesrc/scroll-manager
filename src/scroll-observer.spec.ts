import "jasmine";

import { ScrollObserver } from "./scroll-observer";

describe("Scroll Observer", () => {
  it("should hello world", () => {
    console.log(ScrollObserver);
    expect(new ScrollObserver(document.createElement("div"))).toBeTruthy();
  });
});