package com.board.backend.room;

import com.board.backend.config.CustomJsonMapper;
import com.board.backend.config.PrincipalUtils;
import com.board.backend.room.cassandra.model.Room;
import com.board.backend.room.cassandra.repository.RoomRepository;
import com.board.backend.room.dto.CreateRoomDTO;
import com.board.backend.room.dto.RoomMapper;
import com.board.backend.chat.dto.ChatMessageDTO;
import com.board.backend.chat.dto.ChatMessageMapper;
import com.board.backend.drawing.dto.ChangedPixelsDTO;
import com.board.backend.drawing.dto.BoardPixelsMapper;
import com.board.backend.user.UserDTO;
import com.board.backend.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoomFacade {
    private final RoomRepository crudRoomRepositoryOld;
    private final RoomMapper roomMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final BoardPixelsMapper changedPixelsMapper;
    private final PasswordEncoder encoder;
    private final CustomJsonMapper jsonMapper;
    private final SimpMessagingTemplate template;

    public ResponseEntity<?> createRoom(String roomDto) {
        var result = crudRoomRepositoryOld
                .save(new Room(encoder.encode(
                        jsonMapper.toObject(
                                roomDto,
                                CreateRoomDTO.class
                        ).getPassword()))
                );
        if (result == null) {
            return ResponseEntity.badRequest().body("Error creating room");
        } else {
            return ResponseEntity.ok(result.getId().toString());
        }
    }

    public ResponseEntity<?> connectAndGetRoom(UUID id, Principal principal) {
        if (addNewUser(id, PrincipalUtils.extractUserNameFromPrincipal(principal))) {
            var room = crudRoomRepositoryOld.findOne(id);
            if (room == null) {
                log.error("Could not find room with specified ID: " + id + ", user: " + principal.getName());
                return ResponseEntity.badRequest().body("Could not find room with specified ID: "
                        + id + ", user: " + principal.getName());
            } else {
                template.convertAndSend("/topic/room.connected." + id.toString(),
                        new UserDTO(
                                PrincipalUtils.extractUserNameFromPrincipal(principal),
                                UserStatus.CONNECTED
                        )
                );
                return ResponseEntity.ok(roomMapper.toDTO(room));
            }
        }
        log.error("Current user has no access to room with specified id, user: " + principal.getName());
        return ResponseEntity.badRequest().body("Current user has no access to room with specified id");
    }

    public void saveMessage(ChatMessageDTO message, UUID roomId) {
        saveMessage(roomId, chatMessageMapper.toChatMessage(message));
    }

    public void savePixels(ChangedPixelsDTO pixels, UUID roomId) {
        log.debug(pixels.toString());
        template.convertAndSend("/topic/board.listen." + roomId, pixels);
        savePixels(roomId, changedPixelsMapper.toModel(pixels));
    }

    public void disconnectUser(UUID roomId, String username) {
        var room = crudRoomRepositoryOld.findOne(roomId);
        if (room == null) {
            log.info("EMPTY");
            return;
        }
        room.getCurrentUsers().remove(username);
        if (room.getCurrentUsers().isEmpty()) {
            crudRoomRepositoryOld.delete(roomId);
        } else {
            crudRoomRepositoryOld.removeUser(roomId, username);
        }
    }

    private boolean addNewUser(UUID id, String username) {
        return crudRoomRepositoryOld.addNewUser(id, username);
    }

    private void saveMessage(UUID id, String message) {
        crudRoomRepositoryOld.saveMessage(id, message);
    }

    private void savePixels(UUID id, Map<String, String> pixels) {
        crudRoomRepositoryOld.savePixels(id, pixels);
    }
}
