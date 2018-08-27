---
layout: guide
title: "Building Real-Time Web Applications With Cettia"
description: "An introductory tutorial to Cettia. It explains the reason behind key design decisions that the Cettia team have made in the Cettia, as well as various patterns and features required to build real-time oriented applications without compromise with Cettia."
---

## Building Real-Time Web Applications With Cettia

Table of Contents

<ul> 
  <li><a href="#cettia-architecture" id="markdown-toc-cettia-architecture">Cettia Architecture</a></li> 
  <li><a href="#setting-up-the-project" id="markdown-toc-setting-up-the-project">Setting Up the Project</a></li> 
  <li><a href="#plugging-into-the-web-framework" id="markdown-toc-plugging-into-the-web-framework">Plugging Into the Web Framework</a></li> 
  <li><a href="#opening-a-socket" id="markdown-toc-opening-a-socket">Opening a Socket</a></li> 
  <li><a href="#socket-lifecycle" id="markdown-toc-socket-lifecycle">Socket Lifecycle</a></li> 
  <li><a href="#sending-and-receiving-events" id="markdown-toc-sending-and-receiving-events">Sending and Receiving Events</a></li> 
  <li><a href="#attributes-and-tags" id="markdown-toc-attributes-and-tags">Attributes and Tags</a></li> 
  <li><a href="#working-with-sockets" id="markdown-toc-working-with-sockets">Working with Sockets</a></li> 
  <li><a href="#finder-methods-and-sentence" id="markdown-toc-finder-methods-and-sentence">Finder Methods and Sentence</a></li> 
  <li><a href="#disconnection-handling" id="markdown-toc-disconnection-handling">Disconnection Handling</a></li> 
  <li><a href="#scaling-a-cettia-application" id="markdown-toc-scaling-a-cettia-application">Scaling a Cettia Application</a></li> 
  <li><a href="#conclusion" id="markdown-toc-conclusion">Conclusion</a></li>
</ul>

