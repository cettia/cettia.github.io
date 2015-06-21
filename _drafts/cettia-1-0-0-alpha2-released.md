---
layout: post
title: "Cettia 1.0.0-Alpha2 released"
author: flowersinthesand
---

I'm pleased to announce that Cetita Protocol 1.0.0-Alpha2, Cettia JavaScript Client 1.0.0-Alpha2 and Cettia Java Server 1.0.0-Alpha2 have been released. The theme of this release is [offline application](https://github.com/cettia/cettia-protocol/issues/1), which provides a flexible way to deal with temporary disconnection or persistent disconnection.

In the real world, losing connection is not uncommon so that it is pretty important to make web applications relying on full-duplex connection functional while offline in some way. For example, users lose connection every time they navigate from one page to another page and may lose network while on the move. Even if the time between disconnection and reconnection is very short, it's true that any message can't be sent and received after disconnection and authentication which is a process to verify a user is who they say they are should be done after reconnection and messages which couldn't be sent and received meanwhile should be synchronized. Also if reconnection doesn't occur for a long time, these messages may have to be sent through each user's email.

To solve such problems, it has been required to design and implement user own protocol on top of full duplex connection using cookie or something like that. With this feature, you can handle sockets regardless of their online/offline state as well as deal with such issues with ease just by handling some reserved socket events. Therefore, a reference to socket is not affected by disconnection and reconnection at all and doing authentication once is enough for socket. Of course, it applies to every transport not just HTTP based ones.

Let's take a look the new feature through code snippet.

**JavaScript Client**

```javascript
var socket = cettia.open(uri, {
    // Only for browser. This option allows to maintain this socket's life cycle even after navigation.
    // That means events which couldn't be sent to this socket due to navigation will be arriving in the next page.
    // Therefore, you don't need to follow single page application model to wrokaround such issues.
    name: "main"
});

// A queue containing events the client couldn't send to the server while disconnection.
var cache = [];

// Fired when the server issues a new id for this socket as the beginning of the life cycle and the end of the previous life cycle.
// The open event always follows this event but not vice versa.
socket.on("new", function() {
    // You can reset resources having been used for the previous life cycle for the new life cycle here.
    cache.length = 0;
});

// Fired when the underlying transport establishes a connection.
socket.on("open", function() {
    // Now that communication is possible, you can flush the cache.
    while(socket.state() === "opened" && cache.length) {
        // Removes the first event from the cache and sends it to the server one by one.
        var args = cache.shift();
        socket.send.apply(socket, args);
    }
});

// Fired if some event is sent while there is no connection.
socket.on("cache", function(args) {
    // You can determine whether or not to cache this arguments used to call the send method.
    // For example, in some cases, you may want to avoid caching to deliver live data in time.
    cache.push(args);
});

// You don't need to pay attention to socket's online/offline state when sending an event.
// Internally, it will be delegated to the underlying transport if it's online and the cache event if it's offline.
socket.send("event", data);
```

**Java Server**

