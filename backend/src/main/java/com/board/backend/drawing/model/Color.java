package com.board.backend.drawing.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
public class Color {
    private byte red, green, blue;
    public Color() {
        this((byte) 255,(byte) 255, (byte) 255 );
    }
}
