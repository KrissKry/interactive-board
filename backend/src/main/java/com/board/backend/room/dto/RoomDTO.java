package com.board.backend.room.dto;

import com.board.backend.chat.dto.ChatMessageDTO;
import com.board.backend.drawing.dto.Color;
import com.board.backend.drawing.dto.Pixel;
import com.board.backend.drawing.dto.Point;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class RoomDTO {
    private String roomId;
    private List<String> currentUsers;
    private List<ChatMessageDTO> messages;
    private List<Pixel> pixels;
    private Long created;
    private Long lastUpdated;
}
