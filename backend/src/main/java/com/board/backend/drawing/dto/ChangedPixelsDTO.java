package com.board.backend.drawing.dto;

import com.board.backend.drawing.model.Color;
import com.board.backend.drawing.model.Point;
import lombok.Data;

import java.util.List;

@Data
public class ChangedPixelsDTO {
    Color color;
    List<Point> points;
    Long userId;
}
