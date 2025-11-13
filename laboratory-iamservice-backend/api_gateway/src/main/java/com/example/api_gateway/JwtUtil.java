package com.example.api_gateway;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;


@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expiration = 15 * 60 * 1000;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String getSubject(String token) {
        return parseClaim(token).getSubject();
    }


    public Claims validate(String token) {
        try {
            return parseClaim(token); // return user id from payload
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
