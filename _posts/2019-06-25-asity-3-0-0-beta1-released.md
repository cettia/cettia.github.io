---
layout: post
title: "Asity 3.0.0-Beta1 released"
author: flowersinthesand
---

I'm glad to announce that the first beta of Asity 3.0.0 is out. Asity 3 includes Play framework 2 support, which is one of web frameworks the community has wanted for a long time. The first beta requires Play framework 2.7 and above but we are considering to lower the required Play framework version during the rest of the beta phase.

If you have ever used Play framework, please help us test, code review, and refactor the play-2 bridge. We found some features are not available in Play framework but not sure it's because of the framework, e.g. reading request body by chunk asynchronously and detecting disconnection. Here are some resources to help you get started.

- Play 2 bridge reference - [https://asity.cettia.io/#play-2](https://asity.cettia.io/#play-2)
- Play 2 bridge source code - [https://github.com/cettia/asity/tree/master/bridge-play2](https://github.com/cettia/asity/tree/master/bridge-play2)
- Play 2 example source code - [https://github.com/cettia/asity/tree/master/example-play2](https://github.com/cettia/asity/tree/master/example-play2)

Our plan is to release Asity 3.0.0 GA in Q3. If you have any questions or feedback, as always let us, [Cettia Groups](http://groups.google.com/group/cettia), know.
