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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
            String path = request.getServletPath();
            String header = request.getHeader("Authorization");

            if (path.startsWith("/api/auth") || path.equals("/") ||
                    header == null || !header.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }


            // validate token
            String validatedToken = jwtUtil.validate(header.substring(7));
            User user = userRepository.findById(UUID.fromString(validatedToken))
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            List<GrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority(user.getRoleCode())
            );

            // create authentication object
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user, null, authorities
            );

            // provide authentication obj for security context holder
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);

        } catch (JwtException | UsernameNotFoundException e) {
            // throw error if token validation fail
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized: " + e.getMessage() + "\"}");
        }
    }
}
