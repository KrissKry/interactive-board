package com.board.backend.room.cassandra.model;

import com.datastax.oss.driver.api.core.type.DataType;
import com.datastax.oss.protocol.internal.ProtocolConstants;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.CassandraType;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.*;

@Table
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    @PrimaryKey
    @CassandraType(type = CassandraType.Name.UUID)
    private UUID id;
    private String password;
    private Date created;
    private Date lastUpdated;
    @CassandraType(type = CassandraType.Name.LIST, typeArguments = {CassandraType.Name.TEXT})
    List<String> currentUsers;
    @CassandraType(type = CassandraType.Name.MAP, typeArguments = {CassandraType.Name.TEXT, CassandraType.Name.TEXT})
    Map<String, Long> pixels;
    ;
    @CassandraType(type = CassandraType.Name.LIST, typeArguments = {CassandraType.Name.TEXT})
    List<String> messages;

    public Room(String password) {
        this.id = UUID.randomUUID();
        this.password = password;
        this.created = new Date(System.currentTimeMillis());
        this.lastUpdated = new Date(System.currentTimeMillis());
    }
}
