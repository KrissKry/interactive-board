package com.board.backend.room;

import com.board.backend.room.cassandra.model.Room;
import com.board.backend.room.cassandra.repository.RoomRepository;
import com.board.backend.room.dto.RoomDTO;
import com.board.backend.room.dto.RoomMapper;
import com.board.backend.chat.dto.ChatMessageDTO;
import com.board.backend.chat.dto.ChatMessageMapper;
import com.board.backend.drawing.dto.ChangedPixelsDTO;
import com.board.backend.drawing.dto.BoardPixelsMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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

//    public RoomDTO createRoom(String name, String password) {
//        return roomMapper.toDTO(roomRepository.createRoom(name, password));
//    }

    public RoomDTO createRoom(String password) {
        return roomMapper.toDTO(
                crudRoomRepositoryOld.save(
                        new Room(encoder.encode(password))
                )
        );
    }

    public RoomDTO connectAndGetRoom(UUID id, String username) {
        addNewUser(id, username);
        return roomMapper.toDTO(crudRoomRepositoryOld.findOne(id)); // TODO handle no meeting
    }

    public void saveMessage(ChatMessageDTO message, UUID roomId) {
        saveMessage(roomId, chatMessageMapper.toChatMessage(message));
    }

    public void savePixels(ChangedPixelsDTO points, UUID roomId) {
        savePixels(roomId, changedPixelsMapper.toModel(points));
    }

    public void disconnectUser(UUID roomId, String username) {
        var room = crudRoomRepositoryOld.findOne(roomId);
        if (room == null) {
            log.info("EMPTY");
        }
        room.getCurrentUsers().remove(username);
        if (room.getCurrentUsers().isEmpty()) {
            crudRoomRepositoryOld.delete(roomId);
        } else {
            crudRoomRepositoryOld.save(room);
        }
    }

    private void addNewUser(UUID id, String username) {
        crudRoomRepositoryOld.addNewUser(id, username);
    }

    private void saveMessage(UUID id, String message) {
        crudRoomRepositoryOld.saveMessage(id, message);
    }

    private void savePixels(UUID id, Map<String, Long> pixels) {
        crudRoomRepositoryOld.savePixels(id, pixels);
    }
}
