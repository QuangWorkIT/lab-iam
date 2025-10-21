package com.example.iam_service.controller;

import com.example.iam_service.dto.UserDTO;
import com.example.iam_service.entity.User;
import com.example.iam_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import com.example.iam_service.mapper.UserMapper;


import java.util.List;

@RestController
@RequestMapping("/api/users") // all routes start with /api/users
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody User user) {
        User saved = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDto(saved));
    }

    @GetMapping("/email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(userMapper.toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers(); // returns entity list
        List<UserDTO> userDTOs = users.stream()
                .map(userMapper::toDto)
                .toList();
        return ResponseEntity.ok(userDTOs);
    }
}
