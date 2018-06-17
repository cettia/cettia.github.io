---
layout: post
title: "Cettia Java Platform is now Asity"
author: flowersinthesand
---

Cettia Java Platform is now called Asity, which is created to run Java web applications on any platform on top of the Java Virtual Machine seamlessly. Today, [Asity 1.0.0-Beta1](http://asity.cettia.io/1.0.0-Beta1) and accordingly [Cettia Java Server 1.0.0-Alpha3](http://cettia.io/projects/cettia-java-server/1.0.0-Alpha3) are released.

> Asity is a lightweight abstraction layer for web frameworks which is designed to build applications that can run on any full-stack framework, any micro framework or any raw server on the JVM.

With Asity, you can build web framework-agnostic applications on the JVM with ease. Now an application based on Asity can run on Atmosphere, Grizzly, Java WebSocket API, Netty, Servlet and Vert.x transparently.

Visit the [asity.cettia.io](http://asity.cettia.io) for full documentation.

### How to migrate

Here's how to migrate from Cettia Java Platform 1.0.0-Alpha1 to Asity 1.0.0-Beta1. Just rename the followings:

* GAV from `io.cettia.platform:cettia-platform-xxx:1.0.0-Alpha1` to to `io.cettia.asity:asity-xxx:1.0.0-Beta1`.
* Package from `io.cettia.platform` to `io.cettia.asity`.
* Class from `CettiaXXX` to `AsityXXX`.

Please let us, [Cettia Groups](http://groups.google.com/group/cettia), know if you have any question or feedback.
