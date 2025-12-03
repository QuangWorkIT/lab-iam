package com.example.iam_service.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;

@Slf4j
@RequiredArgsConstructor
public class LogAuditPublisher implements AuditPublisher {

    private final String TOPIC = "iam-services";
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());


    @Override
    public void publish(AuditEvent event) {
        try {
            String payload = mapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, event.getUserId(), payload);
        } catch (RuntimeException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
