package com.example.iam_service.audit;

public interface AuditPublisher {
    void publish(AuditEvent event);
}
