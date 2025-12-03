package com.example.notification_service.repository;

import com.example.notification_service.entity.TestOrderNotification;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestOrderNotifyRepository extends MongoRepository<TestOrderNotification, String> {
    List<TestOrderNotification> findByEmail(String email, Sort sort);
}
