package com.example.iam_service.repository;

import com.example.iam_service.entity.User;
import com.example.iam_service.util.RoleSpecification;
import com.example.iam_service.util.UserSpecification;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByEmail(String email);
    // 🔹 Find all users who are not active
    List<User> findByIsActiveFalse();

    // 🔹 Activate user by ID
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.isActive = TRUE WHERE LOWER(u.email) = LOWER(:email)")
    int activateUserByEmail(String email);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "UPDATE \"User\" SET rolecode = :newRoleCode WHERE rolecode = :oldRoleCode",
            nativeQuery = true)
    int batchUpdateUser(@Param("newRoleCode") String newRoleCode,
                        @Param("oldRoleCode") String oldRoleCode);

    List<User> findAllByIsDeletedFalseAndDeletedAtBefore(LocalDateTime now);
    List<User> findAllByIsDeletedTrueOrDeletedAtIsNotNull();
    List<User> findAllByIsDeletedFalse();


}