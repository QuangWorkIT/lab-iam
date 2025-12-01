package com.example.iam_service.serviceImpl;

import com.example.iam_service.service.authen.ResetPasswordRateLimiterService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ResetPasswordRateLimiterImpl implements ResetPasswordRateLimiterService {
    private final int MAX_ATTEMPTS = 3;
    private final long REFILL_SECONDS = 60 * 60;
    private final long BAN_DURATION = 2 * 60 * 60;

    // Bucket stores user's attempts
    private static class ResetPasswordBucket {
        int token;
        Instant lastAttempt;
        Instant banUntil;

        public ResetPasswordBucket(int token, Instant lastAttempt, Instant banUntil) {
            this.token = token;
            this.lastAttempt = lastAttempt;
            this.banUntil = banUntil;
        }
    }

    private final Map<String, ResetPasswordBucket> userBuckets = new ConcurrentHashMap<>();

    @Override
    public boolean isBannedFromResetPassword(String ip) {
        ResetPasswordBucket bucket = userBuckets.get(ip);
        if (bucket == null || bucket.banUntil == null) return false;

        if (Instant.now().isAfter(bucket.banUntil)) {
            userBuckets.remove(ip);
            return false;
        }
        return true;
    }

    @Override
    public void recordResetPassAttempt(String ip) {
        ResetPasswordBucket bucket = userBuckets.get(ip);

        if (bucket == null) {
            bucket = new ResetPasswordBucket(1, Instant.now(), null);
            userBuckets.put(ip, bucket);
            return;
        }

        Instant now = Instant.now();
        long secondsPassed = Duration.between(bucket.lastAttempt, now).getSeconds();

        if (secondsPassed > REFILL_SECONDS) {
            bucket.token = 0;
        }

        bucket.token++;
        bucket.lastAttempt = Instant.now();

        if (bucket.token >= MAX_ATTEMPTS) {
            bucket.banUntil = Instant.now().plusSeconds(BAN_DURATION);
        }

        userBuckets.put(ip, bucket);
    }

    public Instant getUserBanUntil(String ip) {
        return userBuckets.get(ip) != null ? userBuckets.get(ip).banUntil : null;
    }
}
