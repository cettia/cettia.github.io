---
layout: project
title: Cettia JavaScript Client API
---

<h1>API</h1>

---

**Table of Contents**

* TOC
{:toc}

---

## `module cettia`
A cettia client module acting as a factory to create and manage a socket.

### `export function open(uri: string, options?: SocketOptions): Socket`
It's the same with `cettia.open([uri], options)`.

### `export function open(uris: string[], options?: SocketOptions): Socket`
Creates a socket and returns it. Because it's an asynchronous operation, the returned socket should be in `connecting` state and accordingly `connecting` event is fired. It translates `uris` into ones corresponding to transport one-to-one. As for each URI, a transport corresponding to the URI is created through transport factories specified by `transports?: ((uri: string, options: TransportOptions) => Transport)[]` option and tries a connection within the time specified by `timeout:number` option. If it turns out that an attempt using some URI fails, next URI is used along the same lines.

URI is used to determine a type of a transport as well as identify a name of an endpoint literally so that it should follow a specific URI format according to transport. However, some exceptions are allowed for the sake of convenience.

* Relative URI: It's converted into the absolute one but only available in browser.
* URI whose scheme is `http` or `https` and which has no `cettia-transport-name` param: It's translated into three URIs which correspond to WebSocket, HTTP Streaming and HTTP Long polling in order. 

_Simplest one._

```javascript
// Assumes that it's on some page on http://example.com
cettia.open("/cettia");
```

_Translated one of the above example._

```javascript
// Then, you can change the default transport order with this way
cettia.open(["ws://example.com/cettia", "http://example.com/cettia?cettia-transport-name=stream", "http://example.com/cettia?cettia-transport-name=longpoll"]);
```

_WebSocket transport only._

```javascript
// URI format determines transport
cettia.open("ws://example.com/cettia");
```

### `interface SocketOptions`
An interface of properties to get/set socket options. Because it extends `TransportOptions`, it can contain transport options as well. None of properties are required so it can be an empty object.

_All possible options along with their default values._

```javascript
var options = {
  // Socket options
  name: null, // browser-only
  reconnect: function(lastDelay, lastAttempts) {
    return 2 * lastDelay || 500;
  },
  transports: [
    cettia.transport.createWebSocketTransport, 
    cettia.transport.createHttpStreamTransport, 
    cettia.transport.createHttpLongpollTransport
  ],

  // Transport options
  timeout: 3000,
  xdrURL: null // browser-only
};
```

#### `name?: string`
**Default**: `null`

An identifier that uniquely specifies socket within the document. It is used for the socket of the next page to inherit the lifecycle of the socket of the current page. Accordingly, if the server caches events which couldn't be sent to the socket of the previous page due to temporary disconnection during page navigation , it can send them to the socket of the next page on reconnection.

_Extending the lifecycle to the next page._

```javascript
// It works as long as they have the same `name` option even if URIs are different
var socket = cettia.open("/cettia?now=" + Date.now(), {name: "main"});
socket.on("new", function() {
  // It is called only if socket whose name is main is not found within the browsing context or deleted from the server
});
socket.on("open", function() {
  // With name option, variables used in open event should be available regardless of new event
  // because it's not true that new event always precedes open event
});
```

#### `reconnect? (lastDelay: number, attempts: number): any`
**Default**: Generates a geometric series with initial delay `500` and ratio `2`

##### `reconnect? (lastDelay: number, attempts: number): number`
A function to be used to schedule reconnection. The function is called every time after the `close` event is fired unless it is set to `false` and should return a reconnection delay in milliseconds. The function receives two arguments: The last delay in milliseconds used or `null` at first and the total number of reconnection attempts so far.

##### `reconnect? (lastDelay: number, attempts: number): boolean`
A function returning `false` means no reconnection. It's allowed to blend both signatures returning `number` and `boolean`.

##### `reconnect?: boolean`
No reconnection.

_A Fibonacci series with first delay `500` and second delay `1000`._

```javascript
// Fibonacci series
var series = [0];
var reconnect = function(lastDelay) {
  // Adds 500 if it's the first time
  series.push(lastDelay || 500);
  return series[series.length - 1] + series[series.length - 2]; // 500, 1000, 1500, 2500 ...
};

var socket = cettia.open(uri, {reconnect: reconnect});
// Resets the series if the connection is established
socket.on("open", function() {
  series = [0];
});
```

