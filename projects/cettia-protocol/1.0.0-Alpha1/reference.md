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
To help understand and implement the protocol, reference implementation is provided. It is written in easy-to-read JavaScript with a lot of detailed notes you should be aware of. Also you can use it to verify your implementation casually and as the counterpart in your examples. See annotated source codes:

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
First you need to install [Node.js](http://nodejs.org). Then type the following to install the reference implementation:

```bash
npm install cettia-protocol
```

### Interactive Mode
JavaScript is a dynamic language so you can deal with both client and server in an interactive mode. Open two Node consoles, copy the following scripts and paste into the each console.

**Server**

```javascript
var cettia = require("cettia-protocol");
var server = cettia.createServer();

var httpTransportServer = cettia.transport.createHttpServer().on("transport", server.handle);
var wsTransportServer = cettia.transport.createWebSocketServer().on("transport", server.handle);

var httpServer = require("http").createServer();
httpServer.on("request", httpTransportServer.handle);
httpServer.on("upgrade", wsTransportServer.handle);
httpServer.listen(8080);

var sockets = [];
server.on("socket", function(socket) {
    console.log("sockets[", sockets.push(socket) - 1, "]");
});
```

Once `sockets[ 0 ]` have been logged, you can access the opened socket by `sockets[0]` in the console.

```javascript
sockets[0].send("greeting", "Hello World");
```

**Client**

```javascript
var cettia = require("cettia-protocol");
var socket = cettia.open("http://localhost:8080");

socket.on("open", function() {
    console.log("socket");
});
```

Once `socket` have been logged, you can access the opened socket by `socket` in the console.

```javascript
socket.on("greeting", function(data) {
    console.log("greetings from the server", data);
});
```

### Example
This _echo and chat_ example is very simple but demonstrates essential functionalities of the protocol.

To run example, write `server.js` and `client.js` by copy and paste to the folder where you have installed `cettia-protocol` module. Then, open two consoles, type `node server` and `node client` respectively.

* URI is `http://localhost:8080/cettia`. 
* `echo` event is sent back to the client that sent the event.
* `chat` event is broadcasted to every client that connected to the server.

`server.js`

```javascript
var http = require("http");
var url = require("url");
var cettia = require("cettia-protocol");

// Consumes transport and produces socket
var server = cettia.createServer();
var sockets = [];
server.on("socket", function(socket) {
    console.log("The connection is established successfully and communication is possible");
    // To provide a repository of opened socket 
    sockets.push(socket);
    socket.on("close", function() {
        // Equal to sockets.remove(socket);
        sockets.splice(sockets.indexOf(socket), 1);
        console.log("The connection has been closed");
    });
    // Actions for echo and chat events
    socket.on("error", function(error) {
        console.log("An error happens on the socket", error);
    })
    .on("echo", function(data) {
        console.log("on echo event", data);
        socket.send("echo", data);
    })
    .on("chat", function(data) {
        console.log("on chat event", data);
        sockets.forEach(function(socket) {
            socket.send("chat", data);
        });
    });
});

// Consumes HTTP request-response exchange and produces transport
var httpTransportServer = cettia.transport.createHttpServer().on("transport", server.handle);
// Consumes WebSocket connection and produces transport
var wsTransportServer = cettia.transport.createWebSocketServer().on("transport", server.handle);

http.createServer().on("request", function(req, res) {
    if (url.parse(req.url).pathname === "/cettia") {
        httpTransportServer.handle(req, res);
    }
})
.on("upgrade", function(req, sock, head) {
    if (url.parse(req.url).pathname === "/cettia") {
        wsTransportServer.handle(req, sock, head);
    }
})
.listen(8080);
```

`client.js`

```javascript
var cettia = require("cettia-protocol");
var socket = cettia.open("http://localhost:8080/cettia");

socket.on("open", function() {
    console.log("The connection is established successfully and communication is possible");
    socket.send("echo", "An echo message");
    socket.send("chat", "A chat message");
})
.on("error", function(error) {
    console.error("An error happens on the socket", error);
})
.on("close", function() {
    console.log("The connection has been closed, has been regarded as closed or could not be opened");
})
.on("chat", function(data) {
    console.log("on chat event", data);
})
.on("echo", function(data) {
    console.log("on echo event", data);
});
```

---

## Test Suite
Test suite is provided to help write and verify implementation. Tests are written in JavaScript with the help of reference implementation and runs by [Mocha](http://visionmedia.github.io/mocha/), JavaScript test framework, in Node.js.

### Testee
To run the test suite, you need to write a testee, a web server which brokers between test and your implementation to be tested. Because through writing testee, you will use most API of your implementation, showing your testee is good for explaining how to use your implementation.

The reference implementation is still under active development and it's not easy to maintain documentation. If you want to try out though, please see [server testee](https://github.com/cettia/cettia-protocol/blob/1.0.0-Alpha1/test/testee/server.js) and [client testee](https://github.com/cettia/cettia-protocol/blob/1.0.0-Alpha1/test/testee/client.js). 

### Running Test
First you need to install [Node.js](http://nodejs.org). Then create a `package.json` in an empty directory: 

```json
{
  "devDependencies": {
    "cettia-protocol": "1.0.0-Alpha1",
    "mocha": "2.2.1",
    "chai": "2.1.2",
    "minimist": "1.1.1"
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
