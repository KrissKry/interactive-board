package com.board.backend.room.model.drawing.model;

import lombok.*;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Data
@Component
@Scope(scopeName = "websocket", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class Board {
    private final Short WIDTH = 1280;
    private final Short HEIGHT = 720;

    private Map<String, Long> pixels = new HashMap<>();
    private Long backgroundColor = (long) 0xFFFFFF;

    public Board() {
        initializeBoard();
    }

    private void initializeBoard() {
        for (short i = 0; i< HEIGHT; ++i){
            for (short j = 0; j< WIDTH; ++j){
                pixels.put(i+":"+j, backgroundColor);
            }
        }
    }

    public void savePoints(Map<String, Long> pixels) {
        this.pixels.putAll(pixels);
    }
//    private Map<Point, Color> board = new ConcurrentHashMap<>();
//    private Color background = new Color();
//
//
//    private void initializeBoard() {
//        for (Short i = 0; i< HEIGHT; ++i){
//            for (Short j = 0; j< WIDTH; ++j){
//                board.put(new Point(j, i), background);
//            }
//        }
//    }
}
