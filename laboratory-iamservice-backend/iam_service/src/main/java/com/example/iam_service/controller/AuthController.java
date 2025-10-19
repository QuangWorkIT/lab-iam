package com.example.iam_service.controller;

import com.example.iam_service.dto.request.LoginRequest;
import com.example.iam_service.dto.response.ApiResponse;
import com.example.iam_service.dto.response.auth.TokenResponse;
import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.serviceImpl.LoginServiceImpl;
import com.example.iam_service.serviceImpl.RefreshTokenServiceImpl;
import com.example.iam_service.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final JwtUtil jwtUtil;
    private final RefreshTokenServiceImpl refreshTokenService;
    private final LoginServiceImpl loginService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest loginRq
    ) throws UsernameNotFoundException {
        try {
            User user = loginService.authenticate(loginRq.getEmail(), loginRq.getPassword());

            String token = jwtUtil.generateToken(user);
            Token refreshToken = refreshTokenService.generateRefreshToken(user);

            ResponseCookie cookie = setCookieToken(refreshToken.getTokenId());

            return ResponseEntity
                    .ok()
                    .header("Set-cookie", cookie.toString())
                    .body(new ApiResponse<>(
                            "success",
                            "login success",
                            new TokenResponse(token, refreshToken.getTokenId())));
        } catch (Exception e) {
            System.out.println("error login " + e);
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse<>("Error", "Invalid credentials"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
    ) {
        if (refreshToken == null) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse<>("Error", "Invalid refresh token"));
        }

        Token validToken = refreshTokenService.verifyToken(refreshToken);
        if (validToken == null) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse<>("Error", "Not found or expired refresh token"));
        }

        refreshTokenService.deleteToken(validToken.getTokenId());

        // regenerate tokens
        String accessToken = jwtUtil.generateToken(validToken.getUser());
        Token generatedToken = refreshTokenService.generateRefreshToken(validToken.getUser());

        ResponseCookie cookie = setCookieToken(generatedToken.getTokenId());

        return ResponseEntity
                .ok()
                .header("Set-cookie", cookie.toString())
                .body(new ApiResponse<>(
                        "success",
                        "refresh success",
                        new TokenResponse(accessToken, generatedToken.getTokenId())));
    }

    private ResponseCookie setCookieToken(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .maxAge(7 * 24 * 60 * 60)
                .secure(false) // change to true in production
                .httpOnly(true)
                .path("/")
                .sameSite("Lax") // change to None in production
                .build();
    }
}
