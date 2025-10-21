package com.example.iam_service.audit;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class AuditEvent {
    private String eventType;
    private String actor;
    private String target;
    private String role;
    private OffsetDateTime timestamp;
    private String details;
}
