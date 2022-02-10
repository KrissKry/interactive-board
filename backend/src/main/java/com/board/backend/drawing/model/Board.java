package com.board.backend.drawing.model;

import lombok.*;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
@Component
@Scope(scopeName = "websocket", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class Board {
    private final Short WIDTH = 1280;
    private final Short HEIGHT = 720;
    private Map<Point, Color> board = new ConcurrentHashMap<>();
    private Color background = new Color();

    public Board() {
        initializeBoard();
    }

    private void initializeBoard() {
        for (Short i = 0; i< HEIGHT; ++i){
            for (Short j = 0; j< WIDTH; ++j){
                board.put(new Point(j, i), background);
            }
        }
    }
}
