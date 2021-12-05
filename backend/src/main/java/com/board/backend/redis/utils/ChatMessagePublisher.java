package com.board.backend.redis.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatMessagePublisher implements MessagePublisher {
    private final RedisTemplate<String, Object> redisTemplate;
    private final Topics topics;

    public void publish(String message) {
        for(var top: topics.getTopics()) {
            redisTemplate.convertAndSend(top.getTopic(), message);
        }
    }
}
