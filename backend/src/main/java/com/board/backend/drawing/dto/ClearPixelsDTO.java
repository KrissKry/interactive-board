package com.board.backend.drawing.dto;

import lombok.Data;

@Data
public class ClearPixelsDTO {
    private Clear clear;
}

enum Clear {
    RESET;
}