```java
// Fired when a socket has just been created as the beginning of the life cycle.
// However the handshake is not performed yet so that it is not allowed to exchange an event.
server.onsocket(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        // You can authenticate a socket here e.g. token-based approach or cookie-based approach.
        final Map<String, String> authentication = new TokenVerifier(SECRET).verify(new Uri(socket.uri()).parameter("token"));

        // Once is enough because this reference is unaffected by disconnection and reconnection.
        socket.tag(authentication.get("username"));
        // Then, it's possible to send an event to a specific user who may have used multiple devices by username.
        // A given socket represents a specific device like desktop, phone, tablet and so on.
        // e.g. server.byTag("flowersinthesand", socket -> socket.send("directmessage", "Hello there!"));
        
        // A queue containing events the server couldn't send to the client while disconnection.
        final Queue<Object[]> cache = new ConcurrentLinkedQueue<>();
        
        // Fired when the handshake is performed successfully.
        socket.onopen(new VoidAction() {
            @Override
            public void on() {
                // Now that communication is possible, you can flush the cache.
                while (socket.state() == ServerSocket.State.OPENED && !cache.isEmpty()) {
                    // Removes the first event from the cache and sends it to the client one by one.
                    Object[] args = cache.poll();
                    socket.send((String) args[0], args[1], (Action<?>) args[2], (Action<?>) args[3]);
                }
            }
        });

        // Fired if some event is sent while there is no connection.
        socket.oncache(new Action<Object[]>() {
            @Override
            public void on(Object[] args) {
                // You can determine whether or not to cache this arguments used to call the send method.
                // For example, in some cases, you may want to avoid caching to deliver live data in time.
                cache.offer(args);
            }
        });

        // Fired if the socket has been closed for a long time i.e. 1 minute and deleted from the server as the end of the life cycle.
        // A deleted socket can't be and shouldn't be used.
        socket.ondelete(new VoidAction() {
            @Override
            public void on() {
                // If the cache is not empty, that is to say, there are still some messages user should receive,
                // you can send an email to notify user or store them to database for user to check on next logging in.
                if (!cache.isEmpty()) {
                    Account account = accountService.findByUsername(authentication.get("username"));
                    // Checks if user didn't really receive the unread messages.
                    // For example, user may have received some messages among them through other device or other socket. 
                    Queue<Object[]> unreads = account.unreadEvent(cache);
                    // Nevertheless, if there are still unread messages, sends an email to notify user of some unread messages.
                    if (!unreads.isEmpty()) {
                        mailService.send(account, new UnreadMessageMailTemplate(unreads));
                    }
                }
            }
        });        
    }
});

// You can pass a socket action to server at any time not paying attention to given socket's online/offline state.
server.all(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        // It will be delegated to the underlying transport if it's online or the cache event if it's offline.
        socket.send("event", data);
    }
});
```

For your information, `TokenVerifier`, `Uri`, `Account`, `AccountService`, `MailService` and `UnreadMessageMailTemplate` are just imaginary classes to help describe one of scenarios matching with this feature. As you can see that the above code snippets are just boilerplate, we have agonized over introducing helper classes to remove these boilerplate but have decided to wait for the community's feedback. So don't hesitate to give us your thought about this.

Here's the full changelog:

* Offline application. [cettia-protocol#1](https://github.com/cettia/cettia-protocol/issues/1), [cettia-javascript-client#3](https://github.com/cettia/cettia-javascript-client/issues/3), [cettia-java-server#3](https://github.com/cettia/cettia-java-server/issues/3)
* WebSocket transport doesn't work with URI whose authority has no trailing slash and query is not empty. [cettia-protocol#6](https://github.com/cettia/cettia-protocol/issues/6)
* A client socket stays in connecting state if an invalid URI is given. [cettia-protocol#5](https://github.com/cettia/cettia-protocol/issues/5)
* abort request kills the process if it throws an error. [cettia-protocol#4](https://github.com/cettia/cettia-protocol/issues/5)
* WebSocket transport doesn't fire close event when a connection fails. [cettia-protocol#3](https://github.com/cettia/cettia-protocol/issues/3)
* When test transport fires close event it should remove its stop function from socket's close event. [cettia-javascript-client#6](https://github.com/cettia/cettia-javascript-client/issues/6)
* The total number of reconnection attempts to be passed to reconnect option is wrong. [cettia-javascript-client#5](https://github.com/cettia/cettia-javascript-client/issues/5)
* Extend socket's life cycle over multiple pages. [cettia-javascript-client#4](https://github.com/cettia/cettia-javascript-client/issues/4)
* Expose socket state. [cettia-java-server#2](https://github.com/cettia/cettia-java-server/issues/2)

As always, please let us, [Cettia Groups](http://groups.google.com/group/cettia), know if you have any question or feedback.