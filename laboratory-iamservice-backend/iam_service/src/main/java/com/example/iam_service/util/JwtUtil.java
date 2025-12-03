package com.example.iam_service.util;


import com.example.iam_service.entity.User;
import com.example.iam_service.security.UserGrantAuthority;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expiration = 2 * 60 * 60 * 1000;
    private final UserGrantAuthority grantAuthority;


    public JwtUtil(@Value("${jwt.secret}") String secret, UserGrantAuthority grantAuthority) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.grantAuthority = grantAuthority;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expired = new Date(now.getTime() + expiration);
        Map<String, String> payload = setClaims(user);

        List<GrantedAuthority> authorities = grantAuthority.getAuthorityByUser(user);

        // transfer authority object to string name
        List<String> authorityNames = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return Jwts.builder()
                .subject(user.getUserId().toString())
                .expiration(expired)
                .issuedAt(now)
                .claims(payload)
                .signWith(key)
                .compact();
    }

    public String getSubject(String token) {
        return parseClaim(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<GrantedAuthority> getUserAuthorities(String token) {
        Claims payload = parseClaim(token);
        List<String> authorities = (List<String>) payload.get("privileges");

        List<GrantedAuthority> userAuthorities = new ArrayList<>();
        if (authorities == null) return userAuthorities;

        // convert authority string to granted authority object
        authorities.forEach(p -> {
            userAuthorities.add(new SimpleGrantedAuthority(p.trim()));
        });
        return userAuthorities;
    }

    public List<GrantedAuthority> getUserAuthoritiesV2(User user) {
        return grantAuthority.getAuthorityByUser(user);
    }

    public String validate(String token) {
        try {
            Claims payload = parseClaim(token);
            return payload.getSubject();
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

    private Map<String, String> setClaims(User user) {
        Map<String, String> payload = new HashMap<>();
        payload.put("userName", user.getFullName());
        payload.put("role", user.getRoleCode());
        payload.put("email", user.getEmail());
        payload.put("gender", user.getGender());
        payload.put("identityNumber", user.getIdentityNumber());
        payload.put("age", user.getAge() != null ? user.getAge().toString() : null);
        payload.put("dob", user.getBirthdate() != null ? user.getBirthdate().toString() : null);
        payload.put("address", user.getAddress());
        payload.put("phone", user.getPhoneNumber());
        payload.put("isActive", user.getIsActive().toString());
        payload.put("isDeleted", user.getIsDeleted().toString());
        payload.put("deletedAt",
                user.getDeletedAt() != null ? user.getDeletedAt().toString() : null
        );

        return payload;
    }
}
