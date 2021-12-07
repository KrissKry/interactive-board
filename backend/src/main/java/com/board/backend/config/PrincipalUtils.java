package com.board.backend.config;

import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class PrincipalUtils {

    public static String extractUserNameFromPrincipal(Principal principal) {
        return principal.getName().substring(0, principal.getName().lastIndexOf("#"));
    }

    public static String extractRoomIdFromPrincipal(Principal principal) {
        return principal.getName().substring(principal.getName().lastIndexOf("#")+1);
    }
}
