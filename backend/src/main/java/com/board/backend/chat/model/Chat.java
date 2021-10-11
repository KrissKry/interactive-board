package com.board.backend.chat.model;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Data
@Component
public class Chat {
    private List<Message> messages = new ArrayList<>();

    public void saveMessage(Message message) {
        messages.add(message);
    }
}
