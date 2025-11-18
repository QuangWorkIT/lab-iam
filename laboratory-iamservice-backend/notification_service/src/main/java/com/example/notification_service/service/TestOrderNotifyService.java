package com.example.notification_service.service;

import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.entity.TestOrderNotification;

import java.util.List;

public interface TestOrderNotifyService {
    List<TestOrderNotificationDTO> getAllNotifyByEmail(String email);
}
