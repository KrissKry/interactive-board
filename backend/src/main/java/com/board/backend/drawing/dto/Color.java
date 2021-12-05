package com.board.backend.drawing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class Color {
    private byte red, green, blue;
}
