package com.example.iam_service.serviceImpl;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.dto.user.AdminUpdateUserDTO;
import com.example.iam_service.dto.user.UpdateUserProfileDTO;
import com.example.iam_service.entity.Enum.Privileges;
import com.example.iam_service.entity.User;
import com.example.iam_service.external.PatientVerificationService;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.EmailService;
import com.example.iam_service.service.UserService;
import com.example.iam_service.util.AuditDiffUtil;
import com.example.iam_service.util.PasswordGenerator;
import com.example.iam_service.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditPublisher auditPublisher;
    private final PatientVerificationService patientVerificationService;
    private final SecurityUtil securityUtil;

    @Override
    @Transactional
    public User createUser(User user) {
        User actor = securityUtil.getCurrentUser();
        validateUniqueEmail(user.getEmail());

        // Automatically calculate age if not provided
        if (user.getBirthdate() != null && user.getAge() == null) {
            user.setAge(calculateAge(user.getBirthdate()));
        }

        String plainPassword = null;

        if ("ROLE_PATIENT".equalsIgnoreCase(user.getRoleCode())) {
            plainPassword = preparePatientUser(user);
        } else {
            handleNonPatientCreation(user);
        }

        User savedUser = userRepository.save(user);

        if ("ROLE_PATIENT".equalsIgnoreCase(savedUser.getRoleCode()) && plainPassword != null) {
            emailService.sendPasswordEmail(savedUser.getEmail(), plainPassword);
            auditPublisher.publish(AuditEvent.builder()
                    .eventType("PATIENT_CREATED")
                    .actor(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                    .target(String.valueOf(savedUser.getUserId()))
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
        User actor = securityUtil.getCurrentUser();

        User target = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        if (Boolean.TRUE.equals(target.getIsActive())) {
            throw new IllegalArgumentException("User already active: " + email);
        }

        if (Boolean.TRUE.equals(target.getIsDeleted())) {
            throw new IllegalStateException("Cannot activate a deleted user: " + email);
        }

        target.setIsActive(true);
        userRepository.save(target);

        auditPublisher.publish(AuditEvent.builder()
                .eventType("ACCOUNT_ACTIVATED")
                .actor(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                .target(String.valueOf(target.getUserId()))
                .role(target.getRoleCode()) //
                .timestamp(OffsetDateTime.now())
                .details("User account activated")
                .build());
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    @Override
    public User updateOwnProfile(UUID id, UpdateUserProfileDTO dto) {
        User actor = securityUtil.getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (Boolean.TRUE.equals(user.getIsDeleted()) || user.getDeletedAt() != null) {
            throw new IllegalStateException("You cannot update account information during deletion period.");
        }

        // snapshot old state
        User beforeUpdate = new User();
        BeanUtils.copyProperties(user, beforeUpdate);

        // apply updates
        userMapper.updateUserFromProfileDto(dto, user);
        if (dto.getBirthdate() != null) {
            user.setAge(calculateAge(dto.getBirthdate()));
        }

        User updatedUser = userRepository.save(user);

        // build human-readable diff string
        String diffDetails = AuditDiffUtil.generateDiff(beforeUpdate, updatedUser);

        // publish the audit log
        auditPublisher.publish(AuditEvent.builder()
                .eventType("SELF_PROFILE_UPDATED")
                .actor(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                .target(String.valueOf(user.getUserId()))
                .role(user.getRoleCode())
                .timestamp(OffsetDateTime.now())
                .details(diffDetails)
                .build());

        return updatedUser;
    }


    @Override
    public User adminUpdateUser(UUID id, AdminUpdateUserDTO dto) {
        User actor = securityUtil.getCurrentUser();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (Boolean.TRUE.equals(user.getIsDeleted()) || user.getDeletedAt() != null) {
            throw new IllegalStateException("This account is pending for deletion/already deleted.");
        }

        User beforeUpdate = new User();
        BeanUtils.copyProperties(user, beforeUpdate);

        userMapper.updateUserFromAdminDto(dto, user);

        if (dto.getBirthdate() != null) {
            user.setAge(calculateAge(dto.getBirthdate()));
        }

        User updatedUser = userRepository.save(user);

        // build human-readable diff string
        String diffDetails = AuditDiffUtil.generateDiff(beforeUpdate, updatedUser);

        // publish the audit log
        auditPublisher.publish(AuditEvent.builder()
                .eventType("USER_UPDATED")
                .actor(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                .target(String.valueOf(user.getUserId()))
                .role(user.getRoleCode())
                .timestamp(OffsetDateTime.now())
                .details(diffDetails)
                .build());

        return updatedUser;
    }

    public void requestDeletion(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (!"ROLE_PATIENT".equals(user.getRoleCode())) {
            throw new IllegalStateException("Only patients can request their own account deletion.");
        }

        if (user.getDeletedAt() != null) {
            throw new IllegalStateException("Deletion already requested for this account.");
        }

        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
        LocalDateTime deletionTime = ZonedDateTime.now(zone)
                .plusDays(7)
                .withHour(2)
                .withMinute(59)
                .withSecond(0)
                .withNano(0)
                .toLocalDateTime();

        user.setDeletedAt(deletionTime);

        userRepository.save(user);

        auditPublisher.publish(AuditEvent.builder()
                .eventType("USER_SELF_DELETION")
                .actor(user.getUserId() + " (" + user.getRoleCode() + ")")
                .target(String.valueOf(user.getUserId()))
                .role(user.getRoleCode())
                .timestamp(OffsetDateTime.now())
                .details("Patient requested their own account deletion.")
                .build());
    }

    public void adminDeleteUser(UUID userId) {
        User actor = securityUtil.getCurrentUser();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if ("ROLE_PATIENT".equals(user.getRoleCode())) {
            throw new IllegalStateException("Only patients can require their own account deletion.");
        }

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new IllegalStateException("User is already deleted.");
        }

        user.setIsDeleted(true);
        user.setIsActive(false);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        auditPublisher.publish(AuditEvent.builder()
                .eventType("USER_DELETE")
                .actor(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                .target(String.valueOf(user.getUserId()))
                .role(user.getRoleCode())
                .timestamp(OffsetDateTime.now())
                .details("System admin deletes user.")
                .build());
    }

    @Transactional
    public void deactivateAndAnonymizeExpiredUsers() {
        List<User> expired = userRepository.findAllByIsDeletedFalseAndDeletedAtBefore(LocalDateTime.now());

        for (User user : expired) {
            user.setIsActive(false);
            user.setIsDeleted(true);

            String anonId = user.getUserId().toString().substring(0, 8);
            user.setEmail("deleted_" + anonId + "@example.com");
            user.setFullName("Deleted User");
            user.setPhoneNumber(null);
            user.setIdentityNumber(null);
            user.setAddress(null);
            user.setBirthdate(null);
            user.setAge(null);
        }

        userRepository.saveAll(expired);

        if (!expired.isEmpty()) {
            auditPublisher.publish(AuditEvent.builder()
                    .eventType("SYSTEM_USER_DEACTIVATION_ANONYMIZATION_BATCH")
                    .actor("System Scheduler")
                    .role("SYSTEM")
                    .timestamp(OffsetDateTime.now())
                    .details("Anonymized " + expired.size() + " user(s). IDs: " +
                            expired.stream()
                                    .map(u -> u.getUserId().toString())
                                    .collect(Collectors.joining(", ")))
                    .build());
        }
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

        User actor = securityUtil.getCurrentUser();
        boolean isAdmin = isCreatedByAdmin();

        if (!isAdmin && !"ROLE_PATIENT".equalsIgnoreCase(user.getRoleCode())) {
            // non-admin (lab manager, etc.) creates account → requires approval
            user.setIsActive(false);
            auditPublisher.publish(AuditEvent.builder()
                    .eventType("USER_CREATED_PENDING_APPROVAL")
                    .actor(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                    .target(String.valueOf(user.getUserId()))
                    .role(user.getRoleCode())
                    .timestamp(OffsetDateTime.now())
                    .details("Account created by non-admin and awaiting admin approval")
                    .build());
        } else {
            user.setIsActive(true);
            auditPublisher.publish(AuditEvent.builder()
                    .eventType("USER_CREATED")
                    .actor(actor.getUserId() + " (" + actor.getRoleCode() + ")")
                    .target(String.valueOf(user.getUserId()))
                    .role(user.getRoleCode())
                    .timestamp(OffsetDateTime.now())
                    .details("Account created and activated by admin")
                    .build());
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

    private boolean isCreatedByAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_ADMIN".equalsIgnoreCase(auth.getAuthority()));
    }

    private int calculateAge(LocalDate birthdate) {
        return Period.between(birthdate, LocalDate.now()).getYears();
    }
}
