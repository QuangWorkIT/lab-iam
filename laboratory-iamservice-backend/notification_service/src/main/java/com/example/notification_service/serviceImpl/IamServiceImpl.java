package com.example.notification_service.serviceImpl;

import com.example.notification_service.dto.UserDTO;
import com.example.notification_service.service.IamClient;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IamServiceImpl {

    private final IamClient iamClient;

    public UserDTO findUserByEmail(String email) {
        try {
            ResponseEntity<UserDTO> userResponse = iamClient.findUserByEmail(email);
            if (!userResponse.getStatusCode().is2xxSuccessful()) {
                return null;
            }
            return userResponse.getBody();
        } catch (FeignException e) {
            System.out.println("Error fetching user " + e.getMessage());
            return null;
        }
    }
}
