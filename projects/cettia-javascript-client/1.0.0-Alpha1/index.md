---
layout: reference
title: Cettia JavaScript Client
---

Cettia JavaScript Client <sup><strong>A</strong></sup> is a lightweight <sup><strong>B</strong></sup> JavaScript client for browser-based <sup><strong>C</strong></sup> and Node-based <sup><strong>D</strong></sup> application.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/cettia-protocol/1.0.0-Alpha1">Cettia 1.0.0-Alpha1</a> client.</dd>
    <dt>B</dt>
    <dd>11.17KB minified, 5.1KB minified and gzipped.</dd>
    <dt>C</dt>
    <dd>It has no dependency and follows jQuery 1.x's browser support that embraces Internet Explorer 6.</dd>
    <dt>D</dt>
    <dd>Though browser is the first runtime, it runs seamlessly on Node.js.</dd>
</dl>

---

## Quick Start
Cettia JavaScript Client is distributed at two places according to runtime engine: browser version through this web site in [compressed](/projects/cettia-javascript-client/1.0.0-Alpha1/cettia.min.js) and [uncompressed](/projects/cettia-javascript-client/1.0.0-Alpha1/cettia.js) forms and node version through [npm](https://www.npmjs.com/package/cettia-client).

Once you've loaded the module, you will be able to write the following [echo and chat](/projects/cettia-protocol/1.0.0-Alpha1/reference/#example) client. This page already loaded the uncompressed version, hence you can run and debug it directly here by using a JavaScript console and doing copy and paste.

```javascript
var socket = cettia.open("http://localhost:8080/cettia");
// Built-in events
socket.on("connecting", function() {
    console.log("The selected transport starts connecting to the server");
})
.on("open", function() {
    console.log("The connection is established successfully and communication is possible");
    socket.send("echo", "An echo message").send("chat", "A chat message");
})
.on("error", function(error) {
    console.error("An error happens on the socket", error);
})
.on("close", function() {
    console.log("The connection has been closed, has been regarded as closed or could not be opened");
})
.on("waiting", function(delay, attempts) {
    console.log("The socket waits out the", attempts, (["st", "nd", "rd"][attempts - 1] || "th"), "reconnection delay", delay);
})
// User-defined events
.on("echo", function(data) {
    console.log("on echo event", data);
})
.on("chat", function(data) {
    console.log("on chat event", data);
});
```

### Further Reading

* To play something right now, start with [archetype example](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-javascript-client).
* To take a brief look at API, check out the [testee](https://github.com/cettia/cettia-javascript-client/blob/1.0.0-Alpha1/Gruntfile.js#L22-L52).
* To get details of API, see [API document](/projects/cettia-javascript-client/1.0.0-Alpha1/api/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/cettia-javascript-client/1.0.0-Alpha1/reference/).
