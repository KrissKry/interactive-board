package com.board.backend.redis.utils;

public interface MessagePublisher {
    void publish(String message);
}

