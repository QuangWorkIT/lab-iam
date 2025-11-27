package com.example.iam_service.serviceImpl;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.repository.RefreshTokenRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.authen.*;
import com.example.iam_service.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@AllArgsConstructor
public class AuthenticationServiceImpl implements LoginService, GoogleService, RefreshTokenService, ResetPassWordService {
    private final BCryptPasswordEncoder encoder;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshRepo;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final JwtUtil jwtUtil;
    private final AuditPublisher auditPublisher;

    // helper function for verification
    private User authenticate(String email, String password) {
        Optional<User> userFound = userRepository.findByEmail(email);

        if (userFound.isEmpty())
            throw new UsernameNotFoundException("Email not found");

        User user = userFound.get();
        if (!user.getIsActive())
            throw new BadRequestException("User is deleted");

        if (!encoder.matches(password, user.getPassword()))
            throw new BadCredentialsException("Password is invalid");

        return user;
    }

    public Map<String, String> getTokens(User user) {
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", jwtUtil.generateToken(user));
        tokens.put("refreshToken", generateRefreshToken(user).getTokenId());
        return tokens;
    }

    @Override
    public Map<String, String> login(String email, String password) {
        User authenticatedUser = authenticate(email, password);
        Map<String, String> tokens = new HashMap<>();

        tokens.put("accessToken", jwtUtil.generateToken(authenticatedUser));
        tokens.put("refreshToken",
                generateRefreshToken(authenticatedUser).getTokenId());
        return tokens;
    }

    //    Google services
    @Override
    public GoogleIdToken.Payload getPayload(String tokenId) {
        return verifyGoogleCredential(tokenId).getPayload();
    }

    // verify google token credential
    @Override
    public GoogleIdToken verifyGoogleCredential(String tokenId) {
        try {
            return googleIdTokenVerifier.verify(tokenId);
        } catch (Exception e) {
            throw new RuntimeException("Error verify google id " + e);
        }
    }

    @Transactional
    public User loadUserByLoginGoogle(GoogleIdToken.Payload payload) {
        Optional<User> optUser = userRepository.findByEmail(payload.getEmail());
        if (optUser.isEmpty()) {
            throw new UsernameNotFoundException("Email not found");
        }
        return optUser.get();
    }

    //    Refresh token services
    @Override
    @Transactional
    public void deleteToken(String tokenId) {
        try {
            refreshRepo.deleteByTokenId(tokenId);
        } catch (Exception e) {
            throw new RuntimeException("Error delete refresh token " + e);
        }
    }

    @Override
    public Token findByToken(String tokenId) {
        return refreshRepo.findByTokenId(tokenId).orElse(null);
    }

    @Override
    public Token generateRefreshToken(User user) {
        LocalDateTime now = LocalDateTime.now();

        Token refreshToken = new Token();
        refreshToken.setUser(user);
        refreshToken.setTokenId(UUID.randomUUID().toString());
        refreshToken.setExpiredAt(now.plusSeconds(expiration)); // expiration from refresh token service

        return refreshRepo.save(refreshToken);
    }

    @Override
    public Token verifyRefreshToken(String tokenId) {
        Token tokenFound = findByToken(tokenId);
        if (tokenFound == null ||
                LocalDateTime.now().isAfter(tokenFound.getExpiredAt())) {
            return null;
        }

        return tokenFound;
    }

    @Override
    public User searchUserByEmail(String data) {
        return userRepository.findByEmail(data).orElse(null);
    }

    @Transactional
    @Override
    public User updateUserPassword(String userid, String password, String currentPassword, String option) {
        User user = userRepository.findById(UUID.fromString(userid)).orElseThrow(
                () -> new IllegalArgumentException("User not found")
        );

        if (!user.getIsActive() || user.getDeletedAt() != null || user.getIsDeleted())
            throw new IllegalArgumentException("User is deleted");

        String auditPrefix = option.equals("change") ? "USER_CHANGE_PASSWORD" : "USER_RESET_PASSWORD";
        String details = option.equals("change") ? "User changed their own password" : "User reset their own password";

        if (option.equals("change")) {
            // Check if the provided password is correct
            if (!encoder.matches(currentPassword, user.getPassword()))
                throw new IllegalArgumentException("Current password does not match");

            // Check the difference between current and new password
            if (encoder.matches(password, user.getPassword())) {
                throw new IllegalArgumentException("Password must be different from the old one");
            }
        }

        auditPublisher.publish(AuditEvent.builder()
                .type(auditPrefix)
                .userId(user.getUserId().toString())
                .target(user.getUserId().toString())
                .targetRole(user.getRoleCode())
                .timestamp(OffsetDateTime.now())
                .details(details)
                .build());

        // save new password directly if option "reset"
        user.setPassword(encoder.encode(password));
        return userRepository.save(user);
    }
}
