package com.myProjects.mindWeave.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat")
        .setAllowedOriginPatterns(
                "http://localhost:3000",
                "https://mind-weave-dh5t.vercel.app",
                "https://mind-weave-jhhu.vercel.app",
                "https://*.vercel.app")
        .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");  // clients subscribe here
        registry.setApplicationDestinationPrefixes("/app"); // clients send here
    }
}
