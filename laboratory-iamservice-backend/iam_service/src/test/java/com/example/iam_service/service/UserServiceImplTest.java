package com.example.iam_service.service;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.dto.user.AdminUpdateUserDTO;
import com.example.iam_service.dto.user.UpdateUserProfileDTO;
import com.example.iam_service.entity.User;
import com.example.iam_service.external.PatientVerificationService;
import com.example.iam_service.mapper.UserMapper;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.EmailService;
import com.example.iam_service.serviceImpl.UserServiceImpl;
import com.example.iam_service.util.AuditDiffUtil;
import com.example.iam_service.util.PasswordGenerator;
import com.example.iam_service.util.SecurityUtil;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private AuditPublisher auditPublisher;
    @Mock private PatientVerificationService patientVerificationService;
    @Mock private SecurityUtil securityUtil;
    private MockedStatic<AuditDiffUtil> auditDiffMock;


    @InjectMocks private UserServiceImpl userService;

    private User actor;
    private User testUser;

    @BeforeEach
    void setup() {
        actor = new User();
        actor.setEmail("admin@example.com");
        actor.setRoleCode("ROLE_ADMIN");

        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setRoleCode("ROLE_PATIENT");
        testUser.setBirthdate(LocalDate.of(2000, 1, 1));
        testUser.setUserId(UUID.randomUUID());

        lenient().when(securityUtil.getCurrentUser()).thenReturn(actor);
        auditDiffMock = mockStatic(AuditDiffUtil.class);
        auditDiffMock.when(() -> AuditDiffUtil.generateDiff(any(), any())).thenReturn("diff");
    }

    @AfterEach
    void tearDown() {
        // 🧹 close static mock after each test
        auditDiffMock.close();
    }

    // --- createUser tests ---

    @Test
    void createUser_patient_success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.createUser(testUser);

        assertNotNull(result);
        verify(emailService).sendPasswordEmail(eq(testUser.getEmail()), anyString());
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void createUser_calculatesAge_whenBirthdatePresentAndAgeNull() {
        testUser.setBirthdate(LocalDate.of(2000, 1, 1));
        testUser.setAge(null);
        testUser.setRoleCode("ROLE_PATIENT");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.createUser(testUser);

        assertNotNull(testUser.getAge());
    }

    @Test
    void createUser_doesNotCalculateAge_whenBirthdateIsNull() {
        testUser.setBirthdate(null);
        testUser.setAge(null);
        testUser.setRoleCode("ROLE_PATIENT");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.createUser(testUser);

        // should stay null because no birthdate
        assertNull(testUser.getAge());
    }

    @Test
    void createUser_doesNotCalculateAge_whenAgeAlreadySet() {
        testUser.setBirthdate(LocalDate.of(2000, 1, 1));
        testUser.setAge(25);
        testUser.setRoleCode("ROLE_PATIENT");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.createUser(testUser);

        // stays 25, not recalculated
        assertEquals(25, testUser.getAge());
    }


    @Test
    void createUser_patient_verificationFails() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientVerificationService.verifyPatientExists(anyString())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUser));
    }

    @Test
    void createUser_nonPatient_createdByAdmin() {
        testUser.setRoleCode("ROLE_DOCTOR");
        testUser.setPassword("PasswordA123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        mockAdminAuth();

        User result = userService.createUser(testUser);
        assertTrue(result.getIsActive());
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void createUser_nonPatient_createdByNonAdmin() {
        testUser.setRoleCode("ROLE_DOCTOR");
        testUser.setPassword("PasswordA123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        mockNonAdminAuth();

        User result = userService.createUser(testUser);
        assertFalse(result.getIsActive());
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void createUser_duplicateEmail_throws() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUser));
    }

    // --- activateUserByEmail tests ---

    @Test
    void activateUserByEmail_success() {
        User inactiveUser = new User();
        inactiveUser.setEmail("target@example.com");
        inactiveUser.setIsActive(false);
        inactiveUser.setRoleCode("ROLE_DOCTOR");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(inactiveUser));

        userService.activateUserByEmail(inactiveUser.getEmail());

        verify(userRepository).save(inactiveUser);
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void activateUserByEmail_alreadyActive() {
        User activeUser = new User();
        activeUser.setEmail("target@example.com");
        activeUser.setIsActive(true);

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(activeUser));
        assertThrows(IllegalArgumentException.class, () -> userService.activateUserByEmail(activeUser.getEmail()));
    }

    @Test
    void activateUserByEmail_notFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.activateUserByEmail("nope@example.com"));
    }

    // --- getUserByEmail / getAllUsers / getInactiveUsers ---

    @Test
    void getUserByEmail_success() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        assertTrue(userService.getUserByEmail(testUser.getEmail()).isPresent());
    }

    @Test
    void getUserByEmail_notFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.getUserByEmail("notfound@example.com"));
    }

    @Test
    void getAllUsers_success() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));
        assertEquals(1, userService.getAllUsers().size());
    }

    @Test
    void getInactiveUsers_success() {
        when(userRepository.findByIsActiveFalse()).thenReturn(List.of(testUser));
        assertEquals(1, userService.getInactiveUsers().size());
    }

    // --- updateOwnProfile tests ---

    @Test
    void updateOwnProfile_success() {
        UpdateUserProfileDTO dto = new UpdateUserProfileDTO();
        dto.setBirthdate(LocalDate.of(1990, 1, 1));

        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.updateOwnProfile(testUser.getUserId(), dto);
        assertNotNull(result);
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void updateOwnProfile_userNotFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.updateOwnProfile(UUID.randomUUID(), new UpdateUserProfileDTO()));
    }

    @Test
    void updateOwnProfile_doesNotSetAge_whenBirthdateIsNull() {
        UpdateUserProfileDTO dto = new UpdateUserProfileDTO(); // birthdate left null

        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.updateOwnProfile(testUser.getUserId(), dto);

        // ensure age wasn't recalculated
        assertEquals(testUser.getAge(), result.getAge());
        verify(auditPublisher).publish(any(AuditEvent.class));
    }


    // --- adminUpdateUser tests ---

    @Test
    void adminUpdateUser_success() {
        AdminUpdateUserDTO dto = new AdminUpdateUserDTO();
        dto.setBirthdate(LocalDate.of(1990, 1, 1));

        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.adminUpdateUser(testUser.getUserId(), dto);
        assertNotNull(result);
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void adminUpdateUser_userNotFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.adminUpdateUser(UUID.randomUUID(), new AdminUpdateUserDTO()));
    }

    @Test
    void adminUpdateUser_doesNotSetAge_whenBirthdateIsNull() {
        AdminUpdateUserDTO dto = new AdminUpdateUserDTO(); // no birthdate set

        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = userService.adminUpdateUser(testUser.getUserId(), dto);

        // confirm user.age not changed
        assertEquals(testUser.getAge(), result.getAge());
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    // --- requestDeletion tests ---

    @Test
    void requestDeletion_success() {
        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.requestDeletion(testUser.getUserId());

        assertNotNull(testUser.getDeletedAt());
        verify(userRepository).save(testUser);
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void requestDeletion_userNotFound_throws() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
                () -> userService.requestDeletion(UUID.randomUUID()));
    }

    @Test
    void requestDeletion_nonPatient_throws() {
        testUser.setRoleCode("ROLE_DOCTOR");
        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        assertThrows(IllegalStateException.class,
                () -> userService.requestDeletion(testUser.getUserId()));
    }

    @Test
    void requestDeletion_alreadyRequested_throws() {
        testUser.setDeletedAt(LocalDateTime.now());
        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        assertThrows(IllegalStateException.class,
                () -> userService.requestDeletion(testUser.getUserId()));
    }


