# @gen-tech/scroll-manager
[![travis](https://travis-ci.org/gen-tech/scroll-manager.svg)](https://travis-ci.org/gen-tech/scroll-manager)
[![Coverage Status](https://coveralls.io/repos/github/gen-tech/scroll-manager/badge.svg?branch=master)](https://coveralls.io/github/gen-tech/scroll-manager?branch=master)
[![npm](https://img.shields.io/npm/v/@gen-tech/scroll-manager.svg)](https://www.npmjs.com/package/@gen-tech/scroll-manager)
[![npm](https://img.shields.io/npm/dw/@gen-tech/scroll-manager.svg)](https://www.npmjs.com/package/@gen-tech/scroll-manager)
[![patreon](https://img.shields.io/badge/patreon-alisahin-orange.svg)](https://www.patreon.com/alisahin)
[![license](https://img.shields.io/npm/l/@gen-tech/scroll-manager.svg)](https://github.com/gen-tech/scroll-manager/blob/master/LICENSE)

Improved Scroll Events & Scroll Management

#### Installation
`npm install @gen-tech/scroll-manager --save`

#### Usage
```typescript
import scrollManager from "@gen-tech/scroll-manager";

const target = document.querySelector(".scrollable-div");

// Create an observer for the target
const observer = scrollManager.observe(target);

// Subscribe to targets scrollY events
observer.scrollY.subscribe(position => {
  console.log(position);
});
```

All Documentation => [gen-tech.github.io/scroll-manager](https://gen-tech.github.io/scroll-manager)
