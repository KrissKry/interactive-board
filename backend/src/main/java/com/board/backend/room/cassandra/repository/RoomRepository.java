package com.board.backend.room.cassandra.repository;

import com.board.backend.room.cassandra.model.Room;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.cassandra.core.cql.AsyncCqlTemplate;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Component
@Slf4j
@RequiredArgsConstructor
public class RoomRepository {

    private final AsyncCqlTemplate cassandraTemplate;
    private final CrudRoomRepository crudRoomRepository;

    public boolean addNewUser(UUID id, String user) {
        try {
            cassandraTemplate.execute("UPDATE room SET currentUsers = currentUsers + ['" + user + "'], " +
                    "lastUpdated = " + new Date(System.currentTimeMillis()).getTime() + " WHERE id = " + id).get();
            return true;
        } catch (Exception e) {
            log.info(e.toString());
            return false;
        }
    }

    public void removeUser(UUID id, String user) {
        try {
            cassandraTemplate.execute("UPDATE room SET currentUsers = currentUsers - ['" + user + "'], " +
                    "lastUpdated = " + new Date(System.currentTimeMillis()).getTime() + " WHERE id = " + id).get();
        } catch (Exception e) {
            log.info(e.toString());
        }
    }

    public void saveMessage(UUID id, String message) {
        try {
            // log.info(message);
            cassandraTemplate.execute("UPDATE room SET messages = messages + ['" + message + "'], " +
                    "lastUpdated = " + new Date(System.currentTimeMillis()).getTime() + " WHERE id = " + id).get();
        } catch (Exception e) {
            log.info(e.toString());
        }
    }

    public void savePixels(UUID id, Map<String, String> pixels) {
        StringBuilder query = new StringBuilder("UPDATE room SET pixels = pixels + {");
        var pixel = pixels.entrySet().iterator();
        while (pixel.hasNext()) {
            query.append(convertPixelToString(pixel.next()));
            if (pixel.hasNext()) {
                query.append(", ");
            }
        }
        query
                .append("}, lastUpdated = ")
                .append(new Date(System.currentTimeMillis()).getTime())
                .append(" where id = ").append(id);

        try {
            var x = cassandraTemplate.execute(query.toString()).get();
        } catch (InterruptedException | ExecutionException e) {
            log.info(e.toString());
        }
    }

    public void clearRoomPixels(UUID roomId) {
        var room = crudRoomRepository.findById(roomId).orElse(null);
        if (room != null) {
            room.setPixels(new HashMap<>());
            crudRoomRepository.save(room);
        }
    }

    @SneakyThrows
    public Room findOne(UUID id) {
        return crudRoomRepository.findById(id).orElse(null);
    }

    @SneakyThrows
    public Room save(Room room) {
        return crudRoomRepository.save(room);
    }

    public void delete(UUID id) {
        crudRoomRepository.deleteById(id);
    }

    private String convertPixelToString(Map.Entry<String, String> pixel) {
        return "'" + pixel.getKey() + "' : '" + pixel.getValue() + "'";
    }
}
