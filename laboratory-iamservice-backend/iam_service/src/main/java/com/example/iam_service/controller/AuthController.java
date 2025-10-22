package com.example.iam_service.controller;

import com.example.iam_service.dto.request.GoogleTokenRequest;
import com.example.iam_service.dto.request.LoginRequest;
import com.example.iam_service.dto.response.ApiResponse;
import com.example.iam_service.dto.response.auth.TokenResponse;
import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.serviceImpl.AuthenticationServiceImpl;
import com.example.iam_service.serviceImpl.LoginLimiterServiceImpl;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationServiceImpl authService;
    private final LoginLimiterServiceImpl loginLimiterService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest loginRq,
            @RequestHeader(value = "X-Forwarded-For", required = false) String clientIp,
            HttpServletRequest servletRequest
    ) throws UsernameNotFoundException {
        try {
            String ip = clientIp != null ? clientIp : servletRequest.getRemoteAddr();

            if (loginLimiterService.isBanned(ip)) {
                return ResponseEntity
                        .status(429)
                        .body(new ApiResponse<>(
                                loginLimiterService.getBanUntil(ip).toString(),
                                String.format("Too many attempts. Try after %s minutes",
                                        loginLimiterService.getBanUntil(ip).toString())
                        ));
            }

            // verify user's credentials
            Map<String, String> tokens = authService.login(loginRq.getEmail(), loginRq.getPassword());

            // set cookie and reset attempt if authenticated
            ResponseCookie cookie = setCookieToken(tokens.get("refreshToken"));
            loginLimiterService.resetAttempt(ip);

            return ResponseEntity
                    .ok()
                    .header("Set-cookie", cookie.toString())
                    .body(new ApiResponse<>(
                            "success",
                            "login success",
                            new TokenResponse(
                                    tokens.get("accessToken"),
                                    tokens.get("refreshToken")
                            )));

        } catch (UsernameNotFoundException | BadCredentialsException e) {
            loginLimiterService.recordFailedAttempt(
                    clientIp != null
                            ? clientIp
                            : servletRequest.getRemoteAddr()
            );
            return ResponseEntity
                    .status(401)
                    .body(new ApiResponse<>("Error", e.getMessage()));
        }
    }

    @PostMapping("/login-google")
    public ResponseEntity<ApiResponse<TokenResponse>> googleLogin(
            @Valid @RequestBody GoogleTokenRequest credential
    ) {
        // verify google credentials
        GoogleIdToken.Payload payload = authService.getPayload(credential.getGoogleCredential());
        User user = authService.loadOrCreateUser(payload);

        // generate tokens
        Map<String, String> tokens = authService.getTokens(user);

        ResponseCookie cookie = setCookieToken(tokens.get("refreshToken"));

        return ResponseEntity
                .ok()
                .header("Set-cookie", cookie.toString())
                .body(new ApiResponse<>(
                        "success",
                        "login success",
                        new TokenResponse(tokens.get("accessToken"), tokens.get("refreshToken"))));
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

        Token validToken = authService.verifyRefreshToken(refreshToken);
        if (validToken == null) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse<>("Error", "Not found or expired refresh token"));
        }

        authService.deleteToken(validToken.getTokenId());

        // regenerate tokens
        Map<String, String> tokens = authService.getTokens(validToken.getUser());

        ResponseCookie cookie = setCookieToken(tokens.get("refreshToken"));

        return ResponseEntity
                .ok()
                .header("Set-cookie", cookie.toString())
                .body(new ApiResponse<>(
                        "success",
                        "refresh success",
                        new TokenResponse(tokens.get("accessToken"), tokens.get("refreshToken"))));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
    ) {
        try {
            if (!refreshToken.trim().isEmpty()) {
                authService.deleteToken(refreshToken);
            }

            ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                    .maxAge(0)
                    .secure(false)
                    .httpOnly(true)
                    .path("/")
                    .sameSite("Lax")
                    .build();

            return ResponseEntity
                    .ok()
                    .header("Set-cookie", clearCookie.toString())
                    .body(new ApiResponse<>(
                            "success",
                            "logout success"
                    ));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse<>("Error", "Error logout " + e.getMessage()));
        }
    }

    // helper function to set header cookie
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
