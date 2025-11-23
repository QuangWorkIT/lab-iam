package com.example.iam_service.security;

import com.example.iam_service.exception.NotAllowIpException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class InternalServiceFilter extends OncePerRequestFilter {

    @Value("${ALLOWED_IPS}")
    private String allowedIps;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String remoteIpAddress = request.getRemoteAddr();
            System.out.println("remote address " + remoteIpAddress);
            String path = request.getServletPath();

            List<String> ipWhiteList = Arrays.asList(allowedIps.split(","));
            if (path.startsWith("/internal/") && !ipWhiteList.contains(remoteIpAddress)) {
                throw new NotAllowIpException("IP is not allowed");
            }

            filterChain.doFilter(request, response);
        } catch (NotAllowIpException e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(String.format("""
                    {
                      "message": "Unauthorized request",
                      "error": "%s"
                    }
                    """, e.getMessage()
            ));
        }

    }
}
