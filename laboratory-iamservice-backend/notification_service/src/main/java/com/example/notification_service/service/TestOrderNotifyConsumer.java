package com.example.notification_service.service;

import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.event.TestOrderCommentEvent;
import com.example.notification_service.repository.TestOrderNotifyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TestOrderNotifyConsumer {
    private final ObjectMapper objMapper;
    private final TestOrderNotifyRepository testOrderRepo;

    @KafkaListener(
            topics = "comment-events-topic",
            groupId = "notification-service"
    )
    public void consumeTestOrderEvent(String message) {
        try{
            TestOrderCommentEvent event = objMapper.readValue(message, TestOrderCommentEvent.class);
            System.out.println("event content " + event.getCommentText());

            TestOrderNotification notification = new TestOrderNotification();
            notification.setEmail(event.getEmail());
            notification.setCommentId(event.getCommentId());
            notification.setCommentText(event.getCommentText());
            notification.setCreatedAt(event.getCreatedAt());
            notification.setCreatedFrom(event.getSourceService());

            testOrderRepo.save(notification);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
