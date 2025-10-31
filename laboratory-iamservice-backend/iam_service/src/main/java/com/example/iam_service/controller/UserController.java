package com.example.iam_service.controller;

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


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users") // all routes start with /api/users
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @PreAuthorize("hasAuthority('CREATE_USER') or hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody User user) {
        User saved = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDto(saved));
    }

    @PreAuthorize("hasAuthority('VIEW_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_LAB_MANAGER')")
    @GetMapping("/email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(userMapper.toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAuthority('VIEW_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_LAB_MANAGER')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers(); // returns entity list
        List<UserDTO> userDTOs = users.stream()
                .map(userMapper::toDto)
                .toList();
        return ResponseEntity.ok(userDTOs);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN') ")
    @GetMapping("/inactive")
    public ResponseEntity<List<UserDTO>> getInactiveUsers() {
        List<User> inactiveUsers = userService.getInactiveUsers();
        List<UserDTO> dtoList = inactiveUsers.stream()
                .map(userMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtoList);
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN') ")
    @PutMapping("/activate")
    public ResponseEntity<String> activateUserByEmail(@RequestParam String email) {
        userService.activateUserByEmail(email);
        return ResponseEntity.ok("User with email " + email + " has been activated successfully.");
    }

    @PreAuthorize("hasAuthority('VIEW_USER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_LAB_MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(userMapper.toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserDTO> updateOwnProfile(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserProfileDTO dto) {

        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!currentUser.getUserId().equals(id)) {
            throw new AccessDeniedException("You can only update your own profile!");
        }

        User updatedUser = userService.updateOwnProfile(id, dto);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('MODIFY_USER') or hasAuthority('ROLE_LAB_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUserByAdmin(
            @PathVariable UUID id,
            @Valid @RequestBody AdminUpdateUserDTO dto) {

        User updatedUser = userService.adminUpdateUser(id, dto);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<DetailUserDTO> viewDetailedInformation (@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(userMapper.toDetailDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}
