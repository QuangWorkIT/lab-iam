package com.example.notification_service.service;

import com.example.notification_service.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient("iam-service")
public interface IamClient {

    @GetMapping("internal/users/{email}")
    ResponseEntity<UserDTO> findUserByEmail(@PathVariable("email") String email);
}
