package com.example.iam_service.serviceImpl;

import com.example.iam_service.entity.User;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.EmailService;
import com.example.iam_service.service.UserService;
import com.example.iam_service.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }

        if ("PATIENT".equalsIgnoreCase(user.getRoleCode())) {
            String generatedPassword = PasswordGenerator.generateRandomPassword();
            user.setPassword(passwordEncoder.encode(generatedPassword));
            emailService.sendPasswordEmail(user.getEmail(), generatedPassword);
        } else {
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                throw new IllegalArgumentException("Password is required for non-patient roles");
            }
            if (!user.getPassword().matches("^(?=.*[a-z])(?=.*[A-Z]).{8,}$")) {
                throw new IllegalArgumentException("Password must be at least 8 characters long" +
                        " and include at least one uppercase and one lowercase letter");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("No user found with email: " + email);
        }
        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
