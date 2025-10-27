package com.example.iam_service.service;

import com.example.iam_service.entity.User;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface UserService {
    User createUser(User user);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
    List<User> getInactiveUsers();
    void activateUserByEmail(String email);
    Optional<User> getUserById(UUID id);
    User updateUser(UUID id, User userDTO);
}
