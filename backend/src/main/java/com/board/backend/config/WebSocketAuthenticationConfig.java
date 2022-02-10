package com.board.backend.config;

import com.board.backend.config.authentication.user.UserInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketAuthenticationConfig implements WebSocketMessageBrokerConfigurer {
    private final UserInterceptor userInterceptor;

    @Override
    public void configureClientInboundChannel(final ChannelRegistration registration) {
        registration.interceptors(userInterceptor);
    }
}
