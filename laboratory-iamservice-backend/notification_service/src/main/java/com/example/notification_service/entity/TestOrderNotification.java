package com.example.notification_service.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "TestOrderNotifications")
public class TestOrderNotification {

    @Id
    private String id;
    @Indexed
    private String email;
    private String commentId;
    private String testOrderId;
    private String commentText;
    private String createdFrom;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
