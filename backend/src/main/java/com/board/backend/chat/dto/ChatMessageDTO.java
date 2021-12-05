package com.board.backend.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
//TODO add timestamp/localdate
public class ChatMessageDTO {
    private String text;
    private String username;
}