#### `transports?: ((uri: string, options: TransportOptions) => Transport)[]`
**Default**: `[cettia.transport.createWebSocketTransport, cettia.transport.createHttpStreamTransport, cettia.transport.createHttpLongpollTransport]`

A set of transport factory. It is used to determine a transport for a given URI. Because each transport should have its own URI format, order of factories is not meaningful. The transport factory should create and return a transport object if it can handle given URI or nothing if not. By default, WebSocket transport factory, HTTP Streaming transport factory and HTTP Long polling transport factory are provided.

_Using your own transport._

```javascript
// A factory to create TCP transport
function createNetTransport(uri, options) {
  // Only if URI's protocol is tcp and NetSocket, an imaginary object for TCP communication, is available 
  if (/^tcp:/.test(uri) && NetSocket) {
    // Returns transport object
    return {/* skipped */};
  } else {
    // Returns nothing
  }
}

cettia.open("tcp://localhost:8080", {transports: [createNetTransport]});
```

### `interface Socket`
An interface representing a socket created by calling `cettia.open`.

#### `close(): Socket`
Closes the socket. A socket closed by this method shouldn't be and can't be used again.

#### `off(event: string, handler: Function): Socket`
Removes a given event handler for a given event. 

#### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event. An added event handler is not removed unless `off` method is called, hence, if some event handler is added in dispatching some event, it will be added every time that that event is dispatched. So don't call `on` in dispatching event of course including `open`. Generally, an added handler is called every time the server sends the event, but event handlers for reserved events behave differently like the following. `this` object of event handler refers to the socket.

##### `connecting (): void`
A pseudo event fired when a process to find working transport is started. Even though the event name is `connecting` but it's not that the event is fired every time transport tries to connect to the server. It is called only when the whole process starts.

##### `new (): void`
A pseudo event fired when the server issues a new identifier for this socket. As the only event to determine the lifecycle, it stands for the beginning of the new lifecycle and the end of the old lifecycle. It would happen if it's the first time to connect to the server so there is no corresponding socket in the server or if a connection was disconnected but reconnection doesn't occur for a long time so the socket is deleted from the server.

##### `open (): void`
A network event fired when a connection is established and communication is possible. Even in cases where a closed socket esetablishes a new connection, the event is fired so can be fired multiple times in a single lifecylce. Also it means that disconnection and reconnection don't affect the lifecycle of the socket and the reference to the socket.

##### `error (error: Error): void`
A message event fired every time an error has occurred. The `error`'s message property can be one of the following values:

* `heartbeat`: A heartbeat operations failed.
* `notopened`: A connection is not established yet.
* Otherwise, all transports fail to establish a connection.
 
And transprot's `error` event is propagated to here.

##### `close (): void`
A network event fired when a connection has been closed for any reason or couldn't be establiahsed. It can be fired multiple times in a single lifecylce like `open` event but doesen't mean the current lifecycle is maintained. If reconnection has not succeeded for a long time e.g. 1 minute, it must be deleted from the server so once successful reconnection is done, the new lifecycle will begin.

##### `cache (args: any[]): void`
A pseudo event fired if some event is sent through this socket while offline. It can be used to cache the given event and send it on next reconnection. The given parameter, `args`, is an arguments used to call `send` method. To resend it, call `socket.send.apply(socket, args)`. FYI, it equals to `socket.send(args[0], args[1], args[2], args[3])`.

##### `waiting (delay: number, attempts: number): void`
A pseudo event fired if a reconnection has been scheduled by `reconnect` option. `delay` is the reconnection delay in milliseconds and `attempts` is the total number of reconnection attempts.

