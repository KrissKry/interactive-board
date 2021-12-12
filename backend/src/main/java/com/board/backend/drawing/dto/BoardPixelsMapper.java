package com.board.backend.drawing.dto;

import com.board.backend.config.BoardMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class BoardPixelsMapper {

    private final BoardMapper mapper;

    public Map<String, String> toModel(ChangedPixelsDTO changedPixels) {
        return changedPixels
                .getPoints()
                .stream()
                .collect(
                        Collectors.toMap(
                                mapper::toString,
                                e -> mapper.toString(changedPixels.getColor())
                        )
                );
    }

    public List<Pixel> toDTO(Map<String, String> pixels) {
        if (pixels == null) return new ArrayList<>();
        return pixels
                .entrySet()
                .stream()
                .map(e -> new Pixel(
                                mapper.toObject(e.getKey(), Point.class),
                                mapper.toObject(e.getValue(), Color.class)
                        )
                )
                .collect(Collectors.toList());
    }
}
