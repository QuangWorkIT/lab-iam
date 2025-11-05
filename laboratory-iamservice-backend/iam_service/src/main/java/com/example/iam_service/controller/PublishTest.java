package com.example.iam_service.controller;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.audit.LogAuditPublisher;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@AllArgsConstructor
@RestController
public class PublishTest {

    private final LogAuditPublisher publisher;
    private final AuditPublisher auditPublisher;


    @PostMapping("/publish")
    public void publish(
            @RequestBody AuditEvent event
            ) {
        event.setTimestamp(OffsetDateTime.now());
        publisher.publish(event);
        System.out.println("Sent message success " + event.getActor());
    }
}
