package com.board.backend.redis.utils;

import lombok.Data;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Data
public class Topics {
    List<ChannelTopic> topics = new ArrayList<>();

    void addTopic(ChannelTopic topic){
        topics.add(topic);
    }
}
