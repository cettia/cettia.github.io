---
layout: post
title: "New Cettia Starter Kit"
author: flowersinthesand
---

Based on the feedback so far and the 2019 roadmap, we rewrote the [Cettia Starter Kit](https://github.com/cettia/cettia-starter-kit) from scratch, an example project that you can use as a starting point of your own Cettia application, and updated [Getting Started](/guides/getting-started) guide.

After reviewing support for mobile environment, one of the roadmap items, we concluded that it's more useful and helpful to provide examples which are consistent across different environments e.g. browser, Android, iOS, and so on than to encourage to use the JavaScript console in the browser on the fly. As a result, we implemented the following user stories in the new example in the starter kit.

- As a guest I want to sign in to the application by entering a username only so that I don’t have to go through an annoying sign-up process.
- As a user I want to join the lounge channel where everyone gets together automatically after sign in so that I can talk with everyone.
- As a user I want to send messages to the lounge channel so that everyone can receive my messages.
- As a user I want to receive messages when others send them to the lounge channel so that I can keep conversation in real-time.

Here's a screenshot of the new example.

![cettia-starter-kit-1555758896147](https://user-images.githubusercontent.com/1095042/56456590-5947a080-63a9-11e9-9155-36d49d33ed4c.gif)

Also, in the server side, to demonstrate Cettia's framework-agnostic nature, we separated the part responsible for real-time event handling with Cettia and the part responsible for integrating Cettia with a web framework, and added integrated examples per each web framework supporting Cettia (Technically speaking, frameworks [Asity](https://asity.cettia.io/) supports) in addition to the current Java EE example. Accordingly, examples are added, which demonstrate integration with Atmosphere, Grizzly, Java EE, Netty, Spring WebFlux, Spring Web MVC, and Vert.x.

You can take a look at the Cettia Starter Kit at [https://github.com/cettia/cettia-starter-kit](https://github.com/cettia/cettia-starter-kit) and the Getting Started guide at [https://cettia.io/guides/getting-started](/guides/getting-started). As always, please let us know if you find any issues or have feedback.
