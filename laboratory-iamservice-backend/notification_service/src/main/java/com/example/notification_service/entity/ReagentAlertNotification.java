package com.example.notification_service.entity;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "ReagentNotification")
public class ReagentAlertNotification {

    @Id
    private String id;
    @Indexed
    private String reagentName;
    private double quantity;
    private String alertText;
    private String createdFrom;
    private String url;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
