package com.board.backend.room;

import com.board.backend.room.dto.RoomDTO;
import com.board.backend.room.model.chat.dto.ChatMessageDTO;
import com.board.backend.room.model.drawing.dto.ChangedPixelsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;


@RequiredArgsConstructor
@Slf4j
@Controller
public class RoomController {

    private final RoomFacade roomFacade;
    private final SimpMessagingTemplate template;

    @PostMapping("/api/room/create")
    public ResponseEntity<RoomDTO> createRoom() {
        return ResponseEntity.ok(roomFacade.createRoom());
    }

    @GetMapping("/api/room/get/{roomId}")
    public ResponseEntity<RoomDTO> getRoom(@PathVariable Long roomId) {
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