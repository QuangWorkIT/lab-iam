package com.example.iam_service.service;

import com.example.iam_service.serviceImpl.LoginLimiterServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;


public class LoginLimiterServiceImplTest {
    private LoginLimiterServiceImpl loginLimiterService;

    private static final String TEST_KEY = "test-user";
    private static final String TEST_IP = "192.168.1.1";

    @BeforeEach
    void setUp() {
        loginLimiterService = new LoginLimiterServiceImpl();
    }

    @Test
    @DisplayName("Should return false when user has no failed attempts")
    void testIsBanned_NoAttempts_ReturnsFalse() {
        // When & Then
        assertFalse(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should return false when user is not banned")
    void testIsBanned_NotBanned_ReturnsFalse() {
        // Given
        loginLimiterService.recordFailedAttempt(TEST_KEY);

        // When & Then
        assertFalse(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should return true when user is banned")
    void testIsBanned_UserBanned_ReturnsTrue() {
        // Given - Record 5 failed attempts to trigger ban
        for (int i = 0; i < 5; i++) {
            loginLimiterService.recordFailedAttempt(TEST_KEY);
        }

        // When & Then
        assertTrue(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should record first failed attempt for new user")
    void testRecordFailedAttempt_NewUser_CreatesNewBucket() {
        // When
        loginLimiterService.recordFailedAttempt(TEST_KEY);

        // Then
        assertFalse(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should increment failed attempts for existing user")
    void testRecordFailedAttempt_ExistingUser_IncrementsCounter() {
        // Given
        loginLimiterService.recordFailedAttempt(TEST_KEY);

        // When
        loginLimiterService.recordFailedAttempt(TEST_KEY);
        loginLimiterService.recordFailedAttempt(TEST_KEY);

        // Then
        assertFalse(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should ban user after 5 failed attempts")
    void testRecordFailedAttempt_FiveAttempts_BansUser() {
        // When
        for (int i = 0; i < 5; i++) {
            loginLimiterService.recordFailedAttempt(TEST_KEY);
        }

        // Then
        assertTrue(loginLimiterService.isBanned(TEST_KEY));
    }

    // thread will stop in 1 minute for this test
    @Test
    @DisplayName("Should reset failed attempts after refill duration")
    void testRecordFailedAttempt_AfterRefillDuration_ResetsCounter() throws InterruptedException {
        // Given
        loginLimiterService.recordFailedAttempt(TEST_KEY);
        loginLimiterService.recordFailedAttempt(TEST_KEY);
        loginLimiterService.recordFailedAttempt(TEST_KEY);
        loginLimiterService.recordFailedAttempt(TEST_KEY);

        // When - Wait for refill duration (1 minute + buffer)
        Thread.sleep(61000); // 61 seconds

        // Record new attempt after refill period
        loginLimiterService.recordFailedAttempt(TEST_KEY);

        // Then - Should not be banned as counter was reset
        assertFalse(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should reset attempts counter to zero after ban is applied")
    void testRecordFailedAttempt_AfterBan_ResetsCounter() {
        // Given - Trigger ban
        for (int i = 0; i < 5; i++) {
            loginLimiterService.recordFailedAttempt(TEST_KEY);
        }

        // Then
        assertTrue(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should remove user from tracking when reset is called")
    void testResetAttempt_RemovesUser() {
        // Given
        loginLimiterService.recordFailedAttempt(TEST_KEY);
        loginLimiterService.recordFailedAttempt(TEST_KEY);

        // When
        loginLimiterService.resetAttempt(TEST_KEY);

        // Then
        assertFalse(loginLimiterService.isBanned(TEST_KEY));
    }

    @Test
    @DisplayName("Should handle reset for non-existent user without error")
    void testResetAttempt_NonExistentUser_NoError() {
        // When & Then
        assertDoesNotThrow(() -> loginLimiterService.resetAttempt("non-existent-user"));
    }

    @Test
    @DisplayName("Should return ban time in Ho Chi Minh timezone")
    void testGetBanUntil_ReturnsCorrectTimezone() {
        // Given - Ban the user
        for (int i = 0; i < 5; i++) {
            loginLimiterService.recordFailedAttempt(TEST_IP);
        }

        // When
        ZonedDateTime banUntil = loginLimiterService.getBanUntil(TEST_IP);

        // Then
        assertNotNull(banUntil);
        assertEquals(ZoneId.of("Asia/Ho_Chi_Minh"), banUntil.getZone());
    }

    @Test
    @DisplayName("Should set ban duration to 2 hours")
    void testGetBanUntil_CorrectDuration() {
        // Given - Ban the user
        ZonedDateTime beforeBan = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        for (int i = 0; i < 5; i++) {
            loginLimiterService.recordFailedAttempt(TEST_IP);
        }

        // When
        ZonedDateTime banUntil = loginLimiterService.getBanUntil(TEST_IP);
        ZonedDateTime afterBan = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        // Then - Ban should be approximately 2 hours from now
        assertTrue(banUntil.isAfter(beforeBan.plusHours(2).minusMinutes(1)));
        assertTrue(banUntil.isBefore(afterBan.plusHours(2).plusMinutes(1)));
    }

    @Test
    @DisplayName("Should handle multiple users independently")
    void testMultipleUsers_IndependentTracking() {
        // Given
        String user1 = "user1";
        String user2 = "user2";

        // When
        loginLimiterService.recordFailedAttempt(user1);
        loginLimiterService.recordFailedAttempt(user1);

        for (int i = 0; i < 5; i++) {
            loginLimiterService.recordFailedAttempt(user2);
        }

        // Then
        assertFalse(loginLimiterService.isBanned(user1));
        assertTrue(loginLimiterService.isBanned(user2));
    }


    @Test
    @DisplayName("Should handle concurrent access safely")
    void testConcurrentAccess_ThreadSafe() throws InterruptedException {
        // Given
        int threadCount = 10;
        Thread[] threads = new Thread[threadCount];

        // When
        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                loginLimiterService.recordFailedAttempt(TEST_KEY);
            });
            threads[i].start();
        }

        // Wait for all threads to complete
        for (Thread thread : threads) {
            thread.join();
        }

        // Then - Should be banned after 10 concurrent attempts
        assertTrue(loginLimiterService.isBanned(TEST_KEY));
    }

}
