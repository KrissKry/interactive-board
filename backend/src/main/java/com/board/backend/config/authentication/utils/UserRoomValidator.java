package com.board.backend.config.authentication.utils;

import com.board.backend.config.PrincipalUtils;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.UUID;

@Component
public class UserRoomValidator {

    public static boolean validate(Principal principal, UUID roomId) {
        return PrincipalUtils.extractRoomIdFromPrincipal(principal).equals(roomId.toString());
    }
}
