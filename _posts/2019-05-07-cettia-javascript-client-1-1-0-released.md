---
layout: post
title: "Cettia JavaScript Client 1.1.0 released"
author: flowersinthesand
---

Cettia JavaScript Client 1.1.0 has been released with many improvements including React Native support.

### React Native support

One of the key pieces of the 2019 roadmap is to support mobile application development. As the first milestone React Native support has been added. In React Native, you can load a `cettia` object as you would in a bundler such as Webpack. (React Native internally uses a bundler called Metro) The rest is the same. Use Cettia as you would when creating a webapp.

```javascript
import cettia from "cettia-client/cettia-bundler";
```

To demonstrate how it works on React Native, we added React Native example to the starter kit. Please check it out -- [https://github.com/cettia/cettia-starter-kit/#react-native](https://github.com/cettia/cettia-starter-kit/#react-native)

Here's the full changelog:

- React Native support [#24](https://github.com/cettia/cettia-javascript-client/issues/24) [cettia-starter-kit#2](https://github.com/cettia/cettia-starter-kit/issues/2)
- Update dependencies [#26](https://github.com/cettia/cettia-javascript-client/issues/26)
- Fix a typo in webpack configuration [#20](https://github.com/cettia/cettia-javascript-client/issues/20)
- Tests fail with ws 1.1+ [#19](https://github.com/cettia/cettia-javascript-client/issues/19)
- Run tests on Node 8+ [#27](https://github.com/cettia/cettia-javascript-client/issues/27)

As always, feel free to share your feedback or question on [the mailing list](http://groups.google.com/group/cettia).
