---
layout: project
title: Cettia Java Server
---

Cettia Java Server <sup><strong>A</strong></sup> is a simple <sup><strong>B</strong></sup> and scalable <sup><strong>C</strong></sup> Java server designed to run on any platform on the Java Virtual Machine <sup><strong>D</strong></sup>.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/cettia-protocol/1.0.0-Alpha2">Cettia 1.0.0-Alpha2</a> server.</dd>
    <dt>B</dt>
    <dd>All the interfaces you need to know are <code>Server</code> and <code>ServerSocket</code>. Indeed.</dd>
    <dt>C</dt>
    <dd>Because servers don't share any data, you can scale application horizontally with ease.</dd>
    <dt>D</dt>
    <dd>Your application can run on any platform that <a href="/projects/cettia-java-platform/">Cettia Java Platform</a> supports seamlessly i.e. Atmosphere, Grizzly, Java WebSocket API, Netty, Play, Servlet and Vert.x.</dd>
</dl> 

---

## Quick Start
Cettia Java Server is distributed through Maven Central and a single artifact, `io.cettia:cettia-server:1.0.0-Alpha2`, is enough for general purpose. To run an application on the specific platform, you need to prepare the corresponding bridge artifact from [Cettia Java Platform](/projects/cettia-java-platform/). Here to make the application run on an implementation of Servlet 3 and Java WebSocket API 1 `io.cettia.platform:cettia-platform-bridge-servlet3:1.0.0-Alpha1` and `io.cettia.platform:cettia-platform-bridge-jwa1:1.0.0-Alpha1` are used. 

```xml
<dependency>
    <groupId>io.cettia</groupId>
    <artifactId>cettia-server</artifactId>
    <version>1.0.0-Alpha2</version>
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

Once you've set up the build, you will be able to write the following [echo and chat](/projects/cettia-protocol/1.0.0-Alpha2/reference/#example) server.

```java
import io.cettia.DefaultServer;
import io.cettia.Server;
import io.cettia.ServerSocket;
import io.cettia.platform.action.Action;
import io.cettia.platform.bridge.jwa1.CettiaServerEndpoint;
import io.cettia.platform.bridge.servlet3.CettiaServlet;
import io.cettia.transport.http.HttpTransportServer;
import io.cettia.transport.websocket.WebSocketTransportServer;

import javax.servlet.Servlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.ServletRegistration;
import javax.servlet.annotation.WebListener;
import javax.websocket.DeploymentException;
import javax.websocket.server.ServerContainer;
import javax.websocket.server.ServerEndpointConfig;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        final Server server = new DefaultServer();
        // When a socket is created as the beginning of the lifecycle
        server.onsocket(new Action<ServerSocket>() {
            @Override
            public void on(final ServerSocket socket) {
                System.out.println("on server's socket");
                // Lifecycle events
                // When the handshake is performed successfully
                socket.onopen(new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println("on open");
                    }
                });
                // When the underlying transport is closed for some reason
                socket.onclose(new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println("on close");
                    }
                });
                // When an error happens on the socket
                socket.onerror(new Action<Throwable>() {
                    @Override
                    public void on(Throwable error) {
                        System.out.println("on error");
                        error.printStackTrace();
                    }
                });
                // When the socket has been closed for a long time i.e. 1 minute and deleted from the server as the end of the lifecycle
                socket.ondelete(new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println("on delete");
                    }
                });

                // echo and chat events
                socket.on("echo", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        System.out.println("on echo " + data);
                        socket.send("echo", data);
                    }
                });
                socket.on("chat", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        System.out.println("on chat " + data);
                        server.all().send("chat", data);
                    }
                });
            }
        });
        

        HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
        ServletContext context = event.getServletContext();
        Servlet servlet = new CettiaServlet().onhttp(httpTransportServer);
        ServletRegistration.Dynamic reg = context.addServlet(CettiaServlet.class.getName(), servlet);
        reg.setAsyncSupported(true);
        reg.addMapping("/cettia");

        final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().ontransport(server);
        ServerContainer container = (ServerContainer) context.getAttribute(ServerContainer.class.getName());
        ServerEndpointConfig config = ServerEndpointConfig.Builder.create(CettiaServerEndpoint.class, "/cettia")
        .configurator(new ServerEndpointConfig.Configurator() {
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
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Further Reading

* To play something right now, start with [archetype example](https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server) on your favorite platform.
* To take a brief look at API, check out the [testee](https://github.com/cettia/cettia-java-server/blob/1.0.0-Alpha2/server/src/test/java/io/cettia/ProtocolTest.java#L53-L107).
* To get details of API, see [API document](/projects/cettia-java-server/1.0.0-Alpha2/apidocs/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/cettia-java-server/1.0.0-Alpha2/reference/).