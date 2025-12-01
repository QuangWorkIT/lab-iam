package com.example.notification_service.repository;

import com.example.notification_service.entity.ReagentAlertNotification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReagentAlertNotifyRepository extends MongoRepository<ReagentAlertNotification, String> {
}
