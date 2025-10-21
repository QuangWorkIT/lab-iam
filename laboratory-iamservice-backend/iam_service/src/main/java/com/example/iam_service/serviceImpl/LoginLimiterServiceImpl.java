package com.example.iam_service.serviceImpl;

import com.example.iam_service.service.authen.LoginRateLimiterService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@AllArgsConstructor
public class LoginLimiterServiceImpl implements LoginRateLimiterService {
    private static final int MAX_ATTEMPT = 5; // max number of login attempt
    private static final long BAN_DURATION = 2 * 60 * 60;
    private static final int REFILL_MINUTE = 1; // attempt counter reset after 1 minutes

    // helper class to store user login attempts
    private static class Bucket {
        double failedAttempts;
        LocalDateTime lastFailedAttempt;
        LocalDateTime banUntil;

        public Bucket(double failedAttempts, LocalDateTime lastFailedAttempt, LocalDateTime banUntil) {
            this.failedAttempts = failedAttempts;
            this.lastFailedAttempt = lastFailedAttempt;
            this.banUntil = banUntil;
        }
    }

    private final ConcurrentMap<String, Bucket> userBuckets = new ConcurrentHashMap<>();

    @Override
    public boolean isBanned(String key) {
        Bucket currentBucket = userBuckets.get(key);
        LocalDateTime now = LocalDateTime.now();
        if (currentBucket == null || currentBucket.banUntil == null) return false;

        return now.isBefore(currentBucket.banUntil);
    }

    @Override
    public void recordFailedAttempt(String key) {
        Bucket currentBucket = userBuckets.get(key);
        LocalDateTime now = LocalDateTime.now();
        if (currentBucket == null) {
            userBuckets.put(key, new Bucket(1, now, null));
            return;
        }

        long minutePassed = ChronoUnit.SECONDS.between(currentBucket.lastFailedAttempt, now);
        if (minutePassed >= REFILL_MINUTE * 60) {
            currentBucket.failedAttempts = 0;
        }

        currentBucket.failedAttempts++;
        currentBucket.lastFailedAttempt = now;

        if (currentBucket.failedAttempts >= MAX_ATTEMPT) {
            currentBucket.banUntil = now.plusSeconds(BAN_DURATION);
            currentBucket.failedAttempts = 0;
        }

        userBuckets.put(key, currentBucket);
    }

    @Override
    public void resetAttempt(String key) {
        userBuckets.remove(key);
    }

    public ZonedDateTime getBanUntil(String ip) {
        Bucket bucket = userBuckets.get(ip);
        ZonedDateTime systemTime = bucket.banUntil.atZone(ZoneId.systemDefault());
        return systemTime.withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
    }

}
