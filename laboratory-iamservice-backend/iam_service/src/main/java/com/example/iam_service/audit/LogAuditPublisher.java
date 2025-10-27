package com.example.iam_service.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
public class LogAuditPublisher implements AuditPublisher {

    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Override
    public void publish(AuditEvent event) {
        try {
            String json = mapper.writeValueAsString(event);
            log.info("AUDIT_EVENT: {}", json);
        } catch (Exception e) {
            log.error("Failed to serialize AuditEvent", e);
        }
    }
}
