package com.example.notification_service.serviceImpl;

import com.example.notification_service.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketServiceImpl implements WebSocketService {

    private final SimpMessagingTemplate template;

    @Override
    public void sendNotification(String destination, Object message) {
        template.convertAndSend(destination, message);
    }
}
