package com.board.backend.room.model.chat.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class Chat {
    private List<String> messages = new ArrayList<>();
    public void saveMessage(String message) {
        messages.add(message);
    }
}
