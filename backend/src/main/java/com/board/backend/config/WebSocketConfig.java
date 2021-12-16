package com.board.backend.config;

import com.board.backend.config.authentication.user.UserInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final String CLIENT_LOGIN = "admin";
    private final String CLIENT_SECRET = "admin";
    private final String SYSTEM_LOGIN = "admin";
    private final String SYSTEM_SECRET = "admin";

    private final UserInterceptor userInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/room").setAllowedOrigins("http://localhost:3000",
                "http://localhost:8080");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/api")
                .enableStompBrokerRelay("/topic")
                .setClientLogin(CLIENT_LOGIN)
                .setClientPasscode(CLIENT_SECRET)
                .setSystemLogin(SYSTEM_LOGIN)
                .setSystemPasscode(SYSTEM_SECRET);
    }


    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(userInterceptor);
    }
}
