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
### As browser client
Download cettia.js the way you want.

<ul class="menu">
<li><a href="/projects/cettia-javascript-client/1.0.0-Alpha1/cettia.min.js">The compressed for production</a></li>
<li><a href="/projects/cettia-javascript-client/1.0.0-Alpha1/cettia.js">The uncompressed for development</a></li>
<li><code>bower install cettia</code></li>
</ul>

Then load or link it by using either script tag or [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) loader.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Script tag**

```html
<script src="/cettia/cettia.min.js"></script>
<script>
var socket = cettia.open("/cettia");
</script>
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**AMD loader**

```javascript
require(["cettia"], function(cettia) {
    var socket = cettia.open("/cettia");
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### As Node.js client
cettia.js is available on [npm](https://npmjs.org/package/cettia-client) under the name of `cettia-client`. Install the module.
  
```bash
npm install cettia-client --save
```

It will install the latest version adding it to dependencies entry in `package.json` in the current project folder. If you are on Windows, you may have trouble in installing Contextify. See a [installation guide](https://github.com/tmpvar/jsdom/tree/3.x#contextify) from jsdom.

Then load it as a Node.js module.

```javascript
var cettia = require("cettia-client");
var socket = cettia.open("http://localhost:8080/cettia");
```

---

## Socket
The feature-rich and flexible interface for two-way communication. To open a socket, use `cettia.open(uri: string, options?: SocketOptions)` or `cettia.open(uris: string[], options?: SocketOptions)`. Each URI should follow a specific URI format specified by each transport but it's allowed to use a plain form of URI like `http://localhost/cettia` or `/cettia` for convenience. And socket options can be skipped.

Internally, `cettia.open("http://host/cettia")` is treated as `cettia.open(["ws://host/cettia", "http://host/cettia?transport=stream", "http://host/cettia?transport=longpoll"])`, which correspond to WebSocket, HTTP Streaming and HTTP Long Polling transport respectively.

### Life Cycle
Socket always is in a specific state that can be accessed by `state()` method. According to the status of connection, transition between states occurs and this circulating transition makes a life cycle. The following list is a list of state which a socket can be in. In any case, if connection is closed due to error, `error` event will be fired before transition to `closed`.

* **preparing**

    As an initial state of life cycle, it's internally used during reinitializing socket. State transition occurs to `connecting` without exception.
    
* **connecting**

    The `connecting` event is fired. Given URIs, transports are created through transport factories specified by `transports?: ((uri: string, options: TransportOptions) => Transport)[]` option and used to establish a connection over wire. Each transport should establish a connection in time which is set to `timeout` option. If it turns out that the transport corresponding the current URI is not available, next URI is tried. The `connecting` event is an initial event where you can handle the socket during the life cycle.
    
    State transition occurs to
    * `opened`: if one of transports succeeds in establishing a connection.
    * `closed`: if `close()` method is called.
    * `closed`: if every transport fails to connect in time.<p>
    
* **opened**

    The connection is established successfully and communication is possible. The `open` event is fired. Only in this state, the socket can send and receive events via connection. 
     
    State transition occurs to
    
    * `closed`: if `close()` method is called.
    * `closed`: if connection is closed cleanly.
    * `closed`: if heartbeat fails.
    * `closed`: if connection is disconnected due to some error.<p>
    
* **closed**

    The connection has been closed, has been regarded as closed or could not be opened. If `reconnect? (lastDelay: number, attempts: number)` option is set to `false` or returns `false`, the socket's life cycle ends here.
    
    State transition occurs to
    * `waiting`: if `reconnect` option returns a positive number.<p>
    
* **waiting**

    The socket waits out the reconnection delay. The `waiting` event is fired with the reconnection delay in milliseconds and the total number of reconnection attempts.
    
    State transition occurs to
    * `preparing`: after the reconnection delay.
    * `closed`: if `close()` method is called.

### Error Handling
To capture any error happening in the socket, use error event. If any error is thrown by the socket, `error` event will be fired with `Error` object in question. In most cases, there is nothing you should do in `error` event.

**Note**

* Errors thrown by user created event handler are not propagated to `error` event.

```javascript
cettia.open("http://localhost:8080/cettia", {reconnect: false})
.on("error", function(error) {
    console.error(error);
});
```

### Sending and Receiving Event
You can send event using `send(event: string, data?: any)` and receive event using `on(event: string, onEvent: (data?: any) => void)`. Any event name can be used, except `connecting`, `open`, `error`, `close` and `waiting` and any data can be sent and received but it should be able to be marshalled/unmarshalled to JSON.

**Note**

* Socket must be in `opened` state.
* To manage a lot of events easily, use [URI](http://tools.ietf.org/html/rfc3986) as event name format like `/account/update`.

_The client sends events and the server echoes back to the client._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
cettia.open("http://localhost:8080/cettia", {reconnect: false})
.on("open", function() {
    this.send("echo", Math.PI)
    .send("echo", "pi")
    .send("echo", {"p": "i"})
    .send("echo", ["p", "i"]);
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

_The server sends events and the client echoes back to the server._

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
    socket.on("echo", function(data) {
      console.log(data);
    })
    .send("echo", Math.PI)
    .send("echo", "pi")
    .send("echo", {"p": "i"})
    .send("echo", ["p", "i"]);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Getting and Setting Result of Event Processing
You can get the result of event processing from the server in sending event using `send(event: string, data?: any, onResolved?: (data?: any) => void, onRejected?: (data?: any) => void)` and set the result of event processing to the server in receiving event using `on(event: string, handler:(data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void)`. Either resolved or rejected callback is executed once when the server executes it.

You can apply this functionality to sending events in order, Acknowledgements, Remote Procedure Call and so on.

**Note**

* Socket must be in `opened` state.
* Beforehand determine whether to use rejected callback or not to avoid writing unnecessary rejected callbacks. For example, if required resource is not available, you can execute either resolved callback with null or rejected callback with exception.

_The client sends events attaching callbacks and the server executes one of them with the result of event processing._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
cettia.open("http://localhost:8080/cettia", {reconnect: false})
.on("open", function(data) {
    this.send("/account/find", "donghwan", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
    })
    .send("/account/find", "flowersits", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.on("/account/find", function(id, reply) {
      console.log(id);
      if (id === "donghwan") {
          reply.resolve({name: "Donghwan Kim"});
      } else {
          reply.reject("¯\(°_o)/¯");
      }
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

_The server sends events attaching callbacks and the client executes one of them with the result of event processing._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
cettia.open("http://localhost:8080/cettia", {reconnect: false})
.on("/account/find", function(id, reply) {
    console.log(id);
    if (id === "donghwan") {
        reply.resolve({name: "Donghwan Kim"});
    } else {
        reply.reject("¯\(°_o)/¯");
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.send("/account/find", "donghwan", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
    })
    .send("/account/find", "flowersits", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Reconnection
Reconnection has been disabled in the above code snippets for convenience of test, but it's essential for production so that it's enabled by default. The default strategy generates a geometric progression with initial delay `500` and ratio `2` (500, 1000, 2000, 4000 ...). To change it, set `reconnect (delay: number, attempts: number): number` function which receives the last delay in ms or null at first and the total number of reconnection attempts and should return a delay in ms or `false` not to reconnect.

**Note**

* Don't add event handler by `on` method during dispatch including `open` event. Because reconnection doesn't remove existing event handlers, it will be duplicated in next life cycle.

---

## Transport
As an interface that used to establish a connection, send and receive text and binary message and close the connection, it is used to build socket on top of itself. Of course transport doesn't have an influence on socket's functionalities.

### Implementation
According to the technology, WebSocket transport factory, HTTP Streaming transport factory and HTTP Long polling transport factory are provided and accessible through `cettia.transport.createWebSocketTransport`, `cettia.transport.createHttpStreamTransport` and `cettia.transport.createHttpLongpollTransport` respectively.

### Compatibility
The compatiblity of Cettia JavaScript Client depends on transport compatibility.

#### Browser
The browser support policy is the same with the one of [jQuery 1.x](http://jquery.com/browser-support/).

| Internet Explorer | Chrome | Firefox | Safari | Opera | iOS | Android |
|---|---|---|---|---|---|---|
| 6+ | (Current - 1) or Current | (Current - 1) or Current | 5.1+ | 12.1x, (Current - 1) or Current| 6.0+ | 4.0+ |

A word in WebSocket cell stands for WebSocket protocol browser implements, and in order to use WebSocket in some browser, the server should implement WebSocket protocol the browser implements as well. A word list in HTTP Streaming and HTTP Long Polling cell stands for the host objects used to establish a read-only channel and the final host object is determined through feature detection automatically.

| Browser | Version | WebSocket | HTTP Streaming | HTTP Long Polling |
|---|---|---|---|---|
|Internet Explorer|11|rfc6455|`XMLHttpRequest`|`XMLHttpRequest`|
|                 |10|rfc6455|`XMLHttpRequest`|`XMLHttpRequest`|
|                 |8<sup>3</sup>||`XDomainRequest`<sup>2</sup>, `iframe`<sup>1</sup>|`XMLHttpRequest`<sup>1</sup>, `XDomainRequest`<sup>2</sup>, `script`|
|                 |6<sup>3</sup>||`iframe`<sup>1</sup>|`XMLHttpRequest`<sup>1</sup>, `script`|
|Chrome|25|rfc6455|`EventSource`|`XMLHttpRequest`|
|Firefox|11|rfc6455|`EventSource`|`XMLHttpRequest`|
|Safari|7.0|rfc6455|`EventSource`|`XMLHttpRequest`|
|      |6.0|rfc6455|`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|      |5.1|hixie-76<sup>3</sup>|`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|Opera|15|rfc6455|`EventSource`|`XMLHttpRequest`|
|     |12.10|rfc6455|`EventSource`|`XMLHttpRequest`|
|iOS|7.0|rfc6455|`EventSource`|`XMLHttpRequest`|
|   |6.0||`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|Android|4.4|rfc6455|`EventSource`|`XMLHttpRequest`|
|       |4.0||`XMLHttpRequest`|`XMLHttpRequest`|

**Note**

* 1: only availabe in same origin connection
* 2: `xdrURL` option required.
* 3: binary features are not available.

#### Node.js
Node.js lower than 0.10 may work.

| Version | WebSocket | HTTP Streaming | HTTP Long Polling |
|---|---|---|---|
|0.10| rfc6455|`EventSource`|`XMLHttpRequest`<sup>1</sup>|

**Note**

* 1: binary features are not available.

---

## Quirks
There are problems which can't be dealt with in non-invasive way.

#### The browser limits the number of simultaneous connections

Applies to: HTTP transport

According to the [HTTP/1.1 spec](http://tools.ietf.org/html/rfc2616#section-8.1.4), a single-user client should not maintain more than 2 connections. This restriction actually [varies with the browser](http://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser). If you consider multiple topics to subscribe and publish, utilize the custom event using a single connection.

#### Sending an event emits a clicking sound

Applies to: cross-origin HTTP connection on browsers not supporting CORS

If a given url is cross-origin and the browser doesn't support CORS such as Internet Explorer 6, an invisible form tag is used to send data to the server. Here, a clicking sound occurs every time the form is submitted. There is no workaround.
