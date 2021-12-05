package com.board.backend.chat.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Chat {
    private List<String> messages = new ArrayList<>();
    public void saveMessage(String message) {
        messages.add(message);
    }
}