I started Cettia's predecessor's predecessor (a jQuery plugin for HTTP streaming that I used to demonstrate Servlet 3.0's Async Servlet with IE 6) in 2011. Since then, WebSocket and Asynchronous IO have come into wide use, and it has become easier to develop and maintain real-time web applications in both client and server environments. In the meantime, however, functional and non-functional requirements have become more sophisticated and difficult to meet, and it has become harder to estimate and control the accompanying technical debt as well. In other words, it's still not easy to build enterprise-level real-time web applications quickly and easily.

[Cettia](http://cettia.io) is the result of projects that started out as an effort to address these challenges and is a framework to create real-time web applications without compromise:

- It is designed to work with any web framework on the Java Virtual Machine (JVM) seamlessly.
- It provides a working full duplex connection even if given proxy, firewall, anti-virus software or arbitrary Platform as a Service (PaaS).
- It offers an event system to classify events which take place server-side and client-side and can exchange them in real-time.
- It allows to store information regarding socket in a socket and find sockets based on the stored information.
- It deals with disconnection in an event-driven way so that you can recover missed events declaratively.
- It is designed not to share data between servers and can be scaled horizontally with ease.

In this tutorial, we will take a look at the features required to create real-time oriented web applications with Cettia and build the Cettia starter kit. The source code for the starter kit is available at [https://github.com/cettia/cettia-starter-kit](https://github.com/cettia/cettia-starter-kit).

### Cettia Architecture

Before diving into the code, let's establish three primary concepts of Cettia at the highest conceptual level.

- **Server**

    An interface used to interact with server-side sockets. It offers an event to initialize newly accepted sockets and provides finder methods to find sockets matching the given criteria and execute the given socket action with them.
- **Socket**

    A feature-rich interface built on the top of the transport. It provides the event system that allows you to define your own events, regardless of the type of event data, and exchange them between the Cettia client and the Cettia server in real-time.
- **Transport**

    An interface to represent a full duplex message channel. It carries a binary as well as a text payload based on message framing, exchanges messages bidirectionally, and ensures no message loss and no idle connection. Unlike Server and Socket, you don't need to be aware of the Transport unless you want to tweak the default transport behavior or introduce a brand new transport.

Detailed architecture will be explained later.

### Setting Up the Project

First, be sure that you have Java 8+ and Maven 3+ installed. According to statistics from Maven Central, Servlet 3 and Java WebSocket API 1 are the most-used web frameworks in writing Cettia applications, so we will use them to build the Cettia starter kit. Of course, you can use other frameworks like Spring, Vert.x, and Netty as you will see later.

Create a directory called `starter-kit`. We will write and manage only the following three files in the directory:

1. `pom.xml`: the Maven project descriptor.

    With this POM configuration, we can start up the server without a pre-installed 'servlet container' which is an application server that implements Servlet specification.

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
         <version>1.1.0</version>
       </dependency>
       <dependency>
         <groupId>io.cettia.asity</groupId>
         <artifactId>asity-bridge-servlet3</artifactId>
         <version>2.0.0</version>
       </dependency>
       <dependency>
         <groupId>io.cettia.asity</groupId>
         <artifactId>asity-bridge-jwa1</artifactId>
         <version>2.0.0</version>
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

    To start up the server on port 8080, run `mvn jetty:run`. This Maven command is all we do with Maven in this tutorial. If you can achieve it with other build tools such as Gradle, it's absolutely fine to do that.

1. `src/main/java/io/cettia/starter/CettiaConfigListener.java`: a Java class to play with the Cettia server.

    `ServletContext` is a context object to represent a web application in a servlet container, and we can access it when the web application initialization process is starting by implementing a `ServletContextListener#contextInitialized` method. Within the method, we will set up and play with Cettia.

    ```java
   package io.cettia.starter;

   import io.cettia.DefaultServer;
   import io.cettia.Server;
   import io.cettia.ServerSocket;
   import io.cettia.asity.action.Action;
   import io.cettia.asity.bridge.jwa1.AsityServerEndpoint;
   import io.cettia.asity.bridge.servlet3.AsityServlet;
   import io.cettia.transport.http.HttpTransportServer;
   import io.cettia.transport.websocket.WebSocketTransportServer;
   
   import javax.servlet.ServletContext;
   import javax.servlet.ServletContextEvent;
   import javax.servlet.ServletContextListener;
   import javax.servlet.ServletRegistration;
   import javax.servlet.annotation.WebListener;
   import javax.websocket.DeploymentException;
   import javax.websocket.server.ServerContainer;
   import javax.websocket.server.ServerEndpointConfig;

   @WebListener
   public class CettiaConfigListener implements ServletContextListener {
     @Override
     public void contextInitialized(ServletContextEvent event) {
       // Cettia part
       Server server = new DefaultServer();
       HttpTransportServer httpAction = new HttpTransportServer().ontransport(server);
       WebSocketTransportServer wsAction = new WebSocketTransportServer().ontransport(server);
       
       // The socket handler
       server.onsocket((ServerSocket socket) -> {
         System.out.println(socket);
       });
       
       // Servlet part and Java WebSocket API part will be given in the following section
     }

     @Override
     public void contextDestroyed(ServletContextEvent event) {}
   }
    ```

    `HttpTransportServer` consumes HTTP request-response exchanges and produces streaming transport and long-polling transport, and `WebSocketTransportServer` consumes the WebSocket resource and produces a WebSocket transport. These produced transports are passed into the `Server` and used to create and maintain `ServerSocket`s.

    It is true that WebSocket transport is enough these days, but if proxy, firewall, anti-virus software or arbitrary Platform as a Service (PaaS) are involved, it's difficult to be absolutely sure that WebSocket alone will work. That's why we recommend you install `HttpTransportServer` along with `WebSocketTransportServer` for broader coverage of full duplex message channels in a variety of environments.

    As we proceed through the tutorial, this class will be fleshed out. Keep in mind that you should restart the server every time you modify the class, especially in Windows.

1. `src/main/webapp/index.html`: an HTML page to play with the Cettia client.

    We will handle JavaScript only, since other parts such as HTML and CSS are not important. The following HTML loads the Cettia client, `cettia`, through the script tag from unpkg CDN:

    ```html
    <!DOCTYPE html>
    <title>index</title>
    <script src="https://unpkg.com/cettia-client@1.0.1/cettia-browser.min.js"></script>
    ```

    We will use the console only on this page, accessed through [http://127.0.0.1:8080](http://127.0.0.1:8080), to play with the `cettia` object interactively, rather than editing and refreshing the page. Otherwise, you can use bundlers such as Webpack or other runtimes like Node.js as follows.
    - Webpack
        
        ```
        npm install cettia-client --save
        ```
        ```javascript
        var cettia = require("cettia-client/cettia-bundler");
        ```
    - Node
        
        ```
        npm install cettia-client --save
        ```
        ```javascript
        var cettia = require("cettia-client");
        ```

### Plugging Into the Web Framework

To enable greater freedom of choice on a technical stack, Cettia is designed to run on any web framework seamlessly on the Java Virtual Machine (JVM) without degrading the underlying framework's performance; this is achieved by creating the [Asity](http://asity.cettia.io) project. Asity is a lightweight abstraction layer for Java web frameworks and supports almost all popular web frameworks in Java: Servlet and Java API for WebSocket, Spring WebFlux, Spring Web MVC, Grizzly, Vert.x, Netty, Atmosphere, and so on.

Let's plug the above `httpAction` and `wsAction` into Servlet and Java WebSocket API and map them to `/cettia`. Place the following contents in the `contextInitialized` method:

```java
// Servlet part
ServletContext context = event.getServletContext();
// When it receives Servlet's HTTP request-response exchange, 
// converts it to ServerHttpExchange and feeds httpAction with it
AsityServlet asityServlet = new AsityServlet().onhttp(httpAction);
// Registers asityServlet and maps it to "/cettia"
ServletRegistration.Dynamic reg = context.addServlet(AsityServlet.class.getName(), asityServlet);
reg.setAsyncSupported(true);
reg.addMapping("/cettia");

// Java WebSocket API part
ServerContainer container = (ServerContainer) context.getAttribute(ServerContainer.class.getName());
ServerEndpointConfig.Configurator configurator = new ServerEndpointConfig.Configurator() {
  @Override
  public <T> T getEndpointInstance(Class<T> endpointClass) {
    // When it receives Java WebSocket API's WebSocket connection, 
    // converts it to ServerWebSocket and feeds wsAction with it
    AsityServerEndpoint asityServerEndpoint = new AsityServerEndpoint().onwebsocket(wsAction);
    return endpointClass.cast(asityServerEndpoint);
  }
};
// Registers asityServerEndpoint and maps it to "/cettia"
container.addEndpoint(ServerEndpointConfig.Builder.create(AsityServerEndpoint.class, "/cettia").configurator(configurator).build());
```

As you would intuitively expect, this Cettia application can run on any framework as long as it's possible to feed `httpAction` and `wsAction` with Asity's HTTP request-response exchange and WebSocket connection represented by `ServerHttpExchange` and `ServerWebSocket`, respectively. Here is an example with Spring WebFlux.

```java
// Import statements and unrelated methods are skipped for brevity

@SpringBootApplication
@EnableWebFlux
public class EchoServer {
  @Bean
  public RouterFunction<ServerResponse> httpMapping(HttpTransportServer httpAction) {
    AsityHandlerFunction asityHandlerFunction = new AsityHandlerFunction().onhttp(httpAction);

    RequestPredicate isNotWebSocket = headers(h -> !"websocket".equalsIgnoreCase(h.asHttpHeaders().getUpgrade()));
    return route(path("/cettia").and(isNotWebSocket), asityHandlerFunction);
  }

  @Bean
  public HandlerMapping wsMapping(WebSocketTransportServer wsAction) {
    AsityWebSocketHandler asityWebSocketHandler = new AsityWebSocketHandler().onwebsocket(wsAction);
    Map<String, WebSocketHandler> map = new LinkedHashMap<>();
    map.put("/cettia", asityWebSocketHandler);

    SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
    mapping.setUrlMap(map);

    return mapping;
  }
}
```

We won't delve into Asity in this tutorial. Consult the Asity's ["Run Anywhere"](http://asity.cettia.io/#run-anywhere) section for how to plug a Cettia application into other frameworks. Unless you need to write a web fragment from scratch, you can safely ignore Asity; just note that even if your favorite framework is not supported, with about 200 lines of code, you can write an Asity bridge to your framework and run Cettia via that bridge.

### Opening a Socket 

Let's open a socket as a smoke test. You can open a socket pointing to the URI of the Cettia server with `cettia.open(uri: string, options?: SocketOptions): Socket`. Run the following snippet in the console on the index page:

```javascript
var socket = cettia.open("/cettia");
```

For the given endpoint, WebSocket transport, HTTP streaming transport and HTTP long polling transport are used in turn. If all transports fail to connect, reconnection is scheduled with the delay interval determined by a geometric progression with initial the delay 500 and ratio 2 (500, 1000, 2000, 4000 ...). You can change this reconnection strategy by overriding the `reconnect? (lastDelay: number, attempts: number): any` option. The default function is as follows.

```javascript
var reconnect = (lastDelay) => 2 * (lastDelay || 250);
var socket = cettia.open("/path", {reconnect: reconnect});
```

If everything is set up correctly, in the server side, `Server` creates and passes a `ServerSocket` to socket handlers registered through `server.onsocket(Action<ServerSocket> action)`. Accordingly, you should be able to see the log similar to the following:

```
ServerSocket@9e14198f-fc59-47b1-9910-6de1174a13b5[state=null,tags=[],attributes={}]
```

Here, `9e14198f-fc59-47b1-9910-6de1174a13b5` is the identifier of the socket that can be accessed by `socket.id()`, and each key-value pair within the brackets is a property of the socket. We will take look at each one of them in detail later on.

The socket handler is where you should initialize the socket, including registering event handlers and dealing with socket attributes and tags. Because it is costly to accept transport and socket, you should authenticate requests in advance, if needed, outside of Cettia and filter out unqualified requests before passing them to Cettia. For example, it would look like this, assuming that Apache Shiro is used:

```java
server.onsocket(socket -> {
  Subject currentUser = SecurityUtils.getSubject();
  if (currentUser.hasRole("admin")) {
    // ...
  }
});
```

### Socket Lifecycle

A socket always is in a specific state, such as opened or closed, and its state keeps changing based on the state of the underlying transport. Cettia defines the state transition diagram for the client socket and the server socket and provides various built-in events, which allows fine-grained handling of a socket when a state transition occurs. If you make good use of these diagrams and built-in events, you can easily handle stateful sockets in an event-driven way without having to manage their states by yourself.

Add the following code to the socket handler in the `CettiaConfigListener`. It logs the socket's state when a state transition occurs.

```java
Action<Void> logState = v -> System.out.println(socket + " " + socket.state());
socket.onopen(logState).onclose(logState).ondelete(logState);
```

Here's the state transition diagram of a server socket:

![server-state-diagram](https://user-images.githubusercontent.com/1095042/39472695-ec3ea126-4d85-11e8-908e-de4bdebf4acb.jpg)

1. On the receipt of a transport, the server creates a socket with a `NULL` state and passes it to the socket handlers.
1. If it fails to perform the handshake, it transitions to a `CLOSED` state and fires a `close` event.
1. If it performs the handshake successfully, it transitions to an `OPENED` state and fires an `open` event. The communication is possible only in this state.
1. If connection is disconnected for some reason, it transitions to a `CLOSED` state and fires a `close` event.
1. If the connection is recovered by the client reconnection, it transitions to an `OPENED` state and fires `open` event.
1. After one minute has elapsed since the `CLOSED` state, it transitions to the final state and fires a `delete` event. Sockets in this state shouldn't be used.

As you can see, if a state transition of 4 happens, it is supposed to transition to either 5 or 6. You may want to resend events that the client couldn't receive while without connection on the former, and take action to notify the user of missed events, like push notifications on the latter. We will discuss how to do that in detail later on.

On the client side, it's very important to inform the user of what's going on the wire in terms of the user experience. Open a socket and add an event handler to log the socket's state when a state transition occurs:

```javascript
var socket = cettia.open("http://127.0.0.1:8080/cettia");
var logState = () => console.log(socket.state());
socket.on("connecting", logState).on("open", logState).on("close", logState);
socket.on("waiting", (delay, attempts) => console.log(socket.state(), delay, attempts));
```

Here's the state transition diagram of a client socket:

![client-state-diagram](https://user-images.githubusercontent.com/1095042/39466008-7ec29c5c-4d61-11e8-9845-bf7d2ede131c.jpg)

1. If a socket is created by `cettia.open` and starts a connection, it transitions to a `connecting` state and fires a `connecting` event.
1. If all transports fail to connect in time, it transitions to a `closed` state and fires a `close` event.
1. If one of the transports succeeds in establishing a connection, it transitions to an `opened` state and fires an `open` event. The communication is possible only in this state.
1. If the connection is disconnected for some reason, it transitions to a `closed` state and fires a `close` event.
1. If reconnection is scheduled, it transitions to a `waiting` state and fires a `waiting` event with a reconnection delay and total reconnection attempts.
1. If the socket starts a connection after the reconnection delay has elapsed, it transitions to a `connecting` state and fires a `connecting` event.
1. If the socket is closed by the `socket.close` method, it transitions to the final state. Sockets in this state shouldn't be used.

If there's no problem with the connection, the socket will have a state transition cycle of 3-4-5-6. If not, it will have a state transition cycle of 2-5-6. Restart or shutdown the server for a state transition of 4-5-6 or 2-5-6.

### Sending and Receiving Events

The most common pattern with which to exchange various types of data through a single channel is the Command Pattern; a command object is serialized and sent over the wire, and then deserialized and executed on the other side. At first, JSON and a switch statement should suffice for the purpose of implementing the  pattern, but it becomes a burden to maintain and accrues technical debt if you have to handle binary types of data; implement a heartbeat and make sure you get an acknowledgement of the data. Cettia provides an event system that is flexible enough to accommodate these requirements.

A unit of exchange between the Cettia client and the Cettia server in real-time is the event which consists of a required name property and an optional data property. You can define and use your own events as long as the name isn't duplicated with built-in events. Here's the `echo` event handler where any received `echo` event is sent back. Add it to the socket handler:

```java
socket.on("echo", (Object data) -> socket.send("echo", data));
```

In the code above, we didn't manipulate or validate the given data, but it's not as realistic to use a typeless input as it is in the server. The allowed types for the event data are determined by Jackson, a JSON processor that Cettia uses internally. If an event data is supposed to be one of the primitive types, you can cast and use it with the corresponding wrapper class, and if it's supposed to be an object like List or Map and you prefer POJOs, you can convert and use it with JSON library like Jackson. It might look like this:

```java
socket.on("event", data -> {
  Model model = objectMapper.convertValue(data, Model.class);
  Set<ConstraintViolation<Model>> violations = validator.validate(model);
  // ...
});
```

On the client side, event data is simply JSON with some exceptions. The following is the client code to test the server's `echo` event handler. This simple client sends an `echo` event with arbitrary data to the server on an `open` event and logs the data of an `echo` event to be received in return to the console.

```javascript
var socket = cettia.open("http://127.0.0.1:8080/cettia");
socket.on("open", () => socket.send("echo", "Hello world"));
socket.on("echo", data => console.log(data));
```

As we decided to use the console, you can type and run code snippets, e.g.: `socket.send("echo", {text: "I'm a text", binary: new TextEncoder().encode("I'm a binary")}).send("echo", "It's also chainable")` and watch results on the fly. Try it on your console.

As the example suggests, event data can be basically anything as long as it is serializable, regardless of whether data is binary or text. If at least one of the properties of the event data is `byte[]` or `ByteBuffer` in the server, `Buffer` in Node or `ArrayBuffer` in the browser, the event data is treated as binary and MessagePack format is used instead of JSON format, and the binary property is given as a `ByteBuffer` in the server, a `Buffer` in Node and an `ArrayBuffer` in the browser. In short, you can exchange event data, including binary data, with no issue.

### Attributes and Tags

A socket representing an application user by its nature has state related to a user session apart from the underlying connection's state. The state includes whether a subject represented by the socket is signed in, an administrative user, what username is, which rooms the subject is in, etc, and also is used to group a series of sockets representing the same real-world entity and find these groups. The entity, for example, could be a user signed in to multiple browsers and devices, users entered in a chat room, red-team players in a game, and so on.

Attributes and tags are contexts to store the socket state in the form of `Map` and `Set`, respectively, and are analogous to `data-*` attributes and `class` attribute defined in HTML.

#### Attributes

An attributes and sugar methods on `ServerSocket` are as follows.

```java
Map<String, Object> attributes = socket.attributes();
```

- `socket.get(String name)` - Returns the value mapped to the given name.
- `socket.set(String name, Object value)` - Associates the value with the given name in the socket.
- `socket.remove(String name)` - Removes the mapping associated with the given name.

#### Tags

A tags and sugar methods on `ServerSocket` are as follows.

```java
Set<String> tags = socket.tags();
```

- `socket.tag(String... tags)` - Attaches given tags to the socket.
- `socket.untag(String... tags)` - Detaches given tags from the socket.

### Working with Sockets

To send an event to multiple sockets, you could create a Set, add a socket to the set and send events iterating over the set. It should work, but socket is stateful and not serializable, which means that the caller should always check whether this socket is available each time; it's not possible to handle this socket on the other side of the wire. Cettia resolved these issues in a functional way.

1. The application creates and passes a socket predicate and a socket action to the server.
1. The server finds sockets that matches the passed predicate and executes the passed action, passing sockets one by one.

Here, the socket predicate and socket action are functional interfaces. In this way, you can delegate state management to the server and focus on socket handling by constructing a socket predicate and a socket action; you can also serialize and broadcast a predicate and an action instead of a socket to other servers in the cluster, and let the servers execute the predicate and the action for their own sockets.

`server.find(ServerSocketPredicate predicate, SerializableAction<ServerSocket> action)` is the very method to facilitate this idea; With this method, you can just find sockets by attributes and tags and do something with them such as when querying HTML elements. Add the following `chat` event handler to the socket handler to send a given `chat` event to every socket in the server:

```java
socket.on("chat", data -> {
  server.find(s -> true, s -> s.send("chat", data));
});
```

Don't confuse it with the socket handler registered via `server.onsocket(Action<ServerSocket> action)`. `server.find` is to handle existing sockets in the server (every server in the cluster if clustered) and `server.onsocket` is to initialize sockets newly accepted by this `server`.

To demonstrate the `chat` event handler, open 2 sockets in one tab, or 2 browsers and one socket per browser. When tracking a socket's state, it is convenient to add the above `logState` event handler to built-in events.

```javascript
var socket1 = cettia.open("http://127.0.0.1:8080/cettia").on("chat", data => console.log("socket1", data));
var socket2 = cettia.open("http://127.0.0.1:8080/cettia").on("chat", data => console.log("socket2", data));
```

Once all the sockets are opened, select one of them and send a `chat` event. Then, you should see a chat event sent by `socket1` is broadcast to `socket1` and `socket2` through the server's `chat` event handler.

```javascript
socket1.send("chat", "Is it safe to invest in Bitcoin?");
```

You may be dying to answer the question. Try it on the console.

### Finder Methods and Sentence

The `server.find` method is powerful but it's boring to write a `socket -> true` predicate every time to select all sockets in the server. Along with `server.find`, Cettia provides the following finder methods for the convenience.

- `server.all(SerializableAction<ServerSocket> action)` - All sockets.
- `server.byTag(String tag, SerializableAction<ServerSocket> action)` - Sockets tagged with the given tag.
- `server.byTag(String[] tags, SerializableAction<ServerSocket> action)` - Sockets tagged with the given tags.

Also, writing and submitting a socket action is only useful when you need to do something more complicated than sending events. If it's not that complicated, it can be done in one line of code using `Sentence` without handling each socket. `Sentence` is created and returned by the server when its finder methods are called without a socket action as follows.

- `server.find(ServerSocketPredicate predicate)`.
- `server.all()`. 
- `server.byTag(String... tags)`. 

Each method on `Sentence` is mapped to a pre-implemented common socket action, so if the method is executed, its mapped action is executed with the sockets found by the server according to the called finder method. Here is a list of methods on the sentence.

- `sentence.close()` - Closes the socket.
- `sentence.send(String event)` - Sends a given event without data through the socket.
- `sentence.send(String event, Object data)` - Sends a given event with the given data through the socket.
- `sentence.tag(String... tags)` - Attaches given tags to the socket.
- `sentence.untag(String... tags)` - Detaches given tags from the socket.

All the methods except `close()` are chainable and you can directly handle each socket through `sentence.execute(SerializableAction<ServerSocket> action)`.

Let's rewrite the above `chat` event handler with `server.all` and `sentence.send`. The finder methods and sentence make the code even more declarative and expressive. 

```java
socket.on("chat", data -> {
  server.all().send("chat", data);
});
```

### Disconnection Handling

We have only dealt with sockets in opened states so far, but disconnection is inevitable. If any event fails to be sent to the user because of disconnection and they should be sent in spite of the delay when the connection is recovered, the situation has become complex. Not all disconnections are the same; they vary in the period of time between disconnection and reconnection. In general, a temporary disconnection is more common than a permanent disconnection, especially in the mobile environment, and the user experiences for each case are different. If some events are delivered after a delay of some seconds due to a temporary disconnection, the client could treat them as if they were delivered on time, but if a delay would be some minutes or hours due to permanent disconnection, it might be better to send an email about missed events.

Cettia defines the temporary disconnection as one that is followed by reconnection within 60 seconds. It designs a socket's lifecycle to be unaffected by temporary disconnections, and provides an event-driven way to handle disconnections. Here's a server-side example to send events failed due to disconnection on the next connection.

Append the following imports:

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

Refer to the socket lifecycle section for the difference between the server's `socket` event and the socket's `open` event, and when the socket's `open` and `delete` events are dispatched. By default, the client reconnects to the server with the delay interval determined by the `reconnect? (lastDelay: number, attempts: number): any` option.

- If the socket has no active connection when the `send` method is called, the `cache` event is fired with an argument array used to call the `send` method. In this event, you can decide and collect events to send on the next reconnection into the `queue`.
- If an `open` event is fired, flush the `queue` by sending items one by one via a new connection. Even within the `open` event, you should check that the socket is opened so as not to disrupt the `queue`.
- If a `delete` event is fired and the `queue` is not empty, you have to work with other building blocks of your application according to the user experience you want to provide with the remaining events. For example, a database could be used to store missed events and show them on the next visit to the service. A push notification system could be used to notify a user of missed events, and an SMTP server could be used to send a digest email of missed events.

Note that when writing and submitting socket actions to the server, you don't need to take care of a given socket's state. Even if a socket has no connection and fails to send events, you can safely handle them within the `cache` handler.

The easiest way to simulate a temporary disconnection would be to set a `name` option in opening a socket and refresh a webpage. The `name` option is an identifier within the browsing context to allow the socket to share the same `name` option in the next page and to inherit the lifecycle of the socket in the current page. Because this option can help restore missed events during page navigation, it's useful when you add real-time web feature to multi-page applications. Open the developer tools at `index.html` and run the following code snippet:

```javascript
var socket1 = cettia.open("http://127.0.0.1:8080/cettia", {name: "main"});
socket1.on("chat", data => console.log("socket1", "message", data.message, "with", Date.now() - data.sentAt, "ms delay"));
```

Refresh the webpage, then `socket1` should be disconnected. Run the following code snippet on the refreshed page:

```javascript
var socket2 = cettia.open("http://127.0.0.1:8080/cettia");
socket2.on("open", () => socket2.send("chat", {message: "ㅇㅅㅇ", sentAt: Date.now()}));
socket2.on("chat", data => console.log("socket2", "message", data.message, "with", Date.now() - data.sentAt, "ms delay"));
```

A chat event sent from `socket2` can't reach `socket1` because it has no active connection, and instead the event is cached in a queue for `socket1`. If you run the first code snippet again on the refreshed page so that `socket1`'s lifecycle is extended, you should see that `socket1` receives the cached events. Of course, if you defer running the first code snippet for 1 minute, you will see that `socket1` dispatches the `delete` event, so its cached events are logged as missed events in the server.

### Scaling a Cettia Application

Last but not least is scaling an application. As mentioned earlier, any publish-subscribe messaging system can be used to scale a Cettia application horizontally, and it doesn't require any modification in the existing application. The idea behind scaling a Cettia application is very simple:

- When one of the finder methods of the server is called, it serializes this method invocation to a message and publishes it to the cluster.
- When a server receives some message from the cluster, it deserializes to the method invocation and applies it to its own sockets.

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

Now, add the following imports:

```java
import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.ITopic;
import com.hazelcast.instance.HazelcastInstanceFactory;
import io.cettia.ClusteredServer;
import java.util.Map;
```

Replace the first line of the Cettia part, `Server server = new DefaultServer();`, with the following line:

```java
ClusteredServer server = new ClusteredServer();
```

`ClusteredServer` class has two methods:

1. `onpublish(Action<Map<String,Object>> action)` - The server intercepts the finder method calls to the wrapped server, converts them to messages and passes them to the argument action. The action should publish a passed message to the cluster.
1. `messageAction()` - This action accepts a published message and calls the wrapped server's finder method. It should be called with a message when it arrives from the cluster.

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

Now, if the application calls `server.find` with a predicate and an action, the passed predicate and action will be serialized and broadcast to all servers in the cluster, and deserialized and executed by each server in the cluster. Let's restart the server on port 8080, open a new shell, and start up one more server on port 8090 by running `mvn jetty:run -Djetty.port=8090`. Then you'll see Hazelcast nodes on 8080 and 8090 form the cluster.

To test the implementation, open 2 sockets in one tab per port, or 2 browsers and one socket per browser plausibly:

```javascript
var socket1 = cettia.open("http://127.0.0.1:8080/cettia").on("chat", data => console.log("socket1", data));
var socket2 = cettia.open("http://127.0.0.1:8090/cettia").on("chat", data => console.log("socket2", data));
```

Once all sockets are opened, select one of them and send a `chat` event:

```javascript
socket1.send("chat", "Greetings from 8080");
```

As you can see, a `chat` event sent from a client connected to the server on 8080 propagates to clients connected to the server on 8090 as well as 8080.

As for deployment, it's just a web application, after all, so you can deploy the application and configure the environment as usual. Just keep in mind that you should enable 'sticky session' to deploy a clustered Cettia application. It's required to manage a socket lifecycle that consists of multiple transports and to enable HTTP transports that consist of multiple HTTP request-response exchanges.

### Conclusion

[Cettia](http://cettia.io/) is a full-featured real-time web application framework for Java that you can use to exchange events between server and client in real-time. It is meant for when you run into issues which are tricky to resolve with WebSocket, JSON, and switch statement per se: avoiding repetitive boilerplate code, supporting environments where WebSocket is not available, handling both text and binary data together, recovering missed events, providing multi-device user experience, scaling out an application, and so on. It offers a reliable full duplex message channel and elegant patterns to achieve better user experience in the real-time web, and is compatible with any web frameworks on the Java Virtual Machine.

In this tutorial, we've walked through the reason behind key design decisions that the Cettia team have made in the Cettia, as well as various patterns and features required to build real-time oriented applications without compromise with Cettia, and as a result, we've built the starter kit. The source code for the starter kit is available at [https://github.com/cettia/cettia-starter-kit](https://github.com/cettia/cettia-starter-kit).

If you have any question or feedback, please feel free to share them on [Cettia Groups](http://groups.google.com/group/cettia).
