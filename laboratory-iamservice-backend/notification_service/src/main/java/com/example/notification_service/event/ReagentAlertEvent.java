package com.example.notification_service.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReagentAlertEvent {
    private String type;
    private String reagentName;

    private LocalDate expirationDate;
    private double quantity;
    private int days;
    private String source;
    private String url;
}
