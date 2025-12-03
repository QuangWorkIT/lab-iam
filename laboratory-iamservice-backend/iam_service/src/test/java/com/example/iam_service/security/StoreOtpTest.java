package com.example.iam_service.security;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class StoreOtpTest {
    private StoreOtp storeOtp;

    @BeforeEach
    void setUp() {
        storeOtp = new StoreOtp();
    }

    @Test
    void storeOtp_ShouldAddOtpDetails() {
        String email = "user@example.com";
        String otp = "123456";

        storeOtp.storeOtp(email, otp);
        OtpDetails details = storeOtp.getOtpDetails(email);

        assertNotNull(details);
        assertEquals(email, details.getEmail());
        assertEquals(otp, details.getOtp());
        assertTrue(details.getExpiration().isAfter(LocalDateTime.now()));
    }

    @Test
    void getOtpDetails_ShouldReturnNullIfNotStored() {
        String email = "unknown@example.com";
        OtpDetails details = storeOtp.getOtpDetails(email);
        assertNull(details);
    }

    @Test
    void removeOtp_ShouldRemoveStoredOtp() {
        String email = "user@example.com";
        String otp = "123456";

        // store and check existence
        storeOtp.storeOtp(email, otp);
        assertNotNull(storeOtp.getOtpDetails(email));

        // remove and check removal
        storeOtp.removeOtp(email);
        assertNull(storeOtp.getOtpDetails(email));
    }

    @Test
    void storeOtp_ShouldOverwriteExistingOtp() {
        String email = "user@example.com";

        storeOtp.storeOtp(email, "111111");
        OtpDetails firstDetails = storeOtp.getOtpDetails(email);

        storeOtp.storeOtp(email, "222222");
        OtpDetails secondDetails = storeOtp.getOtpDetails(email);

        assertNotNull(secondDetails);
        assertEquals("222222", secondDetails.getOtp());
        assertNotEquals(firstDetails.getOtp(), secondDetails.getOtp());
    }
}
