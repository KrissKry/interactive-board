package com.board.backend.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.codehaus.jackson.annotate.JsonProperty;

@Data
@Builder
@AllArgsConstructor
//TODO add timestamp/localdate
public class ChatMessageDTO {
    @JsonProperty("text")
    private String text;
    @JsonProperty("username")
    private String username;

    public ChatMessageDTO() {
    }
}
