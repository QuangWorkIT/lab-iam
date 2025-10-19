package com.example.iam_service.util;


import com.example.iam_service.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expiration = 15 * 60 * 1000;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expired = new Date(now.getTime() + expiration);
        Map<String, String> payload = new HashMap<>();
        payload.put("userName", user.getFullName());
        payload.put("role", user.getRoleCode());
        payload.put("email", user.getEmail());

        return Jwts.builder()
                .subject(user.getUserId().toString())
                .expiration(expired)
                .issuedAt(now)
                .claim("privileges", List.of("user", "admin"))
                .claims(payload)
                .signWith(key)
                .compact();
    }

    public String getSubject(String token) {
        return parseClaim(token).getSubject();
    }

    public String validate(String token) {
        try {
            Claims payload = parseClaim(token);
            return payload.getSubject(); // return user id from payload
        } catch (Exception e) {
            throw new JwtException("JWT validation failed: " + e.getMessage());
        }
    }

    private Claims parseClaim(String token) {
        return Jwts.parser()
                .verifyWith(key)  // verify signature of the given token
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
