---
layout: project
title: Cettia Java Server Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* TOC
{:toc}

---

## Installation
Cettia Java Server requires Java 7 and is distributed through Maven Central. Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
  <groupId>io.cettia</groupId>
  <artifactId>cettia-server</artifactId>
  <version>1.0.0-RC1</version>
</dependency>
```

And install the bridge module [Asity](http://asity.cettia.io) provides per platform and bridge it with the application. How to install and bridge is discussed below per platform. If your platform is not supported, you need to write a bridge for the platform in Asity first. See the Asity website for the full documentation.

Also, take a look at the [TechEmpower benchmark results](https://www.techempower.com/benchmarks/) if you have not yet deteremined the platform.

### Atmosphere 2
[Atmosphere 2](https://github.com/Atmosphere/atmosphere/) is a platform to use Java Servlet 3 and Java WebSocket API 1 together in more comfortable way. Note that it requires Atmosphere 2.2 and later.

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
  <groupId>io.cettia.asity</groupId>
  <artifactId>asity-bridge-atmosphere2</artifactId>
  <version>1.0.0-Beta1</version>
</dependency>
```

To bridge application and Atmosphere, you should register a servlet of `AsityAtmosphereServlet`. When registering servlet, you must set `asyncSupported` to `true` and set a init param, `org.atmosphere.cpr.AtmosphereInterceptor.disableDefaults` that is defined as `org.atmosphere.cpr.ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR`, to `true`.

_[Atmosphere 2 example.](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/atmosphere2)_

```java
@WebListener
public class Bootstrap implements ServletContextListener {
  @Override
  public void contextInitialized(ServletContextEvent event) {
    // Cettia server
    Server server = new DefaultServer();
    HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
    WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);
    
    ServletContext context = event.getServletContext();
    Servlet servlet = new AsityAtmosphereServlet().onhttp(httpTransportServer).onwebsocket(wsTransportServer);
    ServletRegistration.Dynamic reg = context.addServlet(AsityAtmosphereServlet.class.getName(), servlet);
    reg.setAsyncSupported(true);
    reg.setInitParameter(ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR, Boolean.TRUE.toString());
    reg.addMapping("/cettia");
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Grizzly 2
[Grizzly 2](https://javaee.github.io/grizzly/) is a framework to help developers to take advantage of the Java&trade; NIO API.

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
  <groupId>io.cettia.asity</groupId>
  <artifactId>asity-bridge-grizzly2</artifactId>
  <version>1.0.0-Beta1</version>
</dependency>
```

And then, you should register an instance of `AsityHttpHandler` to deal with HTTP exchange and an instance of `AsityWebSocketApplication` to deal with WebSocket.

_[Grizzly 2 example.](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/grizzly2)_

```java
public class Bootstrap {
  public static void main(String[] args) throws Exception {
    // Cettia server
    Server server = new DefaultServer();
    HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
    WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);
    
    HttpServer httpServer = HttpServer.createSimpleServer();
    ServerConfiguration config = httpServer.getServerConfiguration();
    config.addHttpHandler(new AsityHttpHandler().onhttp(httpTransportServer), "/cettia");
    NetworkListener listener = httpServer.getListener("grizzly");
    listener.registerAddOn(new WebSocketAddOn());
    WebSocketEngine.getEngine().register("", "/cettia", new AsityWebSocketApplication().onwebsocket(wsTransportServer));
    httpServer.start();

    System.in.read();
  }
}
```

