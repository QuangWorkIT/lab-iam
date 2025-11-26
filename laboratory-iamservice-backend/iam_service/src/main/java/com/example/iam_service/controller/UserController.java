package com.example.iam_service.controller;

import com.example.iam_service.dto.response.ApiResponse;
import com.example.iam_service.dto.user.AdminUpdateUserDTO;
import com.example.iam_service.dto.user.DetailUserDTO;
import com.example.iam_service.dto.user.UpdateUserProfileDTO;
import com.example.iam_service.dto.user.UserDTO;
import com.example.iam_service.entity.User;
import com.example.iam_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import com.example.iam_service.mapper.UserMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "User Management", description = "APIs for managing users and their accounts")
@RestController
@RequestMapping("/users") // all routes start with /api/users
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @Operation(
            summary = "Create a new user",
            description = "Admins or users with CREATE_USER permission can create new accounts. " +
                    "Automatically calculates age and sends credentials if it's a patient."
    )
    @PreAuthorize("hasAuthority('CREATE_USER') or hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody User user) {
        User saved = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDto(saved));
    }

    @Operation(
            summary = "Get user by email",
            description = "Retrieve a user by their email. Available to admins and lab managers or anyone with permission VIEW_USER."
    )
    @PreAuthorize("hasAuthority('VIEW_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_LAB_MANAGER')")
    @GetMapping("/email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(userMapper.toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Get all users",
            description = "Retrieve all users excluding deleted ones."
    )
    @PreAuthorize("hasAuthority('VIEW_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_LAB_MANAGER')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers(); // returns entity list
        List<UserDTO> userDTOs = users.stream()
                .map(userMapper::toDto)
                .toList();
        return ResponseEntity.ok(userDTOs);
    }

    @Operation(
            summary = "Get all inactive users",
            description = "Retrieve all inactivate users. Available to admin only."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN') ")
    @GetMapping("/inactive")
    public ResponseEntity<List<UserDTO>> getInactiveUsers() {
        List<User> inactiveUsers = userService.getInactiveUsers();
        List<UserDTO> dtoList = inactiveUsers.stream()
                .map(userMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtoList);
    }

    @Operation(
            summary = "Activate an account",
            description = "Change an account's status to activate, available to admins only."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN') ")
    @PutMapping("/activate")
    public ResponseEntity<String> activateUserByEmail(@RequestParam String email) {
        userService.activateUserByEmail(email);
        return ResponseEntity.ok("User with email " + email + " has been activated successfully.");
    }

    @Operation(
            summary = "Get detailed information of an user by userId",
            description = "Retrieve a user by their userId. Available to admins and lab managers or anyone with permission VIEW_USER."
    )
    @PreAuthorize("hasAuthority('VIEW_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_LAB_MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<DetailUserDTO> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(userMapper.toDetailDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Update account information",
            description = "User can update their own account information excluding identityNumber."
    )
    @PutMapping("/{id}/profile")
    public ResponseEntity<DetailUserDTO> updateOwnProfile(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserProfileDTO dto) {

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!currentUser.getUserId().equals(id)) {
            throw new AccessDeniedException("You can only update your own profile!");
        }

        User updatedUser = userService.updateOwnProfile(id, dto);
        return ResponseEntity.ok(userMapper.toDetailDto(updatedUser));
    }


    @Operation(
            summary = "Update account information",
            description = "Admins or users with MODIFY_USER permission can create new accounts. Age is automatically calculated"
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('MODIFY_USER') or hasAuthority('ROLE_LAB_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUserByAdmin(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateUserDTO dto) {

        User updatedUser = userService.adminUpdateUser(id, dto);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @Operation(
            summary = "Get a user's detailed account information",
            description = "A user retrieve their own account information."
    )
    @GetMapping("/{id}/profile")
    public ResponseEntity<DetailUserDTO> viewDetailedInformation(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(userMapper.toDetailDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Request account deletion",
            description = "Patient user can request to delete their own account information."
    )
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    @DeleteMapping("/{id}/request-deletion")
    public ResponseEntity<String> requestSelfDeletion(@PathVariable UUID id) {
        userService.requestDeletion(id);
        return ResponseEntity.ok("Your deletion request has been submitted. Account will be deleted after 7 days.");
    }

    @Operation(
            summary = "User deletion",
            description = "Admins or users with DELETE_USER permission can delete a user whose role is not patient." +
                    "Changes will be applied immediately."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('DELETE_USER') or hasAuthority('ROLE_LAB_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserByAdmin(@PathVariable UUID id) {
        userService.adminDeleteUser(id);
        return ResponseEntity.ok("User deleted successfully.");
    }

    @Operation(
            summary = "Get all deleted users",
            description = "Retrieve all deleted users. Available to admins only."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/deleted")
    public ResponseEntity<List<UserDTO>> getDeletedUsers() {
        List<User> deletedUsers = userService.getDeletedUsers();
        List<UserDTO> dtoList = deletedUsers.stream()
                .map(userMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtoList);
    }

    @Operation(
            summary = "Restore a deleted user",
            description = "Restore a deleted user. Available to admins only." +
                    "Can only restore patients whose account hasn't been anonymized."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}/restore")
    public ResponseEntity<String> restoreUser(@PathVariable UUID id) {
        userService.restoreUser(id);
        return ResponseEntity.ok("User restored successfully.");
    }

    @Operation(
            summary = "Update a user by email",
            description = "Admins or users with MODIFY_USER permission can update a user's information by their email."
    )
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('MODIFY_USER') or hasAuthority('ROLE_LAB_MANAGER')")
    @PutMapping("/email")
    public ResponseEntity<UserDTO> updateUserByEmail(
            @RequestParam String email,
            @Valid @RequestBody AdminUpdateUserDTO dto) {

        User updatedUser = userService.updateUserByEmail(email, dto);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @Operation(
            summary = "Batch create patient users",
            description = "Admins or users with CREATE_USER permission can create multiple patient users in a batch. " +
                    "Invalid or duplicate emails will be skipped, valid users will receive credentials via email."
    )
    @PreAuthorize("hasAuthority('CREATE_USER') or hasAuthority('ROLE_ADMIN')")
    @PostMapping("/batch/patients")
    public ResponseEntity<List<UserDTO>> batchCreatePatientUsers(
            @Valid @RequestBody List<User> users) {

        List<User> createdUsers = userService.batchCreatePatientUsers(users);
        List<UserDTO> dtoList = createdUsers.stream()
                .map(userMapper::toDto)
                .toList();

        return ResponseEntity.status(HttpStatus.CREATED).body(dtoList);
    }

    @Operation(
            summary = "Get the number of roles by users",
            description = "Retrieve the total of roles."
    )
    @PreAuthorize("hasAuthority('VIEW_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_LAB_MANAGER')")
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getAllRolesByUsers() {
        List<User> users = userService.getAllUsers();
        if (users == null || users.isEmpty()) {
            return ResponseEntity
                    .status(404)
                    .body(new ApiResponse<>("Error", "No user found"));
        }

        Map<String, Integer> totalOfRoles = new HashMap<>();
        users.forEach(user -> {
            String key = user.getRoleCode().startsWith("ROLE_")
                    ? user.getRoleCode().substring(5)
                    : user.getRoleCode();
            int counter = totalOfRoles.get(key) != null
                    ? totalOfRoles.get(key)
                    : 0;
            totalOfRoles.put(key, ++counter);
        });

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        "Fetched all roles in system",
                        totalOfRoles));
    }
}
