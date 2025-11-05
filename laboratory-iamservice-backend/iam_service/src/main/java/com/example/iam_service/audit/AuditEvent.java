package com.example.iam_service.audit;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class AuditEvent {
    private String eventType; // change to "type"
    private String actor; // userid
    private String target;
    private String role; // target role
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime timestamp;
    private String details;
    // them field source -> "iam-service"
}
