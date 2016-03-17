---
layout: project
title: Cettia JavaScript Client
---

Cettia JavaScript Client <sup><strong>A</strong></sup> is a lightweight <sup><strong>B</strong></sup> JavaScript client for browser-based <sup><strong>C</strong></sup> and Node-based <sup><strong>D</strong></sup> application.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/cettia-protocol/1.0.0-Beta1">Cettia 1.0.0-Beta1</a> client.</dd>
    <dt>B</dt>
    <dd>12.81KB minified, 4.6KB minified and gzipped.</dd>
    <dt>C</dt>
    <dd>It has no dependency and follows jQuery 2.x's browser support that embraces
    Internet Explorer 9.</dd>
    <dt>D</dt>
    <dd>Though browser is the first runtime, it runs seamlessly on Node.js.</dd>
</dl>

---

## Quick Start
Cettia JavaScript Client is distributed at two places according to runtime engine: browser version through this web site in [compressed](/projects/cettia-javascript-client/1.0.0-Beta1/cettia.min.js) and [uncompressed](/projects/cettia-javascript-client/1.0.0-Beta1/cettia.js) forms and node version through [npm](https://www.npmjs.com/package/cettia-client).

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Browser**

```html
<script src="/cettia/cettia.min.js"></script>
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Node.js**

```javascript
var cettia = require("cettia-client");
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

Once you've loaded the module, you will be able to write the following [echo and chat](/projects/cettia-protocol/1.0.0-Beta1/reference/#example) client. This page already loaded the uncompressed version, hence, you can run and debug it directly by copying and pasting to JavaScript console if possible.

```javascript
var socket = cettia.open("http://localhost:8080/cettia");

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
  // From Encoding standard https://encoding.spec.whatwg.org/
  var encoder = new TextEncoder();
  socket.send("echo", encoder.encode("echo"));
  socket.send("chat", encoder.encode("chat"));
  // Composite data
  socket.send("echo", {text: "echo", binary: encoder.encode("echo")});
  socket.send("chat", {text: "chat", binary: encoder.encode("chat")});
  // In Node.js, use Buffer, i.e. new Buffer("echo"), to deal with binary data
});
socket.on("echo", function(data) {
    console.log("on echo", data);
});
socket.on("chat", function(data) {
    console.log("on chat", data);
});
```

### Further Reading

* To play something right now, start with [archetype example](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-javascript-client).
* To get details of API, see [API document](/projects/cettia-javascript-client/1.0.0-Beta1/api/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/cettia-javascript-client/1.0.0-Beta1/reference/).
