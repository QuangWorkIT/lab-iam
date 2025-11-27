package com.example.notification_service.service;

import com.example.notification_service.dto.ReagentAlertNotificationDTO;
import com.example.notification_service.entity.ReagentAlertNotification;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface ReagentAlertNotifyService {
    List<ReagentAlertNotificationDTO> findAllReagentNotification();
}
