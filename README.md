# @gen-tech/scroll-manager
[![travis](https://travis-ci.org/gen-tech/scroll-manager.svg)](https://travis-ci.org/gen-tech/scroll-manager)
[![Coverage Status](https://coveralls.io/repos/github/gen-tech/scroll-manager/badge.svg?branch=master)](https://coveralls.io/github/gen-tech/scroll-manager?branch=master)
[![npm](https://img.shields.io/npm/v/@gen-tech/scroll-manager.svg)](https://www.npmjs.com/package/@gen-tech/scroll-manager)
[![npm](https://img.shields.io/npm/dw/@gen-tech/scroll-manager.svg)](https://www.npmjs.com/package/@gen-tech/scroll-manager)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![patreon](https://img.shields.io/badge/patreon-alisahin-orange.svg)](https://www.patreon.com/alisahin)
[![license](https://img.shields.io/npm/l/@gen-tech/scroll-manager.svg)](https://github.com/gen-tech/scroll-manager/blob/master/LICENSE)

Improved Scroll Events & Scroll Management for web development

> Supports horizontal scroll

> Written with Typescript

> Built with Rxjs

## Installation
`npm install @gen-tech/scroll-manager --save`

## Usage
```typescript
import scrollManager from "@gen-tech/scroll-manager";

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
By default, scroll-manager throttles scroll events for every 90ms.

If you want to capture all events use `const observer = scrollManager.observe(target, 0);`

## Api Documentation
[gen-tech.github.io/scroll-manager](https://gen-tech.github.io/scroll-manager)

## License
MIT
