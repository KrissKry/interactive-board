package com.board.backend.drawing.mapper;

import com.board.backend.drawing.dto.ChangedPixelsDTO;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageToPixelsMapper {

    private final Gson mapper;
    public ChangedPixelsDTO mapMessageToPixels (String message) {
        return mapper.fromJson(message, ChangedPixelsDTO.class);
    }
}
