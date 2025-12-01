package com.example.notification_service.dto;

import com.example.notification_service.entity.ReagentAlertNotification;

import com.example.notification_service.entity.enums.NotificationStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReagentAlertNotificationDTO {
    private String typeId;
    private NotificationStatus status;
    private String source;
    private String text;
    private double quantity;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static ReagentAlertNotificationDTO toDto(ReagentAlertNotification reagentNotification) {
        ReagentAlertNotificationDTO reagentDto = new ReagentAlertNotificationDTO();

        String typeId = reagentNotification.getId() == null ? UUID.randomUUID().toString() : reagentNotification.getId();
        reagentDto.setTypeId(typeId);
        reagentDto.setStatus(NotificationStatus.WARNING);
        reagentDto.setSource("Warehouse service");
        reagentDto.setQuantity(reagentNotification.getQuantity());
        reagentDto.setCreatedAt(reagentNotification.getCreatedAt());
        reagentDto.setText(reagentNotification.getAlertText());

        return reagentDto;
    }
}
