package com.example.iam_service.service;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.dto.user.AdminUpdateUserDTO;
import com.example.iam_service.dto.user.UpdateUserProfileDTO;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private AuditPublisher auditPublisher;
    @Mock private PatientVerificationService patientVerificationService;
    @Mock private com.example.iam_service.mapper.UserMapper userMapper;

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

    @Test
    void createUser_ShouldSetActive_WhenAdminCreatesNonPatient() {
        // simulate admin (not lab manager)
        mockNonLabManagerAuth();
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.createUser(doctorUser);

        assertTrue(result.getIsActive());
        verify(auditPublisher, never()).publish(argThat(
                e -> e.getEventType().equals("ACCOUNT_PENDING_APPROVAL")
        ));
    }

    @Test
    void validatePassword_ShouldPass_WhenPasswordStrong() {
        // indirectly tested via successful non-patient creation
        mockNonLabManagerAuth();
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.createUser(doctorUser);
        assertNotNull(result);
    }

    @Test
    void getUserById_ShouldReturnOptionalUser() {
        when(userRepository.findById(any())).thenReturn(Optional.of(doctorUser));
        Optional<User> found = userService.getUserById(UUID.randomUUID());
        assertTrue(found.isPresent());
    }

    @Test
    void getAllUsers_ShouldReturnList() {
        when(userRepository.findAll()).thenReturn(List.of(doctorUser, patientUser));
        List<User> list = userService.getAllUsers();
        assertEquals(2, list.size());
    }

    @Test
    void getInactiveUsers_ShouldReturnList() {
        when(userRepository.findByIsActiveFalse()).thenReturn(List.of(patientUser));
        List<User> list = userService.getInactiveUsers();
        assertEquals(1, list.size());
    }

    @Test
    void updateUser_ShouldModifyOnlyProvidedFields() {
        UUID id = UUID.randomUUID();
        User existing = new User();
        existing.setFullName("Old");
        existing.setPhoneNumber("123");

        User patch = new User();
        patch.setFullName("NewName");
        patch.setAddress("NewAddress");

        when(userRepository.findById(id)).thenReturn(Optional.of(existing));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.updateUser(id, patch);
        assertEquals("NewName", result.getFullName());
        assertEquals("NewAddress", result.getAddress());
        assertEquals("123", result.getPhoneNumber());
    }

    @Test
    void updateOwnProfile_ShouldUpdateAndRecalculateAge() {
        UUID id = UUID.randomUUID();
        UpdateUserProfileDTO dto = new UpdateUserProfileDTO();
        dto.setBirthdate(LocalDate.of(2000, 1, 1));

        User existing = new User();
        existing.setUserId(id);
        existing.setEmail("test@x.com");

        when(userRepository.findById(id)).thenReturn(Optional.of(existing));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.updateOwnProfile(id, dto);
        verify(userMapper).updateUserFromProfileDto(eq(dto), eq(existing));
        assertNotNull(result.getAge());
    }

    @Test
    void adminUpdateUser_ShouldUpdateAndRecalculateAge() {
        UUID id = UUID.randomUUID();
        AdminUpdateUserDTO dto = new AdminUpdateUserDTO();
        dto.setBirthdate(LocalDate.of(1995, 5, 5));

        User existing = new User();
        existing.setUserId(id);

        when(userRepository.findById(id)).thenReturn(Optional.of(existing));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.adminUpdateUser(id, dto);
        verify(userMapper).updateUserFromAdminDto(eq(dto), eq(existing));
        assertNotNull(result.getAge());
    }

    @Test
    void updateUser_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> userService.updateUser(UUID.randomUUID(), new User()));
    }

    @Test
    void isCreatedByLabManager_ShouldReturnFalse_WhenNotAuthenticated() {
        SecurityContextHolder.clearContext();
        assertFalse(invokeIsCreatedByLabManager());
    }

    // 🔧 helper to call private method using reflection
    private boolean invokeIsCreatedByLabManager() {
        try {
            var method = UserServiceImpl.class.getDeclaredMethod("isCreatedByLabManager");
            method.setAccessible(true);
            return (boolean) method.invoke(userService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void mockNonLabManagerAuth() {
        Authentication auth = mock(Authentication.class);
        lenient().when(auth.isAuthenticated()).thenReturn(true);
        lenient().doReturn((Collection) List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))).when(auth).getAuthorities();

        SecurityContext ctx = mock(SecurityContext.class);
        lenient().when(ctx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(ctx);
    }
}
