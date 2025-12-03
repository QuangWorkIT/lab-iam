package com.example.notification_service.service;

import com.example.notification_service.dto.ReagentAlertNotificationDTO;
import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.entity.ReagentAlertNotification;
import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.repository.ReagentAlertNotifyRepository;
import com.example.notification_service.repository.TestOrderNotifyRepository;
import com.example.notification_service.serviceImpl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceImplTest {

    @Mock
    private TestOrderNotifyRepository testOrderRepo;

    @Mock
    private ReagentAlertNotifyRepository reagentRepo;

    @InjectMocks
    private NotificationServiceImpl notificationService;


    // ====================================================================================
    //  Tests for getAllTestOrderNotifyByEmail()
    // ====================================================================================

    @Test
    void getAllTestOrderNotifyByEmail_ShouldReturnEmpty_WhenEmailNull() {
        List<TestOrderNotificationDTO> result = notificationService.getAllTestOrderNotifyByEmail(null);
        assertTrue(result.isEmpty());
        verifyNoInteractions(testOrderRepo);
    }

    @Test
    void getAllTestOrderNotifyByEmail_ShouldReturnEmpty_WhenEmailBlank() {
        List<TestOrderNotificationDTO> result = notificationService.getAllTestOrderNotifyByEmail("   ");
        assertTrue(result.isEmpty());
        verifyNoInteractions(testOrderRepo);
    }

    @Test
    void getAllTestOrderNotifyByEmail_ShouldReturnMappedDTOList_WhenValidEmail() {
        String email = "test@example.com";

        TestOrderNotification entity = new TestOrderNotification();
        entity.setId("1");
        entity.setEmail(email);
        entity.setTestOrderId("T123");
        entity.setCommentText("Hello world");
        entity.setCreatedAt(LocalDateTime.now());

        // Correct matching for sort
        when(testOrderRepo.findByEmail(eq(email),  any(Sort.class)))
                .thenReturn(List.of(entity));

        List<TestOrderNotificationDTO> result =
                notificationService.getAllTestOrderNotifyByEmail(email);

        assertEquals(1, result.size());
        TestOrderNotificationDTO dto = result.get(0);

        assertEquals("T123", dto.getTypeId());
        assertEquals("Hello world", dto.getText());
        assertEquals(email, dto.getEmail());
        assertEquals("Test order service", dto.getSource());
        assertNotNull(dto.getCreatedAt());

        verify(testOrderRepo, times(1))
                .findByEmail(eq(email), any(Sort.class));
    }

    // ====================================================================================
    //  Tests for findAllReagentNotification()
    // ====================================================================================

    @Test
    void findAllReagentNotification_ShouldReturnMappedDTOList() {
        ReagentAlertNotification entity = new ReagentAlertNotification();
        entity.setId("R1");
        entity.setQuantity(50.0);
        entity.setAlertText("Low reagent");
        entity.setUrl("https://test.com");
        entity.setCreatedAt(LocalDateTime.now());

        // FIX: use any() without type OR use ArgumentMatchers.<Sort>any()
        when(reagentRepo.findAll(ArgumentMatchers.<Sort>any()))
                .thenReturn(List.of(entity));

        List<ReagentAlertNotificationDTO> result =
                notificationService.findAllReagentNotification();

        assertEquals(1, result.size());
        ReagentAlertNotificationDTO dto = result.get(0);

        assertEquals("R1", dto.getTypeId());
        assertEquals(50.0, dto.getQuantity());
        assertEquals("Low reagent", dto.getText());
        assertEquals("Warehouse service", dto.getSource());
        assertEquals("https://test.com", dto.getUrl());
        assertNotNull(dto.getCreatedAt());

        verify(reagentRepo, times(1))
                .findAll(ArgumentMatchers.<Sort>any());
    }

}