### Java Servlet 3
[Java Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Java Servlet 3.1](https://docs.oracle.com/javaee/7/tutorial/servlets.htm) from Java EE 7.

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
  <groupId>io.cettia.asity</groupId>
  <artifactId>asity-bridge-servlet3</artifactId>
  <version>1.0.0-Beta1</version>
</dependency>
```

To bridge application and Servlet, you should register a servlet of `AsityServlet`. When registering servlet, you must set `asyncSupported` to `true`.

_[Servlet 3 example.](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/servlet3-jwa1)_

```java
@WebListener
public class Bootstrap implements ServletContextListener {
  @Override
  public void contextInitialized(ServletContextEvent event) {
    // Cettia server
    Server server = new DefaultServer();
    HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
    
    ServletContext context = event.getServletContext();
    Servlet servlet = new AsityServlet().onhttp(httpTransportServer);
    ServletRegistration.Dynamic reg = context.addServlet(AsityServlet.class.getName(), servlet);
    reg.setAsyncSupported(true);
    reg.addMapping("/cettia");
  }
  
  @Override
  public void contextDestroyed(ServletContextEvent sce) {}
}
```

If your servlet container implements Java WebSocket API as well like Tomcat and Jetty, you can use Java Servlet 3 bridge and Java WebSocket API 1 bridge together.

_[Servlet 3 and Java WebSocket APi 1 example.](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/servlet3-jwa1)_

```java
@WebListener
public class Bootstrap implements ServletContextListener {
  @Override
  public void contextInitialized(ServletContextEvent event) {
    // Cettia server
    Server server = new DefaultServer();
    HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
    final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);

    // Servlet
    ServletContext context = event.getServletContext();
    Servlet servlet = new AsityServlet().onhttp(httpTransportServer);
    ServletRegistration.Dynamic reg = context.addServlet(AsityServlet.class.getName(), servlet);
    reg.setAsyncSupported(true);
    reg.addMapping("/cettia");

    // Java WebSocket API
    ServerContainer container = (ServerContainer) context.getAttribute(ServerContainer.class.getName());
    ServerEndpointConfig config = ServerEndpointConfig.Builder.create(AsityServerEndpoint.class, "/cettia")
    .configurator(new Configurator() {
      @Override
      public <T> T getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
        return endpointClass.cast(new AsityServerEndpoint().onwebsocket(wsTransportServer));
      }
    })
    .build();
    try {
      container.addEndpoint(config);
    } catch (DeploymentException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Java WebSocket API 1
[Java WebSocket API 1](https://docs.oracle.com/javaee/7/tutorial/websocket.htm) (JWA) from Java EE 7.

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
  <groupId>io.cettia.asity</groupId>
  <artifactId>asity-bridge-jwa1</artifactId>
  <version>1.0.0-Beta1</version>
</dependency>
```

Then, you should register an endpoint of `AsityServerEndpoint`. Note that each WebSocket session is supposed to have each endpoint instance so an instance of `AsityServerEndpoint` can't be shared among `ServerEndpointConfig`s.

_[Java WebSocket API 1 example.](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/jwa1)_

```java
public class Bootstrap implements ServerApplicationConfig {
  @Override
  public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> endpointClasses) {
    // Cettia server
    Server server = new DefaultServer();
    final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);
    
    ServerEndpointConfig config = ServerEndpointConfig.Builder.create(AsityServerEndpoint.class, "/cettia")
    .configurator(new Configurator() {
      @Override
      public <T> T getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
        return endpointClass.cast(new AsityServerEndpoint().onwebsocket(wsTransportServer));
      }
    })
    .build();
    return Collections.singleton(config);
  }

  @Override
  public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> scanned) {
    return null;
  }
}
```

### Netty 4
[Netty 4](http://netty.io/) is an asynchronous event-driven network application framework.

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
  <groupId>io.cettia.asity</groupId>
  <artifactId>asity-bridge-netty4</artifactId>
  <version>1.0.0-Beta1</version>
</dependency>
```

To bridge application and Netty, you should register a handler of `AsityServerCodec`. When configuring handlers, you must add `HttpServerCodec` in front of the handler.

_[Netty 4 example.](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/netty4)_

```java
public class Bootstrap {
  public static void main(String[] args) throws Exception {
    // Cettia server
    Server server = new DefaultServer();
    final HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
    final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);
    
    EventLoopGroup bossGroup = new NioEventLoopGroup();
    EventLoopGroup workerGroup = new NioEventLoopGroup();
    try {
      ServerBootstrap bootstrap = new ServerBootstrap();
      bootstrap.group(bossGroup, workerGroup)
      .channel(NioServerSocketChannel.class)
      .childHandler(new ChannelInitializer<SocketChannel>() {
        @Override
        public void initChannel(SocketChannel ch) {
          ChannelPipeline pipeline = ch.pipeline();
          pipeline.addLast(new HttpServerCodec())
          .addLast(new AsityServerCodec() {
            @Override
            protected boolean accept(HttpRequest req) {
              return URI.create(req.getUri()).getPath().equals("/cettia");
            }
          }
          .onhttp(httpTransportServer)
          .onwebsocket(wsTransportServer));
        }
      });
      Channel channel = bootstrap.bind(8080).sync().channel();
      channel.closeFuture().sync();
    } finally {
      workerGroup.shutdownGracefully();
      bossGroup.shutdownGracefully();
    }
  }
}
```

