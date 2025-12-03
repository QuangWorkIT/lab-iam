package com.example.notification_service.entity.enums;

import lombok.Getter;

@Getter
public enum NotificationStatus {
    ALERT(1),
    WARNING(2),
    INFO(3);

    private final int code;

    NotificationStatus(int code) {
        this.code = code;
    }

    // Convert from code to enum
    public static NotificationStatus fromCode(int code) {
        return switch (code) {
            case 1 -> ALERT;
            case 2 -> WARNING;
            case 3 -> INFO;
            default -> throw new IllegalArgumentException("Invalid status code: " + code);
        };
    }

    // Convert from string to enum (useful for JSON)
    public static NotificationStatus fromString(String status) {
        if (status == null) return null;
        return switch (status.toUpperCase()) {
            case "ALERT", "1" -> ALERT;
            case "WARNING", "2" -> WARNING;
            case "INFO", "3" -> INFO;
            default -> throw new IllegalArgumentException("Invalid status: " + status);
        };
    }
}
