package com.example.iam_service.service.authen;

public interface LoginRateLimiterService {

    // key for token bucket (client ip)
    boolean isBanned(String key);

    void recordFailedAttempt(String key);

    void resetAttempt(String key);
}
