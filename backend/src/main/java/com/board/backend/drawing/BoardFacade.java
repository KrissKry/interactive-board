package com.board.backend.drawing;

import com.board.backend.drawing.dto.ChangedPixelsDTO;
import com.board.backend.drawing.model.Board;
import com.board.backend.drawing.model.Color;
import com.board.backend.drawing.model.Point;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.stream.Collectors;

@Component
@Data
@RequiredArgsConstructor
@Scope(scopeName = "websocket", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class BoardFacade {

    private final Board board;

    public void storePoints(ChangedPixelsDTO points) {
        for( var point : points.getPoints() ){
            board.getBoard().put(point, points.getColor());
        }
    }

    public Map<Point, Color> getCurrentBoard() {
        return board.getBoard()
                .entrySet()
                .stream()
                .filter(e -> !e.getValue().equals(board.getBackground()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
}
