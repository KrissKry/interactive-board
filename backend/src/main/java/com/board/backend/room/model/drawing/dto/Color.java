package com.board.backend.room.model.drawing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class Color {
    private byte red, green, blue;
    public Color() {
        this((byte) 255,(byte) 255, (byte) 255 );
    }
}
