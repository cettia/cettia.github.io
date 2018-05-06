---
layout: post
title: "Cettia 1.0.0-Alpha1 released"
author: flowersinthesand
---

After a year and a half of research and experiment, it is my pleasure to announce that the first alpha of Cettia, a real-time web application framework, is now available. 

> Cettia is a new web framework to write real-time web application and service based on its own polyglot protocol built over transport such as HTTP and WebSocket. Cettia focuses on providing reliable full duplex connection and making the best use of it for modern enterprise applications so that teams can focus on event handling itself without unnecessary ties to low-level details and integrate application with any high-level technologies or patterns for enterprise application with ease.

The Cettia project consists of protocol and implementations and as implementation Java Server and JavaScript Client are provided. Please note that each project has many more useful features besides its name suggests.

Here's a very simple example demonstrating essential functionalities. For working example, please refer to the quick start guide of [Java Server](/projects/cettia-java-server/1.0.0-Alpha1/#quick-start) and [JavaScript Client](/projects/cettia-javascript-client/1.0.0-Alpha1/#quick-start) or visit [repository for a lot of examples](https://github.com/cettia/cettia-examples).

<div class="grid-x grid-margin-x">
<div class="cell large-6">
{% capture panel %}
**Java Server**

```java
final Server server = new DefaultServer();
server.onsocket(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        socket.on("echo", new Action<String>() {
            @Override
            public void on(String data) {
                socket.send("echo", data);
            }
        });
        socket.on("chat", new Action<String>() {
            @Override
            public void on(String data) {
                server.all().send("chat", data);
            }
        });
    }
});
// And bridge the above server to your favorite platform like 
// Atmosphere, Grizzly, Netty, Play, Servlet, Vert.x and so on
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="cell large-6">
{% capture panel %}
**JavaScript Client**

```javascript
var socket = cettia.open("http://localhost:8080/cettia");
socket.on("open", function() {
    socket.send("echo", "An echo message");
    socket.send("chat", "A chat message");
});
socket.on("echo", function(data) {
    console.log("on echo event:", data);
});
socket.on("chat", function(data) {
    console.log("on chat event:", data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

Here is a summary of key features in Cettia overall:

* **Based on protocol** - Real-time web will be everywhere soon. You will need more features to write a just simple real-time webapp. The separated protocol is the baseline to build such features.
* **Polyglot** - It's not just for Java and JavaScript but for any language. With the reference implementation and test suite, you can easily not only implement the protocol in any language but also verify your client and server.
* **Standards** - As component of the protocol, RFC and W3C standards are mainly adopted. Just use existing implementation as desired. You don't need to reinvent the wheel.
* **Transport layer** - Any transport technology besides WebSocket and HTTP can be used to bridge client and server as long as it meets requirements of Cettia transport. Along that way, you can control sockets backed by hetero transports through one server.
* **Event not message** - The unit of data to be sent and received from the semantic point of view is an event object associated with a customizable type, which is easy to compose a controller from MVC.
* **Remote Procedure Call** - It also allows to attach callbacks in sending event and to call those callbacks with the result of the event processing in receiving event. It's useful where request-response model is more suited than notification model.
* **Server and Socket** - All the interfaces you need to know to handle server are Server producing and managing socket and Socket representing the remote client. Select some sockets from server and do something with them like manipulating DOM using jQuery.
* **Entity as well as connection** - Tag gives you a way to handle a specific entity in the real world as an identifier of a group of sockets. For example, you can use it to model a user logged in using multiple devices or subscribers to a specific topic.
* **Dependency injection friendly** - A use case with DI framework is definite. Define a server as a singleton and inject it wherever you want to handle socket just like when using EntityManager from JPA.
* **Scalability** - A publish-subscribe messaging system is enough to scale your application. Because servers don't share any data, you can scale application horizontally with ease as well as don't need to prepare for data grid system or NoSQL solution.
* **Run on any platform** - Because server is built on a simple abstraction layer for various application platforms running on JVM, you can run your application on any supported platform seamlessly. Now Atmosphere, Grizzly, Java WebSocket API, Netty, Play, Servlet and Vert.x are supported.
* **Lightweight** - JavaScript client takes 5.1KB minified and gzipped. Compare it to others: Socket.IO 1.3.4 - 19.96KB, Sockjs 0.3.4 - 10.09KB and Autobahn latest - 37.17KB.
* **Wide browser support** - Wherever jQuery 1 is available, you can write a real-time webapp. A multitude of browsers are supported according to jQuery 1's browser support policy embracing IE 6.
* **Proved flexibility** - It is flexible enough to integrate with any technologies, patterns or frameworks for enterprise application with ease, which has been proved by a lot of examples.
* **100% open source** - All projects are distributed under the Apache Software License 2.0 which is one of the most flexible open source licenses. 

And here is the roadmap of Cettia 1.0:

* **Offline application** - It is necessary to handle sockets whose connection is disconnected for a little while. This feature will provide events you can utilize to deal with such case properly by making socket to be backed by multiple transports not just one. [cettia-protocol#1](https://github.com/cettia/cettia-protocol/issues/1)
* **Binary support** - Cettia transport can carry binary data but how to make use of it for event object is not yet determined. With this feature, you will be able to use an object containing binary data as event's data and exchange it without binary-to-text conversion.
* **Complete Play support** - The current implementation written in Play's Java API misses some functionalities. To fix that issue, new implementation will be written in Play's Scala API and also come with helpers making it easy to bridge application and Play. [cettia-java-platform#3](https://github.com/cettia/cettia-java-platform/issues/3)
* **More examples** - A reference application to illustrate how Cettia can be used to build modern web application and more archetype applications to demonstrate how Cettia can be integrated with other technologies and frameworks will be provided.

For full documentation and information on Cettia, please visit the [website](http://cettia.io).

Thanks for all the feedback from early adopters. The feedback has been and will be very important to us, so please feel free to get in touch with us, [Cettia Groups](http://groups.google.com/group/cettia), if you have any question or feedback.
