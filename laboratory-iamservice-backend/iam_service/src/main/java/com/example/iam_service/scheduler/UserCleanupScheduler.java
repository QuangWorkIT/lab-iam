package com.example.iam_service.scheduler;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCleanupScheduler {

    private final UserService userService;
    private final AuditPublisher auditPublisher;

    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Ho_Chi_Minh")
    public void runUserDeactivationJob() {
        log.info("🕒 Starting scheduled Patient deletion & anonymization job...");

        long startTime = System.currentTimeMillis();

        try {
            userService.deactivateAndAnonymizeExpiredUsers();
            long duration = System.currentTimeMillis() - startTime;

            log.info("✅ Patient deletion & anonymization job completed successfully in {} ms.", duration);

        } catch (Exception e) {
            log.error("❌ Patient deletion & anonymization job FAILED: {}", e.getMessage(), e);
            auditPublisher.publish(AuditEvent.builder()
                    .eventType("SYSTEM_JOB_FAILURE")
                    .actor("System Scheduler")
                    .role("SYSTEM")
                    .timestamp(OffsetDateTime.now())
                    .details("Patient deletion & anonymization job failed with error: " + e.getMessage())
                    .build());
        }
    }
}
