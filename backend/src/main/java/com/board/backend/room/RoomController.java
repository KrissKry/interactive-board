package com.board.backend.room;

import com.board.backend.room.dto.RoomDTO;
import com.board.backend.chat.dto.ChatMessageDTO;
import com.board.backend.drawing.dto.ChangedPixelsDTO;
import com.board.backend.user.UserDTO;
import com.board.backend.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.security.Principal;


@RequiredArgsConstructor
@Slf4j
@Controller
public class RoomController {

    private final RoomFacade roomFacade;
    private final SimpMessagingTemplate template;

    @PostMapping("/api/room/create")
    public ResponseEntity<RoomDTO> createRoom(String name, String password) {
        return ResponseEntity.ok(roomFacade.createRoom(name, password));
    }

    @SubscribeMapping("/room/connect/{roomId}")
    public ResponseEntity<RoomDTO> getRoom(@PathVariable Long roomId, Principal principal) {
        template.convertAndSend("/topic/room/connected/" + roomId,
                new UserDTO(principal.getName(), UserStatus.CONNECTED));
        return ResponseEntity.ok(roomFacade.getRoom(roomId));
    }

    @MessageMapping("/board/send/{roomId}")
    public void savePixels(@DestinationVariable Long roomId, @Payload ChangedPixelsDTO pixels) {
        template.convertAndSend("/topic/board.listen.{roomId}", pixels);
        roomFacade.savePixels(pixels, roomId);
        log.info(pixels.toString());
    }

    @MessageMapping("/chat/send/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId, @Payload ChatMessageDTO message) {
        log.info("Received: " + message);
        template.convertAndSend("/topic/chat.listen." + roomId, message);
        roomFacade.saveMessage(message, roomId);
    }
}