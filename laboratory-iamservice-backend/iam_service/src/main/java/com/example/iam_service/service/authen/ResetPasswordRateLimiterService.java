package com.example.iam_service.service.authen;

import java.time.Instant;

public interface ResetPasswordRateLimiterService {

    // get the number of attempts
    boolean isBannedFromResetPassword(String ip);

    // record new attempt
    void recordResetPassAttempt(String ip);

    Instant getUserBanUntil(String ip);
}
