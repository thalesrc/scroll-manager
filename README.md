![Gen Tech](https://avatars3.githubusercontent.com/u/39004692?s=88&v=4)
# Scroll Manager

[![travis](https://travis-ci.org/thalesrc/scroll-manager.svg)](https://travis-ci.org/thalesrc/scroll-manager)
[![codecov](https://codecov.io/gh/thalesrc/scroll-manager/branch/master/graph/badge.svg)](https://codecov.io/gh/thalesrc/scroll-manager)
[![npm](https://img.shields.io/npm/v/@thalesrc/scroll-manager.svg)](https://www.npmjs.com/package/@thalesrch/scroll-manager)
[![npm](https://img.shields.io/npm/dw/@thalesrc/scroll-manager.svg)](https://www.npmjs.com/package/@thalesrc/scroll-manager)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![patreon](https://img.shields.io/badge/patreon-alisahin-orange.svg)](https://www.patreon.com/alisahin)
[![license](https://img.shields.io/npm/l/@thalesrc/scroll-manager.svg)](https://github.com/thalesrc/scroll-manager/blob/master/LICENSE)

__Improved Scroll Events & Scroll Management for web development__

> Supports horizontal scroll

> Written with Typescript

> Built with Rxjs

## Installation
`npm install @thalesrc/scroll-manager --save`

## Usage
```typescript
import scrollManager from "@thalesrc/scroll-manager";

const target = document.querySelector(".scrollable-div");

// Create an observer for the target
const observer = scrollManager.observe(target);

/**
 * Subscribe to targets scrollY events
 */
observer.scrollY.subscribe(position => {
  console.log(position);
});

/**
 * To track window scroll, use `root`
 */
scrollManager.root.scrollY.subscribe(position => {
  console.log(position);
});
```

### Some of Available Scroll Event Streams
```typescript

// Scroll Start
observer.scrollStart.subscribe(position => {
  // {top: number, left: number}
});

// Scroll End
observer.scrollEnd.subscribe(position => {
  // {top: number, left: number}
});

// Scroll Direction Change
observer.scrollDirectionChange.subscribe(position => {
  // 1, 2, 4, 8 (TOP, BOTTOM, LEFT, RIGHT)
});

// Scrolling Down
observer.scrollingDown.subscribe(position => {
  // number
});


// Remaining scrollable area to the right in pixels
observer.remainingX.subscribe(position => {
  // number
});

```

## Performance
By default, scroll-manager throttles scroll events in every 90ms for performance prospects

If you want to capture all events use `const observer = scrollManager.observe(target, 0);`

## Api Documentation
[thalesrc.github.io/scroll-manager](https://thalesrc.github.io/scroll-manager)

## License
MIT
