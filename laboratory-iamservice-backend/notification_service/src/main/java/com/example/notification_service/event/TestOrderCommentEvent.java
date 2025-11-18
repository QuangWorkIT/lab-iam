package com.example.notification_service.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestOrderCommentEvent {
    private String eventId;
    private String eventType;
    private String sourceService;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private String eventTimestamp;
    private String commentId;
    private String testOrderId;
    private String email;
    private String commentText;
    private String createdBy;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
