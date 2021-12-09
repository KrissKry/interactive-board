package com.board.backend.config;

import com.board.backend.room.RoomFacade;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionEventsHandler {

    private final RoomFacade roomFacade;

    @EventListener
    public void handleSessionDisconnect(@NonNull SessionDisconnectEvent event) {
        var uuid = UUID.fromString(
                PrincipalUtils.extractRoomIdFromPrincipal(
                        Objects.requireNonNull(event.getUser())
                )
        );

        log.info(uuid.toString());

        roomFacade.disconnectUser(
                UUID.fromString(
                        PrincipalUtils.extractRoomIdFromPrincipal(
                                Objects.requireNonNull(event.getUser())
                        )
                ),
                PrincipalUtils.extractRoomIdFromPrincipal(event.getUser()));
        log.info("User removed");
    }
}
