package com.example.iam_service.service.authen;

import com.example.iam_service.entity.User;

public interface ResetPassWordService {
    User searchUserByEmail(String data);

    User updateUserPassword(String userid, String password, String currentPassword, String option);
}
