package com.example.iam_service.service;

import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenService {

    void deleteToken(String tokenId);

    Token findByToken(String tokenId);

    Token generateRefreshToken(User user);

    Token verifyToken(String tokenId);
}
