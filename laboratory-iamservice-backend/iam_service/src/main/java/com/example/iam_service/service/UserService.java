package com.example.iam_service.service;

import com.example.iam_service.entity.User;
import java.util.Optional;
import java.util.List;

public interface UserService {
    User createUser(User user);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
}
