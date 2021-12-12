package com.board.backend.chat.dto;

import com.board.backend.config.BoardMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class ChatMessageMapper {

    private final BoardMapper mapper;

    public List<ChatMessageDTO> toDTO(List<String> messages) {
        if (messages == null) return new ArrayList<>();
        return messages
                .stream()
                .map(m -> mapper.toObject(m, ChatMessageDTO.class))
                .collect(Collectors.toList());
    }

    public String toChatMessage(ChatMessageDTO messageDTO) {
        return mapper.toString(messageDTO);
    }
}
