package com.example.iam_service.serviceImpl;

import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.repository.RefreshTokenRepository;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.authen.GoogleService;
import com.example.iam_service.service.authen.LoginService;
import com.example.iam_service.service.authen.RefreshTokenService;
import com.example.iam_service.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthenticationServiceImpl implements LoginService, GoogleService, RefreshTokenService {
    private final BCryptPasswordEncoder encoder;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshRepo;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final JwtUtil jwtUtil;

    // helper function for verification
    private User authenticate(String email, String password) {
        Optional<User> userFound = userRepository.findByEmail(email);

        if (userFound.isEmpty())
            throw new UsernameNotFoundException("Email not found");

        if (!encoder.matches(password, userFound.get().getPassword()))
            throw new BadCredentialsException("Password is invalid");

        return userFound.get();
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
    public User loadOrCreateUser(GoogleIdToken.Payload payload) {
        try {
            Optional<User> optUser = userRepository.findByEmail(payload.getEmail());
            String firstName = (String) payload.get("given_name");
            String lastName = (String) payload.get("family_name");

            if (optUser.isEmpty()) {
                User insertUser = new User();
                insertUser.setEmail(payload.getEmail());
                insertUser.setFullName(lastName.concat(" " + firstName));

                // default value when not updated
                insertUser.setIdentityNumber(UUID.randomUUID().toString());
                insertUser.setPassword(
                        encoder.encode("Aa" + UUID.randomUUID().toString().substring(0, 10))
                );
                insertUser.setPhoneNumber(null);
                insertUser.setAddress(null);
                insertUser.setBirthdate(null);
                insertUser.setAge(null);
                insertUser.setGender("MALE");
                insertUser.setRoleCode("USER");
                insertUser.setIsActive(true);

                userRepository.save(insertUser);
                return insertUser;
            }

            return optUser.get();
        } catch (RuntimeException e) {
            System.out.println("error google login " + e);
            return null;
        }
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

        refreshRepo.save(refreshToken);
        return refreshToken;
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
}
