---
layout: guide
title: "Building real-time web applications with Cettia"
---

<div class="callout warning">
  <p>This tutorial is work in progress.</p>
</div>

## Building real-time web applications with Cettia

Comparing to 7 years ago (2011) when I started Cettia's predecessor's predecessor (A jQuery plugin for HTTP streaming; I used to use it to demonstrate Servlet 3.0's Async Servlet with IE 6), WebSocket and Asynchronous IO have come into wide use and it has become easier to develop and maintain real-time web applications in both client and server environment. In the meantime, however, functional and non-functional requirements have become more sophisticated and difficult to meet, and it has become harder to estimate the accompanying technical debt and keep it under control as well.

The [Cettia](http://cettia.io) is the result of projects started out as an effort to address these challenges and is a framework to create real-time web applications without compromise:

- It is designed to run on any I/O framework on Java Virtual Machine (JVM) seamlessly.
- It provides simply working full duplex connection even if given proxy, firewall, anti-virus software or arbitrary Platform as a Service (PaaS).
- It is designed not to share data between servers and can be scaled horizontally with ease.
- It offers the event system to classify events which take place in server-side and client-side and exchange them in real-time.
- It streamlines a set of sockets handling that is helpful to improve the multi-device user experience a lot.
- It allows to deal with temporary disconnection and permanent disconnection in an event-driven way.

In this tutorial, we will take a look at features required to create real-time oriented web applications with Cettia and build the Cettia starter kit. The source code of the starter kit is available at [https://github.com/cettia/cettia-starter-kit](https://github.com/cettia/cettia-starter-kit).

### Setting up the project

Before getting started, be sure that you have Java 8+ and Maven 3+ installed. According to statistics from the Maven Central, Servlet 3 and Java WebSocket API 1 have been the most used I/O frameworks in writing Cettia applications so that we will use them to build the Cettia starter kit. Of course, you can use other frameworks like Grizzly and Netty, as you will see later.

First, create a directory called `starter-kit`. We will write and manage only the following three files in the directory:

1. `pom.xml`: the Maven project descriptor.

    With this POM configuration, we can start up the server without pre-installed 'servlet container' which is an application server that implements Servlet specification.

    ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns="http://maven.apache.org/POM/4.0.0"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
     <modelVersion>4.0.0</modelVersion>
     <groupId>io.cettia.starter</groupId>
     <artifactId>cettia-starter-kit</artifactId>
     <version>0.0.1-SNAPSHOT</version>
     <packaging>war</packaging>
     <properties>
       <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
       <maven.compiler.source>1.8</maven.compiler.source>
       <maven.compiler.target>1.8</maven.compiler.target>
       <failOnMissingWebXml>false</failOnMissingWebXml>
     </properties>
     <dependencies>
       <dependency>
         <groupId>io.cettia</groupId>
         <artifactId>cettia-server</artifactId>
         <version>1.0.0</version>
       </dependency>
       <dependency>
         <groupId>io.cettia.asity</groupId>
         <artifactId>asity-bridge-servlet3</artifactId>
         <version>1.0.0</version>
       </dependency>
       <dependency>
         <groupId>io.cettia.asity</groupId>
         <artifactId>asity-bridge-jwa1</artifactId>
         <version>1.0.0</version>
       </dependency>
       <dependency>
         <groupId>javax.servlet</groupId>
         <artifactId>javax.servlet-api</artifactId>
         <version>3.1.0</version>
         <scope>provided</scope>
       </dependency>
       <dependency>
         <groupId>javax.websocket</groupId>
         <artifactId>javax.websocket-api</artifactId>
         <version>1.0</version>
         <scope>provided</scope>
       </dependency>
     </dependencies>
     <build>
       <plugins>
         <plugin>
           <groupId>org.eclipse.jetty</groupId>
           <artifactId>jetty-maven-plugin</artifactId>
           <version>9.4.8.v20171121</version>
         </plugin>
       </plugins>
     </build>
   </project>
    ```

    To start up the server on port 8080, run `mvn jetty:run`. This maven command is all we do with Maven in this tutorial. If you can achieve it with other build tools such as Gradle, it's absolutely fine to do that.

1. `src/main/java/io/cettia/starter/CettiaConfigListener.java`: a Java class to play with the Cettia server.

    `ServletContext` is a context object to represent a web application in a servlet container, and we can access it when the web application initialization process is starting by implementing `ServletContextListener#contextInitialized` method. Within the method, we will set up and play with Cettia. Let's start with an empty listener:

    ```java
   package io.cettia.starter;

   import javax.servlet.ServletContextEvent;
   import javax.servlet.ServletContextListener;
   import javax.servlet.annotation.WebListener;

   @WebListener
   public class CettiaConfigListener implements ServletContextListener {
     @Override
     public void contextInitialized(ServletContextEvent event) {}

     @Override
     public void contextDestroyed(ServletContextEvent event) {}
   }
    ```

    As we proceed through the tutorial, this class will be fleshed out. Keep in mind that you should restart the server every time you modify the class, especially in Windows.

1. `src/main/webapp/index.html`: an HTML page to play with the Cettia client.

    We will handle JavaScript only since other parts such as HTML and CSS are not important. The following HTML loads the Cettia client, `cettia`, through the script tag from unpkg CDN:

    ```html
    <!DOCTYPE html>
    <title>index</title>
    <script src="https://unpkg.com/cettia-client@1.0.1/cettia-browser.min.js"></script>
    ```

    We will use the console only on this page accessed through [http://127.0.0.1:8080](http://127.0.0.1:8080) to play with `cettia` object interactively rather than editing and refreshing the page. Otherwise, you can use bundlers such as webpack or other runtimes like Node.js.

### I/O framework agnostic layer

To bring greater freedom of choice on technical stack, Cettia is designed to run on any I/O framework seamlessly on Java Virtual Machine (JVM) without degrading the underlying framework's performance, and it's achieved by creating Asity project that is a lightweight abstraction layer for Java I/O frameworks. Now Asity supports Atmosphere, Grizzly, Java Servlet, Java WebSocket API, Netty and Vert.x.

Let's write an HTTP handler and a WebSocket handler mapped to `/cettia` on Servlet and Java WebSocket API with Asity. These frameworks literally take responsibility of managing HTTP resources and WebSocket connections, respectively. Add the following imports to the `CettiaConfigListener` class:

```java
import io.cettia.asity.action.Action;
import io.cettia.asity.http.ServerHttpExchange;
import io.cettia.asity.websocket.ServerWebSocket;
import io.cettia.asity.bridge.jwa1.AsityServerEndpoint;
import io.cettia.asity.bridge.servlet3.AsityServlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import javax.websocket.DeploymentException;
import javax.websocket.server.ServerContainer;
import javax.websocket.server.ServerEndpointConfig;
```

And place the following contents in the `contextInitialized` method:

```java
// Asity part
Action<ServerHttpExchange> httpTransportServer = http -> System.out.println(http);
Action<ServerWebSocket> wsTransportServer = ws -> System.out.println(ws);

// Servlet part
ServletContext context = event.getServletContext();
// When it receives Servlet's HTTP request-response exchange, converts it to ServerHttpExchange and feeds httpTransportServer with it
AsityServlet asityServlet = new AsityServlet().onhttp(httpTransportServer);
// Registers asityServlet and maps it to "/cettia"
ServletRegistration.Dynamic reg = context.addServlet(AsityServlet.class.getName(), asityServlet);
reg.setAsyncSupported(true);
reg.addMapping("/cettia");

// Java WebSocket API part
ServerContainer container = (ServerContainer) context.getAttribute(ServerContainer.class.getName());
ServerEndpointConfig.Configurator configurator = new ServerEndpointConfig.Configurator() {
  @Override
  public <T> T getEndpointInstance(Class<T> endpointClass) {
    // When it receives Java WebSocket API's WebSocket connection, converts it to ServerWebSocket and feeds wsTransportServer with it
    AsityServerEndpoint asityServerEndpoint = new AsityServerEndpoint().onwebsocket(wsTransportServer);
    return endpointClass.cast(asityServerEndpoint);
  }
};
// Registers asityServerEndpoint and maps it to "/cettia"
try {
  container.addEndpoint(ServerEndpointConfig.Builder.create(AsityServerEndpoint.class, "/cettia").configurator(configurator).build());
} catch (DeploymentException e) {
  throw new RuntimeException(e);
}
```

As you would intuitively expect, `httpTransportServer` and `wsTransportServer` are Asity applications and they can run on any framework as long as it's possible to feed them with `ServerHttpExchange` and `ServerWebSocket`. The Cettia server is also basically an Asity application.

In this step, you can play with Asity resources directly by submitting HTTP request and WebSocket request to `/cettia`. But we won't go deep into the Asity in this tutorial. Consult the [Asity](http://asity.cettia.io) website if you are interested. Unless you need to write an Asity application from the scratch, you can safely ignore Asity. Just note that even if your favorite framework is not supported, with more or less 200 code lines, you can write an Asity bridge to your framework and run Cettia via that bridge.

### Installing Cettia

Before diving into the code, let's figure out 3 primary concepts of Cettia at the highest conceptual level:

- **Server** - An interface used to interact with sockets. It offers an event to initialize newly accepted sockets and provides finder methods to find sockets matching the given criteria and execute the given socket action with them.
- **Socket** - A feature-rich interface built on the top of the transport. It provides the event system which allows to define your own events regardless of the type of event data and exchange them between the Cettia client and the Cettia server in real-time.
- **Transport** - An interface to represent a full duplex message channel. It carries binary as well as text payload based on message framing, exchanges messages bidirectionally and ensures no message loss and no idle connection. Unlike Server and Socket, you don't need to be aware of the Transport unless you want to tweak the default transport behavior or introduce a brand new transport.

Let's set up the Cettia server on top of the above I/O framework agnostic layer and open a socket as a smoke test. Add the following imports:

```java
import io.cettia.DefaultServer;
import io.cettia.Server;
import io.cettia.ServerSocket;
import io.cettia.transport.http.HttpTransportServer;
import io.cettia.transport.websocket.WebSocketTransportServer;
```

And replace the above Asity part with the following Cettia part:

```java
// Cettia part
Server server = new DefaultServer();
HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);

// The socket handler
server.onsocket((ServerSocket socket) -> System.out.println(socket));
```

As an implementation of `Action<ServerHttpExchange>` and `TransportServer`, `HttpTransportServer` consumes HTTP request-response exchanges and produces streaming transport and long-polling transport, and as an implementation of `Action<ServerWebSocket>` and `TransportServer`, `WebSocketTransportServer` consumes WebSocket resource and produces WebSocket transport. These produced transports are passed into the `Server` and used to create and maintain `ServerSocket`s.

It is true that WebSocket transport is enough these days, but if proxy, firewall, anti-virus software or arbitrary Platform as a Service (PaaS), it's difficult to be absolutely-sure that WebSocket will just work. That's why, it is recommended to install `HttpTransportServer` along with `WebSocketTransportServer` for a broader coverage of full duplex message channels in a variety of environments.

`ServerSocket` created by `Server` is passed to socket handlers registered through `server.onsocket(socket -> {})`, and this handler is the very place where you should initialize socket. Because it is costly to accept transport and socket, you should authenticate requests in advance if needed outside of Cettia and filter out unqualified requests before passing them to Cettia. For example, it would like this assuming that Apache Shiro is used:

```java
server.onsocket(socket -> {
  Subject currentUser = SecurityUtils.getSubject();
  if (currentUser.hasRole("admin")) {
    // ...
  }
});
```

In the client side, you can open a socket pointing to the URI of the Cettia server with `cettia.open(uri)`. Run the following snippet in the console on the index page:

```javascript
var socket = cettia.open("http://127.0.0.1:8080/cettia");
```

If everything is set up correctly, you should be able to see a socket log in the server-side and what has been happening through the network panel of the developer tools in the client-side. If WebSocket transport is not available in either the client or the server for some reason, the Cettia client fallbacks to HTTP-based transports automagically. Comment out Java WebSocket API part and open a socket again, or open the index page in Internet Explorer 9. In any case you'll see that a socket is opened.

### Socket lifecycle

A socket always is in a specific state such as opened and closed and its state keeps changing based on the state of the underlying transport. Cettia defines the state transition diagram for the client socket and the server socket and provides various built-in events which allows fine-grained handling of socket when a state transition occurs. If you make use of these diagrams and built-in events well you can handle stateful sockets in an event driven way easily without having to manage their states by yourself.

Add the following code to the socket handler in the `CettiaConfigListener`. It logs the socket's state when a state transition occurs.

```java
Action<Void> logState = v -> System.out.println(socket + " " + socket.state());
socket.onopen(logState).onclose(logState).ondelete(logState);
```

Here's the state transition diagram of a server socket:

![server-state-diagram](https://user-images.githubusercontent.com/1095042/39472695-ec3ea126-4d85-11e8-908e-de4bdebf4acb.jpg)

1. On the receipt of a transport, the server creates a socket with `NULL` state and pass it to the socket handlers.
1. If it fails to perform the handshake, transitions to `CLOSED` state and fires `close` event.
1. If it performs the handshake successfully, transitions to `OPENED` state and fires `open` event. The communication is possible only in this state.
1. If connection is disconnected for some reason, transitions to `CLOSED` state and fires `close` event.
1. If connection is recovered by the client reconnection, transitions to `OPENED` state and fires `open` event.
1. After 1 minute has elapsed since `CLOSED` state, transitions to the final state and fires `delete` event. Sockets in this state shouldn't be used.

As you can see, if a state transition of 4 happens, it is supposed to transition to either 5 or 6. You may want to resend events that the client couldn't receive while no connection on the former, and take action to notify the user of missed events like push notification on the latter. We will discuss how to do that in detail later on this tutorial.

In the client side, it's very important to inform the user of what's going on the wire in terms of the user experience. Open a socket and add an event handler to log the socket's state when a state transition occurs:

```javascript
var socket = cettia.open("http://127.0.0.1:8080/cettia");
var logState = arg => console.log(socket.state(), arg);
socket.on("connecting", logState).on("open", logState).on("close", logState).on("waiting", logState);
```

Here's the state transition diagram of a client socket:

![client-state-diagram](https://user-images.githubusercontent.com/1095042/39466008-7ec29c5c-4d61-11e8-9845-bf7d2ede131c.jpg)

1. If a socket is created by `cettia.open` and starts a connection, transitions to `connecting` state and fires `connecting` event.
1. If all transports fail to connect in time, transitions to `closed` state and fires `close` event.
1. If one of transports succeeds in establishing a connection, transitions to `opened` state and fires `open` event. The communication is possible only in this state.
1. If connection is disconnected for some reason, transitions to `closed` state and fires `close` event.
1. If reconnection is scheduled, transitions to `waiting` state and fires `waiting` event with reconnection delay and total reconnection attempts.
1. If the socket starts a connection after reconnection delay has elapsed, transitions to `connecting` state and fires `connecting` event.
1. If the socket is closed by `socket.close` method, transitions to the final state. Sockets in this state shouldn't be used.

If there's no problem with connection socket will have a state transition cycle of 3-4-5-6. If not, it will have a state transition cycle of 2-5-6. Restart or shutdown the server for a state transition of 4-5-6 or 2-5-6.

### Sending and receiving events

The most common pattern to exchange various types of data through a single channel is the Command pattern; A command object is serialized and sent over the wire, and then deserialized and executed it on the other side. At first, JSON and switch statement should suffice for the purpose of implementing the  pattern, but it becomes a burden to maintain and accrues technical debt if you have to handle binary type of data, implement heartbeat and make sure you get an acknowledgement for the data. Cettia provides the event system that is flexible enough to accommodate these requirements.

A unit of exchange between the Cettia client and the Cettia server in real-time is the event which consists of a required name property and an optional data property. You can define and use your own events as long as its name isn't duplicated with built-in events. Here's the `echo` event handler where any received `echo` event is sent back. Add it to the socket handler:

```java
socket.on("echo", data -> socket.send("echo", data));
```

In the code above, we didn't manipulate or validate the given data but it's not that realistic to use a typeless input as it is in the server. The allowed types for the event data is determined by Jackson, a JSON processor the Cettia uses internally. If an event data is supposed to be one of primitive types, you can cast and use it to the corresponding wrapper class, and if it's supposed to be an object like List or Map and you prefer POJOs, you can convert and use it with JSON library like Jackson. It might look like this:

```java
socket.on("event", data -> {
  Model model = objectMapper.convertValue(data, Model.class);
  Set<ConstraintViolation<Model>> violations = validator.validate(model);
  // ...
});
```

In the client side, event data is simply JSON with some exceptions. The following is the client code to test the server's `echo` event handler. This simple client sends an `echo` event with arbitrary data to the server on `open` event and logs data of an `echo` event to be received in return to the console.

```javascript
var socket = cettia.open("http://127.0.0.1:8080/cettia");
socket.on("open", () => socket.send("echo", "Hello world"));
socket.on("echo", data => console.log(data));
```

As we decided to use the console, you can type and run code snippets e.g. `socket.send("echo", {text: "I'm a text", binary: new TextEncoder().encode("I'm a binary")}).send("echo", "It's also chainable")` and watch results on the fly. Try it on your console.

As the example suggests, event data can be basically anything as long as it is serializable regardless of whether data is binary or text. If at least one of properties of event data is `byte[]` or `ByteBuffer` in the server, `Buffer` in Node or `ArrayBuffer` in browser, the event data is treated as binary and MessagePack format is used instead of JSON format. In short, you can exchange event data including binary data with no issue.

### Broadcasting events

To send an event to multiple sockets, you could create a Set, add a socket to the set and send events iterating over the set. It should work indeed but socket is stateful and not serializable, which means that the caller should always check if this socket is available each time and it's not possible to handle this socket on the other side of the wire. Cettia resolved these issues in a functional way.

1. The application creates and passes a socket action to one of the server's finder methods.
1. The server finds corresponding sockets and executes the passed action passing sockets one by one.

Here, the action means a functional interface used to handle a given argument. In this way, you can delegate state management to server and focus on socket handling by constructing a socket action, also serialize and broadcast an action instead of a socket to other servers in the cluster and let the servers execute the action for their own sockets.

The finder method to find all sockets in the server is `server.all(Action<ServerSocket> action)`. Add the following `chat` event handler to the socket handler sending a given `chat` event to every socket in the server:

```java
socket.on("chat", data -> {
  server.all((Action<ServerSocket> & Serializable) s -> {
    s.send("chat", data);
  });
});
```

Don't confuse it with the socket handler registered via `server.onsocket(Action<ServerSocket> action)`. Finder methods including `server.all` are to handle existing sockets in the server (every server in the cluster if clustered) and `server.onsocket` is to initialize sockets newly accepted by this very `server`.

In fact, writing and submitting an action is only useful when you need to do something more complicated rather than sending some events. If it's not that complicated, it can be done in one line of code using `Sentence`. Rewrite the above `chat` event handler in one line:

```java
socket.on("chat", data -> server.all().send("chat", data));
```

 `Sentence` is created and returned by the server when its finder methods are called without an action i.e. `server.all()`. Each method on `Sentence` like the above `send` is mapped to a pre-implemented common socket action so if the method is executed its mapped action is executed with the sockets found by the server according to the called finder method. That's why, the above two code snippets do exactly the same thing.

To demonstrate the `chat` event handler, open 2 sockets in one tab, or 2 browsers and one socket per browser plausibly. When tracking a socket's state, it is convenient to add the above `logState` event handler to built-in events.

```javascript
var socket1 = cettia.open("http://127.0.0.1:8080/cettia").on("chat", data => console.log("socket1", data));
var socket2 = cettia.open("http://127.0.0.1:8080/cettia").on("chat", data => console.log("socket2", data));
```

Once all sockets are opened, select one of them and send a `chat` event. Then, you should see a chat event sent by `socket1` is broadcast to `socket1` and `socket2`.

```javascript
socket1.send("chat", "Is it safe to invest in Bitcoin?");
```

You may be dying to answer the question. Try it on the console.

### Working with specific sockets

In most cases practically, you are likely to handle a group of sockets representing a specific entity rather than simply all sockets. The entity for example would be a user signed in multiple browsers, users entered in a chat room, red-team players in a game, and so on. As explained, the server's finder methods accept a criterion to find sockets and an action to execute with found sockets, and the criteria to be used here is tag. Cettia allows to add and remove a tag to and from socket and provides finder methods to find tagged sockets like querying the database.

As a simple example, let's write the `myself` event handler which sends a given event to sockets tagged with my username. Here these sockets represent an entity called myself. Assume that the username is included in the query parameter named `username` in a URI and URI encoding safe. For instance, if the socket's URI is `/cettia?username=alice`, the socket handler will add `alice` tag to the socket through `socket.tag(String tagName)`, and when a `myself` event is dispatched, the server will find sockets containing `alice` tag with `server.byTag(String... names)` and send the event to them.

Here's an implementation for the `myself` event handler. Assume that there is a method called `findUsernameParameter` to find the username parameter from given URI.

```java
String username = findUsernameParameter(socket.uri());
socket.tag(username).on("myself", data -> server.byTag(username).send("myself", data));
```

To test the `myself` event handler, open 3 sockets in one tab, or 3 browsers and one socket per browser plausibly:

```javascript
var socket1 = cettia.open("http://127.0.0.1:8080/cettia?username=alice").on("myself", data => console.log("socket1", data));
var socket2 = cettia.open("http://127.0.0.1:8080/cettia?username=alice").on("myself", data => console.log("socket2", data));
var socket3 = cettia.open("http://127.0.0.1:8080/cettia?username=bob").on("myself", data => console.log("socket3", data));
```

And once all sockets are opened, select one of them and send a `myself` event.

```javascript
socket2.send("myself", "A private message for me");
```

You should see an event sent by `socket2` is broadcast to `socket1` and `socket2` but not to `socket3` whose username is different. In this way, if you sends a direct message to yourself, no matter which browser or device you use, it will be broadcast to every browser and device where you have opened a socket, which is very useful to improve the multi-device user experience a lot.

You may want to compare `myself` event with the above `echo` and `chat` events. Run the following code and figure out what's different between these events.

```javascript
[socket1, socket2, socket3].forEach((socket, i) => {
  const log = data => console.log(`socket${i + 1}`, data);
  socket.on("echo", log).on("chat", log);
});
```

### Disconnection handling

We have dealt with sockets in opened state only so far but disconnection is inevitable. If there is any event failed to be sent to the user because of disconnection and they should be sent in spite of delay when the connection is recovered, the situation has became complex. Not all disconnections are the same; they vary in the period of time between disconnection and reconnection. In general, temporary disconnection is more common than permanent disconnection especially in the mobile environment, and the user experience for each case are different. If some events are delivered after a delay of some seconds due to temporary disconnection, it could treat them as if they were delivered on time, but if a delay would be some minutes or hours due to permanent disconnection, it might be better to send an email about missed events.

Cettia defines the temporary disconnection is one that is followed by reconnection in 60 seconds, design socket's lifecycle not to be affected by temporary disconnections, and provide an event-driven way for disconnection handling. Here's a server-side example to send events failed to send due to disconnection on the next connection. Append the following imports:

```java
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
```

And the following code to the socket handler:

```java
Queue<Object[]> queue = new ConcurrentLinkedQueue<>();
socket.oncache(args -> queue.offer(args));
socket.onopen(v -> {
  while (socket.state() == ServerSocket.State.OPENED && !queue.isEmpty()) {
    Object[] args = queue.poll();
    socket.send((String) args[0], args[1], (Action<?>) args[2], (Action<?>) args[3]);
  }
});
socket.ondelete(v -> queue.forEach(args -> System.out.println(socket + " missed event - name: " + args[0] + ", data: " + args[1])));
```

Refer to the socket lifecycle section for the difference between the server's `socket` event and the socket's `open` event, and when the socket's `open` and `delete` events are dispatched. By default, the client reconnects to the server with the delay interval determined by a geometric progression with initial delay 500 and ratio 2 (500, 1000, 2000, 4000 ...).

- If the socket has no active connection when `send` method is called, `cache` event is fired with an argument array used to call the `send` method. In this event, you can decide and collect events to send on next reconnection into the `queue`.
- If `open` event is fired, flush `queue` by sending items one by one via new connection. Even within `open` event, you should check the socket is opened not to mess `queue` up.
- If `delete` event is fired and the `queue` is not empty, you have to work with other building blocks of your application according to the user experience you want to provide with the remaining events. For example, database could be used to store missed events and show them on the next visit to the service, push notification system could be used to notify a user of missed events and also SMTP server could be used to send a digest email of missed events.

Note that when writing and submitting socket actions to the server, you don't need to take a care of given socket's state. Even though socket has no connection and fails to send events, you can safely handle them within `cache` handler.

The easiest way to simulate temporary disconnection would be to set `name` option in opening a socket and refresh a webpage. The `name` option is an identifier within browsing context to allow for the socket to share the same `name` option in the next page to inherit the lifecycle of the socket in the current page. Because this option can help restore missed events during page navigation, it's useful when you add real-time web web feature to multi-page applications. Open the developer tools at `index.html` and run the following code snippet:

```javascript
var socket1 = cettia.open("http://127.0.0.1:8080/cettia", {name: "main"});
socket1.on("chat", data => console.log("socket1", "message", data.message, "with", Date.now() - data.sentAt, "ms delay"));
```

And refresh the webpage then `socket1` should be disconnected. Run the following code snippet on the refreshed page:

```javascript
var socket2 = cettia.open("http://127.0.0.1:8080/cettia");
socket2.on("open", () => socket2.send("chat", {message: "ㅇㅅㅇ", sentAt: Date.now()}));
socket2.on("chat", data => console.log("socket2", "message", data.message, "with", Date.now() - data.sentAt, "ms delay"));
```

A chat event sent from `socket2` can't reach to `socket1` because it has no active connection, and instead the event is cached in a queue for `socket1`. If you run the first code snippet again on the refreshed page so `socket1`'s lifecycle is extended, you should see that `socket1` receives the cached events. Of course, if you defer running the first code snippet for 1 minute, you will see that `socket1` dispatches `delete` event so its cached events are logged as missed events in the server.

### Scaling a Cettia application

Last but not least is scaling an application. As mentioned earlier, any publish-subscribe messaging system can be used to scale a Cettia application horizontally, and it doesn't require any modification in the existing application. The idea behind scaling a Cettia application is very simple:

- When one of the finder methods of the server is called, it serializes this method invocation to a message and publishes it to the cluster.
- When a server receives some message from the cluster, it deserializes to the method invocation and applies it to its own sockets.

No matter how complicated a socket action to be passed to finder method is, it can be executed with sockets in other servers as long as it is serializable. And you don't need to be worried much about serialization. Actions provided by `Sentence` are all serializable and you can make actions serializable simply with cast expressions of Java 8 like `(Action<ServerSocket> & Serializable) socket -> {}` even if you have to use plain actions.

In this tutorial, we will use Hazelcast as a publish-subscribe messaging system. Add the following dependencies:

```xml
<dependencies>
  <dependency>
    <groupId>com.hazelcast</groupId>
    <artifactId>hazelcast</artifactId>
    <version>3.9.3</version>
  </dependency>
  <dependency>
    <groupId>com.hazelcast</groupId>
    <artifactId>hazelcast-client</artifactId>
    <version>3.9.3</version>
  </dependency>
</dependencies>
```

And the following imports:

```java
import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.ITopic;
import com.hazelcast.instance.HazelcastInstanceFactory;
import io.cettia.ClusteredServer;
import java.util.Map;
```

And replace the first line of Cettia part, `Server server = new DefaultServer();`, with the following line:

```java
ClusteredServer server = new ClusteredServer();
```

`ClusteredServer` class have two methods:

1. `onpublish(Action<Map<String,Object>> action)` - The server intercepts and serializes finder method calls to the wrapped server and pass them to the argument action. The action should publish it to the cluster.
1. `messageAction()` - This action deserializes a published message and calls the wrapped server's finder method. It should be called with a message when it is arrived from the cluster.

Just to give you an idea, with `server.onpublish(message -> server.messageAction().on(message));`, `ClusteredServer` will behave exactly the same as `DefaultServer`. Add the following code to the `CettiaConfigListener#contextInitialized` method:

```java
// Hazelcast part
HazelcastInstance hazelcast = HazelcastInstanceFactory.newHazelcastInstance(new Config());
ITopic<Map<String, Object>> topic = hazelcast.getTopic("cettia");
// It publishes messages given by the server
server.onpublish(message -> topic.publish(message));
// It relays published messages to the server
topic.addMessageListener(message -> server.messageAction().on(message.getMessageObject()));
```

Now if the application calls `server.all` with an action, the passed action will be serialized and broadcast to all servers in the cluster, and deserialized and executed by each server in the cluster. Let's restart the server on port 8080, open a new shell and start up one more server on port 8090 by running `mvn jetty:run -Djetty.port=8090`. Then you'll see Hazelcast nodes on 8080 and 8090 form the cluster.

To test the implementation, open 2 sockets in one tab per port, or 2 browsers and one socket per browser plausibly:

```javascript
var socket1 = cettia.open("http://127.0.0.1:8080/cettia").on("chat", data => console.log("socket1", data));
var socket2 = cettia.open("http://127.0.0.1:8090/cettia").on("chat", data => console.log("socket2", data));
```

And once all sockets are opened, select one of them and send a `chat` event:

```javascript
socket1.send("chat", "Greetings from 8080");
```

As you can see, a `chat` event sent from a client connected to the server on 8080 propagates to clients connected to the server on 8090 as well as 8080.

As for deployment, it's just a web application after all so that you can deploy the application and configure the environment as usual. Just keep in mind that you should enable 'sticky session' to deploy a clustered Cettia application. It's required to manage a socket life cycle that consists of multiple transports and enable HTTP transports that consist of multiple HTTP request-response exchanges.

### Conclusion

[Cettia](http://cettia.io/) is a full-featured real-time web application framework that you can use to exchange events between server and client in real-time. Following the separation of concerns principle, the framework is separated into 3 layers; 1. I/O framework agnostic layer to run a Cettia application on any I/O framework on JVM 2. Transport layer to provide reliable full duplex message channel 3. Socket layer to offer elegant patterns to achieve better user experience in the real-time web. This multi-layered architecture enables to focus on application-level real-time event handling only as well as to bring greater freedom of choice on technical stack.

In this tutorial, we've walked through the reason behind key design decisions that Cettia team have made in the Cettia as well as various patterns and features required to build real-time oriented application without compromise with Cettia, and as a result built the starter kit. The source code of the starter kit is available at [https://github.com/cettia/cettia-starter-kit](https://github.com/cettia/cettia-starter-kit).

If you have any question or feedback, please feel free to share them on [Cettia Groups](http://groups.google.com/group/cettia).
