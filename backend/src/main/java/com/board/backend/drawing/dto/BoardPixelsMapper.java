package com.board.backend.drawing.dto;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class BoardPixelsMapper {

    public Map<String, Long> toModel(ChangedPixelsDTO changedPixels) {
        return changedPixels
                .getPoints()
                .stream()
                .collect(
                        Collectors.toMap(
                                this::pointToString,
                                v -> colorToLong(changedPixels.getColor())
                        )
                );
    }

    public Map<Point, Color> toDTO(Map<String, Long> pixels) {
        if (pixels == null) return new HashMap<>();
        return pixels.entrySet().stream()
                .collect(
                        Collectors.toMap(
                                k -> stringToPoint(k.getKey()),
                                v -> longToColor(v.getValue())
                        )
                );
    }

    private String pointToString(Point point) {
        return point.getX() + ":" + point.getY();
    }

    private Point stringToPoint(String point) {
        return new Point(Short.valueOf(
                point.substring(0, point.lastIndexOf(":"))),
                Short.valueOf(point.substring(point.lastIndexOf(":") + 1))
        );
    }

    private Long colorToLong(Color color) {
        return (long) (((color.getRed() & 0x0ff) << 16) | ((color.getGreen() & 0x0ff) << 8) | (color.getBlue() & 0x0ff));
    }

    private Color longToColor(Long rgb) {
        return Color.builder()
                .red((byte) ((rgb >> 16) & 0x0FF))
                .green((byte) ((rgb >> 8) & 0x0FF))
                .blue((byte) (rgb & 0x0FF)).build();
    }
}
