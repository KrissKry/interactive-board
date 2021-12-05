package com.board.backend.room.dto;

import com.board.backend.room.model.Room;
import com.board.backend.chat.dto.ChatMessageMapper;
import com.board.backend.drawing.dto.BoardPixelsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomMapper {
    private final BoardPixelsMapper boardPixelsMapper;
    private final ChatMessageMapper chatMessageMapper;

    public RoomDTO toDTO(Room room) {
        return RoomDTO
            .builder()
            .roomId(room.getRoomId().toString())
            .roomName(room.getRoomName())
            .pixels(boardPixelsMapper.toDTO(room.getPixels()))
            .messages(chatMessageMapper.toDTO(room.getMessages()))
            .build();
    }
}

