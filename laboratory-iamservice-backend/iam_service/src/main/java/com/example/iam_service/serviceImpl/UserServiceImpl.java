package com.example.iam_service.serviceImpl;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.entity.User;
import com.example.iam_service.external.PatientVerificationService;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.EmailService;
import com.example.iam_service.service.UserService;
import com.example.iam_service.util.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditPublisher auditPublisher;
    private final PatientVerificationService patientVerificationService;

    @Override
    @Transactional
    public User createUser(User user) {
        validateUniqueEmail(user.getEmail());

        // Step 1. Prepare the user object
        String plainPassword = null;

        if ("PATIENT".equalsIgnoreCase(user.getRoleCode())) {
            plainPassword = preparePatientUser(user);
        } else {
            handleNonPatientCreation(user);
        }

        // Step 2. Save user first (transactional)
        User savedUser = userRepository.save(user);

        // Step 3. If the save succeeded, handle post-save actions
        if ("PATIENT".equalsIgnoreCase(savedUser.getRoleCode()) && plainPassword != null) {
            // Send email only after the DB commit is successful
            // (this code runs inside @Transactional, so commit will happen after this returns)
            emailService.sendPasswordEmail(savedUser.getEmail(), plainPassword);

            auditPublisher.publish(AuditEvent.builder()
                    .eventType("PATIENT_CREATED")
                    .actor("SYSTEM")
                    .target(savedUser.getEmail())
                    .role(savedUser.getRoleCode())
                    .timestamp(OffsetDateTime.now())
                    .details("Patient account created and credentials emailed")
                    .build());
        }

        return savedUser;
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

    @Override
    public List<User> getInactiveUsers() {
        return userRepository.findByIsActiveFalse();
    }

    @Override
    @Transactional
    public void activateUserByEmail(String email) {
        int updated = userRepository.activateUserByEmail(email);

        if (updated == 0) {
            throw new IllegalArgumentException("User not found or already active: " + email);
        }

        auditPublisher.publish(AuditEvent.builder()
                .eventType("ACCOUNT_ACTIVATED")
                .actor("ADMIN")
                .target(email)
                .timestamp(OffsetDateTime.now())
                .details("User account activated by admin")
                .build());
    }

    // ================= PRIVATE HELPERS =================

    private void validateUniqueEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }
    }

    private String preparePatientUser(User user) {
        boolean exists = patientVerificationService.verifyPatientExists(user.getEmail());
        if (!exists) {
            throw new IllegalArgumentException("Patient verification failed: no existing patient record found for email " + user.getEmail());
        }

        // Generate password but don't email yet
        String generatedPassword = PasswordGenerator.generateRandomPassword();
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setIsActive(true); // patient active right away
        return generatedPassword; // return plain password for post-save email
    }

    private void handleNonPatientCreation(User user) {
        validatePassword(user.getPassword());
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (isCreatedByLabManager() && !"PATIENT".equalsIgnoreCase(user.getRoleCode())) {
            user.setIsActive(false);
            auditPublisher.publish(AuditEvent.builder()
                    .eventType("ACCOUNT_PENDING_APPROVAL")
                    .actor("LAB_MANAGER")
                    .target(user.getEmail())
                    .role(user.getRoleCode())
                    .timestamp(OffsetDateTime.now())
                    .details("Account created by Lab Manager and awaiting admin approval")
                    .build());
        } else {
            user.setIsActive(true);
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required for non-patient roles");
        }
        if (!password.matches("^(?=.*[a-z])(?=.*[A-Z]).{8,}$")) {
            throw new IllegalArgumentException("Password must be at least 8 characters long and include at least one uppercase and one lowercase letter");
        }
    }

    private boolean isCreatedByLabManager() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if ("LAB_MANAGER".equalsIgnoreCase(authority.getAuthority())) {
                return true;
            }
        }

        return false;
    }
}
