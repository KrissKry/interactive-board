package com.board.backend.room;

import com.board.backend.config.PrincipalUtils;
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
import java.util.Map;
import java.util.UUID;


@RequiredArgsConstructor
@Slf4j
@Controller
public class RoomController {

    private final RoomFacade roomFacade;
    private final SimpMessagingTemplate template;
    private ObjectMapper mapper = new ObjectMapper();

    @SneakyThrows
    @PostMapping("/api/room/create")
    public ResponseEntity<String> createRoom(@RequestBody String roomDTO) {
        log.info(roomDTO);
        var dto = mapper.readValue(roomDTO, CreateRoomDTO.class);
        return ResponseEntity.ok(roomFacade.createRoom(dto.getPassword()).getRoomId());
    }

    @SubscribeMapping("/room/connect/{roomId}")
    public ResponseEntity<RoomDTO> getRoom(@DestinationVariable UUID roomId, Principal principal) {
        template.convertAndSend("/topic/room.connected." + roomId,
                new UserDTO(PrincipalUtils.extractUserNameFromPrincipal(principal), UserStatus.CONNECTED));
        var response = roomFacade.connectAndGetRoom(roomId, principal);
        log.info(response.toString());
        return ResponseEntity.ok(response);
    }

    @MessageMapping("/board/send/{roomId}")
    public void savePixels(@DestinationVariable UUID roomId, @Payload ChangedPixelsDTO pixels) {
        template.convertAndSend("/topic/board.listen." + roomId, pixels);
        roomFacade.savePixels(pixels, roomId);
        log.info(pixels.toString());
    }

    @MessageMapping("/chat/test/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId, @Payload String message) {
        log.info("Received: " + message);
        template.convertAndSend("/topic/chat.listen." + roomId, message);
    }

    @MessageMapping("/chat/send/{roomId}")
    public void sendMessage(@DestinationVariable UUID roomId, @Payload ChatMessageDTO message) {
        log.info("Received: " + message);
        template.convertAndSend("/topic/chat.listen." + roomId, message);
        roomFacade.saveMessage(message, roomId);
    }
}