##### `[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void`
All the other event are message event which you can use for your application and fired every time the server sends that event. `data` is data of the server sent event and `reply` is a controller to reply the server and not `null` only if server attaches fulfilled or rejected callback. Generally this type of event is used heavily, to manage such many events systematically, use some format like [URI](http://tools.ietf.org/html/rfc3986) to event naming.

_Handling fulfilled and rejected callbacks._

```javascript
var socket = cettia.open(uri);
// Using fulfilled or rejected callback is a kind of contract
// If some event is supposed to use such callbacks, both the server and the client should handle them
socket.on("/talk/request", function(account, reply) {
  // Imaginary helper to open dialog
  $.templates("#template").link("#dialog section", account);
  // Imaginary event to interact with user within the dialog
  $("#dialog").show().one("close", function() {
    if (this.returnValue) {
      reply.resolve();
    } else {
      reply.reject();
    }
  });
});
```

#### `once(event: string, handler: Function): Socket`
Adds a given one time event handler for a given event. An event handler shares the same signatures with `on`, and can be removed by `off`.

_Adding a close event handler to the last._

```javascript
var socket = cettia.open(uri);
socket.on("close", function() {
  // It's allowed to add an event handler dynamically
  socket.once("close", function() {
    // It will be executed at the end of the current event handler stacks
  });
});
```

#### `send(event: string, data?: any, fulfilled?: (data?: any) => void, rejected?: (data?: any) => void): Socket`
Sends the event with data attaching fulfilled and rejected callbacks. If data or one of its properties is `Buffer` in Node or `ArrayBuffer` in browser, it is serialized into MessagePack and if not, it is serialized into JSON. Therefore, to handle binary in browser, [msgpack-lite](https://github.com/kawanet/msgpack-lite) should be loaded in `window`.

If a socket is not opened, arguments used to call the method will be passed to `cache` event, hence, you can cache it on `cache` event and send it on `open` event.

_Exchanging text data, binary data and composite data._

```javascript
var socket = cettia.open(uri);
socket.on("open", function() {
  socket.send("echo", "flowersinthesand");
  if (typeof exports === "object") {
    // Node
    socket.send("echo", new Buffer("flowersinthesand"));
    socket.send("echo", {text: "flowersinthesand", binary: new Buffer("flowersinthesand")});
  } else {
    // Browser
    // From Encoding standard https://encoding.spec.whatwg.org/
    var encoder = new TextEncoder();
    socket.send("echo", encoder.encode("flowersinthesand"));
    socket.send("echo", {text: "flowersinthesand", binary: encoder.encode("flowersinthesand")});
  }
});
socket.on("echo", function(data) {
  console.log(data);
});
```

_Finding data from the server._

```javascript
var socket = cettia.open(uri);
socket.on("open", function() {
  // Using fulfilled or rejected callback is a kind of contract
  // If some event is supposed to use such callbacks, both the server and the client should handle them
  socket.send("/account/find", "flowersinthesand", function(account) {
    console.dir(account);
  }, function(error) {
    console.error(error);
  });
});
```

#### `state(): string`
Determines the current state of the socket. Possible state values are `connecting`, `opened`, `closed` and `waiting`. Note that `new` event, the only event determining the lifecycle, doesn't affect the state.

_Tracking the socket state_

```javascript
function logState() {
  console.log(this.state());
}

cettia.open(uri).on("connecting", logState).on("open", logState).on("close", logState).on("waiting", logState);
```

---

## `module cettia.transport`
As a sub module of cettia, it is used to create and manage transport. This module is useful to those who want to write their own transport factory. If you are happy with default transport factories, you don't need to look at it at all. The module is accessible through `cettia.transport`.

### `export function createWebSocketTransport(uri: string, options?: TransportOptions): Transport`
A factory to create a [WebSocket](https://en.wikipedia.org/wiki/WebSocket) transport. WebSocket is a protocol designed for a full-duplex communications over a TCP connection. However, many coporate proxies, firewalls and antivirus softwares blocks it for some reason.

A given URI should have either `ws` or `wss` scheme. Only if browser implements `WebSocket` regardless of WebSocket protocol version, this factory can create and return a transport. In browser where WebSocket doesn't support binary message or Typed Arrays are not supported, binary message can't and shouldn't be used.

### `export function createHttpStreamTransport(uri: string, options?: TransportOptions): Transport`
A factory to create a [HTTP Streaming](https://en.wikipedia.org/wiki/Comet_(programming)#Streaming) transport. In streaming, the client performs a HTTP persistent connection and watches changes in response body and the server prints chunk as a message through the connection.

A given URI should have either `http` or `https` scheme and `stream` transport param. This factory always creates and returns a transport and the returned transport is backed up by the following host objects which are chosen according to context automatically. In browser where XMLHttpRequest 2 and Typed Arrays are not supported, binary message can't and shouldn't be used.

To establish read-only channel through `GET` method:
   
* `EventSource`: It works if browser supports `EventSource` specified in [Server-Sent Events](https://en.wikipedia.org/wiki/Server-sent_events). If the browser is Safari 5 or 6, it works only when same origin connection is given. By reason of the spec's ambiguity, there is no way to determine whether a connection closed normally or not so that `error` event is not thrown even though the connection closed due to an error.
* `XMLHttpRequest`: In case of same origin connection, it works without qualification. In case of cross origin, it works if `XMLHttpRequest` supports CORS. However for both cases, if the browser is Internet Explorer, the version should be equal to or higher than 10 and if the browser is Opera, the version should be equal to or higher than 13.
* `XDomainRequest`: It works if `xdrURL` option is set and browser supports `XDomainRequest`, that is Internet Explorer 9-10.
* `iframe` tag: It works if it's same origin connection and browser supports `ActiveXObject`, namely Internet Explorer 9-10. This transport differs from the traditional [Hidden Iframe](http://en.wikipedia.org/wiki/Comet_%28programming%29#Hidden_iframe) in terms of fetching a response text. The traditional transport expects `script` tags, whereas this transport periodically polls the response body.

To establish write-only channel through `POST` method:

* `XMLHttpRequest`: In case of same origin, it works without qualification. In case of cross origin, it works if browser supports CORS.
* `XDomainRequest`: It works if `xdrURL` option is set and browser supports `XDomainRequest`, that is Internet Explorer 9-10.
* `form` tag: It works alwayas but makes a clicking sound.

### `export function createHttpLongpollTransport(uri: string, options?: TransportOptions): Transport`
A factory to create a [HTTP Long polling](https://en.wikipedia.org/wiki/Comet_(programming)#Ajax_with_long_polling) transport. In long polling, the client performs a HTTP persistent connection and the server ends the connection with data. Then, the client receives it and performs a request again.

A given URI should have either `http` or `https` scheme and `longpoll` transport param. This factory always creates and returns a transport and the returned transport is backed up by the following host objects which are chosen according to context automatically. In browser where XMLHttpRequest 2 and Typed Arrays are not supported, binary message can't and shouldn't be used.

To establish read-only channel through `GET` method:
   
* `XMLHttpRequest`: In case of same origin connection, it works without qualification. In case of cross origin, works if `XMLHttpRequest` supports CORS.
* `XDomainRequest`: It works if `xdrURL` option is set and browser supports `XDomainRequest`, that is Internet Explorer 9-10.
* `script` tag: It works always.

To establish write-only channel through `POST` method:

* `XMLHttpRequest`: In case of same origin, it works without qualification. In case of cross origin, it works if browser supports CORS.
* `XDomainRequest`: It works if `xdrURL` option is set and browser supports `XDomainRequest`, that is Internet Explorer 9-10.
* `form` tag: It works alwayas but makes a clicking sound.

### `interface TransportOptions`
An interface of properties to get/set transport options. None of properties are required so it can be an empty object.

#### `timeout?: number`
**Default**: `3000`

A timeout value in milliseconds. It applies when a transport tries connection. If every transport fails, then the `close` event is fired with `error` event.

#### `xdrURL? (uri: string): string`
**Default**: `null`

A function used to modify a url to add session information to enable transports depending on `XDomainRequest`. For security reasons, the `XDomainRequest` excludes cookie when sending a request, so that session cannot be tracked by cookie. However, if the server supports [session tracking by url](http://stackoverflow.com/questions/6453779/maintaining-session-by-rewriting-url), it is possible to track session by setting `xdrURL`.

_Session tracking by modifying url_

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java Servlet**

```javascript
cettia.open(uri, {
  // input: url?k=v
  // output: url;jsessionid=${cookie.JSESSIONID}?k=v
  xdrURL: function(uri) {
    var sid = /(?:^|; )JSESSIONID=([^;]*)/.exec(document.cookie)[1];
    return url.replace(/;jsessionid=[^\?]*|(\?)|$/, 
      ";jsessionid=" + sid + "$1");
  }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**PHP**

```javascript
cettia.open(uri, {
  // input: url?k=v
  // output: url?PHPSESSID=${cookie.PHPSESSID}&k=v
  xdrURL: function(uri) {
    var sid = /(?:^|; )PHPSESSID=([^;]*)/.exec(document.cookie)[1];
    return url.replace(/\?PHPSESSID=[^&]*&?|\?|$/, 
      "?PHPSESSID=" + sid + "&").replace(/&$/, "");
  }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>
