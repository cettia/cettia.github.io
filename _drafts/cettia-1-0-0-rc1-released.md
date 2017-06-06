---
layout: post
title: "Cettia 1.0.0-RC1 released"
author: flowersinthesand
---

I'm happy to announce the release of the Cettia 1.0.0-RC1 (Cetita Protocol 1.0.0-RC1, Cettia Java Server 1.0.0-RC1 and Cettia JavaScript Client 1.0.0-RC1). Based on the feedback, we added a small helper to resolve `HttpSession` from Servlet applications.

```java
HttpSessionResolver httpSessionResolver = new HttpSessionResolver();
HttpSession httpSession = httpSessionResolver.resolve(socket);
```

Please test this release so that we can handle any issues before releasing GA. And, here's one more thing.

> It's time to write the reference application and tutorial that demonstrate how to use the Cettia to develop a real-time web application. I guess it will be yet yet another Slack or Gitter ;) Of course, the source code will be open sourced under the Apache 2.0 license.

> We are going to define the application details based on the features of the Cettia, choose the tech stack based on the popularity in the Java ecosystem, and so on. If you are interested, feel free to share your thought on this.

You can share your thought at [this post](https://groups.google.com/d/msg/cettia/7u78XEh0avA/unAgi-JaCgAJ).

Here's the full changelog:

* Add support for resolving HttpSession from Servlet applications. [cettia-java-server#16](https://github.com/cettia/cettia-java-server/issues/16)
* Node 6/7 support. [cettia-protocol#17](https://github.com/cettia/cettia-protocol/issues/17), [cettia-javascript-client#17](https://github.com/cettia/cettia-javascript-client/issues/17)
* Update dependencies. [cettia-protocol#15](https://github.com/cettia/cettia-protocol/issues/15), [cettia-javascript-client#18](https://github.com/cettia/cettia-javascript-client/issues/18), [cettia-java-server#14](https://github.com/cettia/cettia-java-server/issues/14)
* Prefix query parameter representing protocol header with protocol name. [cettia-protocol#7](https://github.com/cettia/cettia-protocol/issues/7), [cettia-javascript-client#13](https://github.com/cettia/cettia-javascript-client/issues/13), [cettia-java-server#12](https://github.com/cettia/cettia-java-server/issues/12)
* Add the version protocol header. [cettia-protocol#19](https://github.com/cettia/cettia-protocol/issues/19), [cettia-javascript-client#22](https://github.com/cettia/cettia-javascript-client/issues/22), [cettia-java-server#15](https://github.com/cettia/cettia-java-server/issues/15)
* Drop support for Node 0.12. [cettia-protocol#16](https://github.com/cettia/cettia-protocol/issues/16)

As always, please let us know if you have any question or feedback.
