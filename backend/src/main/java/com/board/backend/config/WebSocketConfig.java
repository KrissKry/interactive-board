package com.board.backend.config;

import com.board.backend.config.authentication.user.UserInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${spring.rabbitmq.username}")
    private String CLIENT_LOGIN;
    @Value("${spring.rabbitmq.password}")
    private String CLIENT_SECRET;
    @Value("${spring.rabbitmq.username}")
    private String SYSTEM_LOGIN;
    @Value("${spring.rabbitmq.password}")
    private String SYSTEM_SECRET;
    @Value("${spring.rabbitmq.host}")
    private String HOST;
    @Value("${spring.rabbitmq.port}")
    private int PORT;

    private final UserInterceptor userInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/room").setAllowedOrigins("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/api")
                .enableStompBrokerRelay("/topic")
                .setRelayHost(HOST)
                .setRelayPort(PORT)
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
