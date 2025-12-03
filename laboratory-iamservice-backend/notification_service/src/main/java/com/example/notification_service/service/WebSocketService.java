package com.example.notification_service.service;

public interface WebSocketService {
    void sendNotification(String destination, Object message);
}
