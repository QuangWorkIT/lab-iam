package com.example.iam_service.service;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.entity.User;
import com.example.iam_service.external.PatientVerificationService;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.EmailService;
import com.example.iam_service.serviceImpl.UserServiceImpl;
import com.example.iam_service.util.PasswordGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private AuditPublisher auditPublisher;
    @Mock private PatientVerificationService patientVerificationService;

    @InjectMocks
    private UserServiceImpl userService;

    private User patientUser;
    private User doctorUser;

    @BeforeEach
    void setup() {
        patientUser = new User();
        patientUser.setEmail("patient@example.com");
        patientUser.setRoleCode("ROLE_PATIENT");

        doctorUser = new User();
        doctorUser.setEmail("doctor@example.com");
        doctorUser.setRoleCode("ROLE_DOCTOR");
        doctorUser.setPassword("StrongPass1");
    }

    // ========== PATIENT CREATION FLOW ==========
    @Test
    void createUser_ShouldGenerateAndEmailPassword_WhenRoleIsPatient() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.createUser(patientUser);

        assertTrue(result.getIsActive());
        assertEquals("encoded", result.getPassword());
        verify(emailService).sendPasswordEmail(eq("patient@example.com"), anyString());
        verify(auditPublisher).publish(argThat(
                e -> e.getEventType().equals("PATIENT_CREATED")
        ));
    }

    @Test
    void createUser_ShouldThrow_WhenPatientVerificationFails() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(patientUser));

        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendPasswordEmail(any(), any());
    }

    // ========== NON-PATIENT CREATION FLOW ==========
    @Test
    void createUser_ShouldMarkInactive_WhenLabManagerCreatesNonPatient() {
        mockLabManagerAuth();
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");

        User result = userService.createUser(doctorUser);

        assertFalse(result.getIsActive());
        verify(auditPublisher).publish(argThat(
                e -> e.getEventType().equals("ACCOUNT_PENDING_APPROVAL")
        ));
    }

    @Test
    void createUser_ShouldThrow_WhenPasswordInvalid() {
        doctorUser.setPassword("weak");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        mockLabManagerAuth();

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(doctorUser));
    }

    // ========== COMMON CASES ==========
    @Test
    void createUser_ShouldThrow_WhenEmailExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(doctorUser));
    }

    @Test
    void getUserByEmail_ShouldReturnUser_WhenFound() {
        when(userRepository.findByEmail("x@y.com")).thenReturn(Optional.of(doctorUser));

        Optional<User> result = userService.getUserByEmail("x@y.com");

        assertTrue(result.isPresent());
        assertEquals("ROLE_DOCTOR", result.get().getRoleCode());
    }

    @Test
    void getUserByEmail_ShouldThrow_WhenNotFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.getUserByEmail("missing@y.com"));
    }

    @Test
    void activateUserByEmail_ShouldPublishAudit_WhenSuccess() {
        when(userRepository.activateUserByEmail("x@y.com")).thenReturn(1);

        userService.activateUserByEmail("x@y.com");

        verify(auditPublisher).publish(argThat(
                e -> e.getEventType().equals("ACCOUNT_ACTIVATED")
        ));
    }

    @Test
    void activateUserByEmail_ShouldThrow_WhenUserNotFound() {
        when(userRepository.activateUserByEmail(anyString())).thenReturn(0);

        assertThrows(IllegalArgumentException.class, () -> userService.activateUserByEmail("ghost@y.com"));
    }

    @Test
    void createUser_ShouldAutoCalculateAge_WhenBirthdateProvided() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User user = new User();
        user.setEmail("birthdate@example.com");
        user.setRoleCode("ROLE_PATIENT");
        user.setBirthdate(LocalDate.of(2000, 1, 1)); // 👈 give it a date
        user.setAge(null); // 👈 force age null

        User result = userService.createUser(user);

        assertNotNull(result.getAge(), "Age should be automatically calculated");
        assertTrue(result.getAge() > 0 && result.getAge() < 100, "Age should be realistic");
    }


    // ========== UTIL ==========
    private void mockLabManagerAuth() {
        Authentication auth = mock(Authentication.class);
        lenient().when(auth.isAuthenticated()).thenReturn(true);
        lenient().doReturn((Collection) List.of(new SimpleGrantedAuthority("ROLE_LAB_MANAGER"))).when(auth).getAuthorities();

        SecurityContext ctx = mock(SecurityContext.class);
        lenient().when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }
}
