---
layout: post
title: "Asity 2.0.0-Alpha1 released"
author: flowersinthesand
---

I'm happy to announce the availability of the first alpha of Asity 2.0.0. First of all, we rephrased the project definition to make clear the identity of the project:

> Asity is an abstraction layer for various web frameworks on the Java Virtual Machine.

This articulates the reason why the we crated Asity project; Cettia works with any web framework on the JVM, and allows the end user to plug in the desired web framework. Here's a roadmap for Astiy 2:

- [Set minimum Java verion to 8](https://github.com/cettia/asity/issues/11)
- [Allow to read WebSocket handshake request headers](https://github.com/cettia/asity/issues/12)
- [Support Spring WebFlux 5](https://github.com/cettia/asity/issues/10)
- [Support Spring Web MVC 4](https://github.com/cettia/asity/issues/13)
- [Support Vert.x 3](https://github.com/cettia/asity/issues/9)

For the details of the progress and information, visit [https://github.com/cettia/asity](https://github.com/cettia/asity/). Asity 2 will be available early July. If you have any idea or proposal, don't hesitate to let us know on [Cettia Groups](http://groups.google.com/group/cettia)!

As for the first alpha release, it includes a support for Spring WebFlux, a web framework of Spring's reactive stack based on Reactive Streams. With `io.cettia.asity:asity-bridge-spring-webflux5:2.0.0-Alpha1` bridge module, you can build a Cettia application with Spring WebFlux, and run it through Spring Boot just like a plain Spring application. Here's an example:

```java
package io.cettia.example.spring;

import io.cettia.asity.bridge.spring.webflux5.AsityHandlerFunction;
import io.cettia.asity.bridge.spring.webflux5.AsityWebSocketHandler;

// Skipped for brevity

@SpringBootApplication
@EnableWebFlux
public class Application {

  @Bean
  public Server server(HttpTransportServer httpTransportServer, WebSocketTransportServer wsTransportServer) {
    Server server = new DefaultServer();
    httpTransportServer.ontransport(server);
    wsTransportServer.ontransport(server);
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
  public RouterFunction<ServerResponse> httpMapping(HttpTransportServer httpTransportServer) {
    AsityHandlerFunction asityHandlerFunction = new AsityHandlerFunction().onhttp(httpTransportServer);

    return RouterFunctions.route(
      path("/cettia")
        // Excludes WebSocket handshake requests
        .and(headers(headers -> !"websocket".equalsIgnoreCase(headers.asHttpHeaders().getUpgrade()))), asityHandlerFunction);
  }

  @Bean
  public HandlerMapping wsMapping(WebSocketTransportServer wsTransportServer) {
    AsityWebSocketHandler asityWebSocketHandler = new AsityWebSocketHandler().onwebsocket(wsTransportServer);
    Map<String, WebSocketHandler> map = new LinkedHashMap<>();
    map.put("/cettia", asityWebSocketHandler);

    SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping();
    mapping.setUrlMap(map);

    return mapping;
  }

  @Bean
  public WebSocketHandlerAdapter webSocketHandlerAdapter() {
    return new WebSocketHandlerAdapter();
  }

  @Bean
  public CorsWebFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.applyPermitDefaultValues();
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/cettia", config);

    return new CorsWebFilter(source);
  }

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

}
```
