package com.board.backend.room.model.drawing.dto;

import org.springframework.stereotype.Component;

import java.util.List;
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
                        v->colorToLong(changedPixels.getColor())
                    )
                );
    }

    public Map<Point, Color> toDTO(Map<String, Long> pixels) {
        return pixels.entrySet().stream()
                .collect(
                    Collectors.toMap(
                        k -> stringToPoint(k.getKey()),
                        v->longToColor(v.getValue())
                    )
                );
    }

    private String pointToString(Point point) {
        return point.getX() + ":" + point.getY();
    }

    private Point stringToPoint(String point) {
        return new Point(Short.valueOf(
            point.substring(0, point.lastIndexOf(":"))),
            Short.valueOf(point.substring(point.lastIndexOf(":") +1))
        );
    }

    private Long colorToLong(Color color) {
        int rgb = color.getRed();
        rgb = (rgb << 8) + color.getGreen();
        rgb = (rgb << 8) + color.getBlue();
        return (long) rgb;
    }

    private Color longToColor(Long rgb) {
        return Color.builder()
            .red((byte) ((rgb >> 16) & 0xFF))
            .green((byte)((rgb >> 8) & 0xFF))
            .blue((byte)(rgb & 0xFF)).build();
    }
}
