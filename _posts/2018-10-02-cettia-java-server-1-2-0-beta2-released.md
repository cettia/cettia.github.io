---
layout: post
title: "Cettia Java Server 1.2.0-Beta2 released"
author: flowersinthesand
---

I’m happy to announce the availability of the first beta release of Cettia Java Server 1.2.0. As of this release, Java 8 is the minimum requirement. Accordingly, we added various useful features including a collection of useful socket predicates, `ServerSocketPredicates` class, based on Java 8 features including lambda expressions.

```xml
<dependency>
  <groupId>io.cettia</groupId>
  <artifactId>cettia-server</artifactId>
  <version>1.2.0-Beta2</version>
</dependency>
```

With new features in 1.2, we can rewrite a feature to allow only one socket per username in a more concise and expressive way as follows. The following code snippet finds sockets whose username is the same except the given socket, sends a `signout` event to the sockets to prevent reconnection, and closes connections.

w/ 1.1

```java
server.find(s -> username.equals(s.get("username")) && !socket.id().equals(s.id())).send("signout").close();
```

w/ 1.2

```java
server.find(attr("username", username).and(id(socket).negate())).send("signout").close();
```

Note that the above `attr` and `id` are statically imported from `ServerSocketPredicates`. For the full list of the changes, visit [1.2.0-Beta2 milestone](https://github.com/cettia/cettia-java-server/milestone/9?closed=1).

In the next GA release, we are thinking of deprecating the current finders like `Server#all` and `Server#byTag` in favor of `ServerSocketPredicates`. If you have any feedback, let us know via [Cettia Groups](http://groups.google.com/group/cettia).
