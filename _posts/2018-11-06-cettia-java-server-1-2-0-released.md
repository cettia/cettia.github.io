---
layout: post
title: "Cettia Java Server 1.2.0 released"
author: flowersinthesand
---

It is my pleasure to announce that Cettia Java Server 1.2.0 is available now. As announced in August, we dropped support for Java 7 in this release and added useful features based on Java 8 features such as functional interfaces and lambda expressions. To migrate from 1.1 to 1.2, update the version of the dependency. There is no backward incompatible changes other than the minimum Java version.

```xml
<dependency>
  <groupId>io.cettia</groupId>
  <artifactId>cettia-server</artifactId>
  <version>1.2.0</version>
</dependency>
```

When we added Spring MVC and Spring WebFlux supports to [Asity 2](https://cettia.io/blog/asity-2-0-0-released/), we were inspired by the Spring WebFlux's functional programming model. In this release, we added a `ServerSocketPredicates` class, a helper for `ServerSocketPredicate` which consists of static methods that return various useful `ServerSocketPredicate`s, and the default methods, `and(ServerSocketPredicate that)`, `or(ServerSocketPredicate that)`, and `negate()`, to `ServerSocketPredicate`. `ServerSocketPredicate` and `ServerSocketPredicates` are analogous to `RequestPredicate` and `RequestPredicates` of Spring WebFlux.

The following are static methods to create socket predicates defined in the `ServerSocketPredicates`.

<dl>
  <dt><code>all()</code></dt>
  <dd>A predicate that always matches.</dd>
  <dt><code>attr(String key, Object value)</code></dt>
  <dd>A predicate that tests the socket attributes against the given key-value pair.</dd>
  <dt><code>id(ServerSocket socket)</code></dt>
  <dd>A predicate that tests the socket id against the given socket's id.</dd>
  <dt><code>id(String id)</code></dt>
  <dd>A predicate that tests the socket id against the given socket id.</dd>
  <dt><code>tag(String... tags)</code></dt>
  <dd>A predicate that tests the socket tags against the given tags.</dd>
</dl>

For example, you can find sockets whose username is the same with the given `username` excluding the given `socket` as follows. Assume the `attr` and `id` are statically imported from the `ServerSocketPredicates` class.

```java
// import static io.cettia.ServerSocketPredicates.attr;
// import static io.cettia.ServerSocketPredicates.id;
ServerSocketPredicate p = attr("username", username).and(id(socket).negate());
```

The above predicate can be utilized to limit only one socket per user declaratively like only one session per user. Assume that the `username` is given through a security framework like Apache Shiro and Spring Security and the `signout` event handler in the client side closes a connection and stops reconnecting.

```java
server.onsocket(socket -> {
  // Limits only one socket per user
  server.find(attr("username", username).and(id(socket).negate())).send("signout").close();
});
```

In favor of the `ServerSocketPredicates` class, the existing finder methods such as `Server#all()` and `Server#byTag(String tags...)` are deprecated. Replace them with `all()` and `tag(String... tags)` defined in the `ServerSocketPredicates` with `Server#find(ServerSocketPredicate predicate)`. The finders will be removed in the next major version.

Also, `Sentence#find(ServerSocketPredicate predicate)` is added which creates and returns a sentence with a given predicate like `Server#find(ServerSocketPredicate predicate)` but has a composed predicate that represents a short-circuiting logical AND of the original sentence's predicate and the given predicate. We expect that it will greatly improve the reusability of a sentence. For example, if sockets are tagged with the application type e.g. web, android, desktop when initailized, we can find sockets by the user and then by the application type again.

```java
// import static io.cettia.ServerSocketPredicates.attr;
// import static io.cettia.ServerSocketPredicates.tag;

// Sockets opened by the user
Sentence user = server.find(attr("username", "flowersinthesand"));
user.send(event1);

// Sockets opened through the user's android application
Sentence android = user.find(tag("android"));
android.send(event2);

// Sockets opened through the user's web application
Sentence web = user.find(tag("web"));
web.send(event3);
```

[Cettia starter kit](https://github.com/cettia/cettia-starter-kit) based on Servlet 3 and Java API for WebSocket 1 and [ralscha/cettia-demo](https://github.com/ralscha/cettia-demo) based on Spring framework 5 are updated with Cettia Java Server 1.2.0. Check out the working examples to see it in action. If you have any feedback, let us know via [Cettia Groups](http://groups.google.com/group/cettia).
