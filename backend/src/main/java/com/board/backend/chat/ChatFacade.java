package com.board.backend.chat;

import com.board.backend.chat.model.Chat;
import com.board.backend.chat.model.Message;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Data
@RequiredArgsConstructor
@Scope(scopeName = "websocket", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ChatFacade {

    private final Chat chat;

    public void saveMessage(Message message) {
        chat.saveMessage(message);
    }

    public List<Message> getMessages() {
        return chat.getMessages();
    }
}
