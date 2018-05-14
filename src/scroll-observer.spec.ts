import "jest";

import { ScrollObserver } from "./scroll-observer";

describe("Scroll Observer", () => {
  it("should initialize properly", () => {
    expect(new ScrollObserver(document.createElement("div"))).toBeTruthy();
  });
});