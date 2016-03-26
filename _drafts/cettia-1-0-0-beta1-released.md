---
layout: post
title: "Cettia 1.0.0-Beta1 released"
author: flowersinthesand
---

Finally, all functionalities of Cettia 1.0 are implemented. Accordingly, Cetita Protocol 1.0.0-Beta1, Cettia JavaScript Client 1.0.0-Beta1 and Cettia Java Server 1.0.0-Beta1 have been released. This release focuses on [binary event](https://github.com/cettia/cettia-protocol/issues/9) which allows to exchange binary data without text-to-binary conversion and is one of features that many users have requested.

So far, to send and receive binary, you should have converted binary into text to write data and text into binary to read data based on encoding schemes like Base64, which has inevitably brought about performance degradation as well as payload size increase. Moreover, you have had to figure out which event handle binary in advance and do serialization and deserialization manually.

Thanks to [MessagePack](http://msgpack.org) which is schemaless binary interchange format, now it is possible to send and receive binary without any text-to-binary conversion process. If data or its one of properties is evaluated as binary, it will be internally serialized and deserialized according to MessagePack instead of JSON. Besides, it's designed to work with any binary interchange format so you can let client determine an interchange format it will use e.g. BSON for Smalltalk client and MessagePack for Go client per connection. Just let us know your needs. Anyway, here the most important thing is you don't need to know about this at all.

Let's take a look at the new feature through code snippet.

**JavaScript Client**

```javascript
/**
 * Assumes that the server sends data back on echo event.
 *
 * <pre>
 * server.onsocket(socket -> socket.on("echo", data -> socket.send("echo", data)));
 * </pre>
 */
var socket = cettia.open(uri);
socket.on("open", function() {
  // String object is text
  var text = "echo";
  socket.send("echo", text);

  // According to W3C Encoding standard https://encoding.spec.whatwg.org/
  // encoder.encode takes text and returns binary in the form of ArrayBuffer
  var encoder = new TextEncoder();

  // ArrayBuffer.isView(binary) will return 'true'
  // In Node.js, use 'new Buffer("echo")'
  var binary = encoder.encode("echo");
  socket.send("echo", binary);

  // Of course, composite data including both text and binary can be exchanged
  var composite = {text: "echo", binary: encoder.encode(binary)};
  socket.send("echo", composite);
});
socket.on("echo", function(data) {
  console.log(data);
});
```

**Java Server**

```java
/**
 * Assumes that the client sends data back on echo event.
 *
 * <pre>
 * socket.on('echo', data => socket.send('echo', data));
 * </pre>
 */
Server server = new DefaultServer();
server.onsocket((ServerSocket socket) -> {
  socket.onopen((Void v) -> {
    // String instance is text
    String text = "echo";
    socket.send("echo", text);

    // Byte array is binary
    byte[] bytes = "echo".getBytes();
    socket.send("echo", bytes);

    // ByteBuffer is regarded as binary as well
    ByteBuffer byteBuffer = ByteBuffer.wrap("echo".getBytes());
    socket.send("echo", byteBuffer);

    // Of course, POJO as well as plain map including both text and binary can be exchanged
    Map<String, Object> composite = new LinkedHashMap<>();
    composite.put("text", "echo");
    composite.put("binary", "echo".getBytes());
    socket.send("echo", composite);
  });
  socket.on("echo", (Object data) -> System.out.println(data));
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
