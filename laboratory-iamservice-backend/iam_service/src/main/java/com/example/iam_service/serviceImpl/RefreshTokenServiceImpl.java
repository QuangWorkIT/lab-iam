package com.example.iam_service.serviceImpl;

import com.example.iam_service.entity.Token;
import com.example.iam_service.entity.User;
import com.example.iam_service.repository.RefreshTokenRepository;
import com.example.iam_service.service.RefreshTokenService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {
    private final RefreshTokenRepository refreshRepo;
    private final long expiration = 7 * 24 * 60 * 60;

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
        refreshToken.setExpiredAt(now.plusSeconds(expiration));

        refreshRepo.save(refreshToken);
        return refreshToken;
    }

    @Override
    public Token verifyToken(String tokenId) {
        Token tokenFound = findByToken(tokenId);
        if (tokenFound == null ||
                LocalDateTime.now().isAfter(tokenFound.getExpiredAt())) {
            return null;
        }

        return tokenFound;
    }
}
