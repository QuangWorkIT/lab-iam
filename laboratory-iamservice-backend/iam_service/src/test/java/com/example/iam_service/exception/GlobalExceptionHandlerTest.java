package com.example.iam_service.exception;


import com.example.iam_service.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.BindingResult;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
public class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    // -------------------------------------------------------------------------
    // 1. MethodArgumentNotValidException handler test
    // -------------------------------------------------------------------------
    @Test
    void testHandleValidationErrors() {
        // Mock binding result
        BindingResult bindingResult = mock(BindingResult.class);

        // Fake validation errors
        FieldError error1 = new FieldError("user", "email", "Email is invalid");
        FieldError error2 = new FieldError("user", "fullName", "Full name required");

        when(bindingResult.getFieldErrors()).thenReturn(List.of(error1, error2));

        // Create the actual exception
        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(null, bindingResult);

        // Act
        ResponseEntity<Map<String, String>> response = handler.handleValidationErrors(ex);

        // Assert response status
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Email is invalid", response.getBody().get("email"));
        assertEquals("Full name required", response.getBody().get("fullName"));
        assertEquals(2, response.getBody().size());
    }

    // -------------------------------------------------------------------------
    // 2. IllegalArgumentException handler test
    // -------------------------------------------------------------------------
    @Test
    void testHandleIllegalArgument() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid input");

        ResponseEntity<Map<String, String>> response =
                handler.handleIllegalArgument(ex);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Invalid input", response.getBody().get("error"));
    }

    // -------------------------------------------------------------------------
    // 3. Generic Exception handler test
    // -------------------------------------------------------------------------
    @Test
    void testHandleGenericException() {
        Exception ex = new Exception("Something went wrong");

        ResponseEntity<Map<String, String>> response =
                handler.handleGeneric(ex);

        assertEquals(500, response.getStatusCode().value());
        assertEquals("Unexpected error: Something went wrong",
                response.getBody().get("error"));
    }

    // -------------------------------------------------------------------------
    // 4. InvalidOtpException handler test
    // -------------------------------------------------------------------------
    @Test
    void testHandleOtpException() {
        InvalidOtpException ex = new InvalidOtpException("OTP invalid");

        ResponseEntity<ApiResponse<String>> response =
                handler.handleOtpException(ex);

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Error", response.getBody().getStatus());
        assertEquals("OTP invalid", response.getBody().getMessage());
    }

    // -------------------------------------------------------------------------
    // 5. InsufficientPrivilegesException handler test
    // -------------------------------------------------------------------------
    @Test
    void testHandleInsufficientPrivilege() {
        InsufficientPrivilegesException ex =
                new InsufficientPrivilegesException("Access denied");

        ResponseEntity<Map<String, Object>> response =
                handler.handleInsufficientPrivilege(ex);

        Map<String, Object> body = response.getBody();

        assertEquals(403, response.getStatusCode().value());
        assertEquals(403, body.get("status"));
        assertEquals("Forbidden", body.get("error"));
        assertEquals("Access denied", body.get("message"));

        // timestamp exists and is a LocalDateTime
        assertTrue(body.containsKey("timestamp"));
        assertTrue(body.get("timestamp") instanceof LocalDateTime);
    }
}
