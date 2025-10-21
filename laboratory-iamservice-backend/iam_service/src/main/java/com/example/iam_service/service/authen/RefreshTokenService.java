package com.example.iam_service.service.authen;

import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;

public interface RefreshTokenService {
    long expiration = 7 * 24 * 60 * 60;

    void deleteToken(String tokenId);

    Token findByToken(String tokenId);

    Token generateRefreshToken(User user);

    Token verifyRefreshToken(String tokenId);
}
