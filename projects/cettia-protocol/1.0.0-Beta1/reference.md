---
layout: reference
title: Cettia Protocol Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* TOC
{:toc}

---

## Specification
The protocol is still under active development and it's not easy to maintain both reference implementation and specification document. Accordingly for now the reference implementation takes the place of the specification document.

---

## Reference Implementation
To help understand and implement the protocol, reference implementation is provided. It is written in easy-to-read JavaScript for Node.js with a lot of detailed notes you should be aware of. Also you can use it to verify your implementation casually and as the counterpart in your examples. See the following annotated source codes:

* [`cettia`](../docs/index.html)
* [`cettia.open`](../docs/socket.html)
* [`cettia.createServer`](../docs/server.html)
* [`cettia.transport.createHttpStreamTransport`](../docs/transport-http-stream-transport.html)
* [`cettia.transport.createHttpLongpollTransport`](../docs/transport-http-longpoll-transport.html)
* [`cettia.transport.createHttpServer`](../docs/transport-http-server.html)
* [`cettia.transport.createWebSocketTransport`](../docs/transport-websocket-transport.html)
* [`cettia.transport.createWebSocketServer`](../docs/transport-websocket-server.html)

**Note**

* They are not for production use.

### Installation
First you need to install [Node.js](http://nodejs.org) 4+. Then type the following to install the
reference implementation:

```bash
npm install cettia-protocol
```

### Example
This _echo and chat_ example is very simple but demonstrates essential functionalities of the protocol. In this example,

* URI is `http://localhost:8080/cettia`. 
* `echo` event is sent back to the client that sent the event.
* `chat` event is broadcasted to every client that connected to the server.

To run example, write `server.js` and `client.js` by copy and paste to the folder where you have installed `cettia-protocol` module. Then, open two consoles, type `node server` and `node client` respectively.

`server.js`

```javascript
// Cettia part
var cettia = require("cettia-protocol");
var server = cettia.createServer();
// When a socket is created as the beginning of the lifecycle
server.on("socket", function(socket) {
  console.log("on server's socket");

  // Lifecycle events
  // When the handshake is performed successfully
  socket.on("open", function() {
    console.log("on open");
  });
  // When the underlying transport is closed for some reason
  socket.on("close", function() {
    console.log("on close"); 
  });
  // When an error happens on the socket
  socket.on("error", function(error) {
    console.log("on error", error);
  });
  // When the socket has been closed for a long time i.e. 1 minute and deleted from the server as the end of the lifecycle
  socket.on("delete", function() {
    console.log("on delete");
  });

  // echo and chat events
  socket.on("echo", function(data) {
    console.log("on echo", data);
    socket.send("echo", data);
  });
  socket.on("chat", function(data) {
    console.log("on chat", data);
    server.sockets.forEach(function(socket) {
      socket.send("chat", data);
    });
  });
});
var httpTransportServer = cettia.transport.createHttpServer().on("transport", server.handle);
var wsTransportServer = cettia.transport.createWebSocketServer().on("transport", server.handle);

// Node.js part
var url = require("url");
var http = require("http");
var httpServer = http.createServer();
httpServer.on("request", function(req, res) {
  if (url.parse(req.url).pathname === "/cettia") {
    httpTransportServer.handle(req, res);
  }
});
httpServer.on("upgrade", function(req, sock, head) {
  if (url.parse(req.url).pathname === "/cettia") {
    wsTransportServer.handle(req, sock, head);
  }
});
httpServer.listen(8080);
```

`client.js`

```javascript
var cettia = require("cettia-protocol");
var socket = cettia.open("http://localhost:8080/cettia", {
  reconnect: function(lastDelay, lastAttempts) {
    return (lastDelay || 250) * 2;
  }
});

// Lifecycle events
// When the server issues a new id for this socket as the beginning of the lifecycle and the end of the previous lifecycle
socket.on("new", function() {
  console.log("on new");
});
// When the selected transport starts connecting to the server
socket.on("connecting", function() {
  console.log("on connecting");
});
// When the connection is established successfully
socket.on("open", function() {
  console.log("on open");
});
// When an error happens on the socket
socket.on("error", function(error) {
  console.error("on error", error);
});
// When the connection is closed, regarded as closed or could not be opened
socket.on("close", function() {
  console.log("on close");
});
// When a reconnection is scheduled
socket.on("waiting", function(delay, attempts) {
  console.log("on waiting", attempts, delay);
});

// echo and chat events
socket.on("open", function() {
  // Text data
  socket.send("echo", "echo");
  socket.send("chat", "chat");
  // Binary data
  socket.send("echo", new Buffer("echo"));
  socket.send("chat", new Buffer("chat"));
  // Composite data
  socket.send("echo", {text: "echo", binary: new Buffer("echo")});
  socket.send("chat", {text: "chat", binary: new Buffer("chat")});
});
socket.on("echo", function(data) {
  console.log("on echo", data);
});
socket.on("chat", function(data) {
  console.log("on chat", data);
});
```

Note that JavaScript is a dynamic language so you can deal with both client and server in interactive mode. Open two Node consoles, copy the above scripts and paste into the each console. Then you can access and play around with the above variables on these consoles directly.

---

## Test Suite
Test suite is provided to help write and verify the Cettia protocol implementation. Tests are written in JavaScript with the help of reference implementation and runs by [Mocha](http://visionmedia.github.io/mocha/), JavaScript test framework, in Node.js.

### Testee
To run the test suite, you need to write a testee, a web server which brokers between test and your implementation to be tested. Because through writing testee, you will use most API of your implementation, showing your testee is good for explaining how to use your implementation.

To write a testee, see ones for the reference implementation (for now) - [server testee](https://github.com/cettia/cettia-protocol/blob/1.0.0-Beta1/test/testee/server.js) and [client testee](https://github.com/cettia/cettia-protocol/blob/1.0.0-Beta1/test/testee/client.js).

### Running Test
First you need to install [Node.js](http://nodejs.org). Then create a `package.json` in an empty directory: 

```json
{
  "devDependencies": {
    "cettia-protocol": "1.0.0-Beta1",
    "mocha": "2.4.5",
    "chai": "3.5.0",
    "minimist": "1.2.0"
  }
}
```

And type `npm install` to install modules locally and `npm install mocha -g` to install Mocha globally for convenience. Then, run your testee and execute `mocha` passing the following arguments:

* `--cettia.transports`
  * A set of transport to be tested in a comma-separated value. As transport name, `websocket`, `httpstream` and `httplongpoll` are available. By default, it has `websocket,httpstream,httplongpoll`.

_Testing a client implementing WebSocket transport only._

```bash
mocha ./node_modules/cettia-protocol/test/client.js --cettia.transports websocket
```

**Note**

* Because Node.js is small and can be installed locally, you can automate the protocol test programmatically by downloading and installing Node.js, installing npm modules, running tests through spawning a process and checking that process' exit code that is the number of failed tests.
