package com.example.iam_service.repository;

import com.example.iam_service.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<Token, UUID> {
    Optional<Token> findByTokenId(String tokenId);
    void deleteByTokenId(String tokenId);
}
