package com.example.iam_service.util;

import com.example.iam_service.entity.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SecurityUtil {
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Unauthenticated access");
        }
        Object principal = auth.getPrincipal();
        if (!(principal instanceof User user)) {
            throw new AccessDeniedException("Invalid principal type");
        }
        return user;
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getUserId();
    }

    public String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    public String getCurrentUserRoleCode() {
        return getCurrentUser().getRoleCode();
    }
}
