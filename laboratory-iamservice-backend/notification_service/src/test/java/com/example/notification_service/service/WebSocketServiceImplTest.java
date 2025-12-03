package com.example.notification_service.service;

import com.example.notification_service.serviceImpl.WebSocketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

public class WebSocketServiceImplTest {

    @Mock
    private SimpMessagingTemplate template;

    @InjectMocks
    private WebSocketServiceImpl webSocketService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void sendNotification_ShouldCallConvertAndSend_WithCorrectArgs() {
        String destination = "/topic/test";
        String message = "Hello WebSocket";

        webSocketService.sendNotification(destination, message);

        // Verify that SimpMessagingTemplate.convertAndSend was called with correct arguments
        verify(template, times(1)).convertAndSend(destination, message);
    }
}
