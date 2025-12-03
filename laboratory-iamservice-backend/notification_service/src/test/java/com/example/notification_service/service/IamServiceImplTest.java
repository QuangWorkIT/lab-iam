package com.example.notification_service.service;

import com.example.notification_service.dto.UserDTO;
import com.example.notification_service.serviceImpl.IamServiceImpl;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class IamServiceImplTest {
    @Mock
    private IamClient iamClient;

    @InjectMocks
    private IamServiceImpl iamService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findUserByEmail_ShouldReturnUser_WhenResponseIs2xx() {
        String email = "test@example.com";
        UserDTO user = new UserDTO();
        user.setEmail(email);

        // Mock Feign client to return 200 OK
        when(iamClient.findUserByEmail(email))
                .thenReturn(ResponseEntity.ok(user));

        UserDTO result = iamService.findUserByEmail(email);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(iamClient, times(1)).findUserByEmail(email);
    }

    @Test
    void findUserByEmail_ShouldReturnNull_WhenResponseIsNon2xx() {
        String email = "test@example.com";

        // Mock client to return non-2xx response
        ResponseEntity<UserDTO> response = ResponseEntity.status(HttpStatusCode.valueOf(404)).build();
        when(iamClient.findUserByEmail(email)).thenReturn(response);

        UserDTO result = iamService.findUserByEmail(email);

        assertNull(result);
        verify(iamClient, times(1)).findUserByEmail(email);
    }

    @Test
    void findUserByEmail_ShouldReturnNull_WhenFeignExceptionThrown() {
        String email = "test@example.com";

        // Mock client to throw FeignException
        when(iamClient.findUserByEmail(email))
                .thenThrow(FeignException.FeignClientException.class);

        UserDTO result = iamService.findUserByEmail(email);

        assertNull(result);
        verify(iamClient, times(1)).findUserByEmail(email);
    }
}
