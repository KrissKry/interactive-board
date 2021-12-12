package com.board.backend.room;

import com.board.backend.config.PrincipalUtils;
import com.board.backend.config.authentication.utils.UserRoomValidator;
import com.board.backend.room.dto.CreateRoomDTO;
import com.board.backend.room.dto.RoomDTO;
import com.board.backend.chat.dto.ChatMessageDTO;
import com.board.backend.drawing.dto.ChangedPixelsDTO;
import com.board.backend.user.UserDTO;
import com.board.backend.user.UserStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;


@RequiredArgsConstructor
@Slf4j
@Controller
public class RoomController {

    private final RoomFacade roomFacade;
    private final SimpMessagingTemplate template;

    @SneakyThrows
    @PostMapping("/api/room/create")
    public ResponseEntity<?> createRoom(@RequestBody String roomDTO) {
        log.info(roomDTO);
        return roomFacade.createRoom(roomDTO);
    }

    @SubscribeMapping("/room/connect/{roomId}")
    public ResponseEntity<?> getRoom(@DestinationVariable UUID roomId, Principal principal) {
        if (UserRoomValidator.validate(principal, roomId)) {
            return roomFacade.connectAndGetRoom(roomId, principal);
        } else {
            log.error("Room not accessible for current user");
            return ResponseEntity.badRequest().body("Room not accessible for current user");
        }
    }

    @MessageMapping("/board/send/{roomId}")
    public void savePixels(@DestinationVariable UUID roomId, @Payload ChangedPixelsDTO pixels, Principal principal) {
        if (UserRoomValidator.validate(principal, roomId)) {
            roomFacade.savePixels(pixels, roomId);
        }
    }

    @MessageMapping("/chat/send/{roomId}")
    public void sendMessage(@DestinationVariable UUID roomId, @Payload ChatMessageDTO message, Principal principal) {
        if (UserRoomValidator.validate(principal, roomId)) {
            log.info("Received: " + message);
            template.convertAndSend("/topic/chat.listen." + roomId, message);
            roomFacade.saveMessage(message, roomId);
        }
    }
}