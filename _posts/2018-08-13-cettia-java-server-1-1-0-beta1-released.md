---
layout: post
title: "Cettia Java Server 1.1.0-Beta1 released"
author: flowersinthesand
---

We are pleased to announce the release of Cettia Java Server 1.1.0-Beta1. This beta release adds a new feature to support "Finding sockets and doing something with them" intuitively, which is one of the basic concepts of Cettia.

```java
server.find(socket -> /* find sockets */).execute(socket -> /* do something with them */);
```

In addition, various features are added including an attributes for socket, a socket identifier, etc., and accompanying examples and details are supposed to be described in the GA release announcement. By then, check them in the website main. As a summary of a tutorial, a ['Getting Started'](/#getting-started) section is newly added to the main and covers new features in 1.1.0 as well. For the full list of the changes, visit [1.1.0-Beta1 milestone](https://github.com/cettia/cettia-java-server/milestone/6?closed=1).

By the way, we are considering [dropping support for Java 7 and requiring Java 8 as minimum Java version](https://github.com/cettia/cettia-java-server/issues/28) as of 1.2.0. We think it would be fine since no one seems to use Cettia in Java 7 but if this would be an issue, please let us know.
