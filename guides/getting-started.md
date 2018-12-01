---
layout: guide
title: "Getting Started With Cettia"
description: "TODO An introductory tutorial to Cettia. It explains the reason behind key design decisions that the Cettia team have made in the Cettia, as well as various patterns and features required to build real-time oriented applications without compromise with Cettia."
---

<h1 class="h2" id="getting-started">Getting Started</h1>

This is a summary of a tutorial, TODO <a href="/guides/cettia-tutorial/" target="_blank">Building Real-Time Web Applications With Cettia</a>, for quick start. You may want to read the tutorial for better understanding of Cettia. It covers the reason behind key design decisions that the Cettia team have made in the Cettia as well as the features required to create real-time oriented web applications with Cettia.

The result of the tutorial, the Cettia starter kit, is available in <a href="https://github.com/cettia/cettia-starter-kit" target="_blank">the GitHub repository</a>. If you have Java 8+ and Maven 3+ installed, you can run the example by cloning or downloading the repository and typing the following maven command.

{% capture panel %}
```shell
git clone https://github.com/cettia/cettia-starter-kit
cd cettia-starter-kit
mvn jetty:run
```
{% endcapture %}{{ panel | markdownify }}

Then, open a browser and connect to <a href="http://localhost:8080" target="_blank">http://localhost:8080</a>.

### Setting Up the Project
#### Server

Add an `io.cettia:cettia-server:1.2.0` (<a href="http://javadoc.io/doc/io.cettia/cettia-server" target="_blank">Javadoc</a>) as a dependency of your application.

{% capture panel %}
```xml
<dependency>
  <groupId>io.cettia</groupId>
  <artifactId>cettia-server</artifactId>
  <version>1.2.0</version>
</dependency>
```
{% endcapture %}{{ panel | markdownify }}

Then, you can accept and handle sockets that connect to the server through <code>server.onsocket(socket -&gt; {})</code>.

{% capture panel %}
```java
Server server = new DefaultServer();
HttpTransportServer httpAction = new HttpTransportServer().ontransport(server);
WebSocketTransportServer wsAction = new WebSocketTransportServer().ontransport(server);

server.onsocket((ServerSocket socket) -> System.out.println(socket));

// javax.servlet.Servlet asityServlet = new AsityServlet().onhttp(httpAction);
// javax.websocket.Endpoint asityEndpoint = new AsityServerEndpoint().onwebsocket(wsAction);
```
{% endcapture %}{{ panel | markdownify }}

Cettia is based on <a href="http://asity.cettia.io" target="_blank">Asity</a> and compatible with any web framework on the Java Virtual Machine. As you can see in the commend out code, the above application is able to run on any framework as long as you feed <code>httpAction</code> and <code>wsAction</code> with the framework's HTTP request-response exchange and WebSocket connection through bridges per framework provided by Asity like the above <code>asityServlet</code> and <code>asityEndpoint</code>. For the usage of bridge, see Asity's <a href="http://asity.cettia.io/#run-anywhere" target="_blank">Run Anywhere</a> section. Asity supports almost all popular web frameworks in Java: Servlet and Java API for WebSocket, Spring WebFlux, Spring MVC, Grizzly, Vert.x, Netty, Atmosphere, and so on.

The tutorial uses Servlet and Java API for WebSocket as a web framework and passes requests whose URI is <code>/cettia</code> to the Cettia server. In other means, the Cettia client can connect to this server through <code>http://127.0.0.1:8080/cettia</code>.

#### Client

Load the <code>cettia</code> object the way you want.

<dl>
  <dt>CDN</dt>
  <dd>
{% capture panel %}
```html
<script src="https://unpkg.com/cettia-client@1.0.1/cettia-browser.min.js"></script>
```
{% endcapture %}{{ panel | markdownify }}
  </dd>
  <dt>Webpack</dt>
  <dd>
    <div class="grid-x">
      <div class="cell large-6">
{% capture panel %}
```
npm install cettia-client --save
```
{% endcapture %}{{ panel | markdownify }}
      </div>
      <div class="cell large-6">
{% capture panel %}
```javascript
var cettia = require("cettia-client/cettia-bundler");
```
{% endcapture %}{{ panel | markdownify }}
      </div>
    </div>
  </dd>
  <dt>Node</dt>
  <dd>
    <div class="grid-x">
      <div class="cell large-6">
{% capture panel %}
```
npm install cettia-client --save
```
{% endcapture %}{{ panel | markdownify }}
      </div>
      <div class="cell large-6">
{% capture panel %}
```javascript
var cettia = require("cettia-client");
```
{% endcapture %}{{ panel | markdownify }}
      </div>
    </div>
  </dd>
</dl>

Then, you can open a socket pointing to the URI of the Cettia server with <code>cettia.open(uri)</code>.

{% capture panel %}
```javascript
var socket = cettia.open("/cettia");
```
{% endcapture %}{{ panel | markdownify }}

