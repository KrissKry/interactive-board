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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RoomFacade {
    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final BoardPixelsMapper changedPixelsMapper;
    private final PasswordEncoder encoder;

//    public RoomDTO createRoom(String name, String password) {
//        return roomMapper.toDTO(roomRepository.createRoom(name, password));
//    }

    public RoomDTO createRoom(String user, String password) {
        return roomMapper.toDTO(
            roomRepository.save(
                new Room(user, encoder.encode(password))
            )
        );
    }

    public RoomDTO connectAndGetRoom(UUID id, String username) {
        roomRepository.addNewUser(id, username);
        return roomMapper.toDTO(roomRepository.findOne(id)); // TODO handle no meeting
    }

    public void saveMessage(ChatMessageDTO message, UUID roomId) {
        roomRepository.saveMessage(roomId, chatMessageMapper.toChatMessage(message));
    }

    public void savePixels(ChangedPixelsDTO points, UUID roomId) {
        roomRepository.savePixels(roomId, changedPixelsMapper.toModel(points));
    }

    public void disconnectUser(UUID roomId, String username) {
        var room = roomRepository.findOne(roomId);
        room.getCurrentUsers().remove(username);
        if (room.getCurrentUsers().isEmpty()) {
            roomRepository.delete(roomId);
        }
        else {
            roomRepository.save(room);
        }
    }
}
