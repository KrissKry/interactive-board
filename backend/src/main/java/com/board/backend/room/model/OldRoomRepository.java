package com.board.backend.room.model;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OldRoomRepository {
    Map<Long, Room> rooms = new ConcurrentHashMap<>();
    Long idCounter = 0L;

    public Room createRoom(String name, String password) {
        var room = new Room(++idCounter, name, password);
        return saveRoom(room);
    }

    public void removeRoom(Long id) {
        rooms.remove(id);
    }

    public boolean findRoom(Long id, String password) {
        return rooms.get(id).getPassword().equals(password);
    }

    public Room getRoom(Long id) {
        return rooms.get(id);
    }

    public void addNewUser(Long id, String username) {
        rooms.get(id).getUsers().add(username);
    }

    public Room saveRoom(Room room) {
        rooms.put(room.getRoomId(), room);
        return room;
    }

    public void saveMessage(UUID roomId, String message) {
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
