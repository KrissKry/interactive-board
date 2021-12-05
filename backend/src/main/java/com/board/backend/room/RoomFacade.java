package com.board.backend.room;

import com.board.backend.room.dto.RoomDTO;
import com.board.backend.room.dto.RoomMapper;
import com.board.backend.room.model.RoomRepository;
import com.board.backend.room.model.chat.dto.ChatMessageDTO;
import com.board.backend.room.model.chat.dto.ChatMessageMapper;
import com.board.backend.room.model.drawing.dto.ChangedPixelsDTO;
import com.board.backend.room.model.drawing.dto.BoardPixelsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RoomFacade {
    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final BoardPixelsMapper changedPixelsMapper;

    public RoomDTO createRoom(String name, String password) {
        return roomMapper.toDTO(roomRepository.createRoom(name, password));
    }

    public RoomDTO getRoom(Long id) {
        return roomMapper.toDTO(roomRepository.getRoom(id));
    }

    public void saveMessage(ChatMessageDTO message, Long roomId) {
        roomRepository.saveMessage(roomId, chatMessageMapper.toChatMessage(message));
    }

    public List<ChatMessageDTO> getMessages(Long roomId) {
        return chatMessageMapper.toDTO(roomRepository.getMessages(roomId));
    }

    public void savePixels(ChangedPixelsDTO points, Long roomId) {
        roomRepository.savePixels(roomId, changedPixelsMapper.toModel(points));
    }
}
