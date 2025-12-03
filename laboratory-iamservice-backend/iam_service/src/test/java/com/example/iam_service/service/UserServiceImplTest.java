package com.example.iam_service.service;

import com.example.iam_service.audit.AuditEvent;
import com.example.iam_service.audit.AuditPublisher;
import com.example.iam_service.dto.user.AdminUpdateUserDTO;
import com.example.iam_service.dto.user.PatientDTO;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

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
    @Mock private  RestTemplate restTemplate;


    @InjectMocks private UserServiceImpl userService;

    private User actor;
    private User testUser;

    @BeforeEach
    void setup() {
        actor = new User();
        actor.setUserId(UUID.randomUUID());
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
        // Mock SecurityUtil to return an actor
        User actor = new User();
        actor.setUserId(UUID.randomUUID());
        actor.setRoleCode("ROLE_ADMIN");
        when(securityUtil.getCurrentUser()).thenReturn(actor);

        // Mock repository checks
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        // Mock password encoding
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");

        // Mock the save operation - return a user with ID set
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Mock RestTemplate for synchronizePatientData
        PatientDTO mockPatientDTO = new PatientDTO();
        mockPatientDTO.setEmail(testUser.getEmail());
        ResponseEntity<PatientDTO> mockResponse = ResponseEntity.ok(mockPatientDTO);
        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenReturn(mockResponse);

        // Execute
        User result = userService.createUser(testUser);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getUserId());
        assertEquals("encodedPass", result.getPassword());
        assertTrue(result.getIsActive());

        // Verify interactions
        verify(emailService).sendPasswordEmail(eq(testUser.getEmail()), anyString());
        verify(auditPublisher).publish(any(AuditEvent.class));
        verify(restTemplate).postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        );
    }

    @Test
    void createUser_calculatesAge_whenBirthdatePresentAndAgeNull() {
        testUser.setBirthdate(LocalDate.of(2000, 1, 1));
        testUser.setAge(null);
        testUser.setRoleCode("ROLE_PATIENT");

        // Mock all required dependencies
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Mock RestTemplate for synchronizePatientData
        PatientDTO mockPatientDTO = new PatientDTO();
        mockPatientDTO.setEmail(testUser.getEmail());
        ResponseEntity<PatientDTO> mockResponse = ResponseEntity.ok(mockPatientDTO);
        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenReturn(mockResponse);

        userService.createUser(testUser);

        assertNotNull(testUser.getAge());
        assertTrue(testUser.getAge() > 0); // Age should be calculated from birthdate
    }

    @Test
    void createUser_doesNotCalculateAge_whenBirthdateIsNull() {
        testUser.setBirthdate(null);
        testUser.setAge(null);
        testUser.setRoleCode("ROLE_PATIENT");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(testUser)
        );

        assertTrue(exception.getMessage().contains("Birthdate is required") ||
                exception.getMessage().contains("patient not found"));
    }

    @Test
    void createUser_doesNotCalculateAge_whenAgeAlreadySet() {
        testUser.setBirthdate(LocalDate.of(2000, 1, 1));
        testUser.setAge(25);
        testUser.setRoleCode("ROLE_PATIENT");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Mock RestTemplate for synchronizePatientData
        PatientDTO mockPatientDTO = new PatientDTO();
        mockPatientDTO.setEmail(testUser.getEmail());
        ResponseEntity<PatientDTO> mockResponse = ResponseEntity.ok(mockPatientDTO);
        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenReturn(mockResponse);

        userService.createUser(testUser);

        // stays 25, not recalculated
        assertEquals(25, testUser.getAge());
    }

    @Test
    void createUser_patient_verificationFails() {
        // Since the patient verification is commented out in the service,
        // this test should be removed OR modified to test RestTemplate failure instead

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        // Mock RestTemplate to throw exception (simulating sync failure)
        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenThrow(new RuntimeException("Patient sync failed"));

        // Should throw IllegalArgumentException with message about patient not found
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUser(testUser)
        );

        assertTrue(exception.getMessage().contains("patient not found"));
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
        when(userRepository.findAllByIsDeletedFalse()).thenReturn(List.of(testUser));
        assertEquals(1, userService.getAllUsers().size());
    }

    @Test
    void getInactiveUsers_success() {
        when(userRepository.findByIsActiveFalseAndIsDeletedFalse()).thenReturn(List.of(testUser));
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

    // --- getDeletedUsers tests ---

    @Test
    void getDeletedUsers_success() {
        User deleted = new User();
        deleted.setUserId(UUID.randomUUID());
        deleted.setIsDeleted(true);

        when(userRepository.findAllByIsDeletedTrueOrDeletedAtIsNotNull())
                .thenReturn(List.of(deleted));

        List<User> result = userService.getDeletedUsers();

        assertEquals(1, result.size());
        verify(userRepository).findAllByIsDeletedTrueOrDeletedAtIsNotNull();
    }


// --- restoreUser tests ---

    @Test
    void restoreUser_success_patient_withScheduledDeletion() {
        // patient with deletion scheduled (deletedAt != null, isDeleted = false)
        User patient = new User();
        patient.setUserId(UUID.randomUUID());
        patient.setRoleCode("ROLE_PATIENT");
        patient.setIsDeleted(false);
        patient.setDeletedAt(LocalDateTime.now().plusDays(2));

        when(securityUtil.getCurrentUser()).thenReturn(actor);
        when(userRepository.findById(any())).thenReturn(Optional.of(patient));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.restoreUser(patient.getUserId());

        assertFalse(patient.getIsDeleted());
        assertTrue(patient.getIsActive());
        assertNull(patient.getDeletedAt());
        verify(userRepository).save(patient);
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void restoreUser_patient_alreadyDeleted_throws() {
        User patient = new User();
        patient.setUserId(UUID.randomUUID());
        patient.setRoleCode("ROLE_PATIENT");
        patient.setIsDeleted(true);
        patient.setDeletedAt(LocalDateTime.now().minusDays(1));

        when(userRepository.findById(any())).thenReturn(Optional.of(patient));

        assertThrows(IllegalStateException.class,
                () -> userService.restoreUser(patient.getUserId()));

        verify(userRepository, never()).save(any());
        verify(auditPublisher, never()).publish(any());
    }

    @Test
    void restoreUser_patient_noDeletionRequest_throws() {
        User patient = new User();
        patient.setUserId(UUID.randomUUID());
        patient.setRoleCode("ROLE_PATIENT");
        patient.setIsDeleted(false);
        patient.setDeletedAt(null); // no deletion requested

        when(userRepository.findById(any())).thenReturn(Optional.of(patient));

        assertThrows(IllegalStateException.class,
                () -> userService.restoreUser(patient.getUserId()));

        verify(userRepository, never()).save(any());
        verify(auditPublisher, never()).publish(any());
    }

    @Test
    void restoreUser_success_nonPatient_employeeDeleted() {
        User employee = new User();
        employee.setUserId(UUID.randomUUID());
        employee.setRoleCode("ROLE_DOCTOR");
        employee.setIsDeleted(true);
        employee.setDeletedAt(LocalDateTime.now());

        when(securityUtil.getCurrentUser()).thenReturn(actor);
        when(userRepository.findById(any())).thenReturn(Optional.of(employee));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        userService.restoreUser(employee.getUserId());

        assertFalse(employee.getIsDeleted());
        assertTrue(employee.getIsActive());
        assertNull(employee.getDeletedAt());
        verify(userRepository).save(employee);
        verify(auditPublisher).publish(any(AuditEvent.class));
    }

    @Test
    void restoreUser_nonPatient_notDeleted_throws() {
        User employee = new User();
        employee.setUserId(UUID.randomUUID());
        employee.setRoleCode("ROLE_DOCTOR");
        employee.setIsDeleted(false);
        employee.setDeletedAt(null);

        when(userRepository.findById(any())).thenReturn(Optional.of(employee));

        assertThrows(IllegalStateException.class,
                () -> userService.restoreUser(employee.getUserId()));

        verify(userRepository, never()).save(any());
        verify(auditPublisher, never()).publish(any());
    }

    @Test
    void restoreUser_userNotFound_throws() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> userService.restoreUser(UUID.randomUUID()));

        verify(userRepository, never()).save(any());
        verify(auditPublisher, never()).publish(any());
    }

    // --- updateUserByEmail tests ---

    @Test
    void updateUserByEmail_success() {
        AdminUpdateUserDTO dto = new AdminUpdateUserDTO();
        dto.setFullName("Updated Name");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // make the mock actually update the user
        doAnswer(invocation -> {
            AdminUpdateUserDTO dtoArg = invocation.getArgument(0);
            User userArg = invocation.getArgument(1);
            userArg.setFullName(dtoArg.getFullName());
            return null;
        }).when(userMapper).updateUserFromAdminDto(any(AdminUpdateUserDTO.class), any(User.class));

        User updated = userService.updateUserByEmail(testUser.getEmail(), dto);

        assertEquals("Updated Name", updated.getFullName());
        verify(auditPublisher).publish(any(AuditEvent.class));
    }


    @Test
    void updateUserByEmail_userNotFound_throws() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserByEmail("noone@example.com", new AdminUpdateUserDTO()));

        verify(userRepository, never()).save(any());
        verify(auditPublisher, never()).publish(any());
    }

