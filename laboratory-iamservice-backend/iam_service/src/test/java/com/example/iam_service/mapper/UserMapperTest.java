package com.example.iam_service.mapper;


import com.example.iam_service.dto.user.UserDTO;
import com.example.iam_service.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class UserMapperTest {
    private UserMapperImpl userMapper;

    @BeforeEach
    void setUp() {
        userMapper = new UserMapperImpl();
    }

    @Test
    void testUserToUserDtoMapping() {
        UUID id = UUID.randomUUID();
        LocalDate birthdate = LocalDate.of(1990, 5, 15);
        LocalDate createdAt = LocalDate.now();
        LocalDateTime deletedAt = LocalDateTime.now();

        User user = User.builder()
                .userId(id)
                .email("test@example.com")
                .phoneNumber("+123456789")
                .fullName("John Doe")
                .identityNumber("ID123456")
                .gender("MALE")
                .age(30)
                .address("123 Street")
                .birthdate(birthdate)
                .password("password")
                .roleCode("ROLE_USER")
                .isActive(true)
                .createdAt(createdAt)
                .isDeleted(true)
                .deletedAt(deletedAt)
                .build();

        UserDTO dto = userMapper.toDto(user);

        assertNotNull(dto);
        assertEquals(user.getUserId(), dto.getUserId());
        assertEquals(user.getEmail(), dto.getEmail());
        assertEquals(user.getPhoneNumber(), dto.getPhoneNumber());
        assertEquals(user.getFullName(), dto.getFullName());
        assertEquals(user.getGender(), dto.getGender());
        assertEquals(user.getAge(), dto.getAge());
        assertEquals(user.getAddress(), dto.getAddress());
        assertEquals(user.getBirthdate(), dto.getBirthdate());
        assertEquals(user.getRoleCode(), dto.getRoleCode());
        assertEquals(user.getIsActive(), dto.getIsActive());
        assertEquals(user.getCreatedAt(), dto.getCreatedAt());
        assertEquals(user.getIsDeleted(), dto.getIsDeleted());
        assertEquals(user.getDeletedAt(), dto.getDeletedAt());
    }

    @Test
    void testUserDtoToUserMapping() {
        UUID id = UUID.randomUUID();
        LocalDate birthdate = LocalDate.of(1990, 5, 15);
        LocalDate createdAt = LocalDate.now();
        LocalDateTime deletedAt = LocalDateTime.now();

        UserDTO dto = new UserDTO();
        dto.setUserId(id);
        dto.setEmail("test@example.com");
        dto.setPhoneNumber("+123456789");
        dto.setFullName("John Doe");
        dto.setGender("MALE");
        dto.setAge(30);
        dto.setAddress("123 Street");
        dto.setBirthdate(birthdate);
        dto.setRoleCode("ROLE_USER");
        dto.setIsActive(true);
        dto.setCreatedAt(createdAt);
        dto.setIsDeleted(true);
        dto.setDeletedAt(deletedAt);

        User user = userMapper.toEntity(dto);

        assertNotNull(user);
        assertEquals(dto.getUserId(), user.getUserId());
        assertEquals(dto.getEmail(), user.getEmail());
        assertEquals(dto.getPhoneNumber(), user.getPhoneNumber());
        assertEquals(dto.getFullName(), user.getFullName());
        assertEquals(dto.getGender(), user.getGender());
        assertEquals(dto.getAge(), user.getAge());
        assertEquals(dto.getAddress(), user.getAddress());
        assertEquals(dto.getBirthdate(), user.getBirthdate());
        assertEquals(dto.getRoleCode(), user.getRoleCode());
        assertEquals(dto.getIsActive(), user.getIsActive());
        assertEquals(dto.getCreatedAt(), user.getCreatedAt());
        assertEquals(dto.getIsDeleted(), user.getIsDeleted());
        assertEquals(dto.getDeletedAt(), user.getDeletedAt());
    }

    @Test
    void testNullUserToDtoReturnsNull() {
        assertNull(userMapper.toDto(null));
    }

    @Test
    void testNullDtoToUserReturnsNull() {
        assertNull(userMapper.toEntity(null));
    }
}
