package com.board.backend.room.dto;

import com.board.backend.room.model.chat.dto.ChatMessageDTO;
import com.board.backend.room.model.drawing.dto.Color;
import com.board.backend.room.model.drawing.dto.Point;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class RoomDTO {
    private String roomId;
    private String roomName;
    private List<ChatMessageDTO> messages;
    private Map<Point, Color> pixels;
}