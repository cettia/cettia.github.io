---
layout: reference
title: Cettia Java Server
---

Cettia Java Server <sup><strong>A</strong></sup> is a simple <sup><strong>B</strong></sup> and scalable <sup><strong>C</strong></sup> Java server designed to run any framework or platform on Java Virtual Machine <sup><strong>D</strong></sup>.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/cettia-protocol/1.0.0-Alpha1">Cettia 1.0.0-Alpha1</a> server.</dd>
    <dt>B</dt>
    <dd>All the interfaces you need to know are <code>Server</code> and <code>ServerSocket</code>. Indeed.</dd>
    <dt>C</dt>
    <dd>Because servers don't share any data, you can scale application horizontally with ease.</dd>
    <dt>D</dt>
    <dd>Because it is built on Cettia Java Platform, you can run your application on any platform where it supports seamlessly i.e. Atmosphere, Grizzly, Java WebSocket API, Netty, Play, Servlet and Vert.x.</dd>
</dl> 

---

## Quick Start
Cettia Java Server is distributed through Maven Central. A single artifact, <code>io.cettia:cettia-server:1.0.0-Alpha1</code>, is enough for general purpose and thanks to [Cettia Java Platform](/projects/cettia-java-platform/), your application can run on any framework or platform it supports.

```xml
<dependency>
    <groupId>io.cettia</groupId>
    <artifactId>cettia-server</artifactId>
    <version>1.0.0-Alpha1</version>
</dependency>
<dependency>
    <groupId>io.cettia.platform</groupId>
    <artifactId>cettia-platform-bridge-servlet3</artifactId>
    <version>1.0.0-Alpha1</version>
</dependency>
<dependency>
    <groupId>io.cettia.platform</groupId>
    <artifactId>cettia-platform-bridge-jwa1</artifactId>
    <version>1.0.0-Alpha1</version>
</dependency>
```

Once you've set up the build, you will be able to write the following [echo and chat](/projects/cettia-protocol/1.0.0-Alpha1/reference/#example) server that can run on implementation of Servlet 3 or Java WebSocket API 1.

```java
import io.cettia.DefaultServer;
import io.cettia.Server;
import io.cettia.ServerSocket;
import io.cettia.platform.action.Action;
import io.cettia.platform.bridge.jwa1.CettiaServerEndpoint;
import io.cettia.platform.bridge.servlet3.CettiaServlet;
import io.cettia.transport.http.HttpTransportServer;
import io.cettia.transport.websocket.WebSocketTransportServer;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;
import javax.websocket.DeploymentException;
import javax.websocket.server.*;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Server produces and manages socket
        final Server server = new DefaultServer();
        server.onsocket(new Action<ServerSocket>() {
            @Override
            public void on(final ServerSocket socket) {
                System.out.println("The connection is established successfully and communication is possible");
                // Built-in events
                socket.onerror(new Action<Throwable>() {
                    @Override
                    public void on(Throwable error) {
                        System.out.println("An error happens on the socket");
                        error.printStackTrace();
                    }
                });
                socket.onclose(new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println("The connection has been closed");
                    }
                });
                // Use-defined events
                socket.on("echo", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        socket.send("echo", data);
                    }
                });
                socket.on("chat", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        server.all().send("chat", data);
                    }
                });
            }
        });
        
        // HttpTransportServer consumes HTTP request-response exchanges and produces HTTP transports 
        HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
        ServletContext context = event.getServletContext();
        Servlet servlet = new CettiaServlet().onhttp(httpTransportServer);
        ServletRegistration.Dynamic reg = context.addServlet(CettiaServlet.class.getName(), servlet);
        reg.setAsyncSupported(true);
        reg.addMapping("/cettia");

        // WebSocketTransportServer consumes WebSocket resource and produces WebSocket transports 
        final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);
        ServerContainer container = (ServerContainer) context.getAttribute(ServerContainer.class.getName());
        ServerEndpointConfig config = ServerEndpointConfig.Builder.create(CettiaServerEndpoint.class, "/cettia")
        .configurator(new Configurator() {
            @Override
            public <T> T getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
                return endpointClass.cast(new CettiaServerEndpoint().onwebsocket(wsTransportServer));
            }
        })
        .build();
        try {
            container.addEndpoint(config);
        } catch (DeploymentException e) {
            throw new RuntimeException(e);
        }
        
        // As you can see, any transport technology can be used to bridge client and server
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Further Reading

* To play something right now, start with [archetype example](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server) on your favorite platform.
* To take a brief look at API, check out the [testee](https://github.com/cettia/cettia-java-server/blob/1.0.0-Alpha1/server/src/test/java/io/cettia/ProtocolTest.java#L53-L107).
* To get details of API, see [API document](/projects/cettia-java-server/1.0.0-Alpha1/apidocs/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/cettia-java-server/1.0.0-Alpha1/reference/).
