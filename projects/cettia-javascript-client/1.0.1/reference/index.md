---
layout: project
title: Cettia JavaScript Client Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* TOC
{:toc}

---

## Installation

### As a browser client

Download the package the way you want.

<ul class="menu">
<li><code>npm install cettia-client --save</code></li>
<li><a href="https://unpkg.com/cettia-client@1.0.1/cettia-browser.min.js">The compressed for production</a></li>
<li><a href="https://unpkg.com/cettia-client@1.0.1/cettia-browser.js">The uncompressed for development</a></li>
</ul>

Then load it by using either bundlers such as [webpack](https://webpack.github.io/), [Browserify](http://browserify.org/) and [Rollup](http://rollupjs.org/) or a `script` tag.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Bundler**

```javascript
import cettia from "cettia-client/cettia-bundler";

const socket = cettia.open("/cettia");
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**`script` tag**

```html
<script src="/path/to/cettia-browser.min.js"></script>
<script>
var socket = cettia.open("/cettia");
</script>
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### As a Node.js client
Cettia JavaScript Client is available on [npm](https://npmjs.org/package/cettia-client) under the name of `cettia-client`. Install the module.
  
```bash
npm install cettia-client --save
```

It will install the latest version adding it to dependencies entry in `package.json` in the current project folder.

Then load it as a npm module.

```javascript
var cettia = require("cettia-client");
var socket = cettia.open("http://localhost:8080/cettia");
```

---

## Socket
The interface to represent a client-side socket.

### Opening a socket
To create a socket and connect to the server, use `cettia.open(uri: string, options?: SocketOptions): Socket` or `cettia.open(uris: string[], options?: SocketOptions): Socket`. The returned socket is in `connecting` state. Here URI is used to not only identify a name of an endpoint but also determine transport type so that it should follow a specific URI format according to transport. But it's allowed to use a plain form of URI like `http://localhost/cettia` or `/cettia` for convenience. If a connection is established successfully, then `new` and `open` events are fired. If not, `close` event is fired.

**Note**

* Plain URI is translated to ones which follow WebSocket, HTTP Streaming and HTTP Long Polling transport, respectively, in order. To change this default order, you should use fully qualified URIs instead of plain URI.
* Relative URI is valid only in browser.

_Opening a socket._

```javascript
// A plain URI
// Internally the URI is translated to fully qualified URIs like the below form
cettia.open("http://localhost/cettia");

// Fully qualified URIs
// A fully qualified URI follows the corresponding transport's own URI format
cettia.open(["ws://localhost/cettia", "http://localhost/cettia?cettia-transport-name=stream", "http://localhost/cettia?cettia-transport-name=longpoll"]);
```

### Properties
These are read only.

#### State
The current state of the socket.

```java
socket.state();
```

### Lifecycle
Socket always is in a specific state that can be accessed by `state()` method. Note that regardless of the lifecycle, a reference to the socket isn't affected by disconnection and reconnection, and only the `new` event among reserved events determines the lifecycle. The following list is a list of state which a socket can be in.

* `connecting`

  The `connecting` event is fired. If given URIs, transports are created through transport factories specified by `transports?: ((uri: string, options: TransportOptions) => Transport)[]` option and used to establish a connection over wire. Each transport should establish a connection within the time specified by `timeout?: number` option. If it turns out that a transport corresponding to the current URI is not available, next URI is tried.
  
  State transition occurs to

  * `opened`: if one of transports succeeds in establishing a connection.
  * `closed`: if `close()` method is called.
  * `closed`: if every transport fails to connect in time.

  <p>
  
* `opened`

  The connection is successfully established and communication is possible. If the server issues a new identifier for the socket, the `new` event is fired as the beginning of the new lifecycle and the end of the old lifecycle. Then, the `open` event follows. It would happen if it's the first time to connect to the server so there is no corresponding socket in the server or if a connection was disconnected but reconnection doesn't occur for a long time so the socket is deleted from the server. If the server doesn't issue a new identifier, that is to say, the client reconnects in time, only the `open` event is fired, which doesn't affect the current lifecycle. Only in this state, the socket can send and receive events via connection.
   
  State transition occurs to
  
  * `closed`: if `close()` method is called.
  * `closed`: if connection is closed cleanly.
  * `closed`: if heartbeat fails.
  * `closed`: if connection is disconnected due to some error.

  <p>
  
* `closed`

  The connection has been closed, has been regarded as closed or could not be opened. The `close` event is fired. If `reconnect? (lastDelay: number, lastAttempts: number)` option is set to `false` or returns `false`, the whole lifecycle ends here. In this state, sending and receiving events is not allowed but sent events in this state are passed to the `cache` event without throwing an exception so that you can cache and send them on next reconnection. It is the same for the server.
  
  State transition occurs to

  * `waiting`: if `reconnect` option returns a positive number.

  <p>

* `waiting`

  The socket waits out the reconnection delay. The `waiting` event is fired with the reconnection delay in milliseconds and the total number of reconnection attempts.
  
  State transition occurs to

  * `connecting`: after the reconnection delay.
  * `closed`: if `close()` method is called.

### Handling errors
To capture any error happening in the socket, add `error` event handler. As an argument, `Error` object in question is passed. Exceptions from the underlying transport are also propagated.

**Note**

* In most cases, there is no error that you can ignore safely. You should watch this event.
* Errors thrown by user created event handler are not propagated to `error` event.

### Sending and receiving events
You can send event using `send(event: string, data?: any)` and receive event using `on(event: string, onEvent: (data?: any) => void)`. Any type of data can be sent and received regardless of whether is is text, binary or composite.

**Note**

* Any event name can be used except reserved ones: `connecting`, `new`, `open`, `close`, `cache`, `waiting` and `error`.
* If data or one of its properties is `Buffer` in Node or `ArrayBuffer` in browser, it is regarded as binary. Though, you don’t need to be aware of that.
* If you send an event to a closed socket, it will be delegated to that socket's `cache` event so you don't need to worry about socket's state when sending event.

_The client sends an event and the server echoes back to the client._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
cettia.open("http://localhost:8080/cettia", {reconnect: false})
.on("open", function() {
  if (typeof exports === "object") {
    // Node
    this.send("echo", new Buffer("echo"));
    this.send("echo", {text: "echo", binary: new Buffer("echo")});
  } else {
    // Browser
    // From Encoding standard https://encoding.spec.whatwg.org/
    var encoder = new TextEncoder();
    this.send("echo", encoder.encode("echo"));
    this.send("echo", {text: "echo", binary: encoder.encode("echo")});
  }
})
.on("echo", function(data) {
  console.log(data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
  socket.on("echo", function(data) {
    console.log(data);
    this.send("echo", data);
  });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

_The server sends an event and the client echoes back to the server._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
cettia.open("http://localhost:8080/cettia", {reconnect: false})
.on("echo", function(data) {
  console.log(data);
  this.send("echo", data);
})
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
  socket.on("open", function() {
    socket.send("echo", new Buffer("echo"));
    socket.send("echo", {text: "echo", binary: new Buffer("echo")});
  });
  socket.on("echo", function(data) {
    console.log(data);
  })
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Reconnection
Reconnection has been disabled in the code snippets in this page for convenience of test, but it's essential for production so that it's enabled by default. The default strategy generates a geometric progression with initial delay `500` and ratio `2` (500, 1000, 2000, 4000 ...). To change it, set `reconnect? (lastDelay: number, lastAttempts: number): number` function which receives the last delay in ms or `null` at first and the total number of reconnection attempts so far and should return a reconnection delay in ms or `false` not to reconnect.

**Note**

* Don't add event handler during dispatch. Because reconnection doesn't remove existing event handlers, it will be duplicated. 

### Offline handling
Once the underlying transport is disconnected, it's not possible to send an event through the socket until the new transport establishes a connection. To cache event which is being passed to `send` method while offline and send it on next reconnection, make use of `new`, `open`, and `cache` event. The `cache` event is fired if the `send` method is called when there is no connection with an array of arguments used to call the `send` method.

**Note**

* There is no default behavior for offline handling.

_Caching events while offline and sending them on next reconnection._

```javascript
var socket = cettia.open("http://localhost:8080/cettia");
// A queue containing events the client couldn't send to the server while disconnection
var cache = [];
// Fired if the send method is called when there is no connection
socket.on("cache", function(args) {
  // You can determine whether or not to cache this arguments used to call the send method
  // For example, in some cases, you may want to avoid caching to deliver live data in time
  cache.push(args);
});
socket.on("open", function() {
  // Now that communication is possible, you can flush the cache
  while(socket.state() === "opened" && cache.length) {
    // Removes the first event from the cache and sends it to the server one by one
    var args = cache.shift();
    socket.send.apply(socket, args);
  }
});
socket.on("new", function() {
  // The old lifecycle ends and the new lifecycle begins
  // If the cache is not empty, it means that there are cached message that should have been sent through the old socket
  if (cache.length) {
    // If you don't empty the cache here, cached messages will be sent through the new socket on following open event
  }
});
```

### Extending the lifecycle to the next page
To extend the lifecycle of the socket to the next page, that is to say, for the socket of the next page to inherit the lifecycle of the socket of the current page, set the same `name?: string` option. It enables for the server to cache events which cannot be sent to the socket of the previous page due to temporary disconnection during page navigation and send them on next reconnection to the socket of the next page. Since these sockets are the same in terms of the lifecycle, you can deal with them using a single socket reference in the server and actually don't need to know what's happening in the client. With this option, you don't need to stick with the single page application model to avoid message loss from page navigation.

**Note**

* The lifecycle is extended only within the browsing context. That's why if you duplicate a tab or window, a socket of the new tab will have a different new lifecycle.
* In a page where the socket inherits the lifecycle of the socket of the previous page, the `new` event is not fired of course. If some resources are supposed to be initialized on `new` event before being used, it won't work in such pages.
* `name` option doesn't require to set the same URI so you can include variable parameter to URI like `"/cettia?now=" + Date.now()`.
* This features monopolizes `window.name` as a storage for the browsing context. Make sure that none of your application use `window.name`.

### Handling the result of the remote event processing
You can get the result of event processing from the server in sending event using `send(event: string, data?: any, onFulfilled?: (data?: any) => void, onRejected?: (data?: any) => void)` and set the result of event processing to the server in receiving event using `on(event: string, handler:(data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void)` in an asynchronous manner.

**Note**

* If the server doesn't call either attached fulfilled or rejected callback, these callbacks won't be executed in any way. It is the same for the client.
* Beforehand determine whether to use rejected callback or not to avoid writing unnecessary rejected callbacks. For example, if required resource is not available, you can execute either fulfilled callback with `null` or rejected callback with error e.g. `ResourceNotFoundError`.

---

## Transport
The interface to reprsent a full-duplex connection.

### Implementation
According to the technology, WebSocket transport factory, HTTP Streaming transport factory and HTTP Long polling transport factory are provided and accessible through `cettia.transport.createWebSocketTransport`, `cettia.transport.createHttpStreamTransport` and `cettia.transport.createHttpLongpollTransport` respectively.

### Compatibility
The compatiblity of Cettia JavaScript Client depends on transport compatibility.

#### Browser
The browser support policy is the same with the one of [jQuery](http://jquery.com/browser-support/).

| Internet Explorer | Chrome | Firefox | Safari | Opera | iOS | Android |
|---|---|---|---|---|---|---|
| 9+ | (Current - 1) or Current | (Current - 1) or Current | 5.1+ | 12.1x, (Current - 1) or Current| 6.0+ | 4.0+ |

A word in WebSocket cell stands for WebSocket protocol browser implements, and in order to use WebSocket in some browser, the server should implement WebSocket protocol the browser implements as well. A word list in HTTP Streaming and HTTP Long Polling cell stands for the host objects used to establish a read-only channel and the final host object is determined through feature detection automatically.

| Browser | Version | WebSocket | HTTP Streaming | HTTP Long Polling |
|---|---|---|---|---|
|Internet Explorer|11|rfc6455|`XMLHttpRequest`|`XMLHttpRequest`|
|         |10|rfc6455|`XMLHttpRequest`|`XMLHttpRequest`|
|         |9<sup>3</sup>||`XDomainRequest`<sup>2</sup>, `iframe`<sup>1</sup>|`XMLHttpRequest`<sup>1</sup>, `XDomainRequest`<sup>2</sup>, `script`|
|Chrome|25|rfc6455|`EventSource`|`XMLHttpRequest`|
|Firefox|11|rfc6455|`EventSource`|`XMLHttpRequest`|
|Safari|7.0|rfc6455|`EventSource`|`XMLHttpRequest`|
|    |6.0|rfc6455|`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|    |5.1|hixie-76<sup>3</sup>|`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|Opera|15|rfc6455|`EventSource`|`XMLHttpRequest`|
|   |12.10|rfc6455|`EventSource`|`XMLHttpRequest`|
|iOS|7.0|rfc6455|`EventSource`|`XMLHttpRequest`|
|   |6.0||`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|Android|4.4|rfc6455|`EventSource`|`XMLHttpRequest`|
|     |4.0||`XMLHttpRequest`|`XMLHttpRequest`|

**Note**

* 1: only availabe in same origin connection
* 2: `xdrURL` option required.
* 3: binary features are not available.

#### Node.js

| Version | WebSocket | HTTP Streaming | HTTP Long Polling |
|---|---|---|---|
|4| rfc6455|`EventSource`|`XMLHttpRequest`|

---

## Quirks
There are problems which can't be dealt with in non-invasive way.

#### The browser limits the number of simultaneous connections

Applies to: HTTP transport

According to the [HTTP/1.1 spec](http://tools.ietf.org/html/rfc2616#section-8.1.4), a single-user client should not maintain more than 2 connections. This restriction actually [varies with the browser](http://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser). If you consider multiple topics to subscribe and publish, utilize the custom event using a single connection.

#### Sending an event emits a clicking sound

Applies to: cross-origin HTTP connection on browsers not supporting CORS

If a given url is cross-origin and the browser doesn't support CORS such as Internet Explorer 6, an invisible form tag is used to send data to the server. Here, a clicking sound occurs every time the form is submitted. There is no workaround.
