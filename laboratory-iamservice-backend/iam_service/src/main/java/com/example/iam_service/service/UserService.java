package com.example.iam_service.service;

import com.example.iam_service.dto.user.AdminUpdateUserDTO;
import com.example.iam_service.dto.user.UpdateUserProfileDTO;
import com.example.iam_service.entity.User;

import javax.swing.text.html.Option;
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
    User updateOwnProfile(UUID id, UpdateUserProfileDTO dto);
    User adminUpdateUser(UUID id, AdminUpdateUserDTO dto);
    void requestDeletion(UUID userId);
    void adminDeleteUser(UUID userId);
    void deactivateAndAnonymizeExpiredUsers();
    List<User> getDeletedUsers();
    void restoreUser(UUID userId);
    User updateUserByEmail(String email, AdminUpdateUserDTO dto);
    List<User> batchCreatePatientUsers(List<User> users);
    User createUserByPatientService(User user);
}
