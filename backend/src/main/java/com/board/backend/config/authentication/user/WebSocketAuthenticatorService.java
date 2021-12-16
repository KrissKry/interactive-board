package com.board.backend.config.authentication.user;

import com.board.backend.room.cassandra.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthenticatorService {

    private final PasswordEncoder encoder;
    private final RoomRepository repository;

    // This method MUST return a UsernamePasswordAuthenticationToken instance, the spring security chain is testing it with 'instanceof' later on. So don't use a subclass of it or any other class
    public UsernamePasswordAuthenticationToken getAuthenticatedOrFail(final String username,
                                                                      final String roomId, final String roomPassword) throws AuthenticationException {
        if (username == null || username.trim().isEmpty()) {
            throw new AuthenticationCredentialsNotFoundException("Username was null or empty.");
        }
        if (roomPassword == null || roomPassword.trim().isEmpty()) {
            throw new AuthenticationCredentialsNotFoundException("Password was null or empty.");
        }
        if (!validatePassword(UUID.fromString(roomId), roomPassword)) {
            throw new BadCredentialsException("Bad credentials for user " + username);
        }
        return createAuthenticationToken(username, roomId);
    }

    private UsernamePasswordAuthenticationToken createAuthenticationToken(String username, String roomId) {
        return new UsernamePasswordAuthenticationToken(
                username + "#" + roomId,
                null,
                Collections.singleton((GrantedAuthority) () -> "USER") // MUST provide at least one role
        );
    }

    // TODO implement db fetch

    boolean validatePassword(UUID roomId, String password) {
        return encoder.matches(password, repository.findOne(roomId).getPassword());
    }
}
