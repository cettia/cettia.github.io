---
layout: post
title: "Asity 3.0.0 released"
author: flowersinthesand
---

It is my pleasure to announce that Asity 3 is available now. This major release includes **Play Framework 2** support. Actually, as you may know, Asity supported Play framework 5 years ago though it was dropped because of a lack of features when releasing the Asity 1.0 GA. In this release we rewrote the bridge from scratch using Akka Java API and successfully implemented the missing features.

If you want to jump right in and get started with Asity with Play Framework 2, start with the following examples.

- [Echo server](https://github.com/cettia/asity/tree/master/example-play2) - A simple web fragment to send back data to the client. It uses Play 2.6.
- [Cettia starter kit](https://github.com/cettia/cettia-starter-kit/tree/master/play2) - A basic chat application using a real-time webapp framework built on top of Asity. It uses Play 2.7.

For the Play bridge's reference documentation, visit [https://asity.cettia.io/#play-2](https://asity.cettia.io/#play-2).

There's no breaking changes with Asity 2.0. If you migrate from the last beta to GA, set the raw body parser for HTTP actions as follows. Of course, it applies to code using Play Framework 2 bridge, `asity-bridge-play2`, only.

```java
@BodyParser.Of(BodyParser.Raw.class)
public CompletionStage<Result> http(Http.Request request) {
  AsityHttpAction action = new AsityHttpAction();
  action.onhttp(httpAction);

  return action.apply(request);
}
```

The following bug fixes and improvements are included since the last beta.

- The minimum required version of Play framework is lowered from 2.7 to 2.6. Play 2.5 and below may work though we haven't tried it.
- It's confirmed that the Play bridge is compatible with Play Framework 2.8.0-M3.
- Bugs in the Play bridge's `readAsText(String charset)` are fixed. It requires to use the raw body parser.
- A generic wildcard in `onbody(Action<?> action)` and `onchunk(Action<?> action)` methods of `ServerHttpExchange` interface is replaced with a type parameter. Accordingly, you can write code like `http.<String>onchunk(http::write);` now.

While integrating Play Framework 2 with Asity, we confirmed that most key features work pretty well following the TDD principles, which means that you should have no problems in running a Cettia application on the Play Framework 2 through Asity. However, we also found the following known issues about "Transfer-encoding: chunked" request handling. 

- Play Framework doesn't support to read request body by chunk asynchronously. Now the bridge waits till the client finishes writing the body and give an action the whole request body when finished. Accordingly the `ServerHttpExchange#onchunk` methods is called only once with the whole request body.
- Play Framework doesn't detect TCP disconnection. For that reason the `ServerHttpExchange#onclose` method is not called, regardless of the connection state.

If you have any questions, feedback, or hints for known issues, don't hesitate to contact us, [Cettia Groups](http://groups.google.com/group/cettia).
