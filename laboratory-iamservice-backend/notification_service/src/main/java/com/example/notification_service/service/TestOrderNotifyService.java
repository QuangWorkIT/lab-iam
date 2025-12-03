package com.example.notification_service.service;

import com.example.notification_service.dto.TestOrderNotificationDTO;

import java.util.List;

public interface TestOrderNotifyService {
    List<TestOrderNotificationDTO> getAllTestOrderNotifyByEmail(String email);
}
