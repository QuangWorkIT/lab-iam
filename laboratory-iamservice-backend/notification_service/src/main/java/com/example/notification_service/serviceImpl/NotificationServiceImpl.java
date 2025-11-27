package com.example.notification_service.serviceImpl;

import com.example.notification_service.dto.ReagentAlertNotificationDTO;
import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.repository.ReagentAlertNotifyRepository;
import com.example.notification_service.repository.TestOrderNotifyRepository;
import com.example.notification_service.service.ReagentAlertNotifyService;
import com.example.notification_service.service.TestOrderNotifyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements TestOrderNotifyService, ReagentAlertNotifyService {
    private final TestOrderNotifyRepository testOrderRepo;
    private final ReagentAlertNotifyRepository reagentRepo;

    @Override
    public List<TestOrderNotificationDTO> getAllTestOrderNotifyByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return List.of();


        return testOrderRepo
                .findByEmail(
                        email,
                        Sort.by(Sort.Direction.DESC, "createdAt")
                )
                .stream()
                .map(TestOrderNotificationDTO::toDto)
                .toList();
    }

    @Override
    public List<ReagentAlertNotificationDTO> findAllReagentNotification() {
        return reagentRepo.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(ReagentAlertNotificationDTO::toDto)
                .toList();
    }
}
