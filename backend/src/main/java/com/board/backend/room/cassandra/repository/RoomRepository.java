package com.board.backend.room.cassandra.repository;

import com.board.backend.room.cassandra.model.Room;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.cassandra.core.cql.AsyncCqlTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RoomRepository {

    private final AsyncCqlTemplate cassandraTemplate;
    private final CrudRoomRepository crudRoomRepository;

    public void addNewUser(UUID id, String user) {
        cassandraTemplate.execute("UPDATE room SET users = users + " + user + "where id = " + id);
    }

    public void saveMessage(UUID id, String message) {
        cassandraTemplate.execute("UPDATE room SET messages = messages + " + message + "WHERE id = ?", message, id);
    }

    public void savePixels(UUID id, Map<String, Long> pixels) {
        StringBuilder query = new StringBuilder("UPDATE room SET pixels = pixels + {");
        var pixel = pixels.entrySet().iterator();
        while (pixel.hasNext()) {
            query.append(convertPixelToString(pixel.next()));
            if (pixel.hasNext()) {
                query.append(", ");
            }
        }
        query.append("} where id = ").append(id);
        cassandraTemplate.execute(query.toString());
    }

    @SneakyThrows
    public Room findOne(UUID id) {
        return crudRoomRepository.findById(id).get();
    }

    @SneakyThrows
    public Room save(Room room) {
        return crudRoomRepository.save(room);
    }

    public void delete(UUID id) {
        crudRoomRepository.deleteById(id);
    }

    private String convertPixelToString(Map.Entry<String, Long> pixel) {
        return pixel.getKey() + " : " + pixel.getValue().toString();
    }
}
