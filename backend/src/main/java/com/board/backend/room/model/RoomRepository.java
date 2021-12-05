package com.board.backend.room.model;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RoomRepository {
    Map<Long, Room> rooms = new ConcurrentHashMap<>();
    Long idCounter = 0L;

    public Room createRoom() {
        var room = new Room(++idCounter);
        return saveRoom(room);
    }

    public Room getRoom(Long id) {
        return rooms.get(id);
    }

    public Room saveRoom(Room room) {
        rooms.put(room.getRoomId(), room);
        return room;
    }

    public void saveMessage(Long roomId, String message) {
        rooms.get(roomId).saveMessage(message);
    }

    public List<String> getMessages(Long roomId) {
        return rooms.get(roomId).getMessages();
    }

    public void savePixels(Long roomId, Map<String, Long> points) {
        rooms.get(roomId).savePixels(points);
    }

    public Map<String, Long> getPixels(Long roomId) {
        return rooms.get(roomId).getPixels();
    }
}
