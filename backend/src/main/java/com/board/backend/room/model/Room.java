package com.board.backend.room.model;

import com.board.backend.room.model.chat.model.Chat;
import com.board.backend.room.model.drawing.model.Board;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class Room {
    private Long roomId;
    private String roomName;
    private String password;
    private Chat chat;
    private Board board;

    public Room(Long id, String name, String password) {
        roomId = id;
        chat = new Chat();
        board = new Board();
        roomName = name;
        this.password = password;
    }

    public void saveMessage(String message) {
        chat.saveMessage(message);
    }

    public List<String> getMessages() {
        return chat.getMessages();
    }

    public void savePixels(Map<String, Long> pixels) {
        board.savePoints(pixels);
    }

    public Map<String, Long> getPixels() {
        return board.getPixels();
    }
}
