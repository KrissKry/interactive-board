package com.board.backend.room;

import com.board.backend.room.cassandra.model.Room;
import com.board.backend.room.cassandra.repository.RoomRepository;
import com.board.backend.room.cassandra.repository.RoomRepositoryOld;
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
    private final RoomRepository roomRepositoryOld;
    private final RoomMapper roomMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final BoardPixelsMapper changedPixelsMapper;
    private final PasswordEncoder encoder;

//    public RoomDTO createRoom(String name, String password) {
//        return roomMapper.toDTO(roomRepository.createRoom(name, password));
//    }

    public RoomDTO createRoom(String password) {
        return roomMapper.toDTO(
                roomRepositoryOld.save(
                        new Room(encoder.encode(password))
                )
        );
    }

    public RoomDTO connectAndGetRoom(UUID id, String username) {
        addNewUser(id, username);
        return roomMapper.toDTO(roomRepositoryOld.findById(id).get()); // TODO handle no meeting
    }

    public void saveMessage(ChatMessageDTO message, UUID roomId) {
        saveMessage(roomId, chatMessageMapper.toChatMessage(message));
    }

    public void savePixels(ChangedPixelsDTO points, UUID roomId) {
        savePixels(roomId, changedPixelsMapper.toModel(points));
    }

    public void disconnectUser(UUID roomId, String username) {
        var room = roomRepositoryOld.findById(roomId).get();
        if (room == null) {
            log.info("EMPTY");
        }
        room.getCurrentUsers().remove(username);
        if (room.getCurrentUsers().isEmpty()) {
            roomRepositoryOld.deleteById(roomId);
        } else {
            roomRepositoryOld.save(room);
        }
    }

    private void addNewUser(UUID id, String username) {
        var room = roomRepositoryOld.findById(id).get();
        room.getCurrentUsers().add(username);
        roomRepositoryOld.save(room);
        if (roomRepositoryOld.findById(id).get().getCurrentUsers() == null) log.info("NULLLLLL");
    }

    private void saveMessage(UUID id, String message) {
        var room = roomRepositoryOld.findById(id).get();
        room.getMessages().add(message);
        roomRepositoryOld.save(room);
    }

    private void savePixels(UUID id, Map<String, Long> pixels) {
        var room = roomRepositoryOld.findById(id).get();
        room.getPixels().putAll(pixels);
        roomRepositoryOld.save(room);
    }
}
