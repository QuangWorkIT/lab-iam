package com.example.notification_service.service;

import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.repository.TestOrderNotifyRepository;
import com.example.notification_service.serviceImpl.NotificationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)   // 🔥 Required to enable Mockito
public class NotificationServiceTest {

    @Mock
    private TestOrderNotifyRepository repo;

    @InjectMocks
    private NotificationServiceImpl service;

    // --------------------------
    // CASE 1: email = null
    // --------------------------
    @Test
    void testGetAllNotifyByEmail_NullEmail_ReturnsEmptyList() {
        List<TestOrderNotificationDTO> result = service.getAllTestOrderNotifyByEmail(null);

        assertTrue(result.isEmpty());
        verifyNoInteractions(repo);
    }

    // --------------------------
    // CASE 2: email = blank
    // --------------------------
    @Test
    void testGetAllNotifyByEmail_BlankEmail_ReturnsEmptyList() {
        List<TestOrderNotificationDTO> result = service.getAllTestOrderNotifyByEmail("  ");

        assertTrue(result.isEmpty());
        verifyNoInteractions(repo);
    }

    // --------------------------
    // CASE 3: Valid email → Return list sorted and mapped
    // --------------------------
    @Test
    void testGetAllNotifyByEmail_ValidEmail_ReturnsDtoList() {
        String email = "test@example.com";

        // Prepare fake entity
        TestOrderNotification e1 = new TestOrderNotification();
        e1.setTestOrderId("1");
        e1.setEmail(email);
        e1.setCommentText("Hello");
        e1.setCreatedAt(LocalDateTime.now());

        // Mock repo behavior
        when(repo.findByEmail(eq(email), any(Sort.class)))
                .thenReturn(List.of(e1));

        // Call service
        List<TestOrderNotificationDTO> result = service.getAllTestOrderNotifyByEmail(email);

        // Assertions
        assertEquals(1, result.size());
        assertEquals("1", result.get(0).getTypeId());
        assertEquals(email, result.get(0).getEmail());
        assertEquals("Hello", result.get(0).getText());

        // Verify correct sort parameter
        verify(repo).findByEmail(
                eq(email),
                eq(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
    }
}
