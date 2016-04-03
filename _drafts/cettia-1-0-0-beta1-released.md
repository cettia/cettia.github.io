---
layout: post
title: "Cettia 1.0.0-Beta1 released"
author: flowersinthesand
---

Finally, all functionalities of Cettia 1.0 are implemented. Accordingly, Cetita Protocol 1.0.0-Beta1, Cettia JavaScript Client 1.0.0-Beta1 and Cettia Java Server 1.0.0-Beta1 have been released. This release focuses on [binary event](https://github.com/cettia/cettia-protocol/issues/9) which allows to exchange binary data without using binary-to-text encoding and is one of features that many users have requested.

So far, you have had to serialize binary to text and send that text data to send binary, and receive text data and deserialize that text to binary to read binary, using an binary-to-text encoding scheme like Base64. It has inevitably brought about performance degradation as well as payload size increase. Moreover, you have had to figure out which events handle binary in advance and do serialization and deserialization manually.

Thanks to [MessagePack](http://msgpack.org) which is a schemaless binary interchange format, now it is possible to deal with binary as a first-class citizen. If a given data or its one of properties is evaluated as binary, it will be internally serialized and deserialized according to MessagePack instead of JSON. Besides, it's designed to work with any binary interchange format so you can let client determine an interchange format it will use e.g. BSON for Rust client and MessagePack for Go client per connection. Just let us know your needs. Anyway, here the most important thing is you don't need to know about this at all.

Let's take a look at the new feature. In the following example, both client-side and server-side sockets send text, binary and composite event to their counterpart on open event.

**JavaScript Client**

```javascript
// In Node.js, replace 'cettia' with 'require("cettia-client")'
var socket = cettia.open(uri);
socket.on("open", function() {
  // String object is text
  socket.send("discard", "test");

  // According to W3C Encoding standard https://encoding.spec.whatwg.org/
  // encoder.encode takes text and returns binary in the form of ArrayBuffer
  var encoder = new TextEncoder();
  // In Node.js, replace 'encoder.encode("test")' with 'new Buffer("test")'
  socket.send("discard", encoder.encode("test"));

  // Even composite data including both text and binary can be exchanged
  socket.send("discard", {text: "test", binary: encoder.encode("test")});
});
// Prints all received data
socket.on("discard", function(data) {
  console.log(data);
});
```

**Java Server**

```java
Server server = new DefaultServer();
server.onsocket((ServerSocket socket) -> {
  socket.onopen((Void v) -> {
    // String instance is text
    socket.send("discard", "test");

    // Byte array is binary
    socket.send("discard", "test".getBytes());

    // ByteBuffer is regarded as binary as well
    socket.send("discard", ByteBuffer.wrap("test".getBytes());

    // Even POJO as well as plain map including both text and binary can be exchanged
    socket.send("discard", new LinkedHashMap<String, Object>() {% raw %}{{{% endraw %}
      put("text", "test");
      put("binary", "test".getBytes());
    }});
  });
  // Prints all received data
  socket.on("discard", (Object data) -> System.out.println(data));
});
```

Also, cettia.js's size is notably reduced from 5.18KB to 4.6KB minified and gzipped by dropping support for Internet Explorer 6-8 and now works pretty well in Node 4/5.

Here's the full changelog:

* Binary event. [cettia-protocol#9](https://github.com/cettia/cettia-protocol/issues/9), [cettia-javascript-client#9](https://github.com/cettia/cettia-javascript-client/issues/9), [cettia-java-server#6](https://github.com/cettia/cettia-java-server/issues/6)
* Node 4/5 support. [cettia-protocol#8](https://github.com/cettia/cettia-protocol/issues/8), [cettia-javascript-client#7](https://github.com/cettia/cettia-javascript-client/issues/7)
* Accept typed arrays in send method. [cettia-protocol#10](https://github.com/cettia/cettia-protocol/issues/10)
* Java 8 support. [cettia-java-server#5](https://github.com/cettia/cettia-java-server/issues/5)
* Drop support for Internet Explorer 6-8. [cettia-javascript-client#10](https://github.com/cettia/cettia-javascript-client/issues/10)
* JS Bin example doesn't work with WebSocket in Internet Explorer 11 and Microsoft Edge. [cettia-javascript-client#8](https://github.com/cettia/cettia-javascript-client/issues/8)
* Add README.md. [cettia-protocol#11](https://github.com/cettia/cettia-protocol/issues/11), [cettia-javascript-client#11](https://github.com/cettia/cettia-javascript-client/issues/11), [cettia-java-server#7](https://github.com/cettia/cettia-java-server/issues/7)

As always, please let us know if you have any question or feedback.
