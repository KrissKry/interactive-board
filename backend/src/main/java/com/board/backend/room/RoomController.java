package com.board.backend.room;

import com.board.backend.config.PrincipalUtils;
import com.board.backend.config.authentication.utils.UserRoomValidator;
import com.board.backend.drawing.dto.ClearPixelsDTO;
import com.board.backend.chat.dto.ChatMessageDTO;
import com.board.backend.drawing.dto.ChangedPixelsDTO;
import lombok.Data;
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

    @CrossOrigin(origins = "*")
    @SneakyThrows
    @PostMapping("/api/room/create")
    public ResponseEntity<?> createRoom(@RequestBody String roomDTO) {
        return roomFacade.createRoom(roomDTO);
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/check")
    public ResponseEntity<?> check() {
        return ResponseEntity.ok(new CheckResponse());
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
            log.info("Received board update from user " + PrincipalUtils.extractUserNameFromPrincipal(principal));
            roomFacade.savePixels(pixels, roomId);
        }
    }

    @MessageMapping("/chat/send/{roomId}")
    public void sendMessage(@DestinationVariable UUID roomId, @Payload ChatMessageDTO message, Principal principal) {
        if (UserRoomValidator.validate(principal, roomId)) {
            log.info("Received message: " + message.getText() + " from user " + PrincipalUtils.extractUserNameFromPrincipal(principal));
            template.convertAndSend("/topic/chat.listen." + roomId, message);
            roomFacade.saveMessage(message, roomId);
        }
    }

    @MessageMapping("/board/clear/{roomId}")
    public void clearBoard(@DestinationVariable UUID roomId, @Payload ClearPixelsDTO clearPixelsDTO, Principal principal) {
        if (UserRoomValidator.validate(principal, roomId)) {
            log.info("User: " + PrincipalUtils.extractUserNameFromPrincipal(principal) + "requested clear board for room :" + roomId);
            template.convertAndSend("/topic/board.cleared." + roomId, clearPixelsDTO);
            roomFacade.clearRoom(roomId);
        }
    }

    @Data
    static class CheckResponse {
        String result = "Success";
        String status = "Success";
    }
}