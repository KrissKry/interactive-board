package com.board.backend.room.model.chat.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class ChatMessageMapper {

    ObjectMapper mapper = new ObjectMapper();
    public List<ChatMessageDTO> toDTO(List<String> messages) {
        return messages.stream().map(m -> {
            try {
                return mapper.readValue(m, ChatMessageDTO.class);
            } catch (JsonProcessingException e) {
                log.error("Chat message parsing failed" + Arrays.toString(e.getStackTrace()));
            }
            return null;
        }).collect(Collectors.toList());
    }

    public String toChatMessage(ChatMessageDTO messageDTO) {
        try {
            return mapper.writeValueAsString(messageDTO);
        } catch (JsonProcessingException e) {
            log.error("Chat message parsing failed" + Arrays.toString(e.getStackTrace()));
        }
        return null;
    }
}
