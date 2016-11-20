---
layout: post
title: "Cettia JavaScript Client 1.0.0-Beta2 released"
author: flowersinthesand
---

[Cettia JavaScript Client 1.0.0-Beta2](/projects/cettia-javascript-client/1.0.0-Beta2) has been released. This release brings support for bundlers such as [webpack](https://webpack.github.io/), [Browserfiy](http://browserify.org/) or [Rollup](http://rollupjs.org/).

> 
Kudos to [@DDKnoll](https://github.com/DDKnoll) for the great work. For the details of how to make Cettia work with bundlers, see [this pull request](https://github.com/cettia/cettia-javascript-client/pull/14).

To require the module for a browser bundle: 

```javascript
import cettia from "cettia-client/cettia-bundler"; // ES6 way
```
```javascript
var cettia = require('cettia-client/cettia-bundler'); // CommonJS way
```

As of this release, for the sake of easy management, we have dropped support for Asynchronous Module Definition (AMD) and Bower and made a decision to use [unpkg](https://unpkg.com) that serves files from npm packages as a CDN. Accordingly, `cettia.min.js` has been renamed to `cettia-browser.min.js` and is available at https://unpkg.com/cettia-client@1.0.0-Beta2/cettia-browser.min.js. 

As always, please let us, [Cettia Groups](http://groups.google.com/group/cettia), know if you have any question or feedback.
