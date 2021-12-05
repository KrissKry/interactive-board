package com.board.backend.redis;

import com.board.backend.redis.utils.ChatMessageFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {
    private final ChatMessageFacade facade;
    private int counter = 0;

    @GetMapping("/test")
    void sendMessage() {
        facade.addListener(new ChannelTopic("test"+counter));
        for(int i = 0; i<= counter; ++i) facade.publishMessage("test");
    }
}