// --- adminDeleteUser tests ---

    @Test
    void adminDeleteUser_success() {
        testUser.setRoleCode("ROLE_DOCTOR");
        testUser.setIsDeleted(false);
        when(securityUtil.getCurrentUser()).thenReturn(actor);
        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.adminDeleteUser(testUser.getUserId());

        assertTrue(testUser.getIsDeleted());
        assertFalse(testUser.getIsActive());
        assertNotNull(testUser.getDeletedAt());
        verify(userRepository).save(testUser);
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void adminDeleteUser_patient_throws() {
        testUser.setRoleCode("ROLE_PATIENT");
        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        assertThrows(IllegalStateException.class,
                () -> userService.adminDeleteUser(testUser.getUserId()));
    }

    @Test
    void adminDeleteUser_alreadyDeleted_throws() {
        testUser.setRoleCode("ROLE_DOCTOR");
        testUser.setIsDeleted(true);
        when(userRepository.findById(any())).thenReturn(Optional.of(testUser));
        assertThrows(IllegalStateException.class,
                () -> userService.adminDeleteUser(testUser.getUserId()));
    }

    @Test
    void adminDeleteUser_notFound_throws() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,
                () -> userService.adminDeleteUser(UUID.randomUUID()));
    }


// --- deactivateAndAnonymizeExpiredUsers tests ---

    @Test
    void deactivateAndAnonymizeExpiredUsers_withExpiredUsers() {
        User u1 = new User();
        u1.setUserId(UUID.randomUUID());
        u1.setIsDeleted(false);
        u1.setDeletedAt(LocalDateTime.now().minusDays(10));
        u1.setIsActive(true);
        u1.setEmail("user1@example.com");
        u1.setFullName("Test");
        u1.setPhoneNumber("123");
        u1.setIdentityNumber("ID123");
        u1.setAddress("Somewhere");
        u1.setBirthdate(LocalDate.of(1990, 1, 1));
        u1.setAge(33);

        when(userRepository.findAllByIsDeletedFalseAndDeletedAtBefore(any()))
                .thenReturn(List.of(u1));

        userService.deactivateAndAnonymizeExpiredUsers();

        assertTrue(u1.getIsDeleted());
        assertFalse(u1.getIsActive());
        assertTrue(u1.getEmail().startsWith("deleted_"));
        assertEquals("Deleted User", u1.getFullName());
        assertNull(u1.getPhoneNumber());
        assertNull(u1.getIdentityNumber());
        assertNull(u1.getAddress());
        assertNull(u1.getBirthdate());
        assertNull(u1.getAge());

        verify(userRepository).saveAll(anyList());
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void deactivateAndAnonymizeExpiredUsers_noExpiredUsers() {
        when(userRepository.findAllByIsDeletedFalseAndDeletedAtBefore(any()))
                .thenReturn(Collections.emptyList());

        userService.deactivateAndAnonymizeExpiredUsers();

        // No audit published if no expired users
        verify(auditPublisher, never()).publish(any(AuditEvent.class));
        verify(userRepository).saveAll(Collections.emptyList());
    }


    // --- validatePassword tests ---

    @Test
    void validatePassword_blank_throws() throws Exception {
        var method = UserServiceImpl.class.getDeclaredMethod("validatePassword", String.class);
        method.setAccessible(true);

        InvocationTargetException ex = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, "")
        );

        assertTrue(ex.getCause() instanceof IllegalArgumentException);
        assertEquals("Password is required for non-patient roles", ex.getCause().getMessage());
    }

    @Test
    void validatePassword_invalidFormat_throws() throws Exception {
        var method = UserServiceImpl.class.getDeclaredMethod("validatePassword", String.class);
        method.setAccessible(true);

        Exception ex = assertThrows(InvocationTargetException.class,
                () -> method.invoke(userService, "password"));

        assertTrue(ex.getCause() instanceof IllegalArgumentException);
        assertEquals(
                "Password must be at least 8 characters long and include at least one uppercase and one lowercase letter",
                ex.getCause().getMessage()
        );
    }


    @Test
    void validatePassword_valid_passes() throws Exception {
        var method = UserServiceImpl.class.getDeclaredMethod("validatePassword", String.class);
        method.setAccessible(true);
        method.invoke(userService, "ValidPass");
    }

    // --- calculateAge test ---

    @Test
    void calculateAge_correct() throws Exception {
        var method = UserServiceImpl.class.getDeclaredMethod("calculateAge", LocalDate.class);
        method.setAccessible(true);
        int age = (int) method.invoke(userService, LocalDate.now().minusYears(25));
        assertEquals(25, age);
    }

    // --- mock auth context ---
    private void mockAdminAuth() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getAuthorities())
                .thenReturn((Collection) List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);
    }

    private void mockNonAdminAuth() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getAuthorities())
                .thenReturn((Collection) List.of(new SimpleGrantedAuthority("ROLE_LAB_MANAGER")));
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);
    }
}
