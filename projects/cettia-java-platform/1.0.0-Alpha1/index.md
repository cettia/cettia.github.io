---
layout: project
title: Cettia Java Platform
---

Cettia Java Platform is a simple <sup><strong>A</strong></sup> abstraction layer <sup><strong>B</strong></sup> for full-stack web application frameworks <sup><strong>C</strong></sup> and raw web servers <sup><strong>D</strong></sup> running on Java Virtual Machine.

<dl>
    <dt>A</dt>
    <dd>All the interfaces you need to know are <code>ServerHttpExchange</code> and <code>ServerWebSocket</code>. Indeed.</dd>
    <dt>B</dt>
    <dd>An application written in Cettia Java Platform can run on any supported platforms seamlessly.</dd>
    <dt>C</dt>
    <dd>For example, Play, Spring MVC and JAX-RS.</dd>
    <dt>D</dt>
    <dd>For example, Servlet, Grizzly and Netty.</dd>
</dl>

---

## Quick Start
Cettia Java Platform is distributed through Maven Central. To write web application running on any platform Cettia Java Platform supports, you need two artifacts: `io.cettia.platform:cettia-platform-http:1.0.0-Alpha1` and `io.cettia.platform:cettia-platform-websocket:1.0.0-Alpha1`.

```xml
<dependency>
    <groupId>io.cettia.platform</groupId>
    <artifactId>cettia-platform-http</artifactId>
    <version>1.0.0-Alpha1</version>
</dependency>
<dependency>
    <groupId>io.cettia.platform</groupId>
    <artifactId>cettia-platform-websocket</artifactId>
    <version>1.0.0-Alpha1</version>
</dependency>
```

Once you've set up the build, all you need to do is to write actions receiving `ServerHttpExchange` and `ServerWebSocket`. As a simple example, let's write echo actions sending any incoming messages such as HTTP chunk and WebSocket data frame back.

```java
import io.cettia.platform.action.Action;
import io.cettia.platform.http.ServerHttpExchange;
import io.cettia.platform.websocket.ServerWebSocket;

public class EchoHandler {
    // You can use plain getter instead of public final field of course
    public final Action<ServerHttpExchange> httpAction = new Action<ServerHttpExchange>() {
        @Override
        public void on(final ServerHttpExchange http) {
            // Get the request header, content-type, and set it to the response header, content-type 
            http.setHeader("content-type", http.header("content-type"))
            // When a chunk is read from the request body
            .onchunk(new Action<ByteBuffer>() {
                @Override
                public void on(ByteBuffer bytes) {
                    // Writes a read chunk to the response body
                    http.write(bytes);
                }
            })
            // When the request is fully read
            .onend(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("The end of request");
                    // Ends the response
                    http.end();
                }
            })
            // Reads the request body as binary to circumvent encoding issue
            .readAsBinary()
            // When the response is fully written
            .onfinish(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("The end of response");
                }
            })
            // When some error happens in the request-response exchange
            .onerror(new Action<Throwable>() {
                @Override
                public void on(Throwable t) {
                    t.printStackTrace();
                }
            })
            // When the underlying connection is terminated
            .onclose(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("The end of request-response exchange");
                }
            });
        }
    };
    public final Action<ServerWebSocket> websocketAction = new Action<ServerWebSocket>() {
        @Override
        public void on(final ServerWebSocket ws) {
            // When a text frame is arrived
            ws.ontext(new Action<String>() {
                @Override
                public void on(String data) {
                    // Sends it back
                    ws.send(data);
                }
            })
            // When a binary frame is arrived
            .onbinary(new Action<ByteBuffer>() {
                @Override
                public void on(ByteBuffer bytes) {
                    // Sends it back
                    ws.send(bytes);
                }
            })
            // When some error happens in the connection
            .onerror(new Action<Throwable>() {
                @Override
                public void on(Throwable t) {
                    t.printStackTrace();
                }
            })
            // When the connection is closed for any reason
            .onclose(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("The end of connection");
                }
            });
        }
    };
}
```

Now to run this handler on the specific platform, we need to wrap HTTP resources and WebSocket resources provided by that specific platform into `ServerHttpExchange` and `ServerWebSocket` and feed them into an instance of `EchoHandler`. A module playing such roles is called bridge and various bridges are provided which matches well with each platform's usage.

For example, to run `EchoHandler` on an implementation of Servlet 3 and Java WebSocket API 1 such as Jetty 9 and Tomcat 8, you need Servlet 3 bridge and Java WebSocket API 1 bridge. Let's add the following bridge dependencies.

```xml
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

Then, you can feed the handler with HTTP resources through `CettiaServlet` and WebSocket resources through `CettiaServerEndpoint`.

```java
import io.cettia.platform.bridge.jwa1.CettiaServerEndpoint;
import io.cettia.platform.bridge.servlet3.CettiaServlet;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;
import javax.websocket.DeploymentException;
import javax.websocket.server.*;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // An application
        final EchoHandler handler = new EchoHandler();
        
        // Feeds the application with HTTP resources produced by Servlet 3
        ServletContext context = event.getServletContext();
        Servlet servlet = new CettiaServlet().onhttp(handler.httpAction);
        ServletRegistration.Dynamic reg = context.addServlet(CettiaServlet.class.getName(), servlet);
        reg.setAsyncSupported(true);
        reg.addMapping("/echo");
        
        // Feeds the application with WebSocket resources produced by Java WebSocket API 1
        ServerContainer container = (ServerContainer) context.getAttribute(ServerContainer.class.getName());
        ServerEndpointConfig config = ServerEndpointConfig.Builder.create(CettiaServerEndpoint.class, "/echo")
        .configurator(new Configurator() {
            @Override
            public <T> T getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
                return endpointClass.cast(new CettiaServerEndpoint().onwebsocket(handler.websocketAction));
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

The same pattern applies when bridging application to other platform. Here is working examples. They demonstrate how to run [Cettia Java Server](/projects/cettia-java-server) implementing Cettia Protocol based on Cettia Java Platform on each platform.

<ul class="menu">
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/atmosphere2">Atmosphere 2</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/grizzly2">Grizzly 2</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/jwa1">Java WebSocket API 1</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/netty4">Netty 4</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/play2">Play 2</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/servlet3">Servlet 3</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/servlet3-jwa1">Servlet 3 and Java WebSocket API 1</a></li>
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform/vertx2">Vert.x 2</a></li>
</ul>

It's not the end. Some platform, A, is based on the other platform, B, and allows to deal with the underlying platform, B, so that if a bridge for B is available, without creating an additional bridge for A, it's possible to run application on A through B. For example, applications written in Spring MVC platform or JAX-RS platform can run on Servlet platform.

<ul class="menu">
<li><a href="https://github.com/cettia/cettia-examples/tree/master/archetype/cettia-java-server/platform-on-platform/jaxrs2-atmosphere2">JAX-RS 2 on Atmosphere 2</a></li>
</ul>

Though your favorite platform is not supported? Just take a look how [Grizzly 2 bridge](https://github.com/cettia/cettia-java-platform/tree/1.0.0-Alpha1/bridge-grizzly2) is written. Mostly, with more or less 200 lines, it's enough to write a bridge.

### Further Reading

* To get details of API, see [API document](/projects/cettia-java-platform/1.0.0-Alpha1/apidocs/).
* To have a thorough knowledge, read out the [reference](/projects/cettia-java-platform/1.0.0-Alpha1/reference/).
