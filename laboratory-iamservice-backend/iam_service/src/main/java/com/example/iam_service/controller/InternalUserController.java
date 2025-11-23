package com.example.iam_service.controller;


import com.example.iam_service.dto.user.UserDTO;
import com.example.iam_service.entity.User;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.serviceImpl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {
    private final UserServiceImpl userService;
    private final UserMapper userMapper;

    @GetMapping("/{email}")
    public ResponseEntity<UserDTO> findUserByEmail(
            @PathVariable("email") String email
    ) {
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(userMapper.toDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }
}
