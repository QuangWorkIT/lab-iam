package com.example.iam_service.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
public class LogAuditPublisher implements AuditPublisher {

    private final String TOPIC = "iam-services";
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

//    @Override
//    public void publish(AuditEvent event) {
//        try {
//            String json = mapper.writeValueAsString(event);
//            log.info("AUDIT_EVENT: {}", json);
//        } catch (Exception e) {
//            log.error("Failed to serialize AuditEvent", e);
//        }
//    }

    @Override
    public void publish(AuditEvent event) {
        try {
            String payload = mapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, event.getActor(), payload);
        } catch (RuntimeException | JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
