package com.board.backend.authentication.user;

import lombok.Data;

import java.security.Principal;

@Data
public class User implements Principal {
    private final String name;
    private final String roomId;
    private final String roomPassword;
}