You may have to use an absolute URI, <code>http://127.0.0.1:8080/cettia</code>, if you use runtimes other than browser like Node.js. If everything is set up correctly, you should be able to see a socket log similar to the following in the server-side.

{% capture panel %}
```
ServerSocket@9e14198f-fc59-47b1-9910-6de1174a13b5[state=null,tags=[],attributes={}]
```
{% endcapture %}{{ panel | markdownify }}

### Socket Lifecycle

A socket always is in a specific state, such as opened or closed. Its state keeps changing based on the state of the underlying connection, firing one of built-in events. Just know that the communication is possible only in the <code>opened</code> state.

<div class="grid-x grid-margin-x">
  <div class="cell large-6">
    <h4>Server</h4>
    <p>The state transition diagram of a server socket.</p>
    <p><img src="https://user-images.githubusercontent.com/1095042/39472695-ec3ea126-4d85-11e8-908e-de4bdebf4acb.jpg" alt="server-state-diagram"></p>
    <p>Tracking the state transition of the server socket.</p>
{% capture panel %}
```java
server.onsocket(socket -> { // By 1
  Action<Void> log = v -> System.out.println(socket.state());
  socket.onopen(log); // By 3 and 5
  socket.onclose(log); // By 2 and 4
  socket.ondelete(log); // By 6
});
```
{% endcapture %}{{ panel | markdownify }}
  </div>
  <div class="cell large-6">
    <h4>Client</h4>
    <p>The state transition diagram of a client socket.</p>
    <p><img src="https://user-images.githubusercontent.com/1095042/39466008-7ec29c5c-4d61-11e8-9845-bf7d2ede131c.jpg" alt="client-state-diagram"></p>
    <p>Tracking the state transition of the client socket.</p>
{% capture panel %}
```javascript
var log = arg => console.log(socket.state(), arg);
socket.on("connecting", log); // By 1 and 6
socket.on("open", log); // By 3
socket.on("close", log); // By 2, 4, and 7
socket.on("waiting", log); // By 5
```
{% endcapture %}{{ panel | markdownify }}
  </div>
</div>

### Attributes and Tags

In order to store information regarding socket like username in a socket and find sockets based on the stored information, Cettia provides attributes and tags per socket. They are analogous to <code>data-*</code> attributes and <code>class</code> attribute defined in HTML, respectively.

<div class="grid-x grid-margin-x">
  <div class="cell large-6">
    <h4>Attributes</h4>
    <p>An attributes and its sugar methods on <code>ServerSocket</code> are as follows.</p>
    <dl>
      <dt><code>Map&lt;String, Object&gt; attributes()</code></dt>
      <dd>Returns an attributes of the socket.</dd>
      <dt><code>Object get(key)</code></dt>
      <dd>Returns the value mapped to the given name.</dd>
      <dt><code>ServerSocket set(key, value)</code></dt>
      <dd>Associates the value with the given name in the socket.</dd>
      <dt><code>ServerSocket remove(key)</code></dt>
      <dd>Removes the mapping associated with the given name.</dd>
    </dl>
  </div>
  <div class="cell large-6">
    <h4>Tags</h4>
    <p>A tags and its sugar methods on <code>ServerSocket</code> are as follows.</p>
    <dl>
      <dt><code>Set&lt;String&gt; tags()</code></dt>
      <dd>Returns a tags of the socket.</dd>
      <dt><code>ServerSocket tag(tags...)</code></dt>
      <dd>Attaches given tags to the socket.</dd>
      <dt><code>ServerSocket untag(tags...)</code></dt>
      <dd>Detaches given tags from the socket.</dd>
    </dl>
  </div>
</div>

### Sending and Receiving Events

A unit of exchange between the Cettia client and the Cettia server in real-time is the event. You can define and use your own events as long as the event name isn't duplicated with built-in events. Here's the echo event handler where any received echo event is sent back.

<div class="grid-x grid-margin-x">
  <div class="cell large-6">
    <h4>Server</h4>
{% capture panel %}
```java
socket.on("echo", (Object data) -> socket.send("echo", data));
```
{% endcapture %}{{ panel | markdownify }}
  </div>
  <div class="cell large-6">
    <h4>Client</h4>
{% capture panel %}
```javascript
socket.on("echo", data => socket.send("echo", data));
```
{% endcapture %}{{ panel | markdownify }}
  </div>
</div>

In the server side, the allowed types for the event data are not just <code>Object</code>, but determined by Jackson, a JSON processor used by Cettia internally. If an event data is supposed to be one of the primitive types, you can cast and use it with the corresponding wrapper class, and if it’s supposed to be an object like List or Map and you prefer POJOs, you can convert and use it with JSON library like Jackson. It might look like this:

{% capture panel %}
```java
socket.on("event", data -> {
  Model model = objectMapper.convertValue(data, Model.class);
  Set<ConstraintViolation<Model>> violations = validator.validate(model);
  // ...
});
```
{% endcapture %}{{ panel | markdownify }}


