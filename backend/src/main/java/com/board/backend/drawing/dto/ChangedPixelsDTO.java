package com.board.backend.drawing.dto;

import lombok.Data;

import java.util.List;

@Data
public class ChangedPixelsDTO {
    Color color;
    List<Point> points;
}
