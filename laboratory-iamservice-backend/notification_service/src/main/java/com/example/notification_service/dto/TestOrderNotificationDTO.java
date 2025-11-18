package com.example.notification_service.dto;

import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.entity.enums.NotificationStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestOrderNotificationDTO {
    // id of test-order
    // maybe optional if it is warehouse msg
    private String typeId;
    private NotificationStatus status;
    private String source;
    private String text;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static TestOrderNotificationDTO toDto(TestOrderNotification testOrderNotification) {
        TestOrderNotificationDTO testDto = new TestOrderNotificationDTO();

        testDto.setTypeId(testOrderNotification.getTestOrderId());
        testDto.setText(testOrderNotification.getCommentText());
        testDto.setSource(testOrderNotification.getCreatedFrom());
        testDto.setStatus(NotificationStatus.INFO);
        testDto.setCreatedAt(testOrderNotification.getCreatedAt());

        return testDto;
    }
}
