package com.board.backend.room.cassandra.repository;

import com.board.backend.room.cassandra.model.Room;
import com.datastax.oss.driver.api.querybuilder.QueryBuilder;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.cassandra.core.AsyncCassandraTemplate;
import org.springframework.data.cassandra.core.CassandraOperations;
import org.springframework.data.cassandra.core.cql.CqlTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RoomRepositoryOld {

//    private final CqlTemplate cassandraTemplate;
//
//    public void addNewUser(UUID id, String user) {
////        cassandraTemplate.update("UPDATE room SET users = users + " + user + "where id = "+ id);
//        var room = findOne(id);
//        room.getCurrentUsers().add(user);
//        cassandraTemplate.update(room);
//    }
//
//    public void saveMessage(UUID id, String message) {
//        var room = findOne(id);
//        room.getMessages().add(message);
//        cassandraTemplate.update(room);
////        cassandraTemplate.update("UPDATE room SET messages = messages + " + message + "WHERE id = ?", message, id);
//    }
//
//    public void savePixels(UUID id, Map<String, Long> pixels) {
////        StringBuilder query = new StringBuilder("UPDATE room SET pixels = pixels + {");
////        var pixel = pixels.entrySet().iterator();
////        while(pixel.hasNext()) {
////            query.append(convertPixelToString(pixel.next()));
////            if(pixel.hasNext()) {
////                query.append(", ");
////            }
////        }
////        query.append("} where id = ").append(id);
////        cassandraTemplate.update(query.toString());
//
//        var room = findOne(id);
//        room.getPixels().putAll(pixels);
//        cassandraTemplate.update(room);
//    }
//
//    @SneakyThrows
//    public Room findOne(UUID id) {
//        return cassandraTemplate.selectOneById(id, Room.class);
//    }
//
//    @SneakyThrows
//    public Room save(Room room) {
//        return cassandraTemplate.update(room);
//    }
//
//    public void delete(UUID id) {
//        cassandraTemplate.deleteById(id, Room.class);
//    }
//
//    private String convertPixelToString(Map.Entry<String, Long> pixel) {
//        return pixel.getKey() + " : " + pixel.getValue().toString();
//    }
}