### Vert.x 2

[Vert.x 2](http://vertx.io/) is a lightweight, high performance application platform for the JVM.

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
  <groupId>io.cettia.asity</groupId>
  <artifactId>asity-bridge-vertx2</artifactId>
  <version>1.0.0-Beta1</version>
</dependency>
```

You should register a handler of `AsityRequestHandler` to handle HTTP exchange and `AsityWebSocketHandler` to handle WebSocket.

_[Vert.x 2 example.](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/vertx2)_

```java
public class Bootstrap extends Verticle {
  @Override
  public void start() {
    // Cettia server
    Server server = new DefaultServer();
    HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
    WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);
    
    HttpServer httpServer = vertx.createHttpServer();
    RouteMatcher httpMatcher = new RouteMatcher();
    httpMatcher.all("/cettia", new AsityRequestHandler().onhttp(httpTransportServer));
    httpServer.requestHandler(httpMatcher);
    final AsityWebSocketHandler websocketHandler = new AsityWebSocketHandler().onwebsocket(wsTransportServer);
    httpServer.websocketHandler(new Handler<org.vertx.java.core.http.ServerWebSocket>() {
      @Override
      public void handle(org.vertx.java.core.http.ServerWebSocket socket) {
        if (socket.path().equals("/cettia")) {
          websocketHandler.handle(socket);
        }
      }
    });
    httpServer.listen(8080);
  }
}
```

---

## Server
The interface to consume transport and produce and manage socket. It represents a cettia application.

### Configuring a server
The Cettia protocol options should be centralized in server side and configured through `DefaultServer`. Every option has a proper default value so you don't need to touch it unless there's anything else. 

#### Heartbeat
An heartbeat interval value in milliseconds. Each time the `heartbeat` option has elapsed, an `heartbeat` event should be exchanged between the client and the server. First the client should send the `heartbeat` event to the server 5 seconds before the heartbeat timer expires, and the server should echo back the `heartbeat` event to the client within 5 seconds. Otherwise, both client and server fire the `close` event. The default value is `20000`, and the value must be larger than `5000`.

```java
server.setHeartbeat(15 * 1000);
```

### Handling a socket
When a transport is established and accordingly a socket is created, actions added via `onsocket(Action<ServerSocket> action)` are executed with it. It's allowed to add several actions at any time, so you don't need to centralize all your code to one class.

**Note**

* You can add socket event handlers to a given socket but not send events through the socket as it's not yet opened. The first event where communication is possible is the socket's `open` event.

```java
server.onsocket((ServerSocket socket) -> {
  // You can't send events here
  socket.onopen((Void v) -> {
    // but you can do that here
    socket.send("echo", "Hi");
  });
});
```

### Selecting sockets
It's a common use case to select some sockets and do something with them like dealing with persistence entities or HTML elements. All you need is to write a socket action and pass it to the server's selector method. Then, the server will find the corresponding sockets and execute the action with them. Sockets being passed to the action are always either in the opened state or in the closed state.

**Note**

* Just handle given sockets regardless of their state as you please. If you send some events through closed sockets, these events will be passed to each socket's `cache` event where you can cache that event and send it on next reconnection. For more information about the `cache` event, see the [Offline handling](#offline-handling) section.

#### All
`all(Action<ServerSocket> action)` executes the given action finding all of the socket in this server.

```java
server.all((ServerSocket socket) -> {
  // Your logic here
});
```

#### By tag
A socket may have several tags and a tag may have several sockets exactly like many-to-many relationship. `byTag(String[] names, Action<ServerSocket> action)` finds sockets which have the given tag names in the server and executes the given action. For more information about the tag, see the [Tagging](#tagging) section.

```java
server.byTag("/user/flowersinthesand", (ServerSocket socket) -> {
  // Your logic here
});
```

### Writing a sentence
`Sentence` is a fluent interface to deal with a group of sockets with ease. All finder methods return a sentence when being called without action. Use of sentence is always preferred to use of action if the goal is the same. Because, it enables to write one-liner action and internally uses actions implementing `Serializable` in execution, which is typically required in clustering.

```java
server.all().send("foo", "bar");
```
```java
server.byTag("/room/201", "/room/301").send("message", "time to say goodbye").close();
```

---

## ServerSocket
The interface to represent a server-side socket.

### Properties
These are read only.

<div class="row">
<div class="large-4 columns">
{% capture panel %}
#### State
The current state of the socket.

```java
socket.state();
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
#### URI
A URI used to connect.

