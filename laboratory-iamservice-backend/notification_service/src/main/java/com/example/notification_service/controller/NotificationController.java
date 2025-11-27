package com.example.notification_service.controller;

import com.example.notification_service.config.LogAuditPublisher;
import com.example.notification_service.dto.ApiResponse;
import com.example.notification_service.dto.ReagentAlertNotificationDTO;
import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.event.ReagentAlertEvent;
import com.example.notification_service.event.TestOrderCommentEvent;
import com.example.notification_service.serviceImpl.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
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

        List<TestOrderNotificationDTO> notifications = notificationService.getAllTestOrderNotifyByEmail(email);

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

    @GetMapping("/reagent/alerts")
    public ResponseEntity<ApiResponse<List<ReagentAlertNotificationDTO>>> getAllReagentNotification() {
        List<ReagentAlertNotificationDTO> reagentList = notificationService.findAllReagentNotification();

        if(reagentList.isEmpty()) {
            return ResponseEntity
                    .status(404)
                    .body(new ApiResponse<>(
                            "error",
                            "Reagent notifications not found"
                    ));
        }

        return ResponseEntity
                .ok(new ApiResponse<>(
                        "success",
                        "Notifications found",
                        reagentList
                ));
    }

    @PostMapping("/test-notify")
    public String testProducer(
            @RequestBody TestOrderCommentEvent event) {
        publisher.publish(event);

        return "Sent message " + event.getEventId();
    }

    @PostMapping("/reagent-notify")
    public String reagentProducer(
            @RequestBody ReagentAlertEvent event) {
        publisher.publishReagentAlert(event);

        return "Sent message " + event.getReagentName() + " quantity: " + event.getQuantity();
    }
}
