package com.board.backend.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class BoardMapper {
    private final ObjectMapper mapper = new ObjectMapper();

    public <T> T toObject(String object, Class<T> clz) {
        T result = null;
        try {
            result = mapper.readValue(object, clz);
        } catch (Exception e) {
            log.info("Object of type: " + clz + " could not be parsed from string to object, exception: " + e);
        }
        return result;
    }

    public <T> String toString(T object) {
        String result = null;
        try {
            result = mapper.writeValueAsString(object);
        } catch (Exception e) {
            log.info("Object could not be parsed to string, exception: " + e);
        }
        return result;
    }
}
