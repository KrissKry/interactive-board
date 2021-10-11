package com.board.backend.chat;

import com.board.backend.chat.model.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatFacade chatFacade;

    @SubscribeMapping("/chat/get")
    public List<Message> initChat() {
        return chatFacade.getMessages();
    }

    @MessageMapping("/chat/send")
    @SendTo("/chat/listen")
    public String sendMessage(@Payload String message) {
        var mes = new Message();
        mes.setText(message);
        chatFacade.saveMessage(mes);
        return message;
    }
}
