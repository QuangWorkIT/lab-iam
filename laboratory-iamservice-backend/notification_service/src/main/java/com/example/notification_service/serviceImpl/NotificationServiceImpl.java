package com.example.notification_service.serviceImpl;

import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.repository.TestOrderNotifyRepository;
import com.example.notification_service.service.TestOrderNotifyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements TestOrderNotifyService {
    private final TestOrderNotifyRepository testOrderRepo;

    @Override
    public List<TestOrderNotification> getAllNotifyByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return null;

        return testOrderRepo.findByEmail(email,
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
