package com.board.backend.redis.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatMessageFacade {
    final RedisMessageListenerContainer listenerContainer;
    final ChatMessageSubcsriber subscriber;
    final ChatMessagePublisher publisher;
    final Topics topics;

    public void addListener(ChannelTopic topic) {
        topics.addTopic(topic);
        listenerContainer.addMessageListener(subscriber, topic);
    }

    public void publishMessage(String message) {
        publisher.publish(message);
    }
}