```java
URI.create(socket.uri()).getQuery();
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
#### Tags
A modifiable set of tag names.

```java
Set<String> tags = socket.tags();
tags.add("account#flowersinthesand");
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Lifecycle
Socket always is in a specific state that can be determined by `state()` method. Transition between states occurs according to the underlying transport. The following list is a list of the state which a socket can be in.

* `null`

  As the initial state of the lifecycle, it has been used only until the handshake is performed since a socket is created. The server's `socket` event is fired with a created socket. You can add or remove event handlers but can't exchange event in this state.
  
  State transition occurs to

  * `OPENED`: if the handshake is performed successfully.
  * `CLOSED`: if there was any error in performing the handshake.
  <p>

* `OPENED`

  The handshake is performed successfully and communication is possible. The `open` event is fired. Only in this state, the socket can send and receive events via connection. Note that a closed socket can be opened again, and a reference to the socket isn't affected by disconnection and reconnection.

  State transition occurs to

  * `CLOSED`: if the underlying transport is closed for some reason.
  <p>
  
* `CLOSED`

  The underlying transport is closed for some reason. The `close` event is fired. In this state, sending and receiving events is not possible but sent events in this state are passed to the `cache` event so that you can cache and send them on next reconnection. It is the same for the client.

  State transition occurs to

  * `OPENED`: if the client reconnects to the server and the handshake is performed successfully.
  * `DELETED`: if the client has not reconnected to the server for a long time i.e. 1 minute.
  <p>
  
* `DELETED`

  As the final state of the lifecycle, it applies to sockets whose the underlying transport has been closed for a long time i.e. 1 minute. The `delete` event is fired. A socket in this state is already evicted from the server, hence, it shouldn't and can't be used.

### Handling errors
To capture any error happening in socket, add `error` event handler. As an argument, `Throwable` in question is passed. Exceptions from the underlying transport are also propagated.

**Note**

* In most cases, there is no error that you can ignore safely. You should watch this event and log thrown errors.
* Errors thrown by user created event handler are not propagated to `error` event.

