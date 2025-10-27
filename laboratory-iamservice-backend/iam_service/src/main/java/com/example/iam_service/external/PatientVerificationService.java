package com.example.iam_service.external;

import org.springframework.stereotype.Service;

@Service
public class PatientVerificationService {

    // Mock version for now
    public boolean verifyPatientExists(String email) {

        if ("urpair2905@gmail.com".equalsIgnoreCase(email)) {
            return false;
        }

        // 🧠 TODO: later call external service via RestTemplate or WebClient
        // For now, just simulate: return true if email != null
        return email != null;
    }
}
