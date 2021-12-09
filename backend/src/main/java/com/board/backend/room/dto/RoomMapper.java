package com.board.backend.room.dto;

import com.board.backend.chat.dto.ChatMessageMapper;
import com.board.backend.drawing.dto.BoardPixelsMapper;
import com.board.backend.room.cassandra.model.Room;
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
                .roomId(room.getId().toString())
                .pixels(boardPixelsMapper.toDTO(room.getPixels()))
                .messages(chatMessageMapper.toDTO(room.getMessages()))
                .build();
    }
}

