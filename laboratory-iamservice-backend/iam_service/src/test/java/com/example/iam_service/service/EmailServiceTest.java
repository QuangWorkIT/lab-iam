package com.example.iam_service.service;

import com.example.iam_service.exception.InvalidOtpException;
import com.example.iam_service.security.OtpDetails;
import com.example.iam_service.security.StoreOtp;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private StoreOtp storeOtp;

    @InjectMocks
    private EmailService emailService;

    private String email;
    private String otp;
    private String password;

    @BeforeEach
    void setUp() {
        email = "receiveMail@example.com";
        otp = "ABCDEF";
        password = "TempPass123!";

        emailService.getClass();
        try {
            var field = EmailService.class.getDeclaredField("fromAddress");
            field.setAccessible(true);
            field.set(emailService, "no-reply@lab.com");
        } catch (Exception e) {
            fail("Failed to inject 'fromAddress' field for test.");
        }
    }

    @Test
    void sendOtp_ShouldStoreOtpAndSendEmail() {
        // Arrange
        String testEmail = "user@example.com";

        // Capture SimpleMailMessage passed to mailSender.send()
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendOtp(testEmail);

        // Assert
        verify(storeOtp, times(1)).storeOtp(eq(testEmail), anyString());
        verify(mailSender, times(1)).send(messageCaptor.capture());

        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertNotNull(sentMessage);
        assertEquals("no-reply@lab.com", sentMessage.getFrom());
        assertEquals(testEmail, sentMessage.getTo()[0]);
        assertTrue(sentMessage.getSubject().contains("OTP Code"));
        assertTrue(sentMessage.getText().contains("Your OTP code is"));
        assertTrue(sentMessage.getText().contains("⚠️ This code will expire in 5 minutes"));
    }

    // ✅ Test sendPasswordEmail()
    @Test
    void sendPasswordEmail_ShouldSendPasswordMessage() {
        // Arrange
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        // Act
        emailService.sendPasswordEmail(email, password);

        // Assert
        verify(mailSender, times(1)).send(messageCaptor.capture());
        SimpleMailMessage sentMessage = messageCaptor.getValue();

        assertNotNull(sentMessage);
        assertEquals("no-reply@lab.com", sentMessage.getFrom());
        assertEquals(email, sentMessage.getTo()[0]);
        assertEquals("Your Laboratory Account Password", sentMessage.getSubject());
        assertTrue(sentMessage.getText().contains(password));
        assertTrue(sentMessage.getText().contains("Your temporary password is"));
        assertTrue(sentMessage.getText().contains("Laboratory IAM Service"));
    }


    @Test
    void verifyOtp_Success_ShouldReturnEmail() {
        OtpDetails mockOtpDetails = new OtpDetails();
        mockOtpDetails.setEmail(email);
        mockOtpDetails.setOtp(otp);
        mockOtpDetails.setExpiration(LocalDateTime.now().plusMinutes(10));

        when(storeOtp.getOtpDetails(email)).thenReturn(mockOtpDetails);

        String validatedEmail = emailService.verifyOtp(email, otp);

        assertNotNull(validatedEmail);
        assertEquals(email, validatedEmail);
        verify(storeOtp, times(1)).getOtpDetails(email);
        verify(storeOtp, times(1)).removeOtp(email);
    }

    @Test
    void verifyOtp_OtpNotFound_ShouldThrowNotFoundException() {
        InvalidOtpException ex = assertThrows(InvalidOtpException.class, () ->
                emailService.verifyOtp(email, otp)
        );

        assertTrue(ex.getMessage().contains("OTP not found or invalid"));
        verify(storeOtp, times(1)).getOtpDetails(email);
        verify(storeOtp, times(0)).removeOtp(email);
    }

    @Test
    void verifyOtp_InvalidOtp_ShouldThrowInvalidException() {
        OtpDetails mockOtpDetails = new OtpDetails();
        mockOtpDetails.setEmail(email);
        mockOtpDetails.setOtp("OPQIML");
        mockOtpDetails.setExpiration(LocalDateTime.now().plusMinutes(10));

        when(storeOtp.getOtpDetails(email)).thenReturn(mockOtpDetails);

        InvalidOtpException ex = assertThrows(InvalidOtpException.class, () ->
                emailService.verifyOtp(email, otp)
        );

        assertTrue(ex.getMessage().contains("OTP not found or invalid"));
        assertNotEquals(otp, mockOtpDetails.getOtp());
        verify(storeOtp, times(1)).getOtpDetails(email);
        verify(storeOtp, times(0)).removeOtp(email);
    }

    @Test
    void verifyOtp_OtpExpired_ShouldThrowExpiredException() {
        OtpDetails mockOtpDetails = new OtpDetails();
        mockOtpDetails.setEmail(email);
        mockOtpDetails.setOtp(otp);
        mockOtpDetails.setExpiration(LocalDateTime.now().minusMinutes(10));

        when(storeOtp.getOtpDetails(email)).thenReturn(mockOtpDetails);
        InvalidOtpException ex = assertThrows(InvalidOtpException.class, () ->
                emailService.verifyOtp(email, otp)
        );

        assertTrue(ex.getMessage().contains("OTP expired"));
        assertEquals(otp, mockOtpDetails.getOtp());
        verify(storeOtp, times(1)).getOtpDetails(email);
        verify(storeOtp, times(0)).removeOtp(email);
    }

}
