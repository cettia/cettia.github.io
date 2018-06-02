---
layout: post
title: "Asity 2.0.0-Alpha2 released"
author: flowersinthesand
---

I'm pleased to announce the second alpha release of Asity 2.0.0. This is our last alpha release, which means that we are now feature complete and will focus on fixing bugs and enhancing performance. Asity 2 will be a unique framework that allows you to write an asynchronous web app that runs on almost all popular web frameworks in Java without modification whatsoever; *Servlet and Java API for WebSocket*, *Spring WebFlux*, *Spring Web MVC*, *Grizzly*, *Vert.x*, *Netty*, and *Atmosphere*.

Although a new website for Asity 2 is a work in progress, the contents of the 'Run anywhere' part won't change much. Check out the details at the website: [http://asity.cettia.io](http://asity.cettia.io).

#### Allow to read WebSocket handshake headers [#12](https://github.com/cettia/asity/issues/11)

Now you can retrieve WebSocket handshake headers such as `Authorization` and `Sec-WebSocket-Protocol` from a `ServerWebSocket` instance directly with `Set<String> headerNames()`, `String header(String name)` and `List<String> headers(String name)` methods.

```java
Action<ServerWebSocket> wsAction = (ServerWebSocket ws) -> {
  // Logs WebSocket handshake headers
  ws.headerNames().stream().forEach(name -> System.out.println(name + ": " + ws.header(name)));
  // Subprotocols
  List<String> subprotocols = ws.headers("Sec-WebSocket-Protocol");
  // ...
};
```

Note that to enable this in applications based on Java WebSocket API, you should put a handshake request instance into a map returned by `ServerEndpointConfig#getUserProperties` with the `javax.websocket.server.HandshakeRequest` key by overriding a `Configurator#modifyHandshake` method.

```java
ServerEndpointConfig config = ServerEndpointConfig.Builder.create(AsityServerEndpoint.class, "/cettia")
.configurator(new Configurator() {
  @Override
  public <T> T getEndpointInstance(Class<T> endpointClass) {
    return endpointClass.cast(new AsityServerEndpoint().onwebsocket(wsTransportServer));
  }

  // Required
  @Override
  public void modifyHandshake(ServerEndpointConfig config, HandshakeRequest request, HandshakeResponse response) {
    config.getUserProperties().put(HandshakeRequest.class.getName(), request);
  }
})
.build();
```

#### Spring MVC support [#13](https://github.com/cettia/asity/issues/13)

`io.cettia.asity:asity-bridge-spring-webmvc4:2.0.0-Alpha2` bridge module includes support for Spring Web MVC 4 and later. `AsityController` and `AsityWebSocketHandler` take responsibility for handling HTTP request-response exchanges and WebSocket connections, respectively. Here's an example of building a Cettia application with Spring MVC 4 and Spring Boot 1:

```java
package io.cettia.example.spring.webmvc4;

import io.cettia.asity.bridge.spring.webmvc4.AsityController;
import io.cettia.asity.bridge.spring.webmvc4.AsityWebSocketHandler;

// Skipped for brevity

@SpringBootApplication
@EnableWebMvc
@EnableWebSocket
public class Application implements WebSocketConfigurer {
  @Bean
  public Server server() {
    Server server = new DefaultServer();
    httpTransportServer().ontransport(server);
    wsTransportServer().ontransport(server);
    return server;
  }

  @Bean
  public HttpTransportServer httpTransportServer() {
    return new HttpTransportServer();
  }

  @Bean
  public WebSocketTransportServer wsTransportServer() {
    return new WebSocketTransportServer();
  }

  @Bean
  public HandlerMapping httpMapping() {
    AsityController asityController = new AsityController().onhttp(httpTransportServer());
    AbstractHandlerMapping mapping = new AbstractHandlerMapping() {
      @Override
      protected Object getHandlerInternal(HttpServletRequest request) {
        // Check whether a path equals '/asity'
        return "/cettia".equals(request.getRequestURI()) &&
          // Delegates WebSocket handshake requests to a webSocketHandler bean
          !"websocket".equalsIgnoreCase(request.getHeader("upgrade")) ? asityController : null;
      }
    };
    mapping.setOrder(Ordered.HIGHEST_PRECEDENCE);
    return mapping;
  }

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    AsityWebSocketHandler asityWebSocketHandler = new AsityWebSocketHandler().onwebsocket(wsTransportServer());
    registry.addHandler(asityWebSocketHandler, "/cettia").setAllowedOrigins("*");
  }

  @Bean
  public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.applyPermitDefaultValues();
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/cettia", config);

    return new CorsFilter(source);
  }

  public static void main(String[] args) {
    SpringApplication.run(Application.class);
  }
}
```

#### Vert.x 3 support [#9](https://github.com/cettia/asity/issues/9)

`io.cettia.asity:asity-bridge-vertx3:2.0.0-Alpha2` bridge module includes support for Vert.x 3.  `AsityRequestHandler` and `AsityWebSocketHandler` take responsibility for handling HTTP request-response exchanges and WebSocket connections, respectively. Here's an example of building a Cettia application with Vert.x 3.

```java
package io.cettia.example.vertx3;

import io.cettia.asity.bridge.vertx3.AsityRequestHandler;
import io.cettia.asity.bridge.vertx3.AsityWebSocketHandler;

// Skipped for brevity

public class Application extends AbstractVerticle {
  @Override
  public void start() throws Exception {
    Server server = new DefaultServer();
    HttpTransportServer httpTransportServer = new HttpTransportServer().ontransport(server);
    WebSocketTransportServer webSocketTransportServer = new WebSocketTransportServer().ontransport(server);

    HttpServer httpServer = vertx.createHttpServer();
    AsityRequestHandler requestHandler = new AsityRequestHandler().onhttp(httpTransportServer);
    httpServer.requestHandler(request -> {
      if (request.path().equals("/cettia")) {
        requestHandler.handle(request);
      }
    });
    AsityWebSocketHandler websocketHandler = new AsityWebSocketHandler().onwebsocket(webSocketTransportServer);
    httpServer.websocketHandler(socket -> {
      if (socket.path().equals("/cettia")) {
        websocketHandler.handle(socket);
      }
    });
    httpServer.listen(8080);
  }
};
```

Here's the [full changelog](https://github.com/cettia/asity/milestone/4?closed=1). If you have any idea or proposal, don't hesitate to let us know on [Cettia Groups](http://groups.google.com/group/cettia).
