package com.board.backend.drawing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Pixel {
    Point point;
    Color color;
}
