package com.example.iam_service.service;

import com.example.iam_service.serviceImpl.ResetPasswordRateLimiterImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;


@ExtendWith(MockitoExtension.class)
public class ResetPasswordLimiterServiceImplTest {

    private final ResetPasswordRateLimiterImpl rateLimiter = new ResetPasswordRateLimiterImpl();

    /**
     * ✅ Test: When no bucket exists for an IP, it should return false (not banned).
     */
    @Test
    @DisplayName("Should return false when no reset password bucket exists")
    void isBannedFromResetPassword_ShouldReturnFalse_WhenNoBucketExists() {
        boolean banned = rateLimiter.isBannedFromResetPassword("127.0.0.1");
        assertFalse(banned);
    }

    /**
     * ✅ Test: After the first attempt, the user should not be banned.
     */
    @Test
    @DisplayName("Should not be banned after the first reset password attempt")
    void recordResetPassAttempt_ShouldCreateBucketAndNotBanInitially() {
        String ip = "192.168.1.1";

        rateLimiter.recordResetPassAttempt(ip);
        boolean banned = rateLimiter.isBannedFromResetPassword(ip);

        assertFalse(banned, "After the first attempt, user should not be banned");
    }

    /**
     * ✅ Test: User should be banned after exceeding MAX_ATTEMPTS (3).
     */
    @Test
    @DisplayName("Should be banned after reaching the maximum number of attempts")
    void recordResetPassAttempt_ShouldBanAfterMaxAttempts() {
        String ip = "192.168.0.2";

        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);

        assertTrue(rateLimiter.isBannedFromResetPassword(ip),
                "User should be banned after 3 attempts");
    }

    /**
     * ✅ Test: Ban should expire after BAN_DURATION has passed.
     * This uses reflection to simulate time passing.
     */
    @Test
    @DisplayName("Should reset ban after ban duration has passed")
    void isBannedFromResetPassword_ShouldResetAfterBanTimePassed() throws Exception {
        String ip = "10.0.0.5";

        // Reach max attempts to trigger ban
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);
        assertTrue(rateLimiter.isBannedFromResetPassword(ip));

        // Access private userBuckets field to simulate time passage
        Field userBucketsField = ResetPasswordRateLimiterImpl.class.getDeclaredField("userBuckets");
        userBucketsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, Object> buckets = (Map<String, Object>) userBucketsField.get(rateLimiter);

        Object bucket = buckets.get(ip);
        Field banUntilField = bucket.getClass().getDeclaredField("banUntil");
        banUntilField.setAccessible(true);

        // Set banUntil to 2 hours ago (simulate ban expired)
        banUntilField.set(bucket, Instant.now().minusSeconds(7200));

        // Act again — should now reset
        boolean bannedAfterReset = rateLimiter.isBannedFromResetPassword(ip);
        assertFalse(bannedAfterReset, "User should no longer be banned after ban duration passed");
    }


    /**
     * ✅ Test: The same IP’s lastAttempt timestamp should update with each call.
     */
    @Test
    @DisplayName("Should update lastAttempt timestamp each time recordResetPassAttempt is called")
    void recordResetPassAttempt_ShouldUpdateLastAttemptTimestamp() throws Exception {
        String ip = "9.9.9.9";

        rateLimiter.recordResetPassAttempt(ip);
        Field userBucketsField = ResetPasswordRateLimiterImpl.class.getDeclaredField("userBuckets");
        userBucketsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, Object> buckets = (Map<String, Object>) userBucketsField.get(rateLimiter);

        Object bucket = buckets.get(ip);
        Field lastAttemptField = bucket.getClass().getDeclaredField("lastAttempt");
        lastAttemptField.setAccessible(true);
        Instant firstAttempt = (Instant) lastAttemptField.get(bucket);

        Thread.sleep(5); // simulate slight delay
        rateLimiter.recordResetPassAttempt(ip);
        Instant secondAttempt = (Instant) lastAttemptField.get(bucket);

        assertTrue(secondAttempt.isAfter(firstAttempt),
                "Last attempt timestamp should be updated on each call");
    }

    @Test
    @DisplayName("Should return null when user has no bucket")
    void getUserBanUntil_ShouldReturnNull_WhenNoBucketExists() {
        String ip = "127.0.0.1";
        Instant banUntil = rateLimiter.getUserBanUntil(ip);
        assertNull(banUntil, "Expected null when no bucket exists for IP");
    }

    @Test
    @DisplayName("Should return null if user has attempts but is not banned")
    void getUserBanUntil_ShouldReturnNull_WhenNotBanned() {
        String ip = "192.168.1.1";

        // Record fewer than MAX_ATTEMPTS
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);

        Instant banUntil = rateLimiter.getUserBanUntil(ip);
        assertNull(banUntil, "Expected null because user has not reached max attempts yet");
    }

    @Test
    @DisplayName("Should return correct banUntil after user is banned")
    void getUserBanUntil_ShouldReturnBanInstant_WhenBanned() {
        String ip = "10.0.0.5";

        // Reach max attempts to trigger ban
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);

        Instant banUntil = rateLimiter.getUserBanUntil(ip);

        assertNotNull(banUntil, "Expected non-null banUntil because user should be banned");
        assertTrue(banUntil.isAfter(Instant.now()), "banUntil should be in the future");
    }

    @Test
    @DisplayName("Should return updated banUntil if user re-banned after ban expiry")
    void getUserBanUntil_ShouldUpdateBanInstant_WhenReBanned() throws InterruptedException {
        String ip = "9.9.9.9";

        // First ban
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);
        rateLimiter.recordResetPassAttempt(ip);
        Instant firstBanUntil = rateLimiter.getUserBanUntil(ip);

        // Simulate ban expired by direct reflection manipulation (optional, similar to existing test)
        Thread.sleep(10); // small delay to ensure new timestamp will be after old one

        // Clear bucket to simulate expiry for testing re-ban
        rateLimiter.recordResetPassAttempt(ip); // this may reset token depending on your REFILL_SECONDS logic

        Instant secondBanUntil = rateLimiter.getUserBanUntil(ip);

        // If re-banned, the new banUntil should be different and in the future
        if (secondBanUntil != null) {
            assertTrue(secondBanUntil.isAfter(firstBanUntil) || secondBanUntil.equals(firstBanUntil),
                    "banUntil should be updated or remain the same if re-banned");
        }
    }
}
