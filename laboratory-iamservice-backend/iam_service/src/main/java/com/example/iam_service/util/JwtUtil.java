package com.example.iam_service.util;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expiration = 15 * 60 * 1000;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date expired = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(username)
                .expiration(expired)
                .signWith(key)
                .compact();
    }

    public String getSubject(String token) {
        return parseClaim(token).getSubject();
    }

    public String validate(String token) {
        try {
            parseClaim(token);
            return "true";
        }catch (Exception e) {
            return e.getMessage();
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
