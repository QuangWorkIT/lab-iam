package com.example.iam_service.security;

import com.example.iam_service.exception.NotAllowIpException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InternalServiceFilterTest {

    private InternalServiceFilter filter;

    @Captor
    private ArgumentCaptor<Integer> statusCaptor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        filter = new InternalServiceFilter();
        // Set allowed IPs
        ReflectionTestUtils.setField(filter, "allowedIps", "127.0.0.1,192.168.1.1");
    }

    @Test
    void doFilterInternal_allowedIp_passesFilterChain() throws Exception {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        when(request.getServletPath()).thenReturn("/internal/test");

        // Act
        filter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain, times(1)).doFilter(request, response);
        verify(response, never()).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Test
    void doFilterInternal_disallowedIp_returnsUnauthorized() throws Exception {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(request.getServletPath()).thenReturn("/internal/test");

        StringWriter responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));

        // Act
        filter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain, never()).doFilter(request, response);
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        String expectedJson = """
                {
                  "message": "Unauthorized request",
                  "error": "IP is not allowed"
                }
                """;
        assertEquals(expectedJson.trim(), responseWriter.toString().trim());
    }

    @Test
    void doFilterInternal_nonInternalPath_passesFilterChain() throws Exception {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain filterChain = mock(FilterChain.class);

        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(request.getServletPath()).thenReturn("/public/test");

        // Act
        filter.doFilterInternal(request, response, filterChain);

        // Assert
        verify(filterChain, times(1)).doFilter(request, response);
        verify(response, never()).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
}