### Sending and receiving events
`on(String event, Action<T> action)` attaches an event handler. The allowed types for `T` is determined by a format which is used to deserialize transport message. Now that format corresponds to [Jackson](https://github.com/FasterXML/jackson-databind)'s data format. By default, built-in data format is used for text message and [MessagePack data format](https://github.com/msgpack/msgpack-java/tree/develop/msgpack-jackson) is used for binary message.

`send(String event)` and `send(String event, Object data)` send an event with or without data, respectively. Unlike when receiving event, when sending event, you can use any type of data whether it is text, binary or composite.

**Note**

* Any event name can be used except reserved ones: `open`, `close`, `cache`, `delete` and `error`. 
* If data or one of its properties is `byte[]` or `ByteBuffer`, it is regarded as binary. Though, you don't need to be aware of that.
* If you send an event via a closed socket, it will be delegated to that socket's `cache` event so you don't need to worry about socket's state when sending event.

_The client sends an event and the server echoes back to the client._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.onsocket((ServerSocket socket) -> {
  socket.on("echo", (Object data) -> {
    System.out.println(data);
    socket.send("echo", data);
  });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
cettia.open("http://localhost:8080/cettia")
.on("open", function() {
  this.send("echo", "echo");
  this.send("echo", new Buffer("echo"));
  this.send("echo", {text: "echo", binary: new Buffer("echo")});
})
.on("echo", function(data) {
  console.log(data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

_The server sends an event and the client echoes back to the server._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.onsocket((ServerSocket socket) -> {
  socket.onopen((Void v) -> {
    socket.send("echo", "echo");
    socket.send("echo", "echo".getBytes());
    socket.send("echo", ByteBuffer.wrap("echo".getBytes()));
    socket.send("echo", new LinkedHashMap<String, Object>() {
      {
        put("text", "echo");
        put("binary", "echo".getBytes());
      }
    });
  });
  socket.on("echo", (Object data) -> System.out.println(data));
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
cettia.open("http://localhost:8080/cettia")
.on("echo", function(data) {
  console.log(data);
  this.send("echo", data);
})
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Offline handling
Once the underlying transport is disconnected, it's not possible to send an event through a socket that transport underlies until the client reconnects and the new transport replaces the old one. To cache event which is being passed to `send` method while offline and send it on next reconnection, add `cache` event handler with `open` and `delete` event handler. The `cache` event is fired if the `send` method is called when there is no connection with an object array of arguments used to call the `send` method.

**Note**

* There is no default behavior for offline handling.

_Caching events while offline and sending them on next reconnection._

```java
server.onsocket((ServerSocket socket) -> {
  // A queue containing events the server couldn't send to the client while disconnection
  Queue<Object[]> cache = new ConcurrentLinkedQueue<>();
  // Fired if the send method is called when there is no connection
  socket.oncache((Object[] args) -> {
    // You can determine whether or not to cache this arguments used to call the send method
    // For example, in some cases, you may want to avoid caching to deliver live data in time
    cache.offer(args);
  });
  socket.onopen((Void v) -> {
    // Now that communication is possible, you can flush the cache
    while (socket.state() == ServerSocket.State.OPENED && !cache.isEmpty()) {
      // Removes the first event from the cache and sends it to the client one by one
      Object[] args = cache.poll();
      socket.send((String) args[0], args[1], (Action<?>) args[2], (Action<?>) args[3]);
    }
  });
  socket.ondelete((Void v) -> {
    // If the cache is not empty, that is to say, there are still some messages user should receive,
    if (!cache.isEmpty()) {
      // here you can send an email to notify user or utilize database for user to check on next logging in
    }
  });
});
```

### Tagging
A socket is not suitable for handling a specific entity in the real world. For example, when a user signs in using multiple devices like desktop, laptop, tablet and smartphone, if someone sends a message, it should be delivered to all devices where the user signed in. To do that, you need a way to handle multiple sockets, or the devices, as a single entity, or the user.

That's why tag is introduced. A tag is used to point to a group of sockets. Tag set is managed only by server and unknown to client. `tag(String... names)`/`untag(String... names)` attcahes/detaches given names of tags to/from a socket.

**Note**

* Authentication result can be dealt with as a tag.
* To manage a lot of tags easily, use [URI](http://tools.ietf.org/html/rfc3986) as tag name format like `/account/flowersinthesand`.

_Notifying user using multiple devices of the login/logout from some specific device._

```java
server.onsocket((ServerSocket socket) -> {
  // An imaginary helper class to handle URI
  Uri uri = Uris.parse(socket.uri());
  String username = uri.param("username");
  String devicename = uri.param("devicename");

  socket.tag(username);
  socket.onopen((Void v) -> server.byTag(username).send("/login", "Using device " + devicename));
  socket.onclose((Void v) -> server.byTag(username).send("/logout", "Using device " + devicename));
});
```

### Handling the result of the remote event processing
You can get the result of event processing from the client in sending event using `send(String event, Object data, Action<T> onFulfilled)` and `send(String event, Object data, Action<T> onFulfilled, Action<U> onRejected)` where the allowed types, `T`, are the same with in receiving event, and set the result of event processing to the client in receiving event by using `Reply` as data type in an asynchronous manner.

**Note**

* If the client doesn't call either attached fulfilled or rejected callback, these callbacks won't be executed in any way. It is the same for the server.
* Beforehand determine whether to use rejected callback or not to avoid writing unnecessary rejected callbacks. For example, if required resource is not available, you can execute either fulfilled callback with `null` or rejected callback with exception e.g. `ResourceNotFoundException`.

### Accessing underlying objects
In any case, transport underlies socket and resource like HTTP request-response exchange and WebSocket underlies transport. To access such underlying objects like HTTP session, use `unwrap(Class<?> clazz)`. 

**Note**

* Don't manipulate returned objects unless you know what you are doing.

---

## Support
There are helpers to streamline repetitive tasks per runtime environment.

### Servlet

#### Resolving HttpSession
You can find `HttpSession` by unwrapping socket, transport, and so on but it's quite lengthy. Instead, use `HttpSessionResolver`, which works with Servlet 3 and Java WebSocket API 1.

```java
HttpSessionResolver httpSessionResolver = new HttpSessionResolver();
HttpSession httpSession = httpSessionResolver.resolve(socket);
```

Note that `HttpSessionResolver` doesn't create a session and returns `null` if there's no current session. Also if you are using Java WebSocket API 1, you need to put `HttpSession` into a map returned by `ServerEndpointConfig.getUserProperties()` with the `javax.servlet.http.HttpSession` key when building `ServerEndpointConfig`.

```java
ServerEndpointConfig config = ServerEndpointConfig.Builder.create(AsityServerEndpoint.class, "/cettia")
.configurator(new Configurator() {
    @Override
    protected <T> T getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
      return endpointClass.cast(new AsityServerEndpoint().onwebsocket(wsTransportServer));
    }

    @Override
    protected void modifyHandshake(ServerEndpointConfig config, HandshakeRequest request, HandshakeResponse response) {
      HttpSession httpSession = (HttpSession) request.getHttpSession();
      config.getUserProperties().put(HttpSession.class.getName(), httpSession);
    }
})
.build();
```

---

## Integration
Here is how to integrate cettia application with awesome technologies.

### Dependency injection
With dependency injection, you can inject a server wherever you need. Register a `Server` as a singleton component and inject it wherever you want to handle socket.

**Examples**

<ul class="menu">
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/dependency-injection/cdi1">CDI 1</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/dependency-injection/dagger1">Dagger 1</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/dependency-injection/guice3">Guice 3</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/dependency-injection/hk2">HK 2</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/dependency-injection/picocontainer2">PicoContainer 2</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/dependency-injection/spring4">Spring 4</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/dependency-injection/tapestry5">Tapestry 5</a></li>
</ul>

_Dealing with a server as a component using Spring._

```java
@WebListener
public class Bootstrap implements ServletContextListener {
  @Override
  @SuppressWarnings("resource")
  public void contextInitialized(ServletContextEvent event) {
    AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(SpringConfig.class);
    Server server = applicationContext.getBean(Server.class);
    // ... skipped
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {}
}
```

```java
@Configuration
@EnableScheduling
@ComponentScan(basePackages = { "simple" })
public class SpringConfig {
  // Registers the server as a component
  @Bean
  public Server server() {
    return new DefaultServer();
  }
}
```

```java
@Component
public class Clock {
  // Injects the server
  @Autowired
  private Server server;

  @Scheduled(fixedRate = 3000)
  public void tick() {
    server.all().send("chat", "tick: " + System.currentTimeMillis());
  }
}
```

### Clustering
All of the Message Oriented Middleware (MOM) supporting publish and subscribe model can be used to cluster multiple cettia applications with `ClusteredServer`. `ClusteredServer` intercepts a method invocation to `all` and `byTag`, converts the call into a message and executes actions added via `onpublish(Action<Map<String, Object>> action)` with that message.

All you need is to add an action to `onpublish(Action<Map<String, Object>> action)` to publish message to all servers in the cluster including the one issued and to pass them to `messageAction().on(Map<String, Object> message)` when receiving such messages from other server.

**Note**

* Most MOMs in Java require message to be serialized. In other words, `Action` instance used in `all` and `byTag` (not `onsocket`) should implement `Serializable`. Whereas `Action` is generally used as anonymous class, `Serializable` [can't be used in that manner](http://docs.oracle.com/javase/7/docs/platform/serialization/spec/serial-arch.html#4539). Therefore always use `Sentence` instead of `Action` if possible especially in this case. However, Java 8's [lambda has no such issues](http://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.16) thanks to additional bound. For example, you can use a lambda like `server.all((Action<ServerSocket> & Serializable) socket -> socket.send("chat", "Hi"))`.

**Examples**

<ul class="menu">
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/clustering/amqp1">AMQP 1</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/clustering/hazelcast3">Hazelcast 3</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/clustering/jgroups3">jGroups 3</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/clustering/jms2">JMS 2</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/clustering/redis2">Redis 2</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/clustering/vertx2">Vert.x 2</a></li>
</ul>

_Hazelcast example._

```java
@WebListener
public class Bootstrap implements ServletContextListener {
  @Override
  public void contextInitialized(ServletContextEvent event) {
    ClusteredServer server = new ClusteredServer();
    HazelcastInstance hazelcast = HazelcastInstanceFactory.newHazelcastInstance(new Config());
    ITopic<Map<String, Object>> topic = hazelcast.getTopic("cettia");
    // Some server in the cluster published a message
    // Pass it to this local server
    topic.addMessageListener((Message<Map<String, Object>> message) -> server.messageAction().on(message.getMessageObject()));
    // This local server got a method call from 'all' or 'byTag' and created a message
    // Publish it to every server in the cluster
    server.onpublish((Map<String, Object> message) -> topic.publish(message));
    // ... skipped
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {}
}
```
