package com.board.backend.room.cassandra.repository;

import com.board.backend.room.cassandra.model.Room;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
interface CrudRoomRepository extends CrudRepository<Room, UUID> {
}
