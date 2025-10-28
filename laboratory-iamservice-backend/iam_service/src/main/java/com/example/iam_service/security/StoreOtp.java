package com.example.iam_service.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@AllArgsConstructor
@Data
@Component
public class StoreOtp {
    private final Map<String, OtpDetails> storedOtp = new HashMap<>();

    public void storeOtp(String email, String otp) {
        OtpDetails details = new OtpDetails(otp, email, LocalDateTime.now().plusMinutes(5));
        storedOtp.put(email, details);
    }

    public OtpDetails getOtpDetails(String email) {
        return storedOtp.get(email);
    }

    public void removeOtp(String email){storedOtp.remove(email);}
}
