package com.example.iam_service.audit;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class AuditEvent {
    private String type; // change to "type"
    private String userId; // userid
    private String target;
    private String targetRole; // target role
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime timestamp;
    private String details;
    @Builder.Default
    private String source = "iam-services";
}