An event data can be basically anything as long as it is serializable, regardless of whether data is binary or text. If at least one of the properties of the event data is <code>byte[]</code> or <code>ByteBuffer</code> in the server, <code>Buffer</code> in Node or <code>ArrayBuffer</code> in the browser, the event data is internally treated as binary, and that binary property is given as a <code>ByteBuffer</code> in the server, a <code>Buffer</code> in Node, and an <code>ArrayBuffer</code> in the browser.

### Disconnection Handling

Cettia defines the temporary disconnection as one that is followed by reconnection within 60 seconds, and designs a socket's lifecycle to be unaffected by temporary disconnections, to support environments where temporary disconnections happen frequently just like the mobile environment. Here's an example to send events failed due to disconnection on the next connection.

{% capture panel %}
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
{% endcapture %}{{ panel | markdownify }}

The <code>cache</code> event above is fired with an argument array used to call the <code>send</code> method, if the socket has no active connection when the <code>send</code> method is called. If there has been no reconnection within one minute since disconnection, the <code>delete</code> event is fired and the lifecycle of socket ended. With the <code>delete</code> event, you can store the miseed events in a database and show them on the next visit.

### Working with Sockets

The most common use case in a real-time web application is to push messages to certain clients, of course. Cettia supports this intuitively by enabling "find sockets and do something with them" without a separate concept like Topic and Broadcaster.

{% capture panel %}
```java
server.find(socket -> /* find sockets */).execute(socket -> /* do something with them */);
```
{% endcapture %}{{ panel | markdownify }}

<code>server.find(predicate)</code> finds a certain set of sockets that matches the given predicate and returns an instance of fluent interface called <code>Sentence</code>. And <code>sentence.execute(action)</code> allows to deal with the sockets through the passed socket action. Here's an example to send a chat event to every socket in the server.

{% capture panel %}
```java
server.find(socket -> true).execute(socket -> socket.send("chat", "Hi, there"));
```
{% endcapture %}{{ panel | markdownify }}

Along with <code>server.find</code> and <code>sentence.execute</code>, Cettia offers the following pre-defined predicates and socket actions through <code>ServerSocketPredicates</code> and <code>Sentence</code>, respectively, to make the code even more expressive and readable.

#### ServerSocketPredicates

The following are static methods to create socket predicates defined in <code>ServerSocketPredicates</code>.

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

Here’s an example to find sockets whose username is the same except the <code>socket</code>. Assume the <code>attr</code> and <code>id</code> are statically imported from the <code>ServerSocketPredicates</code> class.

{% capture panel %}
```java
ServerSocketPredicate p = attr("username", username).and(id(socket).negate());
```
{% endcapture %}{{ panel | markdownify }}

#### Sentence

Each method on <code>Sentence</code> is mapped to a pre-implemented common socket action, so if the method is executed, its mapped action is executed with sockets matching the sentence’s predicate. Here is a list of methods on the sentence.

<dl>
  <dt><code>close()</code></dt>
  <dd>Closes the socket.</dd>
  <dt><code>send(String event)</code></dt>
  <dd>Sends a given event without data through the socket.</dd>
  <dt><code>send(String event, Object data)</code></dt>
  <dd>Sends a given event with the given data through the socket.</dd>
  <dt><code>tag(String... tags)</code></dt>
  <dd>Attaches given tags to the socket.</dd>
  <dt><code>untag(String... tags) </code></dt>
  <dd>Detaches given tags from the socket.</dd>
</dl>

Here’s an example of a sentence.

{% capture panel %}
```java
server.find(p).send("signout").close();
```
{% endcapture %}{{ panel | markdownify }}

### Scaling a Cettia Application

Last but not least is scaling an application. Any publish-subscribe messaging system can be used to scale a Cettia application horizontally, and it doesn't require any modification in the existing application. Here's an example of Hazelcast. Replace <code>Server server = new DefaultServer();</code> with <code>ClusteredServer server = new ClusteredServer();</code>, and add the following dependencies to your application:

{% capture panel %}
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
{% endcapture %}{{ panel | markdownify }}

Then place the following Hazelcast configuration after <code>ClusteredServer server = new ClusteredServer();</code>.

{% capture panel %}
```java
HazelcastInstance hazelcast = HazelcastInstanceFactory.newHazelcastInstance(new Config());
ITopic<Map<String, Object>> topic = hazelcast.getTopic("cettia");
server.onpublish(message -> topic.publish(message));
topic.addMessageListener(message -> server.messageAction().on(message.getMessageObject()));
```
{% endcapture %}{{ panel | markdownify }}

If you start up the server with different port such as 8090, you should see servers listening to 8080 and 8090 form a a cluster of Hazelcast nodes. This means that a chat event sent from a client connected to the server on 8080 propagates to clients connected to the server on 8090 as well as 8080.
