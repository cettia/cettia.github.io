---
layout: project
title: Cettia JavaScript Client
---

Cettia JavaScript Client <sup><strong>A</strong></sup> is a lightweight <sup><strong>B</strong></sup> JavaScript client for browser-based <sup><strong>C</strong></sup> and Node-based <sup><strong>D</strong></sup> application.

<dl>
  <dt>A</dt>
  <dd><a href="/projects/cettia-protocol/1.0.0">Cettia 1.0.0</a> client.</dd>
  <dt>B</dt>
  <dd>53.82KB minified, 16.44KB minified and gzipped.</dd>
  <dt>C</dt>
  <dd>It follows jQuery's browser support that embraces Internet Explorer 9.</dd>
  <dt>D</dt>
  <dd>It supports Node 4+.</dd>
</dl>

---

## Quick Start

Cettia JavaScript Client is distributed through [npm](https://www.npmjs.com/package/cettia-client). 

<div class="row">
<div class="large-4 columns">
{% capture panel %}
**webpack, Browserify and Rollup**

```bash
npm install --save cettia-client
```

```javascript
import cettia from "cettia-client/cettia-bundler";
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
**`script` tag**

```html
<script src="https://unpkg.com/cettia-client@1.0.0/cettia-browser.min.js"></script>
```
```javascript
window.cettia;
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
**Node**

```bash
npm install --save cettia-client
```

```javascript
import cettia from "cettia-client";
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

Once you've loaded the module, you will be able to write the following [echo and chat](/projects/cettia-protocol/1.0.0/reference/#example) client. FYI, this page already loaded the uncompressed version. Open the JavaScript console and type `cettia`.

```javascript
var socket = cettia.open("http://localhost:8080/cettia");

// Lifecycle events
// When the selected transport starts connecting to the server
socket.on("connecting", function() {
    console.log("on connecting");
});
// When the server issues a new id for this socket as the beginning of the new lifecycle and the end of the previous lifecycle
socket.on("new", function() {
    console.log("on new");
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
// When a reconnection atempt is scheduled
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

### Example
Here is working example -- [echo and chat](http://jsbin.com/sipimaleji/1/edit?html,js,console)
