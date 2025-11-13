package com.example.iam_service.service;

import com.example.iam_service.exception.InvalidOtpException;
import com.example.iam_service.security.OtpDetails;
import com.example.iam_service.security.StoreOtp;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private final StoreOtp storeOtp;

    @Value("${app.email.from}")
    private String fromAddress;

    @Async
    public void sendPasswordEmail(String to, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Your Laboratory Account Password");
        message.setText("Hello,\n\nYour patient account has been created successfully.\n\n" +
                "Your temporary password is: " + password + "\n\n" +
                "Please log in and change it immediately for security purposes.\n\n" +
                "Best regards,\nLaboratory IAM Service");
        mailSender.send(message);
    }

    public void sendOtp(String email) {
        String otp = generateOtp();
        storeOtp.storeOtp(email, otp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("Your Laboratory OTP Code");
        String text = """
                Dear User,
                
                We received a request to verify your email address for your Laboratory account.
                
                Your OTP code is: %s
                
                ⚠️ This code will expire in 5 minutes.
                Please do not share it with anyone for your account’s security.
                
                Thank you,
                Laboratory Support Team
                """.formatted(otp);
        message.setText(text);
        mailSender.send(message);
    }

    public String verifyOtp(String email, String otp) {
        OtpDetails details = storeOtp.getOtpDetails(email);

        if (details == null || !details.getOtp().equals(otp))
            throw new InvalidOtpException("OTP not found or invalid");

        if (details.getExpiration().isBefore(LocalDateTime.now()))
            throw new InvalidOtpException("OTP expired");

        storeOtp.removeOtp(email);
        return email;
    }

    private String generateOtp() {
        String otp = UUID.randomUUID().toString();
        return otp.substring(0, 6).toUpperCase();
    }
}
