package com.board.backend.config.authentication.user;

import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserInterceptor implements ChannelInterceptor {

    private static final String USERNAME_HEADER = "login";
    private static final String ROOM_ID_HEADER = "roomId";
    private static final String PASSWORD_HEADER = "roomPassword";

    private final WebSocketAuthenticatorService authenticatorService;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String name = accessor.getFirstNativeHeader(USERNAME_HEADER);
            String roomId = accessor.getFirstNativeHeader(ROOM_ID_HEADER);
            String roomPassword = accessor.getFirstNativeHeader(PASSWORD_HEADER);

            final UsernamePasswordAuthenticationToken user = authenticatorService.getAuthenticatedOrFail(name, roomId, roomPassword);

            accessor.setUser(user);
        }
        return message;
    }
}
