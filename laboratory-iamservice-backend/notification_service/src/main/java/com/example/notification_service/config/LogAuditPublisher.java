package com.example.notification_service.config;

import com.example.notification_service.event.ReagentAlertEvent;
import com.example.notification_service.event.TestOrderCommentEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Component
public class LogAuditPublisher {

    private final String TOPIC = "comment-events-topic";
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper;


    public void publish(TestOrderCommentEvent event) {
        try {
            String payload = mapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, event.getEventId(), payload);
        } catch (RuntimeException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public void publishReagentAlert(ReagentAlertEvent event) {
        try {
            String payload = mapper.writeValueAsString(event);
            kafkaTemplate.send("warehouse-reagent-alert", event.getType() + UUID.randomUUID(), payload);
        } catch (RuntimeException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
