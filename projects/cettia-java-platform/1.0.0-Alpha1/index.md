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
    // You can use plain getter instead of public final field
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
            // When some error happens in request-response exchange
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

Now to run this handler on the specific platform, we need to wrap HTTP resources and WebSocket resources provided by that specific platform into `ServerHttpExchange` and `ServerWebSocket` and feed them into an instance of `EchoHandler`. A module playing such roles is called bridge and various bridges are provided which matches well with each platform's usage .

For example, to run `EchoHandler` on an implementation of Servlet 3 and Java WebSocket API 1, you can use Atmosphere 2 platform. Let's add the following bridge dependency.

```xml
<dependency>
    <groupId>io.cettia.platform</groupId>
    <artifactId>cettia-platform-bridge-atmosphere2</artifactId>
    <version>1.0.0-Alpha1</version>
</dependency>
```

Then, through `CettiaAtmosphereServlet`, you can configure `EchoHandler` and run it on an implementation of Servlet 3 and Java WebSocket API 1 that Atmosphere 2 supports such as Jetty 9 and Tomcat 8.

```java
import io.cettia.platform.bridge.atmosphere2.CettiaAtmosphereServlet;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;

import org.atmosphere.cpr.ApplicationConfig;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // An application
        EchoHandler handler = new EchoHandler();
        // How to bridge application and platform 
        ServletContext context = event.getServletContext();
        Servlet servlet = new CettiaAtmosphereServlet().onhttp(handler.httpAction).onwebsocket(handler.websocketAction);
        ServletRegistration.Dynamic reg = context.addServlet(CettiaAtmosphereServlet.class.getName(), servlet);
        reg.setAsyncSupported(true);
        reg.setInitParameter(ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR, Boolean.TRUE.toString());
        reg.addMapping("/echo");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Further Reading

* To get details of API, see [API document](/projects/cettia-java-platform/1.0.0-Alpha1/apidocs/).
* To have a thorough knowledge, read out the [reference](/projects/cettia-java-platform/1.0.0-Alpha1/reference/).