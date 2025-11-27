package com.example.iam_service.security;


import com.example.iam_service.entity.User;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.util.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // Filter for up-coming requests
    @Override
    protected void doFilterInternal(
            @NotNull HttpServletRequest request,
            @NotNull HttpServletResponse response,
            @NotNull FilterChain filterChain) throws ServletException, IOException {
        try {
            // filter ignores public request
            String path = request.getRequestURI();
            System.out.println("request: " + path);
            String authHeader = request.getHeader("X-Auth-Token") != null
                    ? request.getHeader("X-Auth-Token")
                    : request.getHeader("Authorization");

            if (path.startsWith("/auth") || path.startsWith("/api/auth")
                    || path.startsWith("/iam/api/auth")
                    || path.startsWith("/v3/api-docs")
                    || path.startsWith("/swagger-ui")
                    || path.equals("/swagger-ui.html")
                    || path.startsWith("/actuator/")
                    || path.startsWith("/internal/")
            ) {
                filterChain.doFilter(request, response);
                return;
            }

            // filter ignore auth endpoints
            if(authHeader == null) {
                filterChain.doFilter(request,response);
                return;
            }
    
            // extract token from headers
            String jwt = authHeader.startsWith("Bearer ")
                    ? authHeader.substring(7).trim()
                    : authHeader.trim();
            String userId = jwtUtil.validate(jwt);
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            List<GrantedAuthority> authorities = jwtUtil.getUserAuthorities(jwt);

            // create authentication object
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user, null, authorities
            );

            // provide authentication obj for security context holder
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);

        } catch (JwtException | UsernameNotFoundException e) {
            // throw error if token validation fail
            System.out.println("❌" + e.getMessage());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("""
                    {
                      "message": "Unauthorized request IAM Service",
                      "error": "JWT invalid or expired"
                    }
                    """);
        }
    }
}
