package com.example.notification_service.service;

import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.dto.UserDTO;
import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.event.TestOrderCommentEvent;
import com.example.notification_service.repository.TestOrderNotifyRepository;
import com.example.notification_service.serviceImpl.IamServiceImpl;
import com.example.notification_service.serviceImpl.WebSocketServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotifyConsumer {
    private final ObjectMapper objMapper;
    private final TestOrderNotifyRepository testOrderRepo;
    private final WebSocketServiceImpl webSocketService;
    private final IamServiceImpl iamService;
    private final String DESTINATION = "/topic/notification/";

    @KafkaListener(
            topics = "comment-events-topic",
            groupId = "notification-service"
    )
    public void consumeTestOrderEvent(String message) {
        try {
            TestOrderCommentEvent event = objMapper.readValue(message, TestOrderCommentEvent.class);
            System.out.println("event content " + event.getCommentText());

            // Save notifications
            TestOrderNotification notification = new TestOrderNotification();
            notification.setEmail(event.getEmail());
            notification.setCommentId(event.getCommentId());
            notification.setCommentText(event.getCommentText());
            notification.setCreatedAt(event.getCreatedAt());
            notification.setCreatedFrom(event.getSourceService());
            notification.setTestOrderId(event.getTestOrderId());

            UserDTO userFound = iamService.findUserByEmail(event.getEmail());
            if (userFound != null) {
                webSocketService.sendNotification(
                        DESTINATION + userFound.getEmail(),
                        TestOrderNotificationDTO.toDto(notification)
                );
                testOrderRepo.save(notification);
                System.out.println("User found save notification");
            }else{
                System.out.println("User not found");
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
