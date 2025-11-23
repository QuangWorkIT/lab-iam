package com.example.notification_service.controller;

import com.example.notification_service.config.LogAuditPublisher;
import com.example.notification_service.dto.ApiResponse;
import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.event.TestOrderCommentEvent;
import com.example.notification_service.serviceImpl.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class NotificationController {
    private final NotificationServiceImpl notificationService;
    private final LogAuditPublisher publisher;

    @GetMapping("/test-order-notifications/{email}")
    public ResponseEntity<ApiResponse<List<TestOrderNotificationDTO>>> getAllNotificationByEmail(
            @PathVariable String email
    ) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse<>("error", "Email is required"));
        }

        List<TestOrderNotificationDTO> notifications = notificationService.getAllNotifyByEmail(email);

        if (notifications.isEmpty()) {
            return ResponseEntity
                    .status(404)
                    .body(new ApiResponse<>(
                            "error",
                            "Notifications not found"
                    ));
        }

        return ResponseEntity
                .ok(new ApiResponse<>(
                        "success",
                        "Notifications found",
                        notifications
                ));
    }

    @PostMapping("/test-notify")
    public String testProducer(
            @RequestBody TestOrderCommentEvent event) {
        publisher.publish(event);

        return "Sent message " + event.getEventId();
    }
}