// --- batchCreatePatientUsers tests ---

    @Test
    void batchCreatePatientUsers_allValid_success() {
        // arrange
        User patient1 = new User();
        patient1.setEmail("p1@example.com");
        patient1.setRoleCode("ROLE_PATIENT");

        User patient2 = new User();
        patient2.setEmail("p2@example.com");
        patient2.setRoleCode("ROLE_PATIENT");

        patient1.setUserId(UUID.randomUUID());
        patient2.setUserId(UUID.randomUUID());

        List<User> input = List.of(patient1, patient2);

        // email unique
        when(userRepository.existsByEmail(anyString())).thenReturn(false);


        // password encoding
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        // saveAll returns whatever was passed in
        when(userRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        // act
        List<User> result = userService.batchCreatePatientUsers(input);

        // assert
        assertEquals(2, result.size());

        // email sending -> 2 users = 2 emails
        verify(emailService, times(2))
                .sendPasswordEmail(anyString(), anyString());

        // audit: only ONE publish for batch creation
        verify(auditPublisher, times(1))
                .publish(any(AuditEvent.class));

        // no skipped audit because none skipped
        verify(auditPublisher, times(0))
                .publish(argThat(event ->
                        "PATIENT_BATCH_SKIPPED".equals(event.getType())
                ));
    }

    @Test
    void batchCreatePatientUsers_someInvalid_skipped() {
        User validPatient = new User();
        validPatient.setEmail("valid@example.com");
        validPatient.setRoleCode("ROLE_PATIENT");
        validPatient.setUserId(UUID.randomUUID());

        User duplicatePatient = new User();
        duplicatePatient.setEmail("dup@example.com");
        duplicatePatient.setRoleCode("ROLE_PATIENT");
        duplicatePatient.setUserId(UUID.randomUUID());

        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);
        when(userRepository.existsByEmail("valid@example.com")).thenReturn(false);

        // removed dup@example.com verifyPatientExists — not needed

        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        when(userRepository.saveAll(any())).thenAnswer(invocation -> {
            List<User> users = invocation.getArgument(0);
            return users;
        });

        List<User> result = userService.batchCreatePatientUsers(List.of(validPatient, duplicatePatient));

        assertEquals(1, result.size());
        assertEquals("valid@example.com", result.get(0).getEmail());

        verify(emailService, times(1)).sendPasswordEmail(eq("valid@example.com"), anyString());

        // 1 created + 1 skipped
        verify(auditPublisher, times(2)).publish(any(AuditEvent.class));
    }


    @Test
    void batchCreatePatientUsers_invalidPatientVerification_skipped() {
        User patient = new User();
        patient.setEmail("p@example.com");
        patient.setRoleCode("ROLE_PATIENT");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        List<User> result = userService.batchCreatePatientUsers(List.of(patient));

        assertTrue(result.isEmpty());
        verify(emailService, never()).sendPasswordEmail(anyString(), anyString());

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


    // --- createUserByPatientService tests ---

    @Test
    void createUserByPatientService_success() {
        // Arrange
        User patient = new User();
        patient.setEmail("patient@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(2000, 5, 15));
        patient.setFullName("Test Patient");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Act
        User result = userService.createUserByPatientService(patient);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getUserId());
        assertEquals("encodedPassword", result.getPassword());
        assertTrue(result.getIsActive());

        verify(userRepository).existsByEmail(patient.getEmail());
        verify(passwordEncoder).encode(anyString());
        verify(userRepository).save(patient);
        verify(emailService).sendPasswordEmail(eq(patient.getEmail()), anyString());
        verify(auditPublisher).publish(argThat(event ->
                "PATIENT_CREATED".equals(event.getType()) &&
                        event.getDetails().contains("Patient account created and credentials emailed")
        ));
    }

    @Test
    void createUserByPatientService_calculatesAge_whenBirthdatePresentAndAgeNull() {
        // Arrange
        User patient = new User();
        patient.setEmail("patient@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(1995, 3, 20));
        patient.setAge(null);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Act
        userService.createUserByPatientService(patient);

        // Assert
        assertNotNull(patient.getAge());
        assertTrue(patient.getAge() > 0);
        verify(emailService).sendPasswordEmail(eq(patient.getEmail()), anyString());
    }

    @Test
    void createUserByPatientService_doesNotCalculateAge_whenAgeAlreadySet() {
        // Arrange
        User patient = new User();
        patient.setEmail("patient@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(1990, 1, 15));
        patient.setAge(30);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Act
        userService.createUserByPatientService(patient);

        // Assert
        assertEquals(30, patient.getAge()); // Age should remain unchanged
        verify(emailService).sendPasswordEmail(eq(patient.getEmail()), anyString());
    }

    @Test
    void createUserByPatientService_doesNotCalculateAge_whenBirthdateIsNull() {
        // Arrange
        User patient = new User();
        patient.setEmail("patient@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(null);
        patient.setAge(null);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Act
        userService.createUserByPatientService(patient);

        // Assert
        assertNull(patient.getAge()); // Age should remain null
        verify(emailService).sendPasswordEmail(eq(patient.getEmail()), anyString());
    }

    @Test
    void createUserByPatientService_duplicateEmail_throws() {
        // Arrange
        User patient = new User();
        patient.setEmail("existing@example.com");
        patient.setRoleCode("ROLE_PATIENT");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUserByPatientService(patient)
        );

        assertTrue(exception.getMessage().contains("Email already exists"));
        verify(userRepository, never()).save(any());
        verify(emailService, never()).sendPasswordEmail(anyString(), anyString());
        verify(auditPublisher, never()).publish(any());
    }

    @Test
    void createUserByPatientService_saveFailure_throws() {
        // Arrange
        User patient = new User();
        patient.setEmail("patient@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(2000, 1, 1));

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class)))
                .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUserByPatientService(patient)
        );

        assertTrue(exception.getMessage().contains("patient not found"));
        assertTrue(exception.getMessage().contains("Database error"));
        verify(emailService, never()).sendPasswordEmail(anyString(), anyString());
        verify(auditPublisher, never()).publish(any());
    }

    @Test
    void createUserByPatientService_emailServiceFailure_throws() {
        // Arrange
        User patient = new User();
        patient.setEmail("patient@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(2000, 1, 1));

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });
        doThrow(new RuntimeException("Email service unavailable"))
                .when(emailService).sendPasswordEmail(anyString(), anyString());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.createUserByPatientService(patient)
        );

        assertTrue(exception.getMessage().contains("patient not found"));
        assertTrue(exception.getMessage().contains("Email service unavailable"));
        verify(userRepository).save(patient);
        verify(emailService).sendPasswordEmail(eq(patient.getEmail()), anyString());
        verify(auditPublisher, never()).publish(any()); // Audit not published due to exception
    }

    @Test
    void createUserByPatientService_passwordEncoding_applied() {
        // Arrange
        User patient = new User();
        patient.setEmail("patient@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(2000, 1, 1));

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("super-secure-encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Act
        User result = userService.createUserByPatientService(patient);

        // Assert
        assertEquals("super-secure-encoded-password", result.getPassword());
        assertTrue(result.getIsActive());
        verify(passwordEncoder).encode(anyString());
    }

    @Test
    void createUserByPatientService_auditPublisher_receivesCorrectDetails() {
        // Arrange
        User patient = new User();
        patient.setEmail("audit-test@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(2000, 1, 1));

        UUID generatedUserId = UUID.randomUUID();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setUserId(generatedUserId);
            return user;
        });

        // Act
        userService.createUserByPatientService(patient);

        // Assert
        verify(auditPublisher).publish(argThat(event -> {
            return "PATIENT_CREATED".equals(event.getType()) &&
                    event.getUserId().contains(actor.getUserId().toString()) &&
                    event.getUserId().contains(actor.getRoleCode()) &&
                    event.getTarget().equals(generatedUserId.toString()) &&
                    event.getTargetRole().equals("ROLE_PATIENT") &&
                    event.getDetails().equals("Patient account created and credentials emailed");
        }));
    }

    @Test
    void createUserByPatientService_securityUtil_currentUserCalled() {
        // Arrange
        User patient = new User();
        patient.setEmail("security-test@example.com");
        patient.setRoleCode("ROLE_PATIENT");
        patient.setBirthdate(LocalDate.of(2000, 1, 1));

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getUserId() == null) {
                user.setUserId(UUID.randomUUID());
            }
            return user;
        });

        // Act
        userService.createUserByPatientService(patient);

        // Assert
        verify(securityUtil, atLeastOnce()).getCurrentUser();
    }


    // --- synchronizePatientData tests ---

    @Test
    void synchronizePatientData_success() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("John Doe");
        patient.setBirthdate(LocalDate.of(1990, 5, 15));
        patient.setGender("MALE");
        patient.setPhoneNumber("+819012345678");
        patient.setEmail("john.doe@example.com");
        patient.setAddress("123 Test Street");
        patient.setIdentityNumber("ID123456");

        PatientDTO mockResponse = new PatientDTO();
        mockResponse.setEmail(patient.getEmail());
        mockResponse.setFullName(patient.getFullName());

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenReturn(ResponseEntity.ok(mockResponse));

        // Act - use reflection to call private method
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert - should not throw exception
        assertDoesNotThrow(() -> method.invoke(userService, patient));

        verify(restTemplate).postForEntity(
                eq("http://54.206.211.154:8687/api/patients/iam-create"),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        );
    }

    @Test
    void synchronizePatientData_httpStatusCodeException_400BadRequest() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("John Doe");
        patient.setBirthdate(LocalDate.of(1990, 5, 15));
        patient.setGender("MALE");
        patient.setPhoneNumber("+819012345678");
        patient.setEmail("john.doe@example.com");
        patient.setAddress("123 Test Street");
        patient.setIdentityNumber("ID123456");

        HttpStatusCodeException httpException = mock(HttpStatusCodeException.class);
        when(httpException.getStatusCode()).thenReturn(HttpStatus.BAD_REQUEST);
        when(httpException.getResponseBodyAsString()).thenReturn("Invalid patient data");

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenThrow(httpException);

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert
        InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, patient)
        );

        assertTrue(exception.getCause() instanceof HttpStatusCodeException);
        HttpStatusCodeException cause = (HttpStatusCodeException) exception.getCause();
        assertEquals(HttpStatus.BAD_REQUEST, cause.getStatusCode());
        assertEquals("Invalid patient data", cause.getResponseBodyAsString());
    }

    @Test
    void synchronizePatientData_httpStatusCodeException_404NotFound() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("Jane Smith");
        patient.setBirthdate(LocalDate.of(1995, 3, 20));
        patient.setGender("FEMALE");
        patient.setPhoneNumber("+819087654321");
        patient.setEmail("jane.smith@example.com");
        patient.setAddress("456 Test Avenue");
        patient.setIdentityNumber("ID789012");

        HttpStatusCodeException httpException = mock(HttpStatusCodeException.class);
        when(httpException.getStatusCode()).thenReturn(HttpStatus.NOT_FOUND);
        when(httpException.getResponseBodyAsString()).thenReturn("Endpoint not found");

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenThrow(httpException);

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert
        InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, patient)
        );

        assertTrue(exception.getCause() instanceof HttpStatusCodeException);
        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(PatientDTO.class));
    }

    @Test
    void synchronizePatientData_httpStatusCodeException_500InternalServerError() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("Bob Johnson");
        patient.setBirthdate(LocalDate.of(1988, 7, 10));
        patient.setGender("MALE");
        patient.setPhoneNumber("+819011112222");
        patient.setEmail("bob.johnson@example.com");
        patient.setAddress("789 Test Boulevard");
        patient.setIdentityNumber("ID345678");

        HttpStatusCodeException httpException = mock(HttpStatusCodeException.class);
        when(httpException.getStatusCode()).thenReturn(HttpStatus.INTERNAL_SERVER_ERROR);
        when(httpException.getResponseBodyAsString()).thenReturn("Server error occurred");

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenThrow(httpException);

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert
        InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, patient)
        );

        assertTrue(exception.getCause() instanceof HttpStatusCodeException);
        HttpStatusCodeException cause = (HttpStatusCodeException) exception.getCause();
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, cause.getStatusCode());
    }

    @Test
    void synchronizePatientData_httpStatusCodeException_409Conflict() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("Alice Williams");
        patient.setBirthdate(LocalDate.of(1992, 11, 25));
        patient.setGender("FEMALE");
        patient.setPhoneNumber("+819033334444");
        patient.setEmail("alice.williams@example.com");
        patient.setAddress("321 Test Lane");
        patient.setIdentityNumber("ID901234");

        HttpStatusCodeException httpException = mock(HttpStatusCodeException.class);
        when(httpException.getStatusCode()).thenReturn(HttpStatus.CONFLICT);
        when(httpException.getResponseBodyAsString()).thenReturn("Patient already exists");

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenThrow(httpException);

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert
        InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, patient)
        );

        assertTrue(exception.getCause() instanceof HttpStatusCodeException);
        HttpStatusCodeException cause = (HttpStatusCodeException) exception.getCause();
        assertEquals(HttpStatus.CONFLICT, cause.getStatusCode());
        assertEquals("Patient already exists", cause.getResponseBodyAsString());
    }

    @Test
    void synchronizePatientData_genericException_networkError() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("Charlie Brown");
        patient.setBirthdate(LocalDate.of(1985, 2, 14));
        patient.setGender("MALE");
        patient.setPhoneNumber("+819055556666");
        patient.setEmail("charlie.brown@example.com");
        patient.setAddress("654 Test Road");
        patient.setIdentityNumber("ID567890");

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenThrow(new RuntimeException("Network timeout"));

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert
        InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, patient)
        );

        assertTrue(exception.getCause() instanceof RuntimeException);
        assertEquals("Network timeout", exception.getCause().getMessage());
    }

    @Test
    void synchronizePatientData_genericException_restClientException() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("Diana Prince");
        patient.setBirthdate(LocalDate.of(1991, 9, 30));
        patient.setGender("FEMALE");
        patient.setPhoneNumber("+819077778888");
        patient.setEmail("diana.prince@example.com");
        patient.setAddress("987 Test Circle");
        patient.setIdentityNumber("ID234567");

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenThrow(new RestClientException("Connection refused"));

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert
        InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, patient)
        );

        assertTrue(exception.getCause() instanceof RestClientException);
        assertEquals("Connection refused", exception.getCause().getMessage());
    }

    @Test
    void synchronizePatientData_requestBuilding_correctData() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("Test User");
        patient.setBirthdate(LocalDate.of(1993, 4, 12));
        patient.setGender("MALE");
        patient.setPhoneNumber("+819099990000");
        patient.setEmail("test.user@example.com");
        patient.setAddress("111 Test Plaza");
        patient.setIdentityNumber("ID111222");

        ArgumentCaptor<HttpEntity> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);

        when(restTemplate.postForEntity(
                anyString(),
                any(HttpEntity.class),
                eq(PatientDTO.class)
        )).thenReturn(ResponseEntity.ok(new PatientDTO()));

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);
        method.invoke(userService, patient);

        // Assert
        verify(restTemplate).postForEntity(
                urlCaptor.capture(),
                entityCaptor.capture(),
                eq(PatientDTO.class)
        );

        // Verify URL
        assertEquals("http://54.206.211.154:8687/api/patients/iam-create", urlCaptor.getValue());

        // Verify HttpEntity headers
        HttpEntity capturedEntity = entityCaptor.getValue();
        assertEquals(MediaType.APPLICATION_JSON, capturedEntity.getHeaders().getContentType());

        // Verify request body (if accessible)
        assertNotNull(capturedEntity.getBody());
    }

    @Test
    void synchronizePatientData_nullBirthdate_throwsNullPointerException() throws Exception {
        // Arrange
        User patient = new User();
        patient.setFullName("No Birthday User");
        patient.setBirthdate(null); // This will cause NPE when calling .toString()
        patient.setGender("MALE");
        patient.setPhoneNumber("+819088889999");
        patient.setEmail("no.birthday@example.com");
        patient.setAddress("222 Test Street");
        patient.setIdentityNumber("ID333444");

        // Act
        var method = UserServiceImpl.class.getDeclaredMethod("synchronizePatientData", User.class);
        method.setAccessible(true);

        // Assert
        InvocationTargetException exception = assertThrows(
                InvocationTargetException.class,
                () -> method.invoke(userService, patient)
        );

        assertTrue(exception.getCause() instanceof NullPointerException);
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
