package com.board.backend.redis.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisConfig {
    @Bean
    MessageListenerAdapter messageListener() {
        return new MessageListenerAdapter(new ChatMessageSubcsriber());
    }

    @Bean
    RedisMessageListenerContainer redisContainer(RedisConnectionFactory factory) {
        RedisMessageListenerContainer container
                = new RedisMessageListenerContainer();
        container.setConnectionFactory(factory);
        return container;
    }

    @Bean
    RedisTemplate<String, Object> template(RedisConnectionFactory connectionFactory) {
        var res = new RedisTemplate<String, Object>();
        res.setConnectionFactory(connectionFactory);
        return res;
    }

    @Bean
    ChannelTopic topic() {
        return new ChannelTopic("test");
    }
}
