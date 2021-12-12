package com.board.backend.chat.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
public class ChatMessageMapper {

    ObjectMapper mapper = new ObjectMapper();

    public List<ChatMessageDTO> toDTO(List<String> messages) {
        if (messages == null) return new ArrayList<>();
        return messages.stream().map(m -> {
            ChatMessageDTO x = new ChatMessageDTO(null, null);
            try {
                log.info("outbound mapper: " + m);
                x = mapper.readValue(m, ChatMessageDTO.class);
            } catch (Exception e) {
                log.info("Chat message parsing failed" + e.toString());
            }
            return x;
        }).collect(Collectors.toList());
    }

    public String toChatMessage(ChatMessageDTO messageDTO) {
        try {
            return mapper.writeValueAsString(messageDTO);
        } catch (JsonProcessingException e) {
            log.info("Chat message parsing failed" + Arrays.toString(e.getStackTrace()));
        }
        return null;
    }
}
