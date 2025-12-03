package com.example.notification_service.service;

import com.example.notification_service.dto.ReagentAlertNotificationDTO;
import com.example.notification_service.dto.TestOrderNotificationDTO;
import com.example.notification_service.dto.UserDTO;
import com.example.notification_service.entity.ReagentAlertNotification;
import com.example.notification_service.entity.TestOrderNotification;
import com.example.notification_service.event.ReagentAlertEvent;
import com.example.notification_service.event.TestOrderCommentEvent;
import com.example.notification_service.repository.ReagentAlertNotifyRepository;
import com.example.notification_service.repository.TestOrderNotifyRepository;
import com.example.notification_service.serviceImpl.IamServiceImpl;
import com.example.notification_service.serviceImpl.WebSocketServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotifyConsumerTest {

    @Mock
    private TestOrderNotifyRepository testOrderRepo;

    @Mock
    private ReagentAlertNotifyRepository reagentRepo;

    @Mock
    private WebSocketServiceImpl webSocketService;

    @Mock
    private IamServiceImpl iamService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotifyConsumer notifyConsumer;


    // =====================================================================================
    // Test: consumeTestOrderEvent() - user found
    // =====================================================================================
    @Test
    void consumeTestOrderEvent_ShouldSaveNotification_WhenUserFound() throws Exception {

        // Prepare the event object
        TestOrderCommentEvent event = new TestOrderCommentEvent();
        event.setEmail("test@example.com");
        event.setCommentId("C1");
        event.setCommentText("Hello");
        event.setCreatedAt(LocalDateTime.now());
        event.setSourceService("TestOrderService");
        event.setTestOrderId("T123");

        // Mock ObjectMapper.readValue to return the event
        when(objectMapper.readValue(anyString(), eq(TestOrderCommentEvent.class)))
                .thenReturn(event);

        // Mock IAM service to return a user
        UserDTO mockUser = new UserDTO();
        mockUser.setEmail(event.getEmail());
        when(iamService.findUserByEmail(event.getEmail())).thenReturn(mockUser);

        // Call the listener
        notifyConsumer.consumeTestOrderEvent("{fake json}");

        // Verify WebSocket push
        verify(webSocketService, times(1))
                .sendNotification(
                        eq("/topic/notification/" + event.getEmail()),
                        any(TestOrderNotificationDTO.class)
                );

        // Verify DB save
        verify(testOrderRepo, times(1))
                .save(any(TestOrderNotification.class));
    }


    // =====================================================================================
    // Test: consumeTestOrderEvent() - user NOT found
    // =====================================================================================
    @Test
    void consumeTestOrderEvent_ShouldNotSave_WhenUserNotFound() throws Exception {

        // Prepare the event object
        TestOrderCommentEvent event = new TestOrderCommentEvent();
        event.setEmail("ghost@example.com");
        event.setCommentId("C1");
        event.setCommentText("Hello");
        event.setCreatedAt(LocalDateTime.now());
        event.setSourceService("TestOrderService");
        event.setTestOrderId("T123");

        // Mock ObjectMapper.readValue to return the event
        when(objectMapper.readValue(anyString(), eq(TestOrderCommentEvent.class)))
                .thenReturn(event);

        // Mock IAM service to return null
        when(iamService.findUserByEmail(event.getEmail())).thenReturn(null);

        // Call the listener
        notifyConsumer.consumeTestOrderEvent("{fake json}");

        // Verify nothing was sent or saved
        verify(webSocketService, never())
                .sendNotification(anyString(), any());
        verify(testOrderRepo, never()).save(any());
    }


    // =====================================================================================
    // Test: consumeReagentEvent()
    // =====================================================================================
    @Test
    void consumeReagentEvent_ShouldSaveAndPushNotification() throws Exception {

        // Prepare the event object
        ReagentAlertEvent event = new ReagentAlertEvent();
        event.setReagentName("Glucose");
        event.setQuantity(15.0);
        event.setUrl("https://example.com");
        event.setSource("Warehouse");

        // Mock ObjectMapper.readValue to return the event
        when(objectMapper.readValue(anyString(), eq(ReagentAlertEvent.class)))
                .thenReturn(event);

        // Call the listener
        notifyConsumer.consumeReagentEvent("{fake json}");

        // Verify WebSocket push
        verify(webSocketService, times(1))
                .sendNotification(
                        eq("/topic/notification/reagent/alerts"),
                        any(ReagentAlertNotificationDTO.class)
                );

        // Verify DB save
        verify(reagentRepo, times(1))
                .save(any(ReagentAlertNotification.class));
    }
}
