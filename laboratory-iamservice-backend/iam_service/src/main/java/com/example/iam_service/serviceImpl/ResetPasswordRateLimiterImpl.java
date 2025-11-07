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

    // Bucket stores user's attempts
    private static class ResetPasswordBucket {
        int token;
        Instant lastAttempt;

        public ResetPasswordBucket(int token) {
            this.token = token;
        }

        public ResetPasswordBucket(int token, Instant lastAttempt) {
            this.token = token;
            this.lastAttempt = lastAttempt;
        }
    }

    private final Map<String, ResetPasswordBucket> userBuckets = new ConcurrentHashMap<>();

    @Override
    public boolean isBannedFromResetPassword(String ip) {
        ResetPasswordBucket bucket = userBuckets.get(ip);
        if (bucket == null) return false;

        Instant now = Instant.now();
        long secondsPassed = Duration.between(bucket.lastAttempt, now).getSeconds();

        if (secondsPassed > REFILL_SECONDS) {
            bucket.token = 0;
            bucket.lastAttempt = now;
            userBuckets.put(ip, bucket);
        }

        return bucket.token >= MAX_ATTEMPTS;
    }

    @Override
    public void recordResetPassAttempt(String ip) {
        ResetPasswordBucket bucket = userBuckets.get(ip);

        if (bucket == null) {
            bucket = new ResetPasswordBucket(0);
        }

        bucket.token++;
        bucket.lastAttempt = Instant.now();
        userBuckets.put(ip, bucket);
    }
}
