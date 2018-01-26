---
layout: post
title: "Cettia 1.0.0 released"
author: flowersinthesand
---

Finally, several years of long journey up to 1.0.0 has ended and I'm very happy to announce the release of Cettia 1.0.0 (Cetita Protocol 1.0.0, Cettia Java Server 1.0.0, and Cettia JavaScript Client 1.0.0).

> Cettia is a real-time web application framework that allows you to focus on event handling itself. It provides reliable full duplex connection which frees you from the pitfalls of traditional real-time programming, and elegant patterns which eliminate the boilerplate code involved with full duplex connection. Besides, it's designed to work well with any transport technologies, any I/O frameworks, and any scaling methods, which is critical for modern enterprise applications.

Comparing to 7 years ago when I started Cettia's predecessor's predecessor (A jQuery plugin for HTTP streaming; I used to use it to demonstrate Servlet 3.0's Async Servlet in IE 6), it has become much easier to create a real-time web application in both server-side and client-side but is still difficult now to meet the following conditions when writing a real-time web app:

- I/O framework agnostic
    - Reactive everywhere. When adopting an I/O framework to serve your application, you should be able to select it according to performance, productivity, familiarity and so on with no regard to this kind of framework.
    - That's why Cettia is designed to run on any I/O framework on Java Virtual Machine (JVM) seamlessly without degrading the underlying framework's performance. Now Atmosphere, Grizzly, Java Servlet, Java WebSocket API, Netty and Vert.x are supported.
    - Even if your favorite I/O framework is not supported, don’t worry. With more or less 200 code lines, you can write a bridge to your framework and run Cettia via that bridge.
- Reliable full duplex connection
    - If given proxy, firewall, anti-virus software or arbitrary Platform as a Service (PaaS), it's very difficult to be absolutely-sure that WebSocket will just work. You still need "Comet" in 2018, a set of giant hacks for HTTP server-push defined more than 10 years ago.
    - HTTP-based transports Cettia provides i.e. streaming and long polling can carry, not only text but also binary payload based on message framing bidirectionally in real-time just like WebSocket. They just work in the wild.
    - Of course, you don't need to (and should not) know under the hood details. Just open a socket and register event handlers. Cettia will do the rest and call your event handlers.
- Elegant suite of patterns
    - WebSocket's message event is not flexible enough to branch your logic especially in handling text and binary data together. Cettia provides the event system which allows to define your own events regardless of the type of data. No more boilerplate code.
    - One of common pitfalls in working on real world user stories is regarding a user as a single socket. Instead, you should send event to all browsers and devices the user signed in. To help this, Cettia provides a concise API that allows to regard a set of sockets as a single entity.
    - Whatever the reason is, it's inevitable that the connection is disconnected. To help you handle disconnection declaratively, Cettia provides separate events for temporary disconnection and permanent disconnection along with events failed to send during disconnection.
- Scalable horizontally
    - Because the location of the socket is transparent and Cettia servers don't share any data, you can scale your application horizontally with publish-subscribe model like Java Message Service (JMS). Of course, you don't need to modify existing event handlers.
    - Within the microservice architecture or the serverless architecture, it's possible to scale out only the Cettia part of your application using publish-subscribe solution, which is much more cost-effective comparing to the monolithic architecture.
    - With the cloud computing service supporting autoscaling like Amazon Web Service, Microsoft Azure and Google Cloud Platform, it's quite easy to set up scalable cluster of Cettia.

Are you convinced? I bet you are ;) Visit sub-projects for quick starts and working examples:

<ul class="menu">
  <li><a href="/projects/cettia-java-server/1.0.0">Cettia Java Server</a></li>
  <li><a href="/projects/cettia-javascript-client/1.0.0">Cettia JavaScript Client</a></li>
</ul>

Here's a brief roadmap for the next major version.

- Set Java 8 as a minimum JDK version.
- Reference application.
- Reactive Streams support.
- More I/O frameworks support i.e. Play 2, Vert.x 3, Servlet 4 and so on.
- Support batch processing for exchanging messages in HTTP transports.
- Interchangeable binary event format e.g. from MessagePack to BSON.
- Introduce new transport based on HTTP2 server push.

I would like to thank everyone who has given us feedback on Cettia and its predecessors over the few years. These feedbacks have been and will be very useful in developing Cettia! Feel free to get in touch with us and share your questions and experience or just say hi on [Cettia Groups](http://groups.google.com/group/cettia) :)
