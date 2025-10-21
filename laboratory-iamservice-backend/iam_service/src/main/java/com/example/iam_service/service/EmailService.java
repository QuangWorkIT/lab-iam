package com.example.iam_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromAddress;

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
}
