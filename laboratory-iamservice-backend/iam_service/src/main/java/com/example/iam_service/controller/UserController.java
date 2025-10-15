package com.example.iam_service.controller;

import com.example.iam_service.model.User;
import com.example.iam_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users") // all routes start with /api/users
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 🧠 POST /api/users
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User saved = userService.createUser(user);
        return ResponseEntity.ok(saved);
    }

    // 🔍 GET /api/users/email/{email}
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
}
