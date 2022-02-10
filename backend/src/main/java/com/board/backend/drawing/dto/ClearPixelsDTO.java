package com.board.backend.drawing.dto;

import lombok.Data;

@Data
public class ClearPixelsDTO {
    private Clear type = Clear.RESET;
}

enum Clear {
    RESET;
}
