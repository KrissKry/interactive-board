package com.board.backend.user;

import lombok.Data;

@Data
public class UserDTO {
    private String name;
    private String status;

    public UserDTO(String name, UserStatus status) {
        this.name = name;
        this.status = status.toString();
    }
}
