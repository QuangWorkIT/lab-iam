package com.example.iam_service.service;

import com.example.iam_service.entity.User;

public interface LoginService {
    User authenticate(String email, String password);
}
