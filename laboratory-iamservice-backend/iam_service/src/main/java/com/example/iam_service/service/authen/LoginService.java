package com.example.iam_service.service.authen;

import java.util.Map;

public interface LoginService {
    Map<String, String> login(String email, String password);
}
