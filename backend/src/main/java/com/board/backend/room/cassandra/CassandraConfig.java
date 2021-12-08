package com.board.backend.room.cassandra;

import com.datastax.oss.driver.api.core.CqlSession;
import org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.cassandra.core.AsyncCassandraTemplate;
import org.springframework.data.cassandra.repository.config.EnableCassandraRepositories;

@Configuration
@EnableCassandraRepositories(basePackages="com.board.backend.room.cassandra.repository")
public class CassandraConfig extends CassandraAutoConfiguration {

    @Bean
    AsyncCassandraTemplate asyncCassandraTemplate(CqlSession session) {
        return new AsyncCassandraTemplate(session);
    }
